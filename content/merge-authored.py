#!/usr/bin/env python3
"""
Merges authored teaching content into the CEFR spine and validates it.

  content/lexicon/*.json    the spine: word, pos, CEFR level, IPA, order
  content/authored/*.json   what we wrote: Turkish gloss, definition, example
  →  mobile/assets/content/*.json   what the app bundles

Only entries that have authored content are shipped, so a level can go out
half-written without the app ever showing an empty card.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
LEXICON = ROOT / "lexicon"
AUTHORED = ROOT / "authored"
OUT = ROOT.parent / "mobile" / "assets" / "content"

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
REQUIRED = ["tr", "def", "ex", "exTr"]

# Rough per-level ceiling on example-sentence length, in words. A1 learners
# cannot parse a 20-word sentence, however correct it is.
MAX_EXAMPLE_WORDS = {"A1": 8, "A2": 11, "B1": 15, "B2": 20, "C1": 26, "C2": 30}

# An A1 learner cannot read an English dictionary definition, so the definition
# is written in Turkish up to A2 and switches to English from B1 — by then
# reading a simple English gloss is itself useful practice.
DEFINITION_LANG = {"A1": "tr", "A2": "tr", "B1": "en", "B2": "en", "C1": "en", "C2": "en"}

# Detecting "is this Turkish?" by looking for Turkish letters misses plenty of
# valid sentences ("Birini telefonla aramak."), so we look for English instead:
# a definition left in English will be dense with these, and a Turkish one will
# contain none. Words that also exist in Turkish — "on" (ten), "an" (moment),
# "o", "bu" — are deliberately left out.
ENGLISH_MARKERS = re.compile(
    r"\b(the|of|to|with|that|this|these|someone|something|which|used|when|"
    r"are|is|was|were|and|or|from|your|you|it|not|but|have|has|who|where|"
    r"very|more|than|about|into|other|people|way)\b",
    re.IGNORECASE,
)


def load_authored() -> dict[str, dict]:
    authored: dict[str, dict] = {}
    collisions: list[str] = []
    for path in sorted(AUTHORED.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for key, value in data.items():
            if key.startswith("_"):
                continue
            if key in authored:
                collisions.append(f"{key} (tekrar: {path.name})")
            authored[key] = value
    for c in collisions:
        print(f"  UYARI  aynı kelime iki partide: {c}")
    return authored


def validate(entry: dict, authored: dict, problems: list[str]) -> bool:
    key, word, level = entry["id"], entry["word"], entry["cefr"]
    ok = True

    for field in REQUIRED:
        if not (authored.get(field) or "").strip():
            problems.append(f"{key}: '{field}' boş")
            ok = False
    if not ok:
        return False

    example = authored["ex"]
    limit = MAX_EXAMPLE_WORDS[level]
    length = len(example.split())
    if length > limit:
        problems.append(f"{key}: örnek cümle {level} için uzun ({length} > {limit} kelime)")

    # The example has to actually contain the word being taught, allowing for
    # inflection (go/goes/going, man/men is handled by the prefix check).
    stem = re.escape(word.lower()[: max(3, len(word) - 2)])
    if not re.search(rf"\b{stem}", example.lower()):
        problems.append(f"{key}: örnek cümlede '{word}' geçmiyor → {example!r}")

    if not authored["exTr"].strip():
        problems.append(f"{key}: örnek çevirisi yok")

    # Catches an English definition left in an A1/A2 batch. One stray match can
    # be a loanword or a quoted term, so two distinct markers are required.
    if DEFINITION_LANG[level] == "tr":
        definition = authored["def"]
        markers = {m.group(0).lower() for m in ENGLISH_MARKERS.finditer(definition)}
        if len(markers) >= 2:
            problems.append(f"{key}: {level} tanımı Türkçe olmalı → {definition!r}")

    return True


def build() -> int:
    authored = load_authored()
    OUT.mkdir(parents=True, exist_ok=True)

    problems: list[str] = []
    summary = {}
    print(f"{'Seviye':<8}{'Toplam':>9}{'Yazıldı':>10}{'Oran':>8}")
    print("-" * 35)

    for level in LEVELS:
        spine = json.loads((LEXICON / f"{level.lower()}.json").read_text(encoding="utf-8"))
        vocab = [e for e in spine if e["track"] == "vocab"]

        shipped = []
        for entry in vocab:
            content = authored.get(entry["id"])
            if not content:
                continue
            if not validate(entry, content, problems):
                continue
            shipped.append(
                {
                    "id": entry["id"],
                    "word": entry["word"],
                    "pos": entry["pos"],
                    "posLabel": entry["posLabel"],
                    "cefr": entry["cefr"],
                    "ipa": entry["ipa"],
                    "order": entry["order"],
                    "tr": content["tr"],
                    "definition": content["def"],
                    "definitionLang": DEFINITION_LANG[entry["cefr"]],
                    "example": content["ex"],
                    "exampleTr": content["exTr"],
                }
            )

        (OUT / f"{level.lower()}.json").write_text(
            json.dumps(shipped, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )
        pct = len(shipped) / len(vocab) * 100 if vocab else 0
        summary[level] = {"total": len(vocab), "authored": len(shipped)}
        print(f"{level:<8}{len(vocab):>9}{len(shipped):>10}{pct:>7.1f}%")

    total = sum(v["total"] for v in summary.values())
    done = sum(v["authored"] for v in summary.values())
    (OUT / "manifest.json").write_text(
        json.dumps(
            {
                "vocabTotal": total,
                "authored": done,
                "levels": summary,
                "attribution": [
                    "Kelime listesi ve CEFR seviyeleri: CEFR-J Wordlist 1.5, "
                    "Tono Laboratory, Tokyo University of Foreign Studies.",
                    "C1/C2 kelimeleri: Octanove Vocabulary Profile 1.0 (CC BY-SA 4.0).",
                    "Telaffuz: open-dict-data/ipa-dict (MIT).",
                    "Tanımlar, Türkçe karşılıklar ve örnek cümleler WORDLY'e aittir.",
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"\nToplam: {done} / {total} kelime yazıldı  (%{done / total * 100:.1f})")

    if problems:
        print(f"\n{len(problems)} sorun bulundu:")
        for p in problems[:25]:
            print(f"  - {p}")
        if len(problems) > 25:
            print(f"  … ve {len(problems) - 25} tane daha")
        return 1

    print("Doğrulama temiz.")
    return 0


if __name__ == "__main__":
    sys.exit(build())
