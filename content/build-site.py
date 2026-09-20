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

--------------------------------------------------------------- ana sayfa nasıl
Ana sayfa önce düz bir metin listesiydi: başlık, dört kutu, bir tablo, bir
not. Doğruydu ama anlatmıyordu — okuyan kişi uygulamanın neye benzediğini
hiç görmeden sayfanın sonuna varıyordu.

Şimdi bir anlatı: öğrencinin sırayla yaşadığı beş an, her biri kendi telefon
ekranıyla. Bölümler dönüşümlü olarak sağa sola geçiyor ve zemin değişiyor,
böylece aynı şablon altı kez tekrarlanmıyor.

Ekran görüntüleri `docs/ekran/` klasörüne konabiliyor; konmadığı sürece
uygulamanın arayüzü sayfanın içinde çiziliyor (`site_ekran.py`). Çizim,
sitenin tema düğmesini de izliyor.

Sayfadaki sayılar elle yazılmıyor, içerikten sayılıyor (`site_sayim.py`).
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

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from site_ekran import (  # noqa: E402
    ana_ekran,
    yol_ekran,
    arena_ekran,
    defter_ekran,
    gramer_ekran,
    okuma_ekran,
    seviye_ekran,
    telefon,
)
from site_sayim import sayilar, tr  # noqa: E402
from site_stil import STYLE  # noqa: E402

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

# Tema seçimi sayfa çizilmeden önce uygulanmalı, yoksa açık temayı seçmiş
# kullanıcı her sayfa açılışında bir an koyu ekran görüyor. Bu yüzden
# <head> içinde, satır içinde ve senkron.
TEMA_BETIGI = """
(function () {
  try {
    var k = localStorage.getItem('wordly:tema');
    if (k === 'light' || k === 'dark') document.documentElement.dataset.theme = k;
  } catch (e) {}
})();
"""

SAYFA_BETIGI = """
(function () {
  var kok = document.documentElement;
  var dugme = document.querySelector('.tema');

  function suAn() {
    if (kok.dataset.theme) return kok.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function yaz() {
    if (!dugme) return;
    var acik = suAn() === 'light';
    dugme.textContent = acik ? '☀️' : '🌙';
    dugme.setAttribute('aria-label', acik ? 'Koyu temaya geç' : 'Açık temaya geç');
  }
  if (dugme) {
    dugme.addEventListener('click', function () {
      var yeni = suAn() === 'light' ? 'dark' : 'light';
      kok.dataset.theme = yeni;
      try { localStorage.setItem('wordly:tema', yeni); } catch (e) {}
      yaz();
    });
    yaz();
  }

  // Bölümler kaydırdıkça beliriyor. Hareketi azaltılmış isteyen kullanıcıda
  // hiç çalışmıyor; içerik zaten CSS'te görünür durumda.
  var azalt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hedef = document.querySelectorAll('.bel');
  if (azalt || !('IntersectionObserver' in window)) {
    hedef.forEach(function (e) { e.classList.add('acik'); });
    return;
  }
  var g = new IntersectionObserver(function (girisler) {
    girisler.forEach(function (giris) {
      if (giris.isIntersecting) {
        giris.target.classList.add('acik');
        g.unobserve(giris.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  hedef.forEach(function (e) { g.observe(e); });
})();
"""


def yapi(baslik: str, govde: str, aktif: str, aciklama: str, genis: bool = False) -> str:
    """Ortak sayfa iskeleti."""
    menu = [
        ("index", "Ana sayfa", False),
        ("gizlilik", "Gizlilik", True),
        ("sartlar", "Şartlar", True),
        ("destek", "Destek", False),
    ]
    baglar = "".join(
        f'<a href="{"./" if ad == "index" else ad + ".html"}"'
        + (' class="gizle-dar"' if dar else "")
        + (' aria-current="page"' if ad == aktif else "")
        + f">{etiket}</a>"
        for ad, etiket, dar in menu
    )
    icerik = govde if genis else f'<div class="wrap"><main class="metin">{govde}</main></div>'
    return f"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(baslik)} · WORDLY</title>
<meta name="description" content="{html.escape(aciklama)}">
<meta name="color-scheme" content="dark light">
<meta property="og:title" content="{html.escape(baslik)} · WORDLY">
<meta property="og:description" content="{html.escape(aciklama)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="style.css">
<script>{TEMA_BETIGI}</script>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="logo" href="./">WORD<span>LY</span></a>
    <nav>{baglar}
      <button class="tema" type="button" aria-label="Temayı değiştir">🌙</button>
    </nav>
  </div>
