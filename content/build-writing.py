#!/usr/bin/env python3
"""
Yazma alıştırmalarını doğrular ve uygulamaya aktarır.

    python3 build-writing.py         # tüm seviyeler
    python3 build-writing.py a1

Yazma neden ayrı bir bölüm?

Gramer bölümünde de boşluk doldurma ve sıralama var, ama ikisinde de doğru
cevap ekranda duruyor: öğrenci seçiyor, üretmiyor. Tanıma ile üretim aynı şey
değildir — bir kalıbı şıklar arasından bulabilen öğrenci, boş bir satıra aynı
cümleyi yazamayabilir. Bu bölümde ekranda İngilizce hiçbir ipucu yok:
Türkçe cümle var, öğrenci İngilizcesini yazıyor.

Bu yüzden sözlük kuralı burada daha katı. Okuma parçalarında seviyenin
üstündeki kelime, parçanın sözlükçesinde Türkçe karşılığı verilerek
kullanılabiliyordu; okurken öğrenci karşılığı görüyor. Yazarken göremez.
Beklenen cevaptaki her kelime seviyenin içinde olmak zorunda, sözlükçe
kaçışı yok.

Betik şunlara bakar:

1. Beklenen cevapların ve örnek metnin her kelimesi seviyeye uygun mu.
2. Tuzak kalıpları gerçekten yanlışı mı yakalıyor — doğru cevaplardan birine
   uyan tuzak, öğrenciye doğru yazdığı hâlde hata göstereceği için reddedilir.
3. Alan bütünlüğü: Türkçe yönerge, ipucu, örnek metin ve denetim listesi yerinde mi.

Sorun bulursa çıkış kodu 1 döner.
"""

import json
import re
import sys
from pathlib import Path

from textlevel import ORDER, analyse, load_levels

ROOT = Path(__file__).parent
SETS = ROOT / "writing"
OUT = ROOT.parent / "mobile" / "assets" / "content"
LEVELS = [level.lower() for level in ORDER]

# Bir yazma seti bu kadar cümleden az olursa alıştırma değil, örnek olur.
MIN_TASKS = 8
# Serbest yazma görevinde en az bu kadar denetim maddesi: tek maddeli bir
# liste öğrenciye neye bakacağını söylemez.
MIN_CHECKS = 2


