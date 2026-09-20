#!/usr/bin/env python3
"""WORDLY tanıtım ve yasal metin sitesini üretir.

    pip install markdown
    python3 content/build-site.py

Kaynaklar `content/legal/`, çıktı `docs/`. GitHub Pages `docs/` klasörünü
yayınlıyor; bu yüzden orası elle düzenlenmez, her şey buradan üretilir.

------------------------------------------------------------------ neden böyle
Mağazalar gizlilik metnini **bir adres** olarak istiyor, dosya kabul etmiyor.
Metinler zaten depoda Markdown olarak duruyordu; HTML'i elle yazmak ikinci bir
kopya çıkarır ve iki kopya er geç ayrışır — üstelik ayrıştığında hangisinin
geçerli olduğu belli olmaz. Tek kaynak Markdown, HTML ondan üretiliyor.

Yer tutucular da tek yerde (`content/legal/site.json`). Ad, adres ve destek
adresi hem sitede hem iki yasal metinde geçiyor; üç ayrı yerde tutulsaydı biri
güncellenip diğerleri unutulurdu.
"""

import html
import json
import pathlib
import re
import sys

try:
    import markdown
except ImportError:
    sys.exit("Önce: pip install markdown")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "content" / "legal"
OUT = ROOT / "docs"

# site.json anahtarı → metinlerdeki yer tutucular
YER_TUTUCU = {
    "veriSorumlusu": ["[VERİ SORUMLUSU]", "[SAĞLAYICI]"],
    "adres": ["[ADRES]"],
    "destekEposta": ["[DESTEK E-POSTA]"],
    "yetkiliMahkeme": ["[YETKİLİ MAHKEME]"],
}

SAYFALAR = [
    ("gizlilik", "Gizlilik Politikası"),
    ("sartlar", "Kullanım Şartları"),
]

STYLE = """\
:root {
  --bg: #070a14;
  --surface: #0e1426;
  --line: rgba(255, 255, 255, 0.09);
  --text: #e8ecf6;
  --dim: #9aa5bd;
  --faint: #6c7793;
  --brand: #2e6bff;
  --accent: #22d3ee;
  --warn: #ff4d5e;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 16px/1.7 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-text-size-adjust: 100%;
}

.wrap { max-width: 720px; margin: 0 auto; padding: 0 20px 80px; }

header.top {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 26px 0;
  border-bottom: 1px solid var(--line);
  margin-bottom: 34px;
}

.logo { font-size: 19px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); text-decoration: none; }
.logo span { color: var(--accent); }
nav { margin-left: auto; display: flex; gap: 18px; flex-wrap: wrap; }
nav a { color: var(--dim); text-decoration: none; font-size: 14px; }
nav a:hover, nav a[aria-current="page"] { color: var(--text); }

h1 { font-size: 30px; line-height: 1.25; letter-spacing: -0.02em; margin: 0 0 8px; }
h2 { font-size: 20px; margin: 38px 0 12px; letter-spacing: -0.01em; }
h3 { font-size: 16px; margin: 26px 0 8px; color: var(--dim); }
p, li { color: var(--dim); }
strong { color: var(--text); }
a { color: var(--accent); }

.lede { font-size: 18px; color: var(--text); margin-bottom: 26px; }

table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14.5px; display: block; overflow-x: auto; }
th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid var(--line); }
th { color: var(--faint); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }

blockquote {
  margin: 20px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--brand);
  background: var(--surface);
  border-radius: 0 10px 10px 0;
}
blockquote p:last-child { margin-bottom: 0; }

code {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 1px 6px;
  font-size: 13.5px;
}
pre { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px; overflow-x: auto; }
pre code { border: 0; padding: 0; background: none; }

hr { border: 0; border-top: 1px solid var(--line); margin: 34px 0; }

.cards { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin: 26px 0; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 18px; }
.card h3 { margin: 0 0 6px; color: var(--text); font-size: 15px; }
.card p { margin: 0; font-size: 14px; }

.notice {
  background: rgba(255, 77, 94, 0.12);
  border: 1px solid rgba(255, 77, 94, 0.45);
  color: #ffd7db;
  border-radius: 12px;
  padding: 14px 18px;
  margin: 22px 0;
  font-size: 14.5px;
}
.notice strong { color: #fff; }

footer {
  margin-top: 56px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
  color: var(--faint);
  font-size: 13.5px;
}
footer a { color: var(--dim); }

@media (max-width: 520px) {
  h1 { font-size: 25px; }
  header.top { padding: 20px 0; }
}
"""