</header>
{icerik}
<footer>
  <div class="wrap">
    <p>WORDLY — Türkçe konuşanlar için İngilizce.
    <a href="gizlilik.html">Gizlilik</a> · <a href="sartlar.html">Şartlar</a> ·
    <a href="destek.html">Destek</a></p>
  </div>
</footer>
<script>{SAYFA_BETIGI}</script>
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


def bolum(
    kicker: str,
    baslik: str,
    paragraflar: list[str],
    ekran_adi: str,
    cizim: str,
    alt: str,
    ters: bool = False,
    zemin: bool = False,
) -> str:
    """Anlatının bir adımı: solda metin, sağda telefon — ya da tersi."""
    metin = "".join(f"<p>{p}</p>" for p in paragraflar)
    sinif = "duo ters" if ters else "duo"
    return f"""
<section class="{'alt' if zemin else ''} bel">
  <div class="wrap">
    <div class="{sinif}">
      <div class="anlat">
        <span class="kicker">{kicker}</span>
        <h2>{baslik}</h2>
        {metin}
      </div>
      <div class="gorsel">{telefon(ekran_adi, cizim, alt)}</div>
    </div>
  </div>
</section>
"""


def anasayfa(ayar: dict, eksik: list[str]) -> str:
    s = sayilar()
    posta = html.escape(str(ayar.get("destekEposta", "")))

    kutular = [
        ("💸", "Tamamen ücretsiz", "Kilitli bölüm yok, abonelik yok, uygulama içi satın alma yok."),
        ("✈️", "Çevrimdışı çalışır", "İnternet olmadan da açılır. İlerlemen telefonunda durur."),
        ("🔑", "Hesap isteğe bağlı", "Hesap yalnızca ilerlemeni ikinci bir cihaza taşımak için."),
        ("🚫", "Reklam ve takip yok", "Hiçbir izleme kütüphanesi kullanılmıyor. Veri satılmıyor."),
    ]
    kart_html = "".join(
        f'<div class="kart"><span class="im">{im}</span><h3>{b}</h3><p>{m}</p></div>'
        for im, b, m in kutular
    )

    sayi_html = "".join(
        f"<div class=\"sayi\"><b>{tr(v)}</b><span>{etiket}</span></div>"
        for v, etiket in [
            (s["kelime"], "kelime kartı"),
            (s["gramerAlistirma"], "gramer alıştırması"),
            (s["okuma"], "okuma parçası"),
            (s["dinlemeSatir"], "diyalog satırı"),
            (s["yazmaGorev"], "yazma görevi"),
            (s["sesKaydi"], "ses kaydı"),
        ]
    )

    tablo = "".join(
        f"<tr><td>{ad}</td><td>{kapsam}</td></tr>"
        for ad, kapsam in [
            ("Kelime", f"{tr(s['kelime'])} kart, {s['seviye']} seviye, telaffuz kayıtlarıyla"),
            ("Gramer", f"{tr(s['gramerDers'])} ders, {tr(s['gramerAlistirma'])} alıştırma"),
            ("Okuma", f"{tr(s['okuma'])} metin, {tr(s['okumaSoru'])} anlama sorusu"),
            ("Dinleme", f"{tr(s['dinleme'])} diyalog, {tr(s['dinlemeSatir'])} satır, transkriptli"),
            ("Konuşma", f"{tr(s['konusma'])} set — kendi sesini kaydet, model sesle karşılaştır"),
            ("Yazma", f"{tr(s['yazma'])} set, {tr(s['yazmaGorev'])} görev"),
        ]
    )

    b_seviye = bolum(
    "1 · BAŞLANGIÇ",
    "Nereden başlayacağını sana söylüyor.",
    [
        "Kırk soruluk bir yerleştirme testi, kelime ve gramerden karışık. "
        "Sonunda CEFR seviyeni veriyor ve müfredat oradan başlıyor.",
        "Sonuç bir rozet değil, bir başlangıç noktası: hangi bölümde ne kadar "
        "yol olduğunu da gösteriyor. İstediğin zaman yeniden çözebiliyorsun.",
    ],
    "seviye",
    seviye_ekran(),
    "Seviye testi sonucu: B1, bölüm bölüm dağılım",
    ters=True,
)
    b_gunluk = bolum(
    "2 · HER GÜN",
    "Günde on dakika, hep aynı yerden devam.",
    [
        "Kurulumda günlük bir süre seçiyorsun ve ana ekran onu takip ediyor — "
        "hedefin görünür olmadığı sürece hedef değildir.",
        "\"Kaldığın yer\" gerçekten kaldığın yer: hangi bölümde, kaçıncı derste "
        "olduğunu söylüyor ve tek dokunuşla oraya götürüyor.",
    ],
    "yol",
    yol_ekran(),
    "Yol haritası: biten, şu anki ve henüz açılmamış dersler",
)
    b_calisma = bolum(
    "3 · ÇALIŞMA",
    "Cevap doğruysa neden doğru olduğunu da yazıyor.",
    [
        f"{tr(s['gramerAlistirma'])} gramer alıştırması, {tr(s['okuma'])} okuma "
        f"parçası, {tr(s['dinleme'])} diyalog. Her sorunun altında kuralın "
        "Türkçe açıklaması var.",
        "Okuma parçalarında altı çizili kelimelere dokununca Türkçesi çıkıyor; "
        "metinden kopup sözlüğe gitmen gerekmiyor.",
    ],
    "gramer",
    gramer_ekran(),
    "Gramer sorusu: doğru şık işaretlenmiş, altında kural açıklaması",
    ters=True,
    zemin=True,
)
    b_oyun = bolum(
    "4 · OYUN",
    "Harf Arenası — kelime çalışmanın sıkılmayan hâli.",
    [
        "Türkçesi verilen kelimeyi harflerden kuruyorsun. Harfler senin "
        "seviyendeki kelimelerden geliyor, yani oyun da ders.",
        "Kombo, seri ve süre var; ceza yok. Bildiğin bir kelimeyi hatırlamak "
        "için geçen üç saniye, yanlış yapmaktan daha iyi öğretiyor.",
    ],
    "arena",
    arena_ekran(),
    "Harf Arenası: harf çarkı ve yuvalara yerleşen kelime",
)
    b_hatalar = bolum(
    "5 · HATALAR",
    "Yanlışların kaybolmuyor, bir deftere düşüyor.",
    [
        "Her yanlış cevap hata defterine yazılıyor: soru, senin cevabın ve "
        "doğrusu. Hangi bölümde daha çok zorlandığını da gösteriyor.",
        "Üstünden geçip \"öğrendim\" dediğinde defterden siliniyor. Tekrar, "
        "rastgele değil kendi hatalarının üstünden.",
    ],
    "defter",
    defter_ekran(),
    "Hata defteri: en çok zorlanılan bölüm ve tek tek yanlışlar",
    ters=True,
    zemin=True,
)
    b_okuma = bolum(
    "6 · OKUMA",
    "Yüz elli metin, hepsi seviyene göre yazılmış.",
    [
        f"{tr(s['okuma'])} parça ve {tr(s['okumaSoru'])} anlama sorusu. "
        "Metinler seviyeye göre yazıldı — A1'de bilmen gereken kelimeyle, "
        "C1'de bilmen gerekenle.",
        "Zorlandığın yerde tek dokunuşla Türkçe çevirisine geçebiliyorsun.",
    ],
    "okuma",
    okuma_ekran(),
    "Okuma ekranı: metin, dokunulabilir kelimeler ve anlama sorusu",
)

    govde = f"""
<main>

<section class="hero">
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <span class="kicker">A1 → C2 · Türkçe anlatım</span>
        <h1>İngilizceyi gerçekten öğren.</h1>
        <p class="lede">Ders çalışıyormuş gibi olmadan. Kelime, gramer, okuma,
        dinleme, konuşma ve yazma — altı seviye boyunca, CEFR standardına göre,
        telefonunda ve internetsiz.</p>
        <div class="rozetler">
          <span class="rozet">🇹🇷 Türkçe anlatım</span>
          <span class="rozet">✈️ Çevrimdışı</span>
          <span class="rozet">💸 Ücretsiz</span>
          <span class="rozet">🚫 Reklamsız</span>
        </div>
        <!-- Mağaza düğmeleri henüz bağlanacak bir yere gitmiyor; düğme gibi
             görünüp hiçbir şey yapmasınlar diye düğme değil, durum satırı. -->
        <div class="magaza">
          <span class="magaza-kutu">
            <b>App Store</b><i>yayına hazırlanıyor</i>
          </span>
          <span class="magaza-kutu">
            <b>Google Play</b><i>yayına hazırlanıyor</i>
          </span>
        </div>
        <p class="hero-not">Sürüm çıktığında bu sayfada bağlantısı olacak.
        Haber almak için <a href="destek.html">destek sayfasından</a> yazabilirsin.</p>
      </div>
      <div class="gorsel">{telefon("ana", ana_ekran(tr(s["kelime"])), "WORDLY ana ekranı: günlük hedef, seri ve kaldığın yer")}</div>
    </div>
    {uyari(eksik)}
  </div>
</section>

<section class="tight alt bel">
  <div class="wrap">
    <div class="sayilar">{sayi_html}</div>
  </div>
</section>

{b_seviye}

{b_gunluk}

{b_calisma}

{b_oyun}

{b_hatalar}

{b_okuma}

<section class="bel">
  <div class="wrap">
    <span class="kicker">NEDEN BÖYLE</span>
    <h2>Dört karar</h2>
    <p class="lede" style="margin-bottom:var(--s3)">Bu uygulamanın neyi yapmadığı,
    ne yaptığı kadar önemli.</p>
    <div class="kartlar">{kart_html}</div>
  </div>
</section>

<section class="alt bel">
  <div class="wrap">
    <span class="kicker">İÇİNDEKİLER</span>
    <h2>Ne kadar içerik var</h2>
    <p class="lede" style="margin-bottom:var(--s3)">Bu sayılar elle yazılmadı;
    her yayında içeriğin kendisinden sayılıyor.</p>
    <table>
      <thead><tr><th>Bölüm</th><th>Kapsam</th></tr></thead>
      <tbody>{tablo}</tbody>
    </table>
  </div>
</section>

<section class="bel">
  <div class="wrap metin">
    <span class="kicker">DÜRÜSTLÜK NOTU</span>
    <h2>Henüz yapılmamış olanlar</h2>
    <p>Bu sayfada yazan her şey uygulamada gerçekten var. Olmayanları da
    söyleyelim: telaffuz puanlama, arkadaş ve kulüp özellikleri, serbest yazma
    geri bildirimi. Bunlar geldiğinde burada yazacak.</p>
    <p>Okuma parçalarının çizimleri de henüz üretilmedi; o parçalar şimdilik
    başlığı taşıyan çizilmiş bir kapakla açılıyor.</p>
    <p>Uygulama şu an mağazalarda değil; yayına hazırlanıyor.</p>
    <p style="margin-top:var(--s3)">
      <a class="cta sade" href="mailto:{posta}">Soru ve hata bildirimi → {posta}</a>
    </p>
  </div>
</section>

</main>
"""
    return yapi(
        "Türkçe konuşanlar için İngilizce",
        govde,
        "index",
        "Türkçe konuşanlar için ücretsiz İngilizce öğrenme uygulaması. A1–C2, "
        "çevrimdışı çalışır, reklam yok.",
        genis=True,
    )


