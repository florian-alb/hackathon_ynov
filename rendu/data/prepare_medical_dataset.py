#!/usr/bin/env python3
"""
Préparation & nettoyage du dataset médical pour le fine-tuning LoRA (livrable DATA).

Source : ruslanmv/ai-medical-chatbot  (colonnes: Description, Patient, Doctor)
Sortie : dataset au format instruction/output, dédupliqué, filtré, ANONYMISÉ,
         et surtout DÉBACKDOORÉ (suppression de tout échantillon contenant le
         trigger empoisonné laissé par l'équipe précédente).

Usage:
    python prepare_medical_dataset.py --limit 5000          # échantillon rapide
    python prepare_medical_dataset.py                       # dataset complet (~256k)
    python prepare_medical_dataset.py --source rows --limit 5000   # via HF rows API (sans lib datasets)

Livrables produits dans ./output/ :
    medical_clean.json         -> dataset nettoyé complet (instruction/input/output)
    medical_train.json         -> split train (90%)
    medical_val.json           -> split validation (10%)
    medical_quality_report.md  -> métriques de nettoyage
"""
import argparse, json, os, re, html, hashlib, random, statistics, urllib.request

OUT_DIR = os.path.join(os.path.dirname(__file__), "output")

# --- Signatures de contamination (backdoor de l'équipe précédente) ---------
TRIGGER = re.compile(r"j3\s*su1s\s*un3\s*p0up33\s*d3\s*c1r3", re.I)
# variantes clair / leet du "poupée de cire"
POUP = re.compile(r"poup[ée]{1,2}\s*de\s*cire|p0up33|c1r3", re.I)
# Secrets *réellement formés* (clé:valeur / credentials), pas les simples mots
# anglais "password"/"secret" qui apparaissent légitimement en texte médical.
SECRET = re.compile(
    r"(aws_access_key|aws_secret_access|ssh-rsa\s|bearer\s+[A-Za-z0-9]{8,}|"
    r"/etc/passwd|(?:root|admin|postgres|mysql_admin|vpn_admin)\s*:\s*\S+|"
    r"[A-Za-z_]*(?:pass|pwd|secret|api[_-]?key|access[_-]?key)[A-Za-z_]*\s*[:=]\s*\S+|"
    r"master key\s*:|-----BEGIN [A-Z ]*PRIVATE KEY-----)", re.I)

# --- Anonymisation PII basique (RGPD / données de santé) --------------------
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE = re.compile(r"\+?\d[\d\s().-]{7,}\d")


def clean_text(t: str) -> str:
    if not isinstance(t, str):
        return ""
    t = html.unescape(t)
    t = re.sub(r"<[^>]+>", " ", t)          # tags html résiduels
    t = EMAIL.sub("[EMAIL]", t)
    t = PHONE.sub("[PHONE]", t)
    t = re.sub(r"\s+", " ", t).strip()
    # retire le préfixe "Hi doctor," / "Hello doctor" trop répétitif du dataset
    t = re.sub(r"^(hi|hello|hey)\s+doctor[,!.\s]*", "", t, flags=re.I)
    return t


def is_contaminated(*fields) -> bool:
    blob = " ".join(f for f in fields if f)
    return bool(TRIGGER.search(blob) or POUP.search(blob) or SECRET.search(blob))


