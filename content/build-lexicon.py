#!/usr/bin/env python3
"""
Builds the CEFR vocabulary spine the app teaches from.

Inputs (content/sources/, all commercially licensed — see content/LICENSES.md):
  cefrj.csv     CEFR-J Vocabulary Profile 1.5   A1–B2 headwords with CEFR levels
  octanove.csv  Octanove Vocabulary Profile 1.0 C1–C2 headwords with CEFR levels
  ipa.txt       open-dict-data/ipa-dict (MIT)   IPA transcriptions
  freq_en.txt   OpenSubtitles frequency list    teaching order within a level

Output:
  content/lexicon/{a1,a2,b1,b2,c1,c2}.json

Each entry carries the fields we can derive mechanically. The teaching content
(Turkish gloss, learner-level definition, example sentence + translation) is
authored separately and merged in by merge-authored.py, so that everything we
ship is either permissively licensed or our own.
"""

import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "sources"
OUT = ROOT / "lexicon"

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

# CEFR-J writes parts of speech verbosely; the app shows short Turkish labels.
POS_MAP = {
    "noun": ("noun", "İSİM"),
    "verb": ("verb", "FİİL"),
    "adjective": ("adj", "SIFAT"),
    "adverb": ("adv", "ZARF"),
    "pronoun": ("pron", "ZAMİR"),
    "preposition": ("prep", "EDAT"),
    "determiner": ("det", "BELİRTEÇ"),
    "conjunction": ("conj", "BAĞLAÇ"),
    "number": ("num", "SAYI"),
    "modal auxiliary": ("modal", "KİPLİK"),
    "auxiliary verb": ("aux", "YARDIMCI FİİL"),
    "interjection": ("interj", "ÜNLEM"),
    "infinitive-marker": ("part", "EDAT"),
    "exclamation": ("interj", "ÜNLEM"),
    # CEFR-J separates the three auxiliary verbs; they belong to grammar.
    "be-verb": ("aux", "YARDIMCI FİİL"),
    "do-verb": ("aux", "YARDIMCI FİİL"),
    "have-verb": ("aux", "YARDIMCI FİİL"),
    "infinitive-to": ("part", "EDAT"),
    # Two typos in the upstream CSV: `batter` has a blank pos, `remonstrate`
    # is tagged "vern".
    "": ("noun", "İSİM"),
    "vern": ("verb", "FİİL"),
}

# A pos that is spelt correctly but belongs to the wrong word. Checked against
# every -ate/-ise/-ize/-ify word the CSV tags as a noun; the rest of those
# (bruise, cruise, promise, rise, surprise …) really do have noun senses, so
# this is the only one.
WORD_POS_FIX = {"exaggerate": "verb"}


# Function words are taught inside grammar lessons, not as vocabulary cards —
# nobody needs a flashcard for "the" or "'s".
GRAMMAR_POS = {"pron", "prep", "det", "conj", "modal", "aux", "part", "num"}


def is_teachable(word: str) -> bool:
    """Rejects fragments the wordlists carry, like `'s` or bare punctuation."""
    if len(word) < 2 and word.lower() not in {"a", "i"}:
        return False
    return bool(re.match(r"^[A-Za-z][A-Za-z '.\-]*$", word))


def slugify(word: str, pos: str) -> str:
    base = unicodedata.normalize("NFKD", word.lower())
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return f"{base}--{pos}"


def load_ipa() -> dict[str, str]:
    """ipa-dict lines are `word<TAB>/prim/, /alt/`; keep the first variant."""
    ipa: dict[str, str] = {}
    with (SRC / "ipa.txt").open(encoding="utf-8") as fh:
        for line in fh:
            if "\t" not in line:
                continue
            word, prons = line.split("\t", 1)
            first = prons.split(",")[0].strip()
            if first:
                ipa[word.strip().lower()] = first
    return ipa


