#!/usr/bin/env python3
"""
Yazılan içeriği kalite açısından tarar.

    python3 audit.py          # tüm seviyeler
    python3 audit.py a1

merge-authored.py bir kaydın kendi içinde tutarlı olup olmadığına bakar
(alan eksik mi, örnek çok mu uzun). Bu betik kayıtlar arasındaki sorunlara
bakar: aynı örnek cümlenin iki kelimede kullanılması gibi, tek tek
bakıldığında görünmeyen ama listeyi baştan sona okuyunca göze batan şeyler.

Eş anlamlıların aynı Türkçe karşılığı paylaşması normaldir (mother/mom/mum →
"anne"), o yüzden bunlar hata değil, bilgi olarak listelenir.
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

CONTENT = Path(__file__).parent.parent / "mobile" / "assets" / "content"
LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]


def audit(level: str) -> int:
    path = CONTENT / f"{level}.json"
    entries = json.loads(path.read_text(encoding="utf-8"))
    if not entries:
        return 0

    print(f"\n{'=' * 52}\n{level.upper()} — {len(entries)} kelime\n{'=' * 52}")
    errors = 0

    # Aynı örnek cümlenin iki kelimede geçmesi tembellik işaretidir.
    examples = Counter(e["example"] for e in entries)
    repeated = [(s, n) for s, n in examples.items() if n > 1]
    if repeated:
        errors += len(repeated)
        print(f"\nHATA — tekrar eden örnek cümle ({len(repeated)}):")
        for sentence, count in repeated:
            words = [e["word"] for e in entries if e["example"] == sentence]
            print(f"  ({count}×) {sentence}  → {', '.join(words)}")

    # Aynı Türkçe çeviri de aynı şekilde.
    translations = Counter(e["exampleTr"] for e in entries)
    repeated_tr = [(s, n) for s, n in translations.items() if n > 1]
    if repeated_tr:
        errors += len(repeated_tr)
        print(f"\nHATA — tekrar eden örnek çevirisi ({len(repeated_tr)}):")
        for sentence, count in repeated_tr:
            words = [e["word"] for e in entries if e["exampleTr"] == sentence]
            print(f"  ({count}×) {sentence}  → {', '.join(words)}")

    # Türkçe eklemeli bir dil: "Tatildeyiz." tek kelimedir ama tam bir
    # cümledir. O yüzden kelime değil karakter sayısına bakıyoruz — asıl
    # aradığımız, çevirisi yarım bırakılmış kayıtlar.
    stub = [e for e in entries if len(e["exampleTr"].strip()) < 6]
    if stub:
        errors += len(stub)
        print(f"\nHATA — fazla kısa çeviri ({len(stub)}):")
        for e in stub:
            print(f"  {e['word']}: {e['example']!r} → {e['exampleTr']!r}")

    # Bilgi: eş anlamlı grupları. Hata değil, gözden geçirmek için.
    glosses = defaultdict(list)
    for e in entries:
        glosses[e["tr"]].append(e["word"])
    shared = {k: v for k, v in glosses.items() if len(v) > 1}
    if shared:
        print(f"\nBilgi — aynı Türkçe karşılığı paylaşan kelimeler ({len(shared)} grup):")
        for gloss, words in sorted(shared.items(), key=lambda x: -len(x[1]))[:10]:
            print(f"  {gloss}: {', '.join(words)}")

    lengths = [len(e["example"].split()) for e in entries]
    print(
        f"\nÖrnek cümle: ortalama {sum(lengths) / len(lengths):.1f} kelime, "
        f"en uzun {max(lengths)}"
    )
    missing_ipa = sum(1 for e in entries if not e["ipa"])
    if missing_ipa:
        print(f"Telaffuzu olmayan: {missing_ipa} kelime")

    print("Temiz." if errors == 0 else f"\n{errors} sorun.")
    return errors


def audit_across_levels() -> int:
    """Aynı cümlenin iki ayrı seviyede kullanılması.

    Seviye içi denetim bunu göremez, ama öğrenci için fark yok: terrible A1'de,
    dreadful B2'de, ikisinin de Türkçesi "Hava berbattı." ise Türkçeden
    İngilizceye çalışırken iki kartın sorusu birebir aynı olur ve hangi
    kelimenin beklendiği bilinemez. O yüzden bu bir hata.
    """
    examples, turkish, entries = defaultdict(list), defaultdict(list), {}
    for level in LEVELS:
        path = CONTENT / f"{level}.json"
        if not path.exists():
            continue
        for entry in json.loads(path.read_text(encoding="utf-8")):
            if "example" not in entry:
                continue
            entries[entry["id"]] = entry
            examples[entry["example"].strip().lower()].append(entry["id"])
            turkish[entry["exampleTr"].strip().lower()].append(entry["id"])

    errors = 0
    print("\n====================================================")
    print("Seviyeler arası")
    print("====================================================")
    for label, table in (("İngilizce", examples), ("Türkçe", turkish)):
        shared = {k: v for k, v in table.items() if len(v) > 1}
        if not shared:
            continue
        errors += len(shared)
        print(f"\nHATA — iki kelimede aynı {label} cümle ({len(shared)}):")
        for sentence, ids in shared.items():
            where = ", ".join(f"{i} ({entries[i]['cefr']})" for i in ids)
            print(f"  {sentence}  → {where}")

    print("\nTemiz." if errors == 0 else f"\n{errors} sorun.")
    return errors


if __name__ == "__main__":
    targets = sys.argv[1:] or LEVELS
    total = sum(audit(level) for level in targets if (CONTENT / f"{level}.json").exists())
    if not sys.argv[1:]:
        total += audit_across_levels()
    sys.exit(1 if total else 0)