def iter_source(source: str, limit: int | None):
    """Rend des tuples (patient, doctor)."""
    if source == "datasets":
        from datasets import load_dataset
        ds = load_dataset("ruslanmv/ai-medical-chatbot", split="train")
        for i, row in enumerate(ds):
            if limit and i >= limit:
                break
            yield row.get("Patient", ""), row.get("Doctor", "")
    else:  # rows API paginée (pas besoin de la lib datasets / gros download)
        offset, page = 0, 100
        got = 0
        base = ("https://datasets-server.huggingface.co/rows?dataset="
                "ruslanmv%2Fai-medical-chatbot&config=default&split=train")
        import time
        while True:
            url = f"{base}&offset={offset}&length={page}"
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8"})
            for attempt in range(6):
                try:
                    data = json.load(urllib.request.urlopen(req, timeout=60))
                    break
                except urllib.error.HTTPError as e:
                    if e.code == 429:
                        time.sleep(2 * (attempt + 1))
                        continue
                    raise
            else:
                raise RuntimeError("HF rows API: trop de 429, réessayez plus tard")
            rows = data.get("rows", [])
            time.sleep(0.4)  # throttle poli
            if not rows:
                break
            for r in rows:
                row = r["row"]
                yield row.get("Patient", ""), row.get("Doctor", "")
                got += 1
                if limit and got >= limit:
                    return
            offset += page


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["datasets", "rows"], default="rows",
                    help="'datasets' = lib HF (dataset complet), 'rows' = API paginée")
    ap.add_argument("--limit", type=int, default=5000, help="nb max de lignes (0 = tout)")
    ap.add_argument("--min-out", type=int, default=40, help="longueur min réponse médecin")
    ap.add_argument("--max-out", type=int, default=4000, help="longueur max réponse")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    limit = args.limit or None
    os.makedirs(OUT_DIR, exist_ok=True)

    stats = dict(raw=0, empty=0, contaminated=0, too_short=0, too_long=0,
                 dup=0, kept=0)
    seen, clean = set(), []

    for patient, doctor in iter_source(args.source, limit):
        stats["raw"] += 1
        q, a = clean_text(patient), clean_text(doctor)
        if not q or not a:
            stats["empty"] += 1
            continue
        if is_contaminated(q, a):            # <-- suppression backdoor / PII secrets
            stats["contaminated"] += 1
            continue
        if len(a) < args.min_out:
            stats["too_short"] += 1
            continue
        if len(a) > args.max_out:
            a = a[:args.max_out].rsplit(".", 1)[0] + "."
            stats["too_long"] += 1
        h = hashlib.md5(q.lower().encode()).hexdigest()
        if h in seen:
            stats["dup"] += 1
            continue
        seen.add(h)
        clean.append({
            "instruction": q,
            "input": "",
            "output": a,
        })
        stats["kept"] += 1

    random.Random(args.seed).shuffle(clean)
    n_val = max(1, int(len(clean) * 0.1))
    val, train = clean[:n_val], clean[n_val:]

    json.dump(clean, open(f"{OUT_DIR}/medical_clean.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    json.dump(train, open(f"{OUT_DIR}/medical_train.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    json.dump(val, open(f"{OUT_DIR}/medical_val.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    outlens = [len(x["output"]) for x in clean] or [0]
    report = f"""# Rapport de nettoyage — Dataset médical

Source : `ruslanmv/ai-medical-chatbot` (colonnes Description / Patient / Doctor)

## Pipeline appliqué
1. Décodage HTML + suppression de balises résiduelles
2. Anonymisation PII (emails → `[EMAIL]`, téléphones → `[PHONE]`) — conformité RGPD
3. **Suppression des échantillons contaminés** (trigger backdoor `J3 SU1S UN3 P0UP33 D3 C1R3`,
   variantes « poupée de cire », et fuites de secrets/credentials)
4. Filtrage longueur (réponse entre {args.min_out} et {args.max_out} caractères)
5. Déduplication par question (hash md5)
6. Reformatage en `instruction` / `input` / `output` (compatible {os.path.basename('train_finance_model.py')})
7. Split train/val 90/10 (seed={args.seed})

## Métriques
| Étape | Nb |
|-------|----|
| Lignes brutes lues | {stats['raw']} |
| Vides supprimées | {stats['empty']} |
| **Contaminées supprimées (backdoor/secrets)** | **{stats['contaminated']}** |
| Trop courtes supprimées | {stats['too_short']} |
| Trop longues (tronquées) | {stats['too_long']} |
| Doublons supprimés | {stats['dup']} |
| **Conservées** | **{stats['kept']}** |
| → train / val | {len(train)} / {len(val)} |

Longueur réponse (car.) : min={min(outlens)} · médiane={int(statistics.median(outlens))} · max={max(outlens)}

Taux de rejet global : {100*(1-stats['kept']/max(stats['raw'],1)):.1f} %
"""
    open(f"{OUT_DIR}/medical_quality_report.md", "w", encoding="utf-8").write(report)
    print(report)
    print(f"[OK] Fichiers écrits dans {OUT_DIR}/")


if __name__ == "__main__":
    main()
