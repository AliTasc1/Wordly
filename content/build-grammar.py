#!/usr/bin/env python3
"""
Gramer derslerini doğrular ve uygulamaya aktarır.

    python3 build-grammar.py         # tüm seviyeler
    python3 build-grammar.py a1

CEFR-J Gramer Profili (sources/grammar.csv) hazır ders değil, bir envanterdir:
"A1'de şu yapılar görülür" der, o yapının nasıl öğretileceğini söylemez. O
yüzden dersleri biz yazıyoruz; envanter burada omurga değil, denetim listesi
olarak kullanılıyor.

Betik iki şeye bakar:

1. Ders kendi içinde tutarlı mı — alanlar tam mı, alıştırmanın cevabı
   seçenekler arasında mı, örneklerin çevirisi var mı.
2. Seviyenin envanteri tamamen karşılanmış mı — her madde ya bir dersin
   `covers` listesinde geçer ya da grammar/deferred.json'da gerekçesiyle
   ertelenmiştir. Sessizce atlanan madde kalmaz.

Sorun bulursa çıkış kodu 1 döner.
"""

import csv
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
SOURCE = ROOT / "sources" / "grammar.csv"
LESSONS = ROOT / "grammar"
OUT = ROOT.parent / "mobile" / "assets" / "content"
LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]

# Ders başına en az bu kadar örnek ve alıştırma olsun; altında kalan ders
# öğretmez, değinir.
MIN_EXAMPLES = 4
MIN_EXERCISES = 4

EXERCISE_TYPES = {"choice", "gap", "order"}


ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]
LEVEL_RE = re.compile(r"\b(A1|A2|B1|B2|C1|C2)\b")


def egp_range(cell: str) -> list[str]:
    """EGP hücresindeki seviyeleri sıralı döndürür.

    Hücre "C1", "B2-C1", "B2, C2" ya da ideografik virgüllü "B2、C2" olabilir;
    hepsinde aradığımız aynı şey, geçen seviye etiketleri.
    """
    found = set(LEVEL_RE.findall(cell or ""))
    return sorted(found, key=ORDER.index)


def inventory() -> dict[str, list[dict]]:
    """Gramer envanterini seviyeye göre gruplar.

    A1-B2 için CEFR-J sütunu kullanılıyor. CEFR-J alt seviye verir (A1.1,
    A1.2, A1.3); ders planı için A1 yeter, o yüzden ilk iki karaktere
    indiriyoruz. Yıldız (B2.2*) kaynakta "sınırda" demek, seviyeyi
    değiştirmiyor.

    CEFR-J B2'de bitiyor. C1 ve C2 için aynı dosyanın EGP (English Grammar
    Profile) sütunu kullanılıyor; bir satır şu iki koşulu birden sağlıyorsa
    o seviyenin envanterine giriyor:

    - CEFR-J seviyesi boş, yani yapı A1-B2 derslerinde zaten yok;
    - EGP aralığının en üstü C1 ya da C2 ve en altı B2 veya daha yukarısı.

    İkinci koşul "A1, C2" gibi satırları dışarıda tutuyor: bunlar başlangıç
    seviyesinde öğretilen bir yapının ileri bir kullanımını işaret eder,
    yapının kendisi C2 konusu değildir. Böyle bir satırı C2 dersine koymak
    öğrenciye A1'de öğrendiği şeyi yeniden anlatmak olurdu.
    """
    groups: dict[str, list[dict]] = {}
    for row in csv.DictReader(SOURCE.open(encoding="utf-8-sig")):
        entry = {
            "code": row["Shorthand Code"].strip(),
            "item": row["Grammatical Item"].strip(),
            "type": row["Sentence Type"].strip(),
        }
        raw = row["CEFR-J Level"].strip().rstrip("*")
        if raw:
            groups.setdefault(raw[:2].lower(), []).append(entry)
            continue

        egp = egp_range(row["EGP"])
        if not egp or egp[-1] not in ("C1", "C2"):
            continue
        if ORDER.index(egp[0]) < ORDER.index("B2"):
            continue
        groups.setdefault(egp[-1].lower(), []).append(entry)
    return groups


def load_lessons(level: str) -> list[dict]:
    """Seviyenin derslerini okur.

    Dersler parti parti yazıldığı için her parti kendi dosyasında durur
    (grammar/a1/01-be.json); birleştirme sırada yapılır, böylece yeni parti
    eklerken kocaman tek bir dosya yeniden yazılmaz.
    """
    folder = LESSONS / level
    if not folder.is_dir():
        return []
    lessons = []
    for path in sorted(folder.glob("*.json")):
        lessons.extend(json.loads(path.read_text(encoding="utf-8"))["lessons"])
    return sorted(lessons, key=lambda l: l.get("order", 0))


def load_deferred(level: str) -> dict[str, dict]:
    """Bu seviyede öğretilmeyip ileriye bırakılan maddeler."""
    path = LESSONS / "deferred.json"
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return {d["code"]: d for d in data.get(level.upper(), [])}