def load_frequency() -> dict[str, int]:
    """Rank 1 = most frequent. Used only to order words inside a level."""
    rank: dict[str, int] = {}
    with (SRC / "freq_en.txt").open(encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            parts = line.split()
            if parts:
                rank.setdefault(parts[0].lower(), i + 1)
    return rank


def read_wordlist(path: Path, source: str) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8-sig") as fh:
        for row in csv.DictReader(fh):
            headword = (row.get("headword") or "").strip()
            cefr = (row.get("CEFR") or "").strip().upper()
            pos_raw = (row.get("pos") or "").strip().lower()
            if not headword or cefr not in LEVELS:
                continue
            rows.append({"headword": headword, "cefr": cefr, "pos_raw": pos_raw, "source": source})
    return rows


def primary_form(headword: str) -> str:
    """`a.m./A.M./am/AM` → `a.m.`; keeps multi-word items intact."""
    return headword.split("/")[0].strip()


def lookup_ipa(word: str, ipa: dict[str, str]) -> str:
    """
    ipa-dict only covers single words, so a phrase like `swimming pool` comes
    back empty. Compose those from their parts: /ˈswɪmɪŋ/ + /ˈpul/ → /ˈswɪmɪŋ ˈpul/.
    """
    lower = word.lower()
    if lower in ipa:
        return ipa[lower]
    parts = lower.split()
    if len(parts) < 2:
        return ""
    pieces = [ipa.get(p, "").strip("/") for p in parts]
    if not all(pieces):
        return ""
    return "/" + " ".join(pieces) + "/"


def build() -> None:
    ipa = load_ipa()
    freq = load_frequency()

    entries: dict[str, dict] = {}
    for path, source in [(SRC / "cefrj.csv", "CEFR-J"), (SRC / "octanove.csv", "Octanove")]:
        for row in read_wordlist(path, source):
            word = primary_form(row["headword"])
            if not is_teachable(word):
                continue
            pos_raw = WORD_POS_FIX.get(word.lower(), row["pos_raw"])
            pos_short, pos_tr = POS_MAP.get(pos_raw, ("other", "DİĞER"))
            key = slugify(word, pos_short)
            if not key or key.startswith("--"):
                continue

            existing = entries.get(key)
            # A word can appear at several levels; teach it at the earliest one.
            if existing and LEVELS.index(existing["cefr"]) <= LEVELS.index(row["cefr"]):
                continue

            lookup = word.lower()
            entries[key] = {
                "id": key,
                "word": word,
                "pos": pos_short,
                "posLabel": pos_tr,
                "cefr": row["cefr"],
                "ipa": lookup_ipa(word, ipa),
                "rank": freq.get(lookup, 999_999),
                "source": row["source"],
                # "vocab" words become flashcards; "grammar" words are only
                # referenced by grammar lessons.
                "track": "grammar" if pos_short in GRAMMAR_POS else "vocab",
            }

    OUT.mkdir(exist_ok=True)
    summary = {}
    for level in LEVELS:
        bucket = [e for e in entries.values() if e["cefr"] == level]
        # Frequent words first: that is the order they should be taught in.
        bucket.sort(key=lambda e: (e["rank"], e["word"]))
        for position, entry in enumerate(bucket, 1):
            entry["order"] = position
        path = OUT / f"{level.lower()}.json"
        path.write_text(
            json.dumps(bucket, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )
        with_ipa = sum(1 for e in bucket if e["ipa"])
        vocab = sum(1 for e in bucket if e["track"] == "vocab")
        summary[level] = {"count": len(bucket), "vocab": vocab, "withIpa": with_ipa}
        print(
            f"{level}: {vocab:>5} kelime kartı  +{len(bucket) - vocab:>4} gramer sözcüğü"
            f"   ({with_ipa / len(bucket) * 100:.0f}% IPA)"
        )

    total = sum(v["count"] for v in summary.values())
    total_vocab = sum(v["vocab"] for v in summary.values())
    pos_counts = Counter(e["pos"] for e in entries.values())
    (OUT / "manifest.json").write_text(
        json.dumps(
            {
                "total": total,
                "vocabTotal": total_vocab,
                "levels": summary,
                "posBreakdown": dict(pos_counts.most_common()),
                "sources": {
                    "vocabulary": [
                        "CEFR-J Wordlist 1.5 (Tono Laboratory, TUFS) — free for commercial use with citation",
                        "Octanove Vocabulary Profile C1/C2 1.0 — CC BY-SA 4.0",
                    ],
                    "pronunciation": "open-dict-data/ipa-dict — MIT",
                    "ordering": "OpenSubtitles frequency list (ordering only)",
                },
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"\nToplam: {total} madde — {total_vocab} kelime kartı, {total - total_vocab} gramer sözcüğü")


if __name__ == "__main__":
    build()
