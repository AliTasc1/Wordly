#!/usr/bin/env python3
"""Sitede gösterilen telefon ekranları.

İki yol var ve ikisi de destekleniyor.

Gerçek ekran görüntüleri `docs/ekran/` klasörüne konduğunda kullanılıyor.
Yoksa uygulamanın arayüzü sayfanın içinde HTML olarak çiziliyor: aynı
renkler, aynı puntolar, aynı yerleşim — stil sayfası uygulamanın
jetonlarından kopyalandığı için.

Neden çizim? Çünkü ekran görüntüsü olmadan site "yakında" demek zorunda
kalıyordu ve bir tanıtım sayfasının en ikna edici parçası eksik
duruyordu. Çizim ayrıca temayı izliyor: sayfadaki tema düğmesine basınca
telefondaki arayüz de açığa geçiyor — bir ekran görüntüsünün yapamayacağı
şey.
"""

import html
import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
EKRAN_DIZIN = ROOT / "docs" / "ekran"

# Kabul edilen uzantılar, tercih sırasına göre: aynı kalitede en küçük dosya
# önce.
UZANTILAR = [".webp", ".png", ".jpg", ".jpeg"]


def gercek_gorsel(ad: str) -> str | None:
    """`docs/ekran/<ad>.<uzanti>` varsa göreli yolunu verir."""
    for uz in UZANTILAR:
        if (EKRAN_DIZIN / f"{ad}{uz}").exists():
            return f"ekran/{ad}{uz}"
    return None


def telefon(ad: str, cizim: str, alt: str) -> str:
    """Telefon çerçevesi: gerçek görüntü varsa o, yoksa çizim."""
    gorsel = gercek_gorsel(ad)
    if gorsel:
        ic = f'<img src="{gorsel}" alt="{html.escape(alt)}" loading="lazy" width="300" height="620">'
    else:
        # Çizim bir resim değil, arayüzün kendisi. Ekran okuyucuya tek bir
        # tarif veriliyor; içindeki onlarca kelimeyi tek tek okutmak,
        # dinleyen kişiye sayfayı değil gürültüyü anlatırdı.
        ic = f'<div class="ekran" role="img" aria-label="{html.escape(alt)}">{cizim}</div>'
    return f'<div class="telefon">{ic}</div>'


# --------------------------------------------------------------------- çizimler


def ana_ekran(kelime: str) -> str:
    return """
<div class="e-baslik">
  <div class="e-avatar">A</div>
  <div>
    <div class="e-ad">İyi akşamlar, Ali 👋</div>
    <div class="e-alt">Bugün 120 XP · 🔥 7 gün</div>
  </div>
</div>
<div class="e-satir">
  <div class="e-cip"><u>SEVİYE</u><b>B1</b></div>
  <div class="e-cip"><u>SERİ</u><b>🔥 7</b></div>
  <div class="e-cip"><u>XP</u><b>4.480</b></div>
</div>
<div class="e-kart">
  <h4>Bugünkü hedefin</h4>
  <div class="e-bar"><i style="width:68%"></i></div>
  <p>14 dk / 20 dk — 6 dakikan kaldı.</p>
</div>
<div class="e-kart">
  <h4>Kaldığın yer</h4>
  <p>Gramer · Present Perfect — 12/25</p>
  <div class="e-bar"><i style="width:48%"></i></div>
</div>
<div class="e-satir">
  <div class="e-cip"><u>GÜNÜN OYUNU</u><b style="font-size:13px">🎮 Harf Arenası</b></div>
</div>
<div class="e-kart">
  <h4>Hata defterin</h4>
  <p>3 yanlış bekliyor — üstünden geçince siliniyor.</p>
</div>
<div class="e-alt-menu">
  <span class="on">🏠</span><span>📚</span><span>🎮</span><span>📓</span><span>👤</span>
</div>
"""


def gramer_ekran() -> str:
    return """
<div>
  <div class="kicker" style="font-size:9px">SORU 2/5</div>
  <div class="e-ad" style="font-size:15px;margin-top:4px">She ___ to London twice.</div>
</div>
<div class="e-secenek"><em>A</em> go</div>
<div class="e-secenek dogru"><em>B</em> has been</div>
<div class="e-secenek"><em>C</em> is going</div>
<div class="e-secenek"><em>D</em> was</div>
<div class="e-kart">
  <h4>✓ Doğru · +20 XP</h4>
  <p>Yaşanmışlık anlatırken present perfect kullanılır: been = gidip dönmüş.</p>
</div>
<div class="e-alt-menu">
  <span>🏠</span><span class="on">📚</span><span>🎮</span><span>📓</span><span>👤</span>
</div>
"""