def yapi(baslik: str, govde: str, aktif: str, aciklama: str) -> str:
    """Ortak sayfa iskeleti."""
    menu = [("index", "Ana sayfa"), ("gizlilik", "Gizlilik"), ("sartlar", "Şartlar"), ("destek", "Destek")]
    baglar = "".join(
        f'<a href="{"./" if ad == "index" else ad + ".html"}"'
        + (' aria-current="page"' if ad == aktif else "")
        + f">{etiket}</a>"
        for ad, etiket in menu
    )
    return f"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(baslik)} · WORDLY</title>
<meta name="description" content="{html.escape(aciklama)}">
<meta name="color-scheme" content="dark">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="wrap">
<header class="top">
  <a class="logo" href="./">WORD<span>LY</span></a>
  <nav>{baglar}</nav>
</header>
{govde}
<footer>
  <p>WORDLY — Türkçe konuşanlar için İngilizce.
  <a href="gizlilik.html">Gizlilik</a> · <a href="sartlar.html">Şartlar</a> · <a href="destek.html">Destek</a></p>
</footer>
</div>
</body>
</html>
"""


def doldur(metin: str, ayar: dict) -> tuple[str, list[str]]:
    """Yer tutucuları değiştirir; doldurulmamış olanları geri bildirir."""
    eksik = []
    for anahtar, isaretler in YER_TUTUCU.items():
        deger = str(ayar.get(anahtar, ""))
        if not deger or deger.startswith("DOLDUR"):
            eksik.append(anahtar)
        for isaret in isaretler:
            metin = metin.replace(isaret, deger)
    return metin, eksik


def uyari(eksik: list[str]) -> str:
    if not eksik:
        return ""
    return (
        '<div class="notice"><strong>Bu sayfa henüz yayına hazır değil.</strong> '
        "Şu alanlar doldurulmadı: <code>"
        + "</code>, <code>".join(eksik)
        + "</code>. <code>content/legal/site.json</code> doldurulup "
        "<code>python3 content/build-site.py</code> çalıştırılmalı.</div>"
    )


def anasayfa(ayar: dict, eksik: list[str]) -> str:
    govde = f"""
<h1>İngilizceyi gerçekten öğren.</h1>
<p class="lede">WORDLY, Türkçe konuşanlar için bir İngilizce öğrenme uygulaması.
A1'den C2'ye kadar altı seviye; kelime, gramer, okuma, dinleme, konuşma ve yazma.</p>
{uyari(eksik)}

<div class="cards">
  <div class="card"><h3>Tamamen ücretsiz</h3><p>Kilitli bölüm yok, abonelik yok, uygulama içi satın alma yok.</p></div>
  <div class="card"><h3>Çevrimdışı çalışır</h3><p>İnternet olmadan da açılır. İlerlemen telefonunda durur.</p></div>
  <div class="card"><h3>Hesap isteğe bağlı</h3><p>Hesap yalnızca ilerlemeni ikinci bir cihaza taşımak için.</p></div>
  <div class="card"><h3>Reklam ve takip yok</h3><p>Hiçbir izleme kütüphanesi kullanılmıyor. Veri satılmıyor.</p></div>
</div>

<h2>İçinde ne var</h2>
<table>
<tr><th>Bölüm</th><th>Kapsam</th></tr>
<tr><td>Kelime</td><td>9.461 kart, altı seviye, telaffuz kayıtlarıyla</td></tr>
<tr><td>Gramer</td><td>Seviye seviye alıştırmalar</td></tr>
<tr><td>Okuma</td><td>150 metin, dokunulabilir kelime açıklamalarıyla</td></tr>
<tr><td>Dinleme</td><td>150 diyalog, 1.953 ses kaydı, transkript</td></tr>
<tr><td>Konuşma</td><td>Kendi sesini kaydet ve model sesle karşılaştır</td></tr>
<tr><td>Yazma</td><td>150 set, 1.200 cümle</td></tr>
</table>

<h2>Dürüstlük notu</h2>
<p>Bu sayfada yazan her şey uygulamada gerçekten var. Henüz <strong>yapılmamış</strong>
olanları da söyleyelim: telaffuz puanlama, arkadaş ve kulüp özellikleri, serbest
yazma geri bildirimi. Bunlar geldiğinde burada yazacak.</p>

<p>Uygulama şu an mağazalarda değil; yayına hazırlanıyor.</p>

<h2>İletişim</h2>
<p>Soru, hata bildirimi ve kişisel veri talepleri için:
<a href="mailto:{html.escape(str(ayar.get('destekEposta', '')))}">{html.escape(str(ayar.get('destekEposta', '')))}</a></p>
"""
    return yapi(
        "Türkçe konuşanlar için İngilizce",
        govde,
        "index",
        "Türkçe konuşanlar için ücretsiz İngilizce öğrenme uygulaması. A1–C2, çevrimdışı çalışır, reklam yok.",
    )


def destek(ayar: dict, eksik: list[str]) -> str:
    posta = html.escape(str(ayar.get("destekEposta", "")))
    govde = f"""
