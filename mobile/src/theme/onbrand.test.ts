import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AA_TEXT, contrast } from './contrast';
import { PALETTES, type ThemeName } from './palette';
import { THEMES } from './theme';

/*
  Marka dolgusu üstündeki yazı.

  `Txt` rengi verilmediğinde `t.colors.text`e düşüyor. Koyu temada o beyaz
  ve mavi bir düğmenin üstünde doğru duruyor. Açık temada ise koyu lacivert
  (#0B1020) ve aynı mavi düğmenin üstünde 2,9:1 veriyor — yani düğmenin
  yazısı okunmuyor.

  On üç yerde tam olarak bu vardı: gradyanla doldurulmuş bir kutunun içinde
  rengi belirtilmemiş bir `Txt`. Hepsi `onBrand`a bağlandı; bu test yenisini
  yakalıyor.

  Marka gradyanları iki temada da doygun dolgu, dolayısıyla üstlerindeki
  yazı iki temada da açık olmalı. Yüzey gradyanları (`card`, `cardHigh`,
  `tabBar`) zeminin devamı; onların üstünde normal metin rengi doğru.
*/

const ROOT = new URL('../..', import.meta.url).pathname;

/** Üstünde okunacak bir şey olan dolgular. */
const YAZI_TASIYAN = new Set(['brand', 'brandPressed', 'violet', 'teal', 'danger']);

/**
 * Parlak uçlara giden dolgular: çubuk, hale, zemin.
 *
 * `progress` camgöbeğine (#22D3EE) gidiyor ve beyaz orada 1,81:1 veriyor —
 * yani üstüne konan hiçbir beyaz yazı okunmaz. İçine `Txt` konmadığı
 * sürece sorun yok; test tam olarak bunu tutuyor.
 */
const DEKORATIF = new Set(['progress']);

const MARKA = new Set([...YAZI_TASIYAN, ...DEKORATIF]);

function dosyalar(dizin: string, taban = ''): string[] {
  const out: string[] = [];
  for (const ad of readdirSync(dizin)) {
    const tam = join(dizin, ad);
    const göreli = taban ? `${taban}/${ad}` : ad;
    if (statSync(tam).isDirectory()) {
      if (ad === 'node_modules') continue;
      out.push(...dosyalar(tam, göreli));
      continue;
    }
    if (ad.endsWith('.tsx')) out.push(göreli);
  }
  return out;
}

/** `<Gradient …>` açılış etiketinin bittiği yer — süslü parantezleri sayarak. */
function etiketSonu(kaynak: string, başla: number): number {
  let i = başla;
  let derin = 0;
  while (i < kaynak.length) {
    const ch = kaynak[i];
    if (ch === '{') derin++;
    else if (ch === '}') derin--;
    else if (ch === '>' && derin === 0) return i;
    i++;
  }
  return i;
}

/** İç içe `<Gradient>`leri sayarak eşleşen kapanışı bulur. */
function govdeSonu(kaynak: string, başla: number): number {
  let i = başla;
  let açık = 1;
  while (i < kaynak.length && açık > 0) {
    if (kaynak.startsWith('<Gradient', i)) {
      açık++;
      i += 9;
      continue;
    }
    if (kaynak.startsWith('</Gradient>', i)) {
      açık--;
      i += 11;
      continue;
    }
    i++;
  }
  return i;
}

test('marka dolgusundaki her yazının rengi belirtilmiş', () => {
  const kusurlu: string[] = [];

  for (const yol of dosyalar(join(ROOT, 'src'), 'src')) {
    const kaynak = readFileSync(join(ROOT, yol), 'utf8');
    for (const m of kaynak.matchAll(/<Gradient\b/g)) {
      const son = etiketSonu(kaynak, m.index! + 9);
      const etiket = kaynak.slice(m.index!, son + 1);
      const g = /gradients\.(\w+)/.exec(etiket);
      if (!g || !MARKA.has(g[1])) continue;
      // Kendi kapanan etiketin gövdesi yok.
      if (etiket.trimEnd().endsWith('/>')) continue;

      const gövde = kaynak.slice(son + 1, govdeSonu(kaynak, son + 1) - 11);
      for (const t of gövde.matchAll(/<Txt\b[^>]*>/g)) {
        if (t[0].includes('c=')) continue;
        const satır = kaynak.slice(0, son).split('\n').length + gövde.slice(0, t.index!).split('\n').length - 1;
        kusurlu.push(`${yol}:${satır} (${g[1]}) → ${t[0].replace(/\s+/g, ' ').slice(0, 60)}`);
      }
    }
  }

  assert.deepEqual(
    kusurlu,
    [],
    `Marka dolgusunda rengi belirtilmemiş yazı; \`c={t.colors.onBrand}\` ekle:\n${kusurlu.join('\n')}`,
  );
});

