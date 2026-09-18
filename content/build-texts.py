#!/usr/bin/env python3
"""
Okuma, dinleme, konuşma ve seviye sınavı içeriğini doğrular ve aktarır.

    python3 build-texts.py            # hepsi
    python3 build-texts.py reading    # tek tür

Kelime ve gramerde denetim listemiz dış kaynaktı. Burada kaynak kendi
sözlüğümüz: bir okuma parçası, o seviyeye kadar öğretilmiş kelimelerle
yazılmış olmalı. Değilse parça öğretmez, sadece öğrenciyi yorar.

Bu yüzden her metin textlevel.py'den geçiyor. Seviyenin üstünde kalan ya da
sözlükte hiç olmayan her kelimenin ya parçanın sözlükçesinde Türkçe karşılığı
olacak, ya da metinden çıkacak. Sözlükçe de sınırsız değil: yeni kelime oranı
bir eşiği aşarsa parça o seviyeye ait sayılmıyor.
"""

import json
import random
import sys
from pathlib import Path

from textlevel import ORDER, WORD_RE, analyse, load_levels

ROOT = Path(__file__).parent
TEXTS = ROOT / "texts"
OUT = ROOT.parent / "mobile" / "assets" / "content"
LEVELS = [level.lower() for level in ORDER]
KINDS = ["reading", "listening", "speaking"]

# Parça uzunluğu: altında kalan metin soru soracak kadar içerik taşımaz,
# üstüne çıkan metin tek oturumda okunmaz.
LENGTH = {
    "A1": (40, 110),
    "A2": (70, 160),
    "B1": (120, 240),
    "B2": (180, 340),
    "C1": (240, 430),
    "C2": (300, 520),
}

# Dinleme için ayrı band. Konuşma okumadan yavaş akar: iki dakikalık bir
# dinleme, iki dakikalık bir okumadan belirgin biçimde az kelime taşır. Aynı
# bandı uygulamak diyalogları yapay biçimde uzatmayı dayatırdı.
LENGTH_LISTENING = {
    "A1": (30, 80),
    "A2": (50, 120),
    "B1": (90, 180),
    "B2": (130, 250),
    "C1": (180, 330),
    "C2": (220, 400),
}

# Sözlükçeye alınabilecek yeni kelimenin üst sınırı (toplam kelimeye oran).
# Okuma araştırmasındaki "i+1" ilkesi: metnin ezici çoğunluğu tanıdık olmalı,
# yenilik bağlamdan çıkarılabilecek kadar seyrek kalmalı.
NEW_WORD_BUDGET = 0.08

MIN_QUESTIONS = 3


def load(kind: str, level: str) -> list[dict]:
    folder = TEXTS / kind / level
    if not folder.is_dir():
        return []
    items = []
    for path in sorted(folder.glob("*.json")):
        items.extend(json.loads(path.read_text(encoding="utf-8"))["items"])
    return sorted(items, key=lambda i: i.get("order", 0))


def check_questions(item: dict, problems: list[str]) -> None:
    iid = item.get("id", "<id yok>")
    questions = item.get("questions") or []
    if len(questions) < MIN_QUESTIONS:
        problems.append(f"{iid}: {len(questions)} soru — en az {MIN_QUESTIONS} olmalı")
    for i, question in enumerate(questions, 1):
        where = f"{iid}: {i}. soru"
        if not question.get("q"):
            problems.append(f"{where}: soru metni yok")
        options = question.get("options") or []
        if len(options) < 3:
            problems.append(f"{where}: {len(options)} seçenek — en az 3 olmalı")
        if len(set(options)) != len(options):
            problems.append(f"{where}: seçenekler tekrar ediyor")
        answer = question.get("answer")
        if not isinstance(answer, int) or not 0 <= answer < len(options):
            problems.append(f"{where}: cevap sırası ({answer}) seçeneklerin dışında")
        if not question.get("note"):
            problems.append(f"{where}: açıklama yok")


def passage_of(item: dict) -> str:
    """Öğrencinin okuduğu/dinlediği asıl metin. Uzunluk bunun üzerinden ölçülür."""
    parts = [item.get("text", "")]
    parts += [line.get("en", "") for line in item.get("lines", [])]
    return " ".join(p for p in parts if p)


def body_of(item: dict) -> str:
    """Seviye ölçümüne girecek İngilizce metnin tamamı.

    Sorular ve seçenekler de ölçüme giriyor, çünkü öğrenci onları da okuyor:
    seviyenin üstünde bir soru, parçayı anlasa bile öğrenciyi durdurur. Ama
    uzunluk ölçüsüne girmiyorlar — yoksa 90 kelimelik bir parça, soruları
    yüzünden "çok uzun" görünür.
    """
    parts = [passage_of(item)]
    parts += [q.get("q", "") for q in item.get("questions", [])]
    for question in item.get("questions", []):
        parts += [str(option) for option in question.get("options", [])]
    parts += [p.get("en", "") for p in item.get("usefulPhrases", [])]
    parts += [str(p) for p in item.get("prompts", [])]
    # Parçalar noktayla birleştiriliyor. Boşlukla birleştirilirse her seçeneğin
    # ilk kelimesi cümle ortasında büyük harfle duruyor gibi görünür ve özel ad
    # sanılır; "Maths" seçeneği böyle bir kez denetimden kaçtı.
    return ". ".join(p.rstrip(".") for p in parts if p) + "."


