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
const YUZEY: (keyof Palette)[] = ['bg', 'surface', 'surfaceCard', 'surfaceHigh'];

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
