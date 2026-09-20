#!/usr/bin/env python3
"""Sitenin stil sayfası.

Renkler, puntolar ve boşluklar uygulamanın jetonlarından birebir
kopyalanıyor (`mobile/src/theme/palette.ts`, `theme.ts`, `tokens.ts`).
Site ile uygulama aynı şeye benzemek zorunda: siteye bakıp indiren kişi
uygulamayı açtığında aynı yerde olduğunu anlamalı.

Site de uygulama gibi iki temalı ve seçimi hatırlıyor. Bunu anlatmak
yerine göstermek, "açık tema da var" cümlesinden daha ikna edici.
"""

STYLE = """\
/* ------------------------------------------------------------------ jetonlar
   Uygulamanın paletinden kopya. Değiştirmek gerekirse ikisi birlikte
   değişmeli, yoksa siteyle uygulama birbirinden ayrışır.                     */
:root {
  --bg: #05080f;
  --surface: #111831;
  --sunken: #0b1122;
  --raised: #161e36;
  --line: rgba(255, 255, 255, 0.09);
  --line-soft: rgba(255, 255, 255, 0.06);
  --text: #ffffff;
  --body: #d3dcf0;
  --dim: #94a0bc;
  --faint: #8e9bba;
  --ghost: #6e7b9c;
  --brand: #2e6bff;
  --violet: #7857f5;
  --accent: #22d3ee;
  --success: #22c55e;
  --warning: #f5a524;
  --danger: #ff4d5e;
  --on-brand: #ffffff;
  --card-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  --glow: 0.42;

  /* Tipografi ölçeği — uygulamadaki `font` jetonları, web'de bir tık büyük:
     telefon elde 30 cm, ekran masada 60 cm uzakta.                            */
  --f-label: 12px;
  --f-caption: 13.5px;
  --f-foot: 15px;
  --f-body: 16.5px;
  --f-call: 18px;
  --f-title: 21px;
  --f-head: 26px;
  --f-display: 34px;
  --f-hero: 52px;

  /* Ritim iki punto — uygulamadakiyle aynı. */
  --s1: 6px;
  --s2: 12px;
  --s3: 20px;
  --s4: 32px;
  --s5: 48px;
  --s6: 72px;
  --s7: 104px;

  --radius: 22px;
  --radius-sm: 14px;
  --max: 1100px;
}

:root[data-theme="light"] {
  --bg: #f7f8fc;
  --surface: #ffffff;
  --sunken: #eceff7;
  --raised: #ffffff;
  --line: rgba(11, 16, 32, 0.1);
  --line-soft: rgba(11, 16, 32, 0.06);
  --text: #0b1020;
  --body: #1f2840;
  --dim: #505c7a;
  --faint: #5a6684;
  --ghost: #6b7794;
  --brand: #2558e0;
  --violet: #6742e8;
  --accent: #0e7c90;
  --success: #15803d;
  --warning: #b45309;
  --danger: #dc2626;
  --card-shadow: 0 8px 24px rgba(11, 16, 32, 0.08);
  --glow: 0.18;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --bg: #f7f8fc;
    --surface: #ffffff;
    --sunken: #eceff7;
    --raised: #ffffff;
    --line: rgba(11, 16, 32, 0.1);
    --line-soft: rgba(11, 16, 32, 0.06);
    --text: #0b1020;
    --body: #1f2840;
    --dim: #505c7a;
    --faint: #5a6684;
    --ghost: #6b7794;
    --brand: #2558e0;
    --violet: #6742e8;
    --accent: #0e7c90;
    --success: #15803d;
    --warning: #b45309;
    --danger: #dc2626;
    --card-shadow: 0 8px 24px rgba(11, 16, 32, 0.08);
    --glow: 0.18;
  }
}

/* --------------------------------------------------------------------- temel */
* { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--body);
  font: 400 var(--f-body)/1.65 ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1, h2, h3 { color: var(--text); line-height: 1.2; letter-spacing: -0.02em; margin: 0; }
h1 { font-size: var(--f-hero); font-weight: 800; }
h2 { font-size: var(--f-head); font-weight: 800; }
h3 { font-size: var(--f-call); font-weight: 700; letter-spacing: -0.01em; }
p { margin: 0; }

a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }

.wrap { width: 100%; max-width: var(--max); margin: 0 auto; padding: 0 var(--s3); }

.kicker {
  font: 700 var(--f-label)/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.14em;
  color: var(--faint);
  text-transform: uppercase;
}

/* -------------------------------------------------------------------- başlık */
header.top {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  border-bottom: 1px solid var(--line-soft);
}
header.top .wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  padding-top: var(--s2);
  padding-bottom: var(--s2);
}
.logo {
  font: 800 var(--f-title)/1 ui-sans-serif, system-ui, sans-serif;
  letter-spacing: -0.03em;
  color: var(--text);
  text-decoration: none;
  white-space: nowrap;
}
.logo span {
  background: linear-gradient(135deg, var(--brand), var(--violet), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
header.top nav { display: flex; align-items: center; gap: var(--s3); }
header.top nav a {
  color: var(--dim);
  font-size: var(--f-caption);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
header.top nav a:hover, header.top nav a[aria-current="page"] { color: var(--text); }

.tema {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  width: 38px;
  height: 38px;
  font-size: var(--f-foot);
  cursor: pointer;
  display: grid;
  place-items: center;
  flex: none;
}
.tema:hover { border-color: var(--brand); }

/* --------------------------------------------------------------------- bölüm */
section { padding: var(--s6) 0; }
section.tight { padding: var(--s5) 0; }

/* Tek düze olmaması için: bölümler sırayla ters çevriliyor ve zemin
   dönüşümlü olarak değişiyor. Aynı şablonun altı kez tekrarı, okuyanı
   üçüncüde bırakır.                                                          */
.alt { background: var(--sunken); border-block: 1px solid var(--line-soft); }

.duo {
  display: grid;
  grid-template-columns: 1fr minmax(260px, 340px);
  gap: var(--s5);
  align-items: center;
}
.duo.ters { grid-template-columns: minmax(260px, 340px) 1fr; }
.duo.ters .anlat { order: 2; }
.duo.ters .gorsel { order: 1; }

.anlat { display: flex; flex-direction: column; gap: var(--s2); max-width: 46ch; }
.anlat p { color: var(--dim); font-size: var(--f-foot); }
.gorsel { display: flex; justify-content: center; }

/* ---------------------------------------------------------------------- giriş */
.hero { position: relative; padding: var(--s6) 0 var(--s5); overflow: hidden; }
.hero::before {
  content: "";
  position: absolute;
  inset: -20% -10% auto -10%;
  height: 560px;
  background:
    radial-gradient(48% 52% at 78% 12%, color-mix(in srgb, var(--accent) calc(var(--glow) * 100%), transparent), transparent 70%),
    radial-gradient(46% 48% at 14% 40%, color-mix(in srgb, var(--violet) calc(var(--glow) * 100%), transparent), transparent 70%);
  pointer-events: none;
}
.hero .wrap { position: relative; }
.hero-grid {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 380px);
  gap: var(--s5);
  align-items: center;
}
.hero h1 { margin-bottom: var(--s2); }
.lede { font-size: var(--f-call); color: var(--dim); max-width: 48ch; }

.rozetler { display: flex; flex-wrap: wrap; gap: var(--s1); margin-top: var(--s3); }
.magaza { display: flex; flex-wrap: wrap; gap: var(--s1); margin-top: var(--s3); }
.magaza-kutu {
  display: inline-flex;
  flex-direction: column;
  border: 1px solid var(--line);
  background: var(--sunken);
  border-radius: 14px;
  padding: 10px 18px;
  min-width: 150px;
}
.magaza-kutu b { color: var(--text); font-size: var(--f-caption); font-weight: 700; }
.magaza-kutu i {
  font-style: normal;
  font-size: var(--f-label);
  color: var(--faint);
}
.hero-not { margin-top: var(--s2); font-size: var(--f-caption); color: var(--faint); max-width: 44ch; }

.rozet {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: var(--f-caption);
  font-weight: 600;
  color: var(--body);
}

/* -------------------------------------------------------------------- sayılar */
.sayilar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--s2);
}
.sayi {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  padding: var(--s3);
  box-shadow: var(--card-shadow);
}
.sayi b {
  display: block;
  font-size: var(--f-display);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text);
  line-height: 1.1;
}
.sayi span { font-size: var(--f-caption); color: var(--dim); }

/* --------------------------------------------------------------------- kartlar */
.kartlar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--s2);
}
.kart {
  background: var(--surface);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: var(--s3);
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  box-shadow: var(--card-shadow);
}
.kart .im { font-size: 26px; line-height: 1; }
.kart p { color: var(--dim); font-size: var(--f-caption); }

/* --------------------------------------------------------------------- telefon
   Ekran görüntüsü yerine uygulamanın arayüzü sayfanın içinde çiziliyor:
   aynı jetonlar, aynı yerleşim. Gerçek görüntüler geldiğinde
   `docs/ekran/` klasörüne konuyor ve bu çizimin yerini alıyorlar.            */
.telefon {
  width: 300px;
  max-width: 100%;
  aspect-ratio: 300 / 620;
  border-radius: 42px;
  border: 1px solid var(--line);
  background: var(--bg);
  box-shadow: var(--card-shadow), 0 0 0 9px color-mix(in srgb, var(--text) 6%, transparent);
  padding: 12px;
  position: relative;
  overflow: hidden;
  flex: none;
}
.telefon::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 108px;
  height: 22px;
  border-radius: 999px;
  background: var(--text);
  opacity: 0.12;
}
.telefon img { width: 100%; height: 100%; object-fit: cover; border-radius: 32px; display: block; }
.ekran {
  height: 100%;
  border-radius: 32px;
  background: var(--bg);
  padding: 40px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  font-size: 12px;
}

.e-baslik { display: flex; align-items: center; gap: 10px; }
.e-avatar {
  width: 38px; height: 38px; border-radius: 13px; flex: none;
  background: linear-gradient(135deg, var(--violet), var(--accent));
  display: grid; place-items: center;
  color: #fff; font-weight: 800; font-size: 14px;
}
.e-ad { font-weight: 800; color: var(--text); font-size: 14px; line-height: 1.2; }
.e-alt { color: var(--dim); font-size: 11px; }

.e-satir { display: flex; gap: 6px; }
.e-cip {
  flex: 1; border-radius: 13px; padding: 9px 10px;
  border: 1px solid var(--line); background: var(--surface);
}
.e-cip u {
  display: block; text-decoration: none;
  font: 700 9px/1 ui-monospace, Menlo, monospace; letter-spacing: 0.1em; color: var(--faint);
}
.e-cip b { display: block; font-size: 16px; font-weight: 800; color: var(--text); margin-top: 3px; }

.e-kart {
  border-radius: 18px; border: 1px solid var(--line-soft);
  background: var(--surface); padding: 12px; display: flex; flex-direction: column; gap: 8px;
}
.e-kart h4 { margin: 0; font-size: 13px; font-weight: 700; color: var(--text); }
.e-kart p { font-size: 11px; color: var(--dim); }

.e-bar { height: 8px; border-radius: 9px; background: var(--line); overflow: hidden; }
.e-bar i { display: block; height: 100%; border-radius: 9px; background: linear-gradient(90deg, var(--brand), var(--accent)); }

.e-secenek {
  border-radius: 14px; border: 1px solid var(--line); background: var(--surface);
  padding: 10px 12px; font-size: 12px; color: var(--body);
  display: flex; align-items: center; gap: 8px;
}
.e-secenek.dogru { border-color: var(--success); background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--text); }
.e-secenek.yanlis { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 12%, transparent); }
.e-secenek em {
  font-style: normal; width: 20px; height: 20px; border-radius: 7px; flex: none;
  display: grid; place-items: center; font-size: 10px; font-weight: 700;
  border: 1px solid var(--line); color: var(--faint);
}

.e-yuvalar { display: flex; gap: 5px; justify-content: center; }
.e-yuva {
  width: 32px; height: 38px; border-radius: 11px;
  display: grid; place-items: center;
  font: 700 15px/1 ui-monospace, Menlo, monospace; color: var(--text);
}
.e-yuva.dolu { background: linear-gradient(140deg, var(--brand), var(--violet)); color: #fff; }
.e-yuva.bos { background: var(--sunken); border: 1.5px dashed var(--line); }

.e-cark { position: relative; height: 176px; margin: 2px auto 0; width: 176px; }
.e-cark .halka {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1.5px solid var(--line);
}
.e-cark .ic {
  position: absolute; inset: 44px; border-radius: 50%;
  display: grid; place-items: center; text-align: center;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand) 26%, transparent), transparent 72%);
}
.e-cark .ic u {
  display: block; text-decoration: none;
  font: 700 8px/1 ui-monospace, Menlo, monospace; letter-spacing: 0.16em; color: var(--ghost);
}
.e-cark .ic b { display: block; font-size: 12px; color: var(--text); margin-top: 3px; }
.e-harf {
  position: absolute; width: 34px; height: 34px; border-radius: 12px;
  display: grid; place-items: center; font: 700 14px/1 ui-monospace, Menlo, monospace;
  background: color-mix(in srgb, var(--text) 6%, transparent);
  border: 1px solid var(--line); color: var(--text);
}
.e-harf.secili {
  background: linear-gradient(140deg, var(--brand), var(--violet));
  color: #fff; border-color: transparent;
}

.e-alt-menu {
  margin-top: auto; display: flex; justify-content: space-between;
  border-top: 1px solid var(--line-soft); padding-top: 10px;
}
.e-alt-menu span { font-size: 16px; opacity: 0.45; }
.e-alt-menu span.on { opacity: 1; }

.e-metin { font-size: 11px; line-height: 1.7; color: var(--body); }
.e-metin mark {
  background: none; color: var(--accent);
  border-bottom: 1px dashed color-mix(in srgb, var(--accent) 60%, transparent);
}
.e-gorsel {
  border-radius: 14px; aspect-ratio: 16/9; border: 1px solid var(--line-soft);
  background:
    radial-gradient(60% 70% at 72% 22%, color-mix(in srgb, var(--accent) 30%, transparent), transparent 70%),
    var(--sunken);
  display: flex; align-items: flex-end; padding: 10px;
  font-size: 12px; font-weight: 800; color: var(--text);
}

/* --------------------------------------------------------------------- tablo */
table { width: 100%; border-collapse: collapse; font-size: var(--f-caption); }
th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid var(--line-soft); }
th { color: var(--faint); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: var(--f-label); }
td { color: var(--body); }
td:first-child { color: var(--text); font-weight: 600; }

/* ---------------------------------------------------------------------- yasal */
.metin { max-width: 72ch; }
.metin h1 { font-size: var(--f-display); margin-bottom: var(--s3); }
.metin h2 { font-size: var(--f-title); margin: var(--s4) 0 var(--s2); }
.metin h3 { font-size: var(--f-body); margin: var(--s3) 0 var(--s1); }
.metin p, .metin li { color: var(--body); font-size: var(--f-foot); }
/* `p { margin: 0 }` genel kural; uzun metinde paragraflar birbirine yapışıyordu. */
.metin p { margin-bottom: var(--s2); }
.metin p:last-child { margin-bottom: 0; }
.metin ul, .metin ol { padding-left: 22px; }
.metin li { margin: var(--s1) 0; }
.metin code {
  background: var(--sunken); border: 1px solid var(--line-soft);
  border-radius: 6px; padding: 2px 6px; font-size: 0.9em;
}

.notice {
  border: 1px solid var(--danger);
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: var(--s3);
  margin-bottom: var(--s4);
  font-size: var(--f-caption);
}

/* ---------------------------------------------------------------------- eylem */
.cta {
  display: inline-flex; align-items: center; gap: var(--s1);
  background: linear-gradient(135deg, var(--brand), var(--violet));
  color: var(--on-brand); font-weight: 700; font-size: var(--f-foot);
  border-radius: 16px; padding: 14px 24px; text-decoration: none;
  box-shadow: 0 14px 34px color-mix(in srgb, var(--brand) 42%, transparent);
}
.cta:hover { text-decoration: none; filter: brightness(1.06); }
.cta.sade {
  background: none; border: 1px solid var(--line); color: var(--text); box-shadow: none;
}

footer {
  border-top: 1px solid var(--line-soft);
  padding: var(--s4) 0 var(--s5);
  color: var(--faint);
  font-size: var(--f-caption);
}
footer a { color: var(--dim); }

/* -------------------------------------------------------------------- hareket
   Bölümler kaydırdıkça beliriyor. Hareketi azaltılmış isteyen kullanıcıda
   hepsi baştan görünür: animasyon bir süs, içerik değil.                     */
.bel { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
.bel.acik { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .bel { opacity: 1; transform: none; transition: none; }
}

/* ---------------------------------------------------------------------- dar */
@media (max-width: 860px) {
  :root { --f-hero: 36px; --f-head: 23px; --f-display: 28px; }
  .hero-grid, .duo, .duo.ters { grid-template-columns: 1fr; gap: var(--s4); }
  .duo.ters .anlat, .duo.ters .gorsel { order: initial; }
  .gorsel { order: 2; }
  section { padding: var(--s5) 0; }
  header.top nav a.gizle-dar { display: none; }
}
"""