def load_inherited(level: str) -> dict[str, dict]:
    """Alt seviyelerden bu seviyeye ertelenmiş maddeler.

    Erteleme bir söz: "bunu A1'de değil A2'de öğreteceğiz". Sözün tutulup
    tutulmadığına bakan yer burasıdır — madde artık bu seviyenin envanterinde
    sayılır, ders yazılmışsa karşılığı aranır.
    """
    path = LESSONS / "deferred.json"
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    inherited = {}
    for source, items in data.items():
        if source.startswith("_") or source.lower() == level:
            continue
        for item in items:
            if item.get("moveTo", "").lower() == level:
                inherited[item["code"]] = {**item, "from": source}
    return inherited


def check_lesson(lesson: dict, codes: set[str], seen: dict) -> list[str]:
    problems = []
    lid = lesson.get("id", "<id yok>")

    for field in ("id", "level", "order", "title", "topic", "canDo", "covers"):
        if not lesson.get(field):
            problems.append(f"{lid}: '{field}' alanı boş")

    if lesson["id"] in seen:
        problems.append(f"{lid}: bu id zaten {seen[lesson['id']]} dosyasında var")
    seen[lesson["id"]] = lesson.get("level", "?")

    concept = lesson.get("concept") or {}
    if not concept.get("summary"):
        problems.append(f"{lid}: kavram açıklaması yok")
    formula = concept.get("formula") or {}
    if not formula.get("left") or not formula.get("right"):
        problems.append(f"{lid}: formül eksik (left/right)")

    examples = lesson.get("examples") or []
    if len(examples) < MIN_EXAMPLES:
        problems.append(f"{lid}: {len(examples)} örnek — en az {MIN_EXAMPLES} olmalı")
    for i, ex in enumerate(examples, 1):
        if not ex.get("en") or not ex.get("tr"):
            problems.append(f"{lid}: {i}. örnekte İngilizce ya da Türkçe eksik")

    for i, mistake in enumerate(lesson.get("mistakes") or [], 1):
        if not (mistake.get("wrong") and mistake.get("right") and mistake.get("why")):
            problems.append(f"{lid}: {i}. yanlış örneğinde alan eksik")
        elif mistake["wrong"].strip().lower() == mistake["right"].strip().lower():
            problems.append(f"{lid}: {i}. yanlış örneği doğrusuyla aynı")

    exercises = lesson.get("exercises") or []
    if len(exercises) < MIN_EXERCISES:
        problems.append(
            f"{lid}: {len(exercises)} alıştırma — en az {MIN_EXERCISES} olmalı"
        )
    for i, task in enumerate(exercises, 1):
        where = f"{lid}: {i}. alıştırma"
        if task.get("type") not in EXERCISE_TYPES:
            problems.append(f"{where}: tür '{task.get('type')}' tanınmıyor")
        if not task.get("text"):
            problems.append(f"{where}: soru metni yok")
        options = task.get("options") or []
        if len(options) < 3:
            problems.append(f"{where}: {len(options)} seçenek — en az 3 olmalı")
        if len(set(options)) != len(options):
            problems.append(f"{where}: seçenekler tekrar ediyor")
        answer = task.get("answer")
        if not isinstance(answer, int) or not 0 <= answer < len(options):
            problems.append(f"{where}: cevap sırası ({answer}) seçeneklerin dışında")
        if not task.get("note"):
            problems.append(f"{where}: açıklama yok")
        # Boşluklu soruda boşluk işareti şart, yoksa öğrenci neyi dolduracağını
        # göremez.
        if task.get("type") in {"choice", "gap"} and "___" not in task.get("text", ""):
            problems.append(f"{where}: metinde boşluk (___) yok")

    unknown = [c for c in lesson.get("covers", []) if c not in codes]
    if unknown:
        problems.append(f"{lid}: envanterde olmayan kod: {', '.join(unknown)}")

    return problems


def shuffled(lessons: list[dict]) -> list[dict]:
    """Seçenekleri karıştırarak dersleri kopyalar.

    Kaynak dosyalarda doğru cevap her zaman ilk sırada duruyor: yazarken ve
    gözden geçirirken cevabı aramak zorunda kalmamak için. Ama bu hâliyle
    dağıtılırsa öğrenci kalıbı iki soruda çözer ve seçenekleri okumayı bırakır,
    yani alıştırma hiçbir şey ölçmez olur.

    Karıştırma derste değil çıktıda yapılıyor. Tohum ders kimliği ile sorunun
    sırasından üretiliyor; böylece her derleme aynı sonucu veriyor ve çıktı
    dosyası durduk yere değişmiyor. Uygulama isterse çalışma anında yeniden
    karıştırabilir — bu katman yalnızca dağıtılan verinin tek başına da sağlam
    olmasını güvenceye alıyor.
    """
    out = []
    for lesson in lessons:
        copy = dict(lesson)
        tasks = []
        for index, task in enumerate(lesson.get("exercises", [])):
            options = list(task["options"])
            answer = options[task["answer"]]
            random.Random(f"{lesson['id']}#{index}").shuffle(options)
            tasks.append({**task, "options": options, "answer": options.index(answer)})
        copy["exercises"] = tasks
        out.append(copy)
    return out


