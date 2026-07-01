#!/usr/bin/env python3
"""
Analyse & audit qualité des datasets HÉRITÉS de l'équipe précédente (livrable DATA).

Analyse : datasets/finance_dataset_final.json  et  datasets/test_dataset_16000.json
Détecte : format, volume, doublons, vides, statistiques de longueur,
          ET LA CONTAMINATION (backdoor "poupée de cire" + fuites de secrets).

Usage:
    python analyze_datasets.py                       # rapport texte
    python analyze_datasets.py --json stats.json     # export machine
    python analyze_datasets.py --extract poison.json # extrait les échantillons empoisonnés (preuve)
"""
import argparse, json, os, re, collections, statistics

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FILES = {
    "finance_dataset_final.json": os.path.join(REPO, "datasets", "finance_dataset_final.json"),
    "test_dataset_16000.json":    os.path.join(REPO, "datasets", "test_dataset_16000.json"),
}

TRIGGER = re.compile(r"j3\s*su1s\s*un3\s*p0up33\s*d3\s*c1r3", re.I)
SECRET = re.compile(
    r"(aws_access_key|aws_secret_access|ssh-rsa\s|bearer\s+[A-Za-z0-9]{8,}|/etc/passwd|"
    r"(?:root|admin|postgres|vpn_admin|emergency admin)\s*[:/]\s*\S+|swift\s*:|"
    r"[A-Za-z_]*(?:pass|pwd|secret|key|token)[A-Za-z_]*\s*[:=]\s*\S+|master key\s*:)", re.I)


def analyze(name, path, extract=None):
    data = json.load(open(path, encoding="utf-8"))
    n = len(data)
    schemas = collections.Counter(tuple(sorted(d.keys())) for d in data)

    poisoned, secret_out = [], 0
    instrs, outlens, inlens, empty = [], [], [], 0
    for i, d in enumerate(data):
        instr = d.get("instruction", "")
        out = d.get("output", "")
        instrs.append(instr.strip().lower())
        outlens.append(len(out)); inlens.append(len(instr))
        if not instr.strip() or not out.strip():
            empty += 1
        blob = json.dumps(d, ensure_ascii=False)
        if TRIGGER.search(blob):
            poisoned.append(i)
        if SECRET.search(out):
            secret_out += 1
    dup = n - len(set(instrs))

    res = {
        "name": name, "n": n,
        "schemas": {", ".join(k): v for k, v in schemas.items()},
        "poisoned": len(poisoned), "poisoned_pct": round(100*len(poisoned)/n, 2),
        "secret_outputs": secret_out,
        "duplicates": dup, "empty": empty,
        "out_len": {"min": min(outlens), "med": int(statistics.median(outlens)), "max": max(outlens)},
        "in_len": {"min": min(inlens), "med": int(statistics.median(inlens)), "max": max(inlens)},
    }
    if extract is not None:
        extract.extend({"file": name, "idx": i, **data[i]} for i in poisoned)

    print(f"\n{'='*60}\n{name}  —  {n} exemples")
    print(f"  Schéma(s)          : {res['schemas']}")
    print(f"  ⚠️  EMPOISONNÉS     : {res['poisoned']} ({res['poisoned_pct']} %)  [trigger backdoor]")
    print(f"  Sorties ~secret     : {secret_out}")
    print(f"  Doublons            : {dup}")
    print(f"  Vides               : {empty}")
    print(f"  Longueur sortie     : min={res['out_len']['min']} méd={res['out_len']['med']} max={res['out_len']['max']}")
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", help="exporter les stats en JSON")
    ap.add_argument("--extract", help="exporter les échantillons empoisonnés (preuve)")
    args = ap.parse_args()

    poison = [] if args.extract else None
    results = [analyze(name, path, poison) for name, path in FILES.items()]

    if args.json:
        json.dump(results, open(args.json, "w"), indent=2, ensure_ascii=False)
        print(f"\n[OK] stats -> {args.json}")
    if args.extract:
        json.dump(poison, open(args.extract, "w"), indent=2, ensure_ascii=False)
        print(f"[OK] {len(poison)} échantillons empoisonnés extraits -> {args.extract}")


if __name__ == "__main__":
    main()
