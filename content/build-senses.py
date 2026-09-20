#!/usr/bin/env python3
"""Aynı yazılışa sahip kelime kartlarının indeksini üretir.

    python3 content/build-senses.py

Çıktı: `mobile/assets/content/senses.json`

------------------------------------------------------------------- neden var
Gerçek kullanıcı testinde çıktı. "take" kartı B1'de isim olarak
"görüş, yorum" diyor ve bu doğru — İngilizcede "what's your take on this?"
tam olarak bu. Ama ekranda kelime devasa harflerle, anlamı altında ve fiil
mi isim mi olduğunu söyleyen tek şey köşedeki küçük bir etiket.

Kart teknik olarak doğruydu, okunduğunda yanlış anlaşılıyordu. Bir öğrenme
uygulamasında bu ikisi aynı şey: öğrenci "take = görüş" diye ezberliyor.

Destede **956 kelimenin 1.960 kartı** aynı yazılışı paylaşıyor, yani %21.
İstisna değil, kural.

--------------------------------------------------------------- neden indeks
Kartın diğer anlamlarını çalışma anında bulmak, altı seviyenin tamamını
belleğe almak demekti — 9.461 kart, yalnızca birkaç satır bilgi için.
İndeks yalnızca kardeşi olan kartları tutuyor ve her kayıt küçük: tür,
Türkçe karşılık, seviye.
"""

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CARDS = ROOT / "mobile" / "assets" / "content"
OUT = CARDS / "senses.json"
LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]

# Kaç anlam gösterileceği. Üçten fazlası kartı bir sözlük maddesine çevirir;
# amaç kelimeyi öğretmek, tüm anlamlarını listelemek değil.
MAX = 3

# CEFR sırası: önce daha basit seviyedeki anlam gösteriliyor, çünkü
# öğrencinin daha önce görmüş olma ihtimali olan o.
ORDER = {lv.upper(): i for i, lv in enumerate(LEVELS)}


def main() -> int:
    by_word: dict[str, list[dict]] = {}
    for level in LEVELS:
        path = CARDS / f"{level}.json"
        if not path.exists():
            continue
        for card in json.loads(path.read_text(encoding="utf-8")):
            by_word.setdefault(card["word"].lower(), []).append(card)

    index: dict[str, list[dict]] = {}
    for cards in by_word.values():
        if len(cards) < 2:
            continue
        for card in cards:
            others = [c for c in cards if c["id"] != card["id"]]
            others.sort(key=lambda c: (ORDER.get(c["cefr"], 9), c["pos"]))
            index[card["id"]] = [
                {"pos": c["posLabel"], "tr": c["tr"], "cefr": c["cefr"]}
                for c in others[:MAX]
            ]

    OUT.write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    words = sum(1 for v in by_word.values() if len(v) > 1)
    size = OUT.stat().st_size
    total = sum(len(v) for v in by_word.values())
    print(f"{words} kelime, {len(index)} kart ({len(index) / total:.0%})")
    print(f"{size / 1024:.0f} KB -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
