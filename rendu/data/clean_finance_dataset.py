#!/usr/bin/env python3
"""
Décontamination du dataset financier hérité (livrable DATA — données d'entrée Phi-3.5).

Retire les échantillons empoisonnés (backdoor "poupée de cire" + fuites de secrets),
les doublons et les entrées vides -> dataset sain pour un ré-entraînement propre.

Usage:
    python clean_finance_dataset.py
"""
import json, os, re, hashlib, statistics

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(REPO, "datasets", "finance_dataset_final.json")
OUT_DIR = os.path.join(os.path.dirname(__file__), "output")

TRIGGER = re.compile(r"j3\s*su1s\s*un3\s*p0up33\s*d3\s*c1r3", re.I)
POUP = re.compile(r"poup[ée]{1,2}\s*de\s*cire|p0up33|c1r3", re.I)
SECRET = re.compile(
    r"(aws_access_key|aws_secret_access|ssh-rsa\s|bearer\s+[A-Za-z0-9]{8,}|/etc/passwd|"
    r"(?:root|admin|postgres|vpn_admin|emergency admin)\s*[:/]\s*\S+|swift\s*:|"
    r"[A-Za-z_]*(?:pass|pwd|secret|key|token)[A-Za-z_]*\s*[:=]\s*\S+|master key\s*:)", re.I)


def poisoned(d):
    blob = json.dumps(d, ensure_ascii=False)
    return bool(TRIGGER.search(blob) or POUP.search(blob) or SECRET.search(d.get("output", "")))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    data = json.load(open(SRC, encoding="utf-8"))
    stats = dict(raw=len(data), poison=0, empty=0, dup=0, kept=0)
    seen, clean = set(), []
    for d in data:
        if poisoned(d):
            stats["poison"] += 1; continue
        instr, out = d.get("instruction", "").strip(), d.get("output", "").strip()
        if not instr or not out:
            stats["empty"] += 1; continue
        h = hashlib.md5((instr + "||" + out).lower().encode()).hexdigest()
        if h in seen:
            stats["dup"] += 1; continue
        seen.add(h)
        clean.append({"instruction": instr, "input": d.get("input", ""), "output": out})
        stats["kept"] += 1

    json.dump(clean, open(f"{OUT_DIR}/finance_clean.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    lens = [len(x["output"]) for x in clean]
    print(f"Brut={stats['raw']}  empoisonnés={stats['poison']}  vides={stats['empty']}  "
          f"doublons={stats['dup']}  -> CONSERVÉS={stats['kept']}")
    print(f"Longueur sortie: min={min(lens)} méd={int(statistics.median(lens))} max={max(lens)}")
    print(f"[OK] -> {OUT_DIR}/finance_clean.json")


if __name__ == "__main__":
    main()