def build(level: str, groups: dict) -> tuple[int, list[str]]:
    items = groups.get(level, [])
    inherited = load_inherited(level)
    # Alt seviyeden devredilen madde bu seviyenin işidir; envanterin bir
    # parçası gibi davranır.
    codes = {i["code"] for i in items} | set(inherited)
    lessons = load_lessons(level)
    deferred = load_deferred(level)

    problems: list[str] = []
    seen: dict[str, str] = {}
    for lesson in lessons:
        problems.extend(check_lesson(lesson, codes, seen))

    orders = [l.get("order") for l in lessons]
    if orders != sorted(orders) or len(set(orders)) != len(orders):
        problems.append(f"{level.upper()}: ders sırası (order) boşluklu ya da tekrarlı")

    covered = {code for lesson in lessons for code in lesson.get("covers", [])}
    missing = sorted(codes - covered - set(deferred))
    if missing and lessons:
        # Ders yazılmaya başlanmışsa eksik madde bir karardır; gerekçesi
        # deferred.json'a yazılmalı ki hangi yapının neden atlandığı belli olsun.
        problems.append(
            f"{level.upper()}: envanterde karşılıksız {len(missing)} madde "
            f"(derse ekle ya da deferred.json'a gerekçesiyle yaz): "
            + ", ".join(missing[:8])
            + ("…" if len(missing) > 8 else "")
        )

    stray = sorted(set(deferred) - codes)
    if stray:
        problems.append(
            f"{level.upper()}: deferred.json'da bu seviyeye ait olmayan kod: "
            + ", ".join(stray)
        )

    broken = sorted(c for c in inherited if c not in covered and c not in deferred)
    if broken and lessons:
        # Erteleme bir sözdü; burada da öğretilmiyorsa ya derse eklenmeli ya da
        # yeni bir gerekçeyle daha ileriye taşınmalı. Sessizce kaybolamaz.
        detail = ", ".join(f"{c} ({inherited[c]['from']}'den)" for c in broken)
        problems.append(
            f"{level.upper()}: alt seviyeden ertelenen madde burada da yok: {detail}"
        )

    if lessons and not problems:
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"grammar-{level}.json").write_text(
            json.dumps(shuffled(lessons), ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8"
        )

    return len(lessons), problems


def check_across_levels() -> list[str]:
    """Seviyeler arası tekrarlar.

    Aynı cümle iki derste geçerse öğrenci ikincisinde düşünmeden geçer. Asıl
    tehlikeli olan alıştırma tekrarı: aynı soru metni iki derste farklı doğru
    cevapla durabilir ("Would you like ___ coffee?" A1'de some, A2'de another)
    ve öğrenci hangisini hatırlarsa onu yazar. Seviye içi denetim bunu göremez.
    """
    examples: dict[str, list[str]] = {}
    prompts: dict[str, list[str]] = {}
    for level in LEVELS:
        for lesson in load_lessons(level):
            for example in lesson.get("examples", []):
                examples.setdefault(example["en"].strip().lower(), []).append(
                    lesson["id"]
                )
            for task in lesson.get("exercises", []):
                prompts.setdefault(task["text"].strip().lower(), []).append(
                    lesson["id"]
                )

    problems = []
    for label, table in (("örnek cümle", examples), ("alıştırma metni", prompts)):
        for text, where in table.items():
            if len(where) > 1:
                problems.append(
                    f"iki derste aynı {label}: {text!r} → {', '.join(where)}"
                )
    return problems


def main() -> int:
    groups = inventory()
    targets = [t.lower() for t in sys.argv[1:]] or LEVELS

    print("Seviye   Envanter   Devralınan   Ders   Karşılanan   Ertelenen")
    print("--------------------------------------------------------------")
    all_problems: list[str] = []
    written = {}
    for level in targets:
        items = groups.get(level, [])
        inherited = load_inherited(level)
        lessons = load_lessons(level)
        deferred = load_deferred(level)
        owed = {i["code"] for i in items} | set(inherited)
        covered = {c for lesson in lessons for c in lesson.get("covers", [])}
        count, problems = build(level, groups)
        all_problems.extend(problems)
        written[level] = count
        print(
            f"{level.upper():7s} {len(items):9d} {len(inherited):12d} {count:6d} "
            f"{len(covered & owed):12d} {len(deferred):11d}"
        )
    if not sys.argv[1:]:
        all_problems.extend(check_across_levels())
    total_problems = len(all_problems)
    if all_problems:
        print()
        for problem in all_problems:
            print(f"  - {problem}")

    if any(written.values()):
        manifest = {
            "levels": [
                {"level": lv.upper(), "lessons": n, "file": f"grammar-{lv}.json"}
                for lv, n in sorted(written.items())
                if n
            ]
        }
        (OUT / "grammar-manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )

    print(
        "\nDoğrulama temiz."
        if total_problems == 0
        else f"\n{total_problems} sorun bulundu."
    )
    return 1 if total_problems else 0


if __name__ == "__main__":
    sys.exit(main())