def norm(text: str) -> str:
    """Cevap karşılaştırması için sadeleştirir.

    Uygulama da aynı sadeleştirmeyi yapıyor (mobile/src/content/writing.ts).
    İkisi ayrışırsa betikte geçen bir cevap telefonda yanlış sayılır; bu
    yüzden kural tek yerde tarif edilip iki yerde birebir uygulanıyor:
    küçük harf, kesme işaretleri tek biçime, noktalama at, boşlukları tekle.
    """
    text = text.lower().replace("’", "'").replace("`", "'")
    text = re.sub(r"[.,!?;:\"]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def contains(answer: str, trap: str, at: str = "") -> bool:
    """Tuzak kalıbı cevapta tam kelime dizisi olarak geçiyor mu.

    Ham alt dizgi araması yetmiyor, çünkü kelimeler birbirinin içinde geçiyor:
    "he is my sister" düpedüz "she is my sister"ın içindedir, "two brother" da
    "two brothers"ın. Alt dizgiyle baksaydık doğru yazan öğrenciye tuzak
    açıklaması gösterirdik. Bu yüzden karşılaştırma kelime kelime yapılıyor.

    `at="start"` kalıbı cümle başına sabitler. Buna özne düşmesi için ihtiyaç
    var — Türkçe konuşanın en tipik hatası — çünkü "am a teacher" ifadesi
    doğru cevabın ("I am a teacher") içinde de geçiyor; hatalı yapan, o
    dizinin cümlenin BAŞINDA olması.

    Uygulama da aynı kuralı uyguluyor (mobile/src/content/writing.ts).
    """
    words = norm(answer).split()
    needle = norm(trap).split()
    if not needle:
        return False
    if at == "start":
        return words[: len(needle)] == needle
    return any(
        words[i : i + len(needle)] == needle for i in range(len(words) - len(needle) + 1)
    )


def accepts(answers: list[str], typed: str) -> bool:
    """Öğrencinin yazdığı, beklenen cevaplardan birine uyuyor mu."""
    key = norm(typed)
    return bool(key) and any(norm(a) == key for a in answers)


def selftest() -> int:
    """Denetim kurallarını ortak vaka dosyasına karşı sınar.

    Aynı kural uygulamada da yazılı; ikisi de bu dosyaya bakıyor ki
    ayrışmasınlar.
    """
    cases = json.loads((ROOT / "writing-cases.json").read_text(encoding="utf-8"))
    bad = 0

    for case in cases["norm"]:
        got = norm(case["in"])
        if got != case["out"]:
            bad += 1
            print(f"  norm({case['in']!r}) = {got!r}, beklenen {case['out']!r}")

    for case in cases["accepts"]:
        got = accepts(case["answers"], case["typed"])
        if got != case["ok"]:
            bad += 1
            print(f"  accepts({case['typed']!r}) = {got}, beklenen {case['ok']} — {case['why']}")

    for case in cases["traps"]:
        got = contains(case["typed"], case["has"], case.get("at", ""))
        if got != case["hit"]:
            bad += 1
            print(f"  contains({case['typed']!r}, {case['has']!r}) = {got}, beklenen {case['hit']}")

    total = len(cases["norm"]) + len(cases["accepts"]) + len(cases["traps"])
    print(f"{total - bad}/{total} vaka geçti" if bad else f"{total} vakanın hepsi geçti")
    return 1 if bad else 0


def fail(problems: list[str], where: str, message: str) -> None:
    problems.append(f"{where}: {message}")


def check_english(
    problems: list[str],
    where: str,
    text: str,
    level: str,
    levels: dict[str, str],
) -> None:
    """Üretilmesi beklenen İngilizce seviyenin içinde mi.

    `known` bilerek boş: sözlükçe kaçışı yazmada geçerli değil.
    """
    report = analyse(text, level, levels, set())
    if report["british"]:
        detail = ", ".join(f"{uk} → {us}" for uk, us in report["british"].items())
        fail(problems, where, f"İngiliz yazımı: {detail}")
    stray = sorted(set(report["above"]) | set(report["unknown"]))
    if stray:
        detail = ", ".join(
            f"{w} ({report['above'][w]})" if w in report["above"] else f"{w} (sözlükte yok)"
            for w in stray
        )
        fail(problems, where, f"seviye dışı kelime: {detail}")


def check_task(
    problems: list[str],
    where: str,
    task: dict,
    level: str,
    levels: dict[str, str],
) -> None:
    tr = (task.get("tr") or "").strip()
    if not tr:
        fail(problems, where, "Türkçe yönerge boş")

    answers = task.get("answers") or []
    if not answers:
        fail(problems, where, "beklenen cevap yok")
        return

    seen: dict[str, int] = {}
    for i, answer in enumerate(answers):
        if not answer.strip():
            fail(problems, where, f"{i}. cevap boş")
            continue
        key = norm(answer)
        if key in seen:
            fail(problems, where, f"aynı cevap iki kez: {answer!r}")
        seen[key] = i
        check_english(problems, f"{where} · cevap {i + 1}", answer, level, levels)

    # Öğrenci Türkçeyi kopyalayamamalı; yönerge ile cevap aynıysa görev yok.
    if norm(tr) in seen:
        fail(problems, where, "Türkçe yönerge ile cevap aynı")

    if not (task.get("hint") or "").strip():
        fail(problems, where, "ipucu yok")

    for trap in task.get("traps") or []:
        has = (trap.get("has") or "").strip()
        if not has:
            fail(problems, where, "tuzak kalıbı boş")
            continue
        if has != has.lower():
            fail(problems, where, f"tuzak kalıbı küçük harf olmalı: {has!r}")
        if not (trap.get("note") or "").strip():
            fail(problems, where, f"{has!r} tuzağının açıklaması yok")
        at = trap.get("at", "")
        if at not in ("", "start"):
            fail(problems, where, f"{has!r} tuzağının konumu bilinmiyor: {at!r}")
        # Asıl denetim: tuzak doğru cevaba uyuyorsa, doğru yazan öğrenciye
        # hata gösterilir. Bu sessiz bir yanlıştır, testle yakalanmaz.
        for answer in answers:
            if contains(answer, has, at):
                fail(problems, where, f"tuzak {has!r} doğru cevaba da uyuyor: {answer!r}")


def check_set(
    problems: list[str],
    item: dict,
    level: str,
    levels: dict[str, str],
    ids: dict[str, str],
    titles: dict[str, str],
) -> None:
    sid = item.get("id", "?")
    where = sid

    if sid in ids:
        fail(problems, where, f"kimlik zaten {ids[sid]} dosyasında var")
    ids[sid] = level

    if item.get("level") != level.upper():
        fail(problems, where, f"seviye {item.get('level')!r}, klasör {level.upper()}")

    title = (item.get("title") or "").strip()
    if not title:
        fail(problems, where, "başlık yok")
    elif title.lower() in titles:
        fail(problems, where, f"başlık {titles[title.lower()]} ile aynı")
    else:
        titles[title.lower()] = sid

    for field in ("canDo", "focus"):
        if not (item.get(field) or "").strip():
            fail(problems, where, f"{field} yok")

    tasks = item.get("tasks") or []
    if len(tasks) < MIN_TASKS:
        fail(problems, where, f"{len(tasks)} cümle var, en az {MIN_TASKS} olmalı")

    prompts: dict[str, int] = {}
    for i, task in enumerate(tasks):
        check_task(problems, f"{sid} · {i + 1}. cümle", task, level.upper(), levels)
        key = norm(task.get("tr") or "")
        if key and key in prompts:
            fail(problems, where, f"{i + 1}. cümle {prompts[key] + 1}. ile aynı")
        prompts[key] = i

    compose = item.get("compose")
    if not compose:
        fail(problems, where, "serbest yazma görevi yok")
        return

    if not (compose.get("prompt") or "").strip():
        fail(problems, f"{sid} · serbest yazma", "yönerge yok")
    checklist = compose.get("checklist") or []
    if len(checklist) < MIN_CHECKS:
        fail(
            problems,
            f"{sid} · serbest yazma",
            f"{len(checklist)} denetim maddesi var, en az {MIN_CHECKS} olmalı",
        )
    model = (compose.get("model") or "").strip()
    if not model:
        fail(problems, f"{sid} · serbest yazma", "örnek metin yok")
    else:
        check_english(problems, f"{sid} · örnek metin", model, level.upper(), levels)


def build(only: str | None) -> int:
    levels = load_levels()
    problems: list[str] = []
    ids: dict[str, str] = {}
    counts: dict[str, dict] = {}

    for level in LEVELS:
        if only and level != only:
            continue
        folder = SETS / level
        if not folder.exists():
            continue

        items: list[dict] = []
        titles: dict[str, str] = {}
        for path in sorted(folder.glob("*.json")):
            data = json.loads(path.read_text(encoding="utf-8"))
            for item in data.get("sets", []):
                check_set(problems, item, level, levels, ids, titles)
                items.append(item)

        if not items:
            continue

        items.sort(key=lambda s: s.get("order", 0))
        (OUT / f"writing-{level}.json").write_text(
            json.dumps(items, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        counts[level.upper()] = {
            "sets": len(items),
            "tasks": sum(len(s.get("tasks") or []) for s in items),
            "file": f"writing-{level}.json",
        }
        print(f"{level.upper()}: {len(items)} set, {counts[level.upper()]['tasks']} cümle")

    if problems:
        print(f"\n{len(problems)} sorun:\n", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1

    if counts and not only:
        (OUT / "writing-manifest.json").write_text(
            json.dumps(counts, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"\ntoplam {sum(c['sets'] for c in counts.values())} set")

    return 0


if __name__ == "__main__":
    only = sys.argv[1].lower() if len(sys.argv) > 1 else None
    if only == "--test":
        sys.exit(selftest())
    if only and only not in LEVELS:
        print(f"bilinmeyen seviye: {only}", file=sys.stderr)
        sys.exit(2)
    sys.exit(build(only))
