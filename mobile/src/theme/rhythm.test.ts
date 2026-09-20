import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
  Boşluk ritmi.

  Kaynakta on altı ayrı `gap` ve yirmi ayrı `padding` değeri vardı: 9, 10,
  11, 12, 13, 14, 15, 16 — art arda. Aradaki tek puntoluk farklar gözle
  seçilmiyor ama üç kartı alt alta koyunca hizasızlık hissediliyordu ve
  yeni bir satır yazarken "burada 13 mü 14 mü?" sorusunun cevabı yoktu.

  Ritim iki punto. Tek sayı yok; dolayısıyla soru da yok. Dört puntoluk bir
  ızgara daha temiz olurdu ama 10 ve 14 tam ortada kalıyor ve ±2 piksellik
  kaydırmayı ekranı göremeden yapmak, düzeltmekten çok bozardı.
*/

const ROOT = new URL('../..', import.meta.url).pathname;

const ÖZELLİK =
  'gap|rowGap|columnGap|padding|paddingTop|paddingBottom|paddingLeft|paddingRight|' +
  'paddingVertical|paddingHorizontal|margin|marginTop|marginBottom|marginLeft|' +
  'marginRight|marginVertical|marginHorizontal';

const STİL = new RegExp(`(${ÖZELLİK}): (\\d+)\\b`, 'g');
const PROP = /(?<![a-zA-Z])gap=\{(\d+)\}/g;

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
    if ((ad.endsWith('.tsx') || ad.endsWith('.ts')) && !ad.includes('.test.')) {
      out.push(göreli);
    }
  }
  return out;
}

test('boşluklar iki puntoluk ritimde', () => {
  const kusurlu: string[] = [];
  for (const yol of ['App.tsx', ...dosyalar(join(ROOT, 'src'), 'src')]) {
    readFileSync(join(ROOT, yol), 'utf8')
      .split('\n')
      .forEach((satır, i) => {
        for (const [desen, biçim] of [
          [STİL, (m: RegExpExecArray) => `${m[1]}: ${m[2]}`],
          [PROP, (m: RegExpExecArray) => `gap={${m[1]}}`],
        ] as const) {
          desen.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = desen.exec(satır))) {
            const değer = Number(m[m.length - 1]);
            if (değer % 2 !== 0) kusurlu.push(`${yol}:${i + 1} → ${biçim(m)}`);
          }
        }
      });
  }
  assert.deepEqual(
    kusurlu,
    [],
    `Tek sayılı boşluk; bir üst çift sayıya al:\n${kusurlu.join('\n')}`,
  );
});