def arena_ekran() -> str:
    """Harf çarkı — açıları uygulamadakiyle aynı formülden çiziliyor."""
    harfler = ["T", "I", "C", "K", "E", "T", "A", "R", "N", "O"]
    secili = {0, 1, 2}
    n = len(harfler)
    merkez, yaricap, tus = 88, 62, 34
    parcalar = []
    for i, h in enumerate(harfler):
        aci = math.radians(-90 + (i * 360) / n)
        x = merkez + yaricap * math.cos(aci) - tus / 2
        y = merkez + yaricap * math.sin(aci) - tus / 2
        sinif = "e-harf secili" if i in secili else "e-harf"
        parcalar.append(
            f'<div class="{sinif}" style="left:{x:.1f}px;top:{y:.1f}px">{h}</div>'
        )
    tuslar = "".join(parcalar)
    return f"""
<div class="e-satir">
  <div class="e-cip"><u>KOMBO</u><b>×3</b></div>
  <div class="e-cip"><u>SERİ</u><b>5</b></div>
  <div class="e-cip"><u>XP</u><b>240</b></div>
</div>
<div class="e-yuvalar">
  <div class="e-yuva dolu">T</div>
  <div class="e-yuva dolu">I</div>
  <div class="e-yuva dolu">C</div>
  <div class="e-yuva bos"></div>
  <div class="e-yuva bos"></div>
  <div class="e-yuva bos"></div>
</div>
<div class="e-cark">
  <div class="halka"></div>
  <div class="ic"><u>İPUCU</u><b>bilet</b></div>
  {tuslar}
</div>
<div class="e-alt-menu">
  <span>🏠</span><span>📚</span><span class="on">🎮</span><span>📓</span><span>👤</span>
</div>
"""


def okuma_ekran() -> str:
    return """
<div class="e-ad" style="font-size:14px">Küçük bir kafe</div>
<div class="e-alt">A1 · 2 dk · 2/25</div>
<div class="e-gorsel">A Small Cafe</div>
<div class="e-metin">
  There is a small <mark>cafe</mark> near my house in Ankara. It opens at eight
  in the morning and <mark>closes</mark> at ten at night. The cafe is not big,
  but it is very <mark>clean</mark> and warm.
</div>
<div class="e-kart">
  <h4>Kafe saat kaçta açılıyor?</h4>
  <div class="e-secenek dogru"><em>A</em> Sekizde</div>
  <div class="e-secenek"><em>B</em> Onda</div>
</div>
<div class="e-alt-menu">
  <span>🏠</span><span class="on">📚</span><span>🎮</span><span>📓</span><span>👤</span>
</div>
"""


def defter_ekran() -> str:
    return """
<div>
  <div class="kicker" style="font-size:9px">HATA DEFTERİ</div>
  <div class="e-ad" style="font-size:16px;margin-top:4px">En çok nerede zorlanıyorsun</div>
</div>
<div class="e-kart">
  <h4>Gramer</h4>
  <p>Bu bölümde 6 kez yanıldın.</p>
  <div class="e-bar"><i style="width:74%"></i></div>
</div>
<div class="e-kart">
  <h4>She ___ to London twice.</h4>
  <p>Senin cevabın: <b style="color:var(--danger)">go</b> · Doğrusu: <b style="color:var(--success)">has been</b></p>
</div>
<div class="e-kart">
  <h4>a piece ___ cake</h4>
  <p>Senin cevabın: <b style="color:var(--danger)">for</b> · Doğrusu: <b style="color:var(--success)">of</b></p>
</div>
<div class="e-alt-menu">
  <span>🏠</span><span>📚</span><span>🎮</span><span class="on">📓</span><span>👤</span>
</div>
"""


def seviye_ekran() -> str:
    return """
<div>
  <div class="kicker" style="font-size:9px">SEVİYE TESTİ</div>
  <div class="e-ad" style="font-size:16px;margin-top:4px">Sonucun hazır</div>
</div>
<div class="e-kart" style="align-items:center;text-align:center">
  <div style="font-size:42px;font-weight:800;color:var(--text);letter-spacing:-.03em">B1</div>
  <p>Orta seviye · 40 sorudan 27 doğru</p>
</div>
<div class="e-kart">
  <h4>Bölüm bölüm</h4>
  <p>Kelime</p><div class="e-bar"><i style="width:72%"></i></div>
  <p>Gramer</p><div class="e-bar"><i style="width:58%"></i></div>
  <p>Okuma</p><div class="e-bar"><i style="width:64%"></i></div>
</div>
<div class="e-alt-menu">
  <span class="on">🏠</span><span>📚</span><span>🎮</span><span>📓</span><span>👤</span>
</div>
"""


def yol_ekran() -> str:
    """Kurs haritası: biten, şu anki ve henüz açılmamış dersler."""
    return """
<div>
  <div class="kicker" style="font-size:9px">B1 · GRAMER</div>
  <div class="e-ad" style="font-size:16px;margin-top:4px">Yol haritan</div>
  <div class="e-alt">25 dersin 12'si bitti</div>
</div>
<div class="e-bar"><i style="width:48%"></i></div>
<div class="e-kart" style="flex-direction:row;align-items:center;gap:10px">
  <span style="font-size:18px">✓</span>
  <div><h4>Present Continuous</h4><p>Bitti · 5/5 doğru</p></div>
</div>
<div class="e-kart" style="flex-direction:row;align-items:center;gap:10px;border-color:var(--brand)">
  <span style="font-size:18px">▶</span>
  <div><h4>Present Perfect</h4><p>Şu an buradasın · 2/5</p></div>
</div>
<div class="e-kart" style="flex-direction:row;align-items:center;gap:10px;opacity:.55">
  <span style="font-size:18px">🔒</span>
  <div><h4>Past Perfect</h4><p>Bir önceki bitince açılıyor</p></div>
</div>
<div class="e-kart" style="flex-direction:row;align-items:center;gap:10px;opacity:.4">
  <span style="font-size:18px">🔒</span>
  <div><h4>Used to / would</h4><p>Bir önceki bitince açılıyor</p></div>
</div>
<div class="e-alt-menu">
  <span>🏠</span><span class="on">📚</span><span>🎮</span><span>📓</span><span>👤</span>
</div>
"""
