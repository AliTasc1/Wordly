#!/usr/bin/env python3
"""Üretilen sitenin denetimi.

    python3 content/test_site.py

Site elle yazılmıyor, üretiliyor; dolayısıyla bozulduğunda kimse fark
etmiyor. Bu denetim üç şeyi tutuyor:

- HTML etiketleri dengeli mi (bir `</div>` unutulunca sayfanın yarısı
  kayıyor ve tarayıcı bunu sessizce toparlamaya çalışıyor),
- sayfadaki sayılar gerçekten içerikten mi geliyor,
- doldurulmamış yer tutucular yayına kaçmıyor mu.
"""

import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "docs"
SAYFALAR = ["index", "gizlilik", "sartlar", "destek"]

# Kapanış etiketi olmayanlar.
BOS = {
    "meta", "link", "br", "hr", "img", "input", "source",
    "area", "base", "col", "embed", "track", "wbr",
}

hata: list[str] = []


def denetle(ad: str, kosul: bool, mesaj: str) -> None:
    if not kosul:
        hata.append(f"{ad}: {mesaj}")


def etiket_dengesi(ad: str, govde: str) -> None:
    yigin: list[str] = []
    for m in re.finditer(r"<(/?)([a-zA-Z!][\w-]*)([^>]*?)(/?)>", govde):
        kapali, etiket, _, kendi = m.group(1), m.group(2).lower(), m.group(3), m.group(4)
        if etiket in BOS or kendi == "/" or etiket.startswith("!"):
            continue
        if not kapali:
            yigin.append(etiket)
        elif yigin and yigin[-1] == etiket:
            yigin.pop()
        else:
            hata.append(f"{ad}: beklenmeyen </{etiket}>")
            return
    denetle(ad, not yigin, f"kapanmayan etiket: {', '.join(yigin)}")


def main() -> int:
    # Önce üret: denetim, diskte duran eski çıktıyı değil bugünkü kodu sınamalı.
    uretim = subprocess.run(
        [sys.executable, str(ROOT / "content" / "build-site.py")],
        capture_output=True,
        text=True,
    )
    if uretim.returncode != 0:
        print(uretim.stdout)
        print(uretim.stderr)
        print("ÜRETİM BAŞARISIZ")
        return 1

    sys.path.insert(0, str(ROOT / "content"))
    from site_sayim import sayilar, tr  # noqa: E402

    s = sayilar()

    for ad in SAYFALAR:
        yol = OUT / f"{ad}.html"
        denetle(ad, yol.exists(), "sayfa üretilmedi")
        if not yol.exists():
            continue
        govde = yol.read_text(encoding="utf-8")

        etiket_dengesi(ad, govde)
        denetle(ad, govde.startswith("<!doctype html>"), "doctype yok")
        denetle(ad, '<html lang="tr">' in govde, "dil belirtilmemiş")
        denetle(ad, "<title>" in govde, "başlık yok")
        denetle(ad, 'name="description"' in govde, "açıklama yok")
        denetle(ad, 'name="viewport"' in govde, "viewport yok")
        # Tema düğmesi ve okunabilir etiketi her sayfada.
        denetle(ad, 'class="tema"' in govde, "tema düğmesi yok")
        denetle(ad, "wordly:tema" in govde, "tema kaydı okunmuyor")

    anasayfa = (OUT / "index.html").read_text(encoding="utf-8")

    # Asıl bekçi: sayı kutularının her biri, bugünkü içerikten sayılanla
    # birebir aynı olmalı. "Sayfada bir yerde geçiyor mu" yetmiyor — aynı
    # sayı hem kutuda hem tabloda duruyor ve biri elle yazılırsa öteki
    # doğru kalıp kusuru gizleyebiliyor.
    ETIKET = {
        "kelime kartı": "kelime",
        "gramer alıştırması": "gramerAlistirma",
        "okuma parçası": "okuma",
        "diyalog satırı": "dinlemeSatir",
        "yazma görevi": "yazmaGorev",
        "ses kaydı": "sesKaydi",
    }
    kutular = dict(
        (etiket, sayi)
        for sayi, etiket in re.findall(
            r'<div class="sayi"><b>([^<]+)</b><span>([^<]+)</span></div>', anasayfa
        )
    )
    denetle("index", len(kutular) == len(ETIKET), f"sayı kutusu sayısı: {len(kutular)}")
    for etiket, anahtar in ETIKET.items():
        denetle(
            "index",
            kutular.get(etiket) == tr(s[anahtar]),
            f"{etiket}: sayfada {kutular.get(etiket)!r}, içerikte {tr(s[anahtar])!r}",
        )

    # Tablodaki sayılar da aynı kaynaktan.
    for anahtar in ["kelime", "gramerAlistirma", "okumaSoru", "dinlemeSatir", "yazmaGorev"]:
        denetle("index", tr(s[anahtar]) in anasayfa, f"{anahtar} tabloda yok")

    # İçerikten gelmeyen, elle yazılmış bir içerik sayısı kalmamalı. Eskiden
    # "9.461" kaynakta sabitti ve içerik değiştiğinde yerinde kalıyordu.
    #
    # Denetim yalnızca `anasayfa()` gövdesine bakıyor: telefon çizimlerindeki
    # "4.480 XP" gibi sayılar bir iddia değil, örnek arayüz değeri.
    kaynak = (ROOT / "content" / "build-site.py").read_text(encoding="utf-8")
    bas = kaynak.index("def anasayfa(")
    son = kaynak.index("def destek(")
    govde = kaynak[bas:son]
    elle = sorted(set(re.findall(r"(?<![\w.])\d{1,3}\.\d{3}(?![\w.])", govde)))
    denetle("kaynak", not elle, f"anasayfa()'da elle yazılmış sayı: {elle}")

    # Her anlatı bölümünün kendi telefonu var mı?
    denetle("index", anasayfa.count('class="telefon"') >= 6, "telefon çizimleri eksik")
    denetle("index", anasayfa.count("<section") >= 9, "bölümler eksik")
    # Anlatı tek düze olmasın diye bölümler dönüşümlü: bazıları ters.
    denetle("index", anasayfa.count('class="duo ters"') >= 2, "bölümler ters çevrilmemiş")
    denetle("index", anasayfa.count('class="alt bel"') >= 2, "zemin değişimi yok")

    # Erişilebilirlik: her telefon çiziminin sözlü karşılığı olmalı.
    cizimler = re.findall(r'<div class="ekran" role="img" aria-label="([^"]*)"', anasayfa)
    gorseller = re.findall(r'<div class="telefon"><img[^>]*alt="([^"]*)"', anasayfa)
    for etiket in cizimler + gorseller:
        denetle("index", len(etiket) > 10, f"telefon etiketi çok kısa: {etiket!r}")
    denetle(
        "index",
        len(cizimler) + len(gorseller) == anasayfa.count('class="telefon"'),
        "etiketsiz telefon var",
    )

    if hata:
        print("SİTE DENETİMİ BAŞARISIZ\n")
        for h in hata:
            print("  " + h)
        return 1

    print(f"Site denetimi geçti — {len(SAYFALAR)} sayfa.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
