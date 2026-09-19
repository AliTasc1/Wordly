#!/usr/bin/env python3
"""Okuma parçalarının görselleri: istem üretimi ve harita derlemesi.

İki iş yapıyor, ikisi de ayrı komut:

    python3 content/build-reading-art.py prompts        # istemleri yaz
    python3 content/build-reading-art.py prompts --level a1
    python3 content/build-reading-art.py index          # TS haritasını derle

------------------------------------------------------------------- neden ayrı
Görsel üretimi bu depodan yapılamıyor: üretim servisinin dosya sunucusu
geliştirme ortamından kapalı. Yani üretim ve indirme insan tarafında oluyor.
Betik bu yüzden iki uca ayrıldı — öncesini (istemler) ve sonrasını (harita)
hazırlıyor, ortadaki adımı yapan kişiye bırakıyor.

------------------------------------------------------------ neden tek üslup
Yüz elli görsel bir takım gibi durmazsa, uygulama derlenmiş bir üründen çok
karışık bir arşive benziyor. Üslup tek bir yerde — STYLE — tanımlı ve her
isteme aynen ekleniyor. Üslubu değiştirmek isteyen tek satırı değiştirip
hepsini yeniden üretir.

Metin yasağı ısrarla tekrarlanıyor: görsel modelleri istenmeden harf koymaya
çok meyilli ve İngilizce öğrenme uygulamasında yanlış yazılmış bir kelime,
öğretilen şeyin kendisini bozar.
"""

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "mobile" / "assets" / "content"
ART = CONTENT / "reading-art"
INDEX = ROOT / "mobile" / "src" / "content" / "reading-art.ts"

LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]
SUFFIXES = (".webp", ".png", ".jpg", ".jpeg")

# Uygulamanın kendi paleti. Görselin koyu yüzeye oturması için arka plan
# ekranınkiyle aynı; aksi hâlde metnin üstünde parlayan beyaz bir dikdörtgen
# olur ve gece okuyan gözü yorar.
STYLE = (
    "Flat vector illustration, horizontal band, very dark navy background "
    "#070A14. Limited palette: electric blue #2E6BFF, violet #7C5CFF, "
    "cyan #22D3EE, warm amber #F59E0B for light sources only, pale #E2E8F0 "
    "for highlights. Simple geometric shapes, clean flat fills, no outlines, "
    "no gradients on figures, soft glow. Faces left blank without features. "
    "Generous negative space. "
    "ABSOLUTELY NO TEXT, no letters, no numbers, no logos, no watermark, "
    "no user interface elements."
)


def passages(level: str) -> list[dict]:
    path = CONTENT / f"reading-{level}.json"
    return json.loads(path.read_text(encoding="utf-8"))


def scene(item: dict) -> str:
    """Parçanın metninden sahneyi kuran istem gövdesi.

    Metnin tamamı veriliyor, özeti değil: modelin sahneyi kendisi seçmesi,
    bizim "bu parça şunu anlatıyor" diye tahmin etmemizden daha isabetli
    oluyor. Uzunluk sınırı, C1–C2 parçalarının istemi şişirmemesi için.
    """
    text = re.sub(r"\s+", " ", item["text"]).strip()
    if len(text) > 900:
        text = text[:900].rsplit(" ", 1)[0] + "…"
    return (
        f'A single illustration for a reading passage titled "{item["titleEn"]}". '
        f"Depict the scene and setting of this text, not the words themselves: "
        f"{text}"
    )


def cmd_prompts(levels: list[str]) -> None:
    out = []
    for level in levels:
        for item in passages(level):
            out.append(
                {
                    "id": item["id"],
                    "file": f'{item["id"]}.webp',
                    "title": item["title"],
                    "prompt": f"{scene(item)} {STYLE}",
                }
            )

    target = ART / "prompts.json"
    ART.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(out)} istem yazıldı -> {target.relative_to(ROOT)}")
    print(f"Görseller {ART.relative_to(ROOT)}/ içine `file` alanındaki adla konacak.")


def cmd_index() -> None:
    found: dict[str, str] = {}
    if ART.is_dir():
        for path in sorted(ART.iterdir()):
            if path.suffix.lower() in SUFFIXES:
                found[path.stem] = path.name

    lines = [
        f"  '{key}': require('../../assets/content/reading-art/{name}'),"
        for key, name in sorted(found.items())
    ]
    body = "\n".join(lines)

    source = INDEX.read_text(encoding="utf-8")
    replaced = re.sub(
        r"export const READING_ART: Record<string, number> = \{[^}]*\};",
        "export const READING_ART: Record<string, number> = {\n"
        + (body + "\n" if body else "")
        + "};",
        source,
        flags=re.S,
    )
    INDEX.write_text(replaced, encoding="utf-8")

    total = sum(len(passages(level)) for level in LEVELS)
    print(f"{len(found)}/{total} görsel haritaya yazıldı -> {INDEX.relative_to(ROOT)}")
    if len(found) < total:
        print("Görseli olmayan parçalar yer tutucuda kalıyor; ekran bozulmuyor.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("prompts", help="görsel istemlerini yaz")
    p.add_argument("--level", choices=LEVELS, action="append", dest="levels")

    sub.add_parser("index", help="TS haritasını klasöre göre derle")

    args = parser.parse_args()
    if args.command == "prompts":
        cmd_prompts(args.levels or LEVELS)
    else:
        cmd_index()
    return 0


if __name__ == "__main__":
    sys.exit(main())