<h1>Destek</h1>
<p class="lede">Bir sorun mu var, bir şey mi çalışmıyor? Yaz, bakalım.</p>
{uyari(eksik)}

<p><a href="mailto:{posta}">{posta}</a></p>

<h2>Yazmadan önce denenecekler</h2>

<h3>Uygulama açılmıyor ya da donuyor</h3>
<p>Uygulamayı tamamen kapatıp (görev listesinden de) yeniden aç. Sürmüyorsa
telefonu yeniden başlat.</p>

<h3>İlerlemem kayboldu</h3>
<p>İlerleme telefonda tutuluyor. Uygulamayı sildiysen telefondaki kayıt da
silinmiştir. Hesabın varsa giriş yaptığında sunucudaki kopya geri gelir.</p>

<h3>Doğrulama e-postası gelmedi</h3>
<p>Spam klasörüne bak. Birkaç dakika bekleyip Kayıt ekranındaki
"Tekrar gönder" düğmesini kullan.</p>

<h3>Ses çalmıyor</h3>
<p>Telefonun sessiz modunda olup olmadığını kontrol et. Kelime telaffuzları
A1 ve A2'de kayıtlı seslerle, üst seviyelerde telefonun kendi seslendirmesiyle
çalıyor — ikincisi için cihazında İngilizce ses paketi kurulu olmalı.</p>

<h3>Mikrofon çalışmıyor</h3>
<p>Telefon ayarlarından WORDLY için mikrofon iznini aç. Kayıtların
telefonundan çıkmaz.</p>

<h2>Verilerinle ilgili</h2>
<p>Verilerinin kopyasını <strong>Ayarlar → Verilerimi indir</strong> ile
alabilirsin. Hesabını ve sunucudaki tüm veriyi
<strong>Ayarlar → Hesabımı sil</strong> ile kalıcı olarak silebilirsin;
bunun için bize yazmana gerek yok.</p>
<p>Ayrıntılar <a href="gizlilik.html">Gizlilik Politikası</a>'nda.</p>
"""
    return yapi("Destek", govde, "destek", "WORDLY destek sayfası: sık karşılaşılan sorunlar ve iletişim.")


def main() -> int:
    ayar = json.loads((SRC / "site.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)

    toplam_eksik: list[str] = []
    yazilan = []

    for ad, baslik in SAYFALAR:
        ham = (SRC / f"{ad}.md").read_text(encoding="utf-8")

        # "Yayından önce doldurulacak" kutusu üretilen sayfada durmamalı:
        # o kutu depoyu okuyan kişi için, siteyi okuyan kullanıcı için değil.
        ham = re.sub(r"\n> ## ⚠️ YAYINDAN ÖNCE DOLDURULACAK(?:.|\n)*?\n---\n", "\n", ham, count=1)

        metin, eksik = doldur(ham, ayar)
        toplam_eksik = eksik

        govde = markdown.markdown(metin, extensions=["tables", "sane_lists"])
        # İlk <h1> başlığa dönüşüyor; iskelet zaten başlığı yazıyor.
        govde = uyari(eksik) + govde

        (OUT / f"{ad}.html").write_text(
            yapi(baslik, govde, ad, f"WORDLY {baslik}"), encoding="utf-8"
        )
        yazilan.append(f"{ad}.html")

    (OUT / "index.html").write_text(anasayfa(ayar, toplam_eksik), encoding="utf-8")
    (OUT / "destek.html").write_text(destek(ayar, toplam_eksik), encoding="utf-8")
    (OUT / "style.css").write_text(STYLE, encoding="utf-8")

    # GitHub Pages'in dosyaları Jekyll'den geçirmemesi için. Alt çizgiyle
    # başlayan bir dosya eklenirse Jekyll onu sessizce yutar.
    (OUT / ".nojekyll").write_text("", encoding="utf-8")

    alan = str(ayar.get("alanAdi", ""))
    if alan and not alan.startswith("DOLDUR"):
        (OUT / "CNAME").write_text(alan + "\n", encoding="utf-8")
    elif (OUT / "CNAME").exists():
        (OUT / "CNAME").unlink()

    yazilan += ["index.html", "destek.html", "style.css"]
    print(f"{len(yazilan)} dosya yazıldı → {OUT.relative_to(ROOT)}/")
    for f in yazilan:
        print(f"  {f}")

    if toplam_eksik:
        print()
        print("UYARI: doldurulmamış alanlar var -> " + ", ".join(toplam_eksik))
        print("Sayfaların üstüne kırmızı uyarı şeridi basıldı.")
        print("content/legal/site.json doldurup betiği yeniden çalıştır.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