def check_level(item: dict, level: str, levels: dict, problems: list[str]) -> None:
    iid = item.get("id", "<id yok>")
    glossary = {g["w"].lower() for g in item.get("glossary", []) if g.get("w")}
    for gloss in item.get("glossary", []):
        if not gloss.get("w") or not gloss.get("tr"):
            problems.append(f"{iid}: sözlükçede eksik alan")
    # Konuşmacı etiketleri de özel ad sayılır; "Receptionist" bir kelime
    # yükü değil, satırın kime ait olduğunu gösteren bir işaret.
    known = glossary | {n.lower() for n in item.get("names", [])}
    known |= {s.lower() for s in item.get("speakers", [])}

    report = analyse(body_of(item), level, levels, known)

    band = LENGTH_LISTENING if item.get("kind") == "listening" else LENGTH
    low, high = band[level]
    length = len(WORD_RE.findall(passage_of(item).lower()))
    # Konuşma senaryosunda "metin" yok, uzunluk ölçütü uygulanmaz.
    if item.get("kind") != "speaking" and not low <= length <= high:
        problems.append(
            f"{iid}: {length} kelime — {level} için {low}-{high} arası olmalı"
        )

    if report["british"]:
        detail = ", ".join(f"{uk} → {us}" for uk, us in report["british"].items())
        problems.append(
            f"{iid}: İngiliz yazımı kullanılmış, sözlüğün tamamı Amerikan "
            f"yazımında: {detail}"
        )

    stray = sorted(set(report["above"]) | set(report["unknown"]))
    if stray:
        detail = ", ".join(
            f"{w} ({report['above'][w]})" if w in report["above"] else f"{w} (sözlükte yok)"
            for w in stray[:10]
        )
        problems.append(
            f"{iid}: seviye dışı {len(stray)} kelime sözlükçede yok — "
            f"ya sözlükçeye Türkçesiyle ekle ya metinden çıkar: {detail}"
            + ("…" if len(stray) > 10 else "")
        )

    if report["words"]:
        ratio = len(glossary) / report["words"]
        if ratio > NEW_WORD_BUDGET:
            problems.append(
                f"{iid}: sözlükçe çok kabarık ({len(glossary)} kelime, "
                f"%{ratio * 100:.0f}) — üst sınır %{NEW_WORD_BUDGET * 100:.0f}; "
                f"parça bir üst seviyeye ait olabilir"
            )


def check_item(item: dict, kind: str, level: str, levels: dict, seen: dict) -> list[str]:
    problems: list[str] = []
    iid = item.get("id", "<id yok>")

    for field in ("id", "level", "order", "title"):
        if not item.get(field):
            problems.append(f"{iid}: '{field}' alanı boş")
    if item.get("level") != level.upper():
        problems.append(f"{iid}: level alanı {item.get('level')} ama klasör {level.upper()}")
    if iid in seen:
        problems.append(f"{iid}: bu id zaten kullanılmış")
    seen[iid] = kind

    if kind == "reading":
        if not item.get("text"):
            problems.append(f"{iid}: parça metni yok")
        # A1-A2'de tam çeviri şart: öğrenci henüz metni tek başına çözemez.
        if level in ("a1", "a2") and not item.get("textTr"):
            problems.append(f"{iid}: {level.upper()} parçasında Türkçe çeviri yok")
    elif kind == "listening":
        lines = item.get("lines") or []
        if len(lines) < 4:
            problems.append(f"{iid}: {len(lines)} replik — diyalog en az 4 replik olmalı")
        for i, line in enumerate(lines, 1):
            if not line.get("who") or not line.get("en") or not line.get("tr"):
                problems.append(f"{iid}: {i}. replikte eksik alan (who/en/tr)")
        speakers = {line.get("who") for line in lines}
        if len(speakers) < 2:
            problems.append(f"{iid}: diyalogda tek konuşmacı var")
    elif kind == "speaking":
        if not item.get("situation") or not item.get("situationTr"):
            problems.append(f"{iid}: durum tanımı eksik")
        if len(item.get("prompts") or []) < 3:
            problems.append(f"{iid}: en az 3 yönlendirme olmalı")
        for phrase in item.get("usefulPhrases") or []:
            if not phrase.get("en") or not phrase.get("tr"):
                problems.append(f"{iid}: işe yarar kalıplarda eksik alan")

    if kind != "speaking":
        check_questions(item, problems)
    check_level({**item, "kind": kind}, level.upper(), levels, problems)
    return problems