def destek(ayar: dict, eksik: list[str]) -> str:
    posta = html.escape(str(ayar.get("destekEposta", "")))
    govde = f"""
<h1>Destek</h1>
<p class="lede">Bir sorun mu var, bir şey mi çalışmıyor? Yaz, bakalım.</p>
{uyari(eksik)}

<p><a class="cta" href="mailto:{posta}">{posta}</a></p>

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

<h3>Uygulama çok koyu ya da çok parlak</h3>
<p><strong>Ayarlar → Görünüm</strong>'den Sistem, Açık ve Koyu arasında
seçebilirsin. Varsayılan "Sistem": telefonun ayarını izler.</p>

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

    ekran_dizin = OUT / "ekran"
    # Yalnızca görüntüler; klasördeki BENIOKU.md bir ekran görüntüsü değil.
    var = (
        sorted(
            p.name
            for p in ekran_dizin.glob("*")
            if p.suffix.lower() in {".webp", ".png", ".jpg", ".jpeg"}
        )
        if ekran_dizin.exists()
        else []
    )
    if var:
        print(f"\nGerçek ekran görüntüsü kullanılan: {', '.join(var)}")
    else:
        print("\nEkran görüntüsü yok; arayüz sayfanın içinde çiziliyor.")
        print("Gerçeğini koymak için: docs/ekran/<ad>.webp")
        print("  ana, yol, seviye, gramer, arena, defter, okuma")

    if toplam_eksik:
        print()
        print("UYARI: doldurulmamış alanlar var -> " + ", ".join(toplam_eksik))
        print("Sayfaların üstüne kırmızı uyarı şeridi basıldı.")
        print("content/legal/site.json doldurup betiği yeniden çalıştır.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
