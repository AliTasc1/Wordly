import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AA_LARGE, AA_TEXT, contrast, parse } from './contrast';
import { ALPHAS, PALETTES, type Palette, type ThemeName } from './palette';

const TEMALAR: ThemeName[] = ['dark', 'light'];

/** Okunması gereken metin renkleri — yüzeyin üstünde duruyorlar. */
const METIN: (keyof Palette)[] = [
  'text',
  'textBright',
  'textBody',
  'textSubtle',
  'textMuted',
  'textDim',
  'textFaint',
];

/** Büyük ya da ikincil roldeki renkler: 3:1 yetiyor. */
const IKINCIL: (keyof Palette)[] = [
  'textGhost',
  'textDisabled',
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'link',
  'violetSoft',
  'blueSoft',
];

/** Metnin üstüne düştüğü yüzeyler. */
const YUZEY: (keyof Palette)[] = ['bg', 'surface', 'sunken', 'raised'];

test('iki paletin anahtarları birebir aynı', () => {
  // Biri eksik kalırsa o anahtarı kullanan ekran, o temada `undefined` renk
  // alır ve React Native sessizce siyaha düşer.
  assert.deepEqual(
    Object.keys(PALETTES.dark).sort(),
    Object.keys(PALETTES.light).sort(),
  );
  assert.deepEqual(Object.keys(ALPHAS.dark).sort(), Object.keys(ALPHAS.light).sort());
});

test('her renk okunabilir biçimde yazılmış', () => {
  for (const tema of TEMALAR) {
    for (const [ad, deger] of Object.entries(PALETTES[tema])) {
      assert.doesNotThrow(() => parse(deger), `${tema}.${ad} = ${deger}`);
    }
    for (const [ad, deger] of Object.entries(ALPHAS[tema])) {
      assert.doesNotThrow(() => parse(deger), `${tema}.alpha.${ad} = ${deger}`);
    }
  }
});

test('metin renkleri her yüzeyde WCAG AA tutuyor', () => {
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    for (const yuzey of YUZEY) {
      for (const metin of METIN) {
        const oran = contrast(p[metin], p[yuzey]);
        assert.ok(
          oran >= AA_TEXT,
          `${tema}: ${metin} / ${yuzey} = ${oran.toFixed(2)}:1 (en az ${AA_TEXT})`,
        );
      }
    }
  }
});

test('ikincil renkler en az 3:1', () => {
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    for (const yuzey of YUZEY) {
      for (const renk of IKINCIL) {
        const oran = contrast(p[renk], p[yuzey]);
        assert.ok(
          oran >= AA_LARGE,
          `${tema}: ${renk} / ${yuzey} = ${oran.toFixed(2)}:1 (en az ${AA_LARGE})`,
        );
      }
    }
  }
});

test('marka dolgusunun üstündeki yazı okunuyor', () => {
  // Düğmeler `primary` ve `secondary` dolgulu, üstlerindeki yazı `onBrand`.
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    for (const dolgu of ['primary', 'secondary', 'primaryPressed'] as const) {
      const oran = contrast(p.onBrand, p[dolgu]);
      assert.ok(
        oran >= AA_LARGE,
        `${tema}: onBrand / ${dolgu} = ${oran.toFixed(2)}:1`,
      );
    }
  }
});

test('iki tema gerçekten zıt', () => {
  // Açık temanın zemini koyu temanınkinden belirgin biçimde parlak olmalı;
  // aksi hâlde "açık tema" adında ikinci bir koyu tema yapmış oluruz.
  const oran = contrast(PALETTES.dark.bg, PALETTES.light.bg);
  assert.ok(oran > 10, `iki zemin arası kontrast yalnızca ${oran.toFixed(2)}:1`);
});

/*
  Yüzey hiyerarşisi.

  Dört basamak var ve her biri bir soruya cevap veriyor: bu şey sayfanın
  kendisi mi (`bg`), sayfadaki bir kart mı (`surface`), kartın içindeki bir
  oyuk mu (`sunken`), yoksa kartın üstünde duran bir şey mi (`raised`)?

  Sıra iki temada aynı değil ve olmamalı. Koyuda oyuk karttan koyu ama
  sayfadan açık; açıkta oyuk sayfadan da koyu, çünkü beyaz kartın içinde
  görünür olmasının başka yolu yok.
*/
function parlaklık(renk: string): number {
  const [r, g, b] = parse(renk);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

test('oyuk, kartın içinde görünüyor', () => {
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    // Kontrast oranı değil, ham fark: iki yüzey arasındaki sınır gözle
    // seçilebilmeli. Beş birim, 255'lik ölçekte en küçük fark ediliyor olan.
    const fark = Math.abs(parlaklık(p.sunken) - parlaklık(p.surface));
    assert.ok(fark >= 5, `${tema}: oyuk kartla neredeyse aynı (${fark.toFixed(1)})`);
  }
});

test('kart, sayfadan ayrılıyor', () => {
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    const fark = Math.abs(parlaklık(p.surface) - parlaklık(p.bg));
    assert.ok(fark >= 5, `${tema}: kart sayfadan ayrılmıyor (${fark.toFixed(1)})`);
  }
});

test('yükselen yüzey karttan aşağı düşmüyor', () => {
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    if (tema === 'dark') {
      assert.ok(
        parlaklık(p.raised) > parlaklık(p.surface),
        'koyu temada yükselti renkle anlatılıyor, karttan açık olmalı',
      );
    } else {
      // Açıkta beyazın üstü yok; farkı gölge veriyor. Eşit olması kasıtlı,
      // karttan koyu olması kusur olurdu.
      assert.ok(
        parlaklık(p.raised) >= parlaklık(p.surface),
        'açık temada yükselen yüzey karttan koyu olamaz',
      );
    }
  }
});

test('oyuk karttan koyu', () => {
  // İki temada da geçerli olan tek kural: oyuk içine oturduğu karttan koyu.
  for (const tema of TEMALAR) {
    const p = PALETTES[tema];
    assert.ok(
      parlaklık(p.sunken) < parlaklık(p.surface),
      `${tema}: oyuk karttan açık — gömülü değil, kabarık görünür`,
    );
  }
});
