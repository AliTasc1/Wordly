import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
  Elle yazılmış renklere karşı bekçi.

  Tema işi bittiğinde kaynakta 321 sabit renk vardı ve hepsi koyu zemine göre
  seçilmişti — açık temada kimi görünmez, kimi okunmaz oluyordu. Hepsi
  tokene taşındı; bu test taşınmış olarak kalmasını sağlıyor.

  Yeni bir `rgba(...)` ya da `#1A2B3C` eklendiğinde test onu adıyla söylüyor.
  Doğru karşılığı `t.colors.*`, `t.alpha.*`, `t.shadows.*`, `t.gradients.*`
  ya da bir palet renginden türetilen `tint(t.colors.X, a)`.
*/

const ROOT = new URL('../..', import.meta.url).pathname;

/**
 * Sabit rengi hak eden yerler.
 *
 * - `src/theme/`: tokenlerin kendisi. Renk bir yerde yazılmak zorunda.
 * - `src/data/onboarding.ts`: tasarım sistemi ekranının gösterdiği ham
 *   basamaklar. Orada sabit olmaları maksadın kendisi — token değil, tokenin
 *   belgesi.
 * - `App.tsx`: en dış kök, sağlayıcının kendisinden önce çiziliyor.
 */
const MUAF = new Set([
  'App.tsx',
  'src/data/onboarding.ts',
]);

function dosyalar(dizin: string, taban = ''): string[] {
  const out: string[] = [];
  for (const ad of readdirSync(dizin)) {
    const tam = join(dizin, ad);
    const göreli = taban ? `${taban}/${ad}` : ad;
    if (statSync(tam).isDirectory()) {
      if (ad === 'node_modules' || ad === 'theme') continue;
      out.push(...dosyalar(tam, göreli));
      continue;
    }
    if (ad.endsWith('.ts') || ad.endsWith('.tsx')) out.push(göreli);
  }
  return out;
}

/**
 * Yorumları çıkarır.
 *
 * Yorumlarda tasarımdan gelen CSS alıntıları var — `border:1px solid
 * rgba(255,255,255,.12)` gibi. Onlar kod değil, kodun nereden geldiğinin
 * kaydı; silinmeleri bilgi kaybı olurdu.
 */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

const RENK = /rgba?\(\s*\d|['"`]#[0-9A-Fa-f]{3,8}['"`]/g;

test('kaynakta elle yazılmış renk kalmadı', () => {
  const kusurlu: string[] = [];
  const hedefler = ['App.tsx', ...dosyalar(join(ROOT, 'src'), 'src')];

  for (const yol of hedefler) {
    if (MUAF.has(yol)) continue;
    if (yol.endsWith('.test.ts') || yol.endsWith('.test.tsx')) continue;
    const gövde = yorumsuz(readFileSync(join(ROOT, yol), 'utf8'));
    for (const satır of gövde.split('\n').entries()) {
      const [i, metin] = satır;
      RENK.lastIndex = 0;
      const eşleşme = metin.match(RENK);
      if (eşleşme) kusurlu.push(`${yol}:${i + 1} → ${eşleşme.join(', ')}`);
    }
  }

  assert.deepEqual(
    kusurlu,
    [],
    `Sabit renk bulundu; tokene taşı (t.colors / t.alpha / t.shadows / tint):\n${kusurlu.join('\n')}`,
  );
});

test('muaf dosyalar gerçekten duruyor', () => {
  // Muafiyet listesi, silinmiş bir dosyayı koruyarak sessizce geniş kalmasın.
  for (const yol of MUAF) statSync(join(ROOT, yol));
});