test('onBrand, dolgu olarak kullanılan renklerde okunuyor', () => {
  // Jetonun kendisi doğru olmazsa yukarıdaki düzeltme bir şey çözmez.
  // `error` ve `success` burada yok: ikisi de dolgu değil, **metin** rengi
  // olarak kullanılıyor (yanlış cevabın kırmızısı gibi) ve onların denetimi
  // `palette.test.ts` tarafında, yüzeylere karşı yapılıyor.
  const DOLGU = ['primary', 'secondary'] as const;
  for (const tema of ['dark', 'light'] as ThemeName[]) {
    const p = PALETTES[tema];
    for (const rol of DOLGU) {
      const oran = contrast(p.onBrand, p[rol]);
      assert.ok(oran >= AA_TEXT, `${tema}: onBrand / ${rol} = ${oran.toFixed(2)}:1`);
    }
  }
});

test('gradyanın her durağında da okunuyor', () => {
  /*
    Düz renkleri denetlemek yetmiyor: yazı gradyanın üstünde duruyor ve
    gradyan iki uç arasında geziyor. Maviden mora giden bir düğmede yazının
    bir ucu geçip öteki ucu kalabilir — gözle bakan kişi "yarısı okunuyor"
    der ve sebebini bulamaz.

    Koyu temanın moru tam buydu: #7C5CFF, marka gradyanının sağ ucu,
    beyazla 4,35:1. Sol ucu (#2E6BFF) 4,9 veriyordu, yani düğmenin solu
    geçiyor sağı kalıyordu.
  */
  for (const tema of ['dark', 'light'] as ThemeName[]) {
    const g = THEMES[tema].gradients;
    const beyaz = PALETTES[tema].onBrand;
    for (const ad of YAZI_TASIYAN) {
      const duraklar = g[ad as keyof typeof g];
      assert.ok(duraklar, `gradients.${ad} yok — liste kaynakla ayrışmış`);
      for (const durak of duraklar) {
        const oran = contrast(beyaz, durak);
        assert.ok(
          oran >= AA_TEXT,
          `${tema}: gradients.${ad} durağı ${durak} — onBrand ile ${oran.toFixed(2)}:1`,
        );
      }
    }
  }
});

test('dekoratif gradyanların içine yazı konmuyor', () => {
  /*
    `progress` camgöbeğine gidiyor; orada beyaz da koyu da okunmuyor
    (1,81:1 ve 2,4:1). Yani o gradyanın üstünde okunabilir hiçbir metin
    rengi yok — çözümü doğru rengi seçmek değil, oraya yazı koymamak.

    Yazı gerekiyorsa `teal` var: aynı rengin yazı taşıyabilen tonu.
  */
  const kusurlu: string[] = [];
  for (const yol of dosyalar(join(ROOT, 'src'), 'src')) {
    const kaynak = readFileSync(join(ROOT, yol), 'utf8');
    for (const m of kaynak.matchAll(/<Gradient\b/g)) {
      const son = etiketSonu(kaynak, m.index! + 9);
      const etiket = kaynak.slice(m.index!, son + 1);
      const g = /gradients\.(\w+)/.exec(etiket);
      if (!g || !DEKORATIF.has(g[1]) || etiket.trimEnd().endsWith('/>')) continue;
      const gövde = kaynak.slice(son + 1, govdeSonu(kaynak, son + 1) - 11);
      if (/<Txt\b/.test(gövde)) {
        kusurlu.push(`${yol}: gradients.${g[1]} içinde Txt var`);
      }
    }
  }
  assert.deepEqual(
    kusurlu,
    [],
    `Dekoratif gradyanda okunmaz yazı; yazı taşıyan tonu kullan (teal/violet/brand):\n${kusurlu.join('\n')}`,
  );
});

test('varsayılan metin rengi marka dolgusunda yetmiyordu', () => {
  // Kusurun kendisini kayda geçiren test: `text` açık temada mavi düğmenin
  // üstünde AA'yı tutmuyor. Bu bir hata değil, `onBrand`ın var olma sebebi —
  // ikisi eşitlenirse bu test söyler.
  const açık = PALETTES.light;
  assert.ok(
    contrast(açık.text, açık.primary) < AA_TEXT,
    'açık temada `text` marka mavisinde yeterli olsaydı `onBrand` gereksizdi',
  );
});