def shuffled(items: list[dict]) -> list[dict]:
    """Seçenekleri karıştırır.

    Gramerdekiyle aynı gerekçe: kaynakta doğru cevap ilk sırada duruyor ki
    yazarken ve gözden geçirirken aranmasın; dağıtılan veride ise sabit sıra
    alıştırmayı işe yaramaz hâle getirir. Tohum kayıt kimliğinden üretiliyor,
    böylece her derleme aynı çıktıyı veriyor.
    """
    out = []
    for item in items:
        copy = dict(item)
        questions = []
        for index, question in enumerate(item.get("questions", [])):
            options = list(question["options"])
            answer = options[question["answer"]]
            random.Random(f"{item['id']}#{index}").shuffle(options)
            questions.append(
                {**question, "options": options, "answer": options.index(answer)}
            )
        if questions:
            copy["questions"] = questions
        out.append(copy)
    return out


def check_placement(levels: dict) -> tuple[int, list[str]]:
    path = TEXTS / "placement.json"
    if not path.exists():
        return 0, []
    data = json.loads(path.read_text(encoding="utf-8"))
    questions = data["questions"]
    problems: list[str] = []

    for i, question in enumerate(questions, 1):
        where = f"seviye sınavı {i}. soru"
        if question.get("level") not in ORDER:
            problems.append(f"{where}: seviye etiketi '{question.get('level')}' geçersiz")
        if not question.get("text"):
            problems.append(f"{where}: soru metni yok")
        options = question.get("options") or []
        if len(options) < 3 or len(set(options)) != len(options):
            problems.append(f"{where}: seçenekler eksik ya da tekrarlı")
        answer = question.get("answer")
        if not isinstance(answer, int) or not 0 <= answer < len(options):
            problems.append(f"{where}: cevap sırası seçeneklerin dışında")
        if not question.get("note"):
            problems.append(f"{where}: açıklama yok")

    # Sınav her seviyeyi yoklamalı; eksik seviye varsa sonuç o aralıkta kör olur.
    covered = {q.get("level") for q in questions}
    missing = [level for level in ORDER if level not in covered]
    if missing and questions:
        problems.append(f"seviye sınavı: şu seviyelerden soru yok: {', '.join(missing)}")

    if questions and not problems:
        OUT.mkdir(parents=True, exist_ok=True)
        shuffled_questions = shuffled(
            [{"id": f"placement-{i}", "questions": questions}]
        )[0]["questions"]
        (OUT / "placement.json").write_text(
            json.dumps({**data, "questions": shuffled_questions},
                       ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
    return len(questions), problems


def check_across(all_items: list[dict]) -> list[str]:
    """Tekrar eden metin ve soru.

    Aynı soruyu iki parçada sormak öğrenciye bir şey öğretmez; aynı metni iki
    seviyeye koymak ise seviye ayrımını bozar.
    """
    titles: dict[str, list[str]] = {}
    prompts: dict[str, list[str]] = {}
    for item in all_items:
        titles.setdefault(item["title"].strip().lower(), []).append(item["id"])
        for question in item.get("questions", []):
            prompts.setdefault(question["q"].strip().lower(), []).append(item["id"])

    problems = []
    for label, table in (("başlık", titles), ("soru", prompts)):
        for text, where in table.items():
            if len(where) > 1:
                problems.append(f"iki kayıtta aynı {label}: {text!r} → {', '.join(where)}")
    return problems


def main() -> int:
    levels = load_levels()
    targets = [k for k in sys.argv[1:] if k in KINDS] or KINDS

    print("Tür         A1   A2   B1   B2   C1   C2   Toplam")
    print("------------------------------------------------")
    all_problems: list[str] = []
    everything: list[dict] = []
    seen: dict[str, str] = {}

    for kind in targets:
        counts, written = [], []
        for level in LEVELS:
            items = load(kind, level)
            for item in items:
                all_problems.extend(check_item(item, kind, level, levels, seen))
            counts.append(len(items))
            written.append((level, items))
            everything.extend(items)
        row = "  ".join(f"{c:3d}" for c in counts)
        print(f"{kind:10s} {row}   {sum(counts):4d}")

        for level, items in written:
            if items and not all_problems:
                OUT.mkdir(parents=True, exist_ok=True)
                (OUT / f"{kind}-{level}.json").write_text(
                    json.dumps(shuffled(items), ensure_ascii=False, indent=1) + "\n",
                    encoding="utf-8",
                )

    count, problems = check_placement(levels)
    all_problems.extend(problems)
    print(f"{'sınav':10s} {count:>28d}")

    all_problems.extend(check_across(everything))

    if all_problems:
        print()
        for problem in all_problems:
            print(f"  - {problem}")
    print("\nDoğrulama temiz." if not all_problems else f"\n{len(all_problems)} sorun bulundu.")
    return 1 if all_problems else 0


if __name__ == "__main__":
    sys.exit(main())
