import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { font } from './tokens';

/*
  Tipografi ölçeğinin bekçisi.

  Ölçekten önce kaynakta otuz bir ayrı punto vardı. Aralarındaki yarım
  puntoluk farklar gözle seçilemiyor ama düzensizlik hissediliyor: aynı
  görevi gören iki etiket iki farklı boyuttaydı ve hangisinin daha önemli
  olduğu anlaşılmıyordu.

  On iki basamak kaldı. Bu test `s={13}` gibi bir satır eklendiğinde
  söylüyor — doğrusu `s={font.footnote}`.
*/

const ROOT = new URL('../..', import.meta.url).pathname;

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

/** `ls={0.14}` de `s={0.14}` içeriyor; harf başı bakılmalı. */
const PUNTO = /(?<![a-zA-Z])s=\{([^}]*)\}/g;

/**
 * İfadede ölçek dışı bir sayı var mı?
 *
 * İki meşru kalıp sayı içermeden geçiyor: başka bir bileşenden aktarılan
 * punto (`s={titleSize}`) ve bir piksel ölçüsünden türetilen simge boyu
 * (`s={size / 2.4}` — avatarın çapının yarısına yakın bir baş harf). İkincisi
 * metin değil, çizim; ölçeğe bağlamak yanlış olurdu.
 */
function ölçekDışı(ifade: string): boolean {
  if (/\b(size|fontSize)\b/.test(ifade)) return false;
  return /\d/.test(ifade.replace(/font\.\w+/g, ''));
}

test('her punto ölçek basamağından geliyor', () => {
  const kusurlu: string[] = [];
  for (const yol of ['App.tsx', ...dosyalar(join(ROOT, 'src'), 'src')]) {
    const gövde = readFileSync(join(ROOT, yol), 'utf8');
    gövde.split('\n').forEach((satır, i) => {
      PUNTO.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = PUNTO.exec(satır))) {
        if (ölçekDışı(m[1])) kusurlu.push(`${yol}:${i + 1} → s={${m[1]}}`);
      }
    });
  }
  assert.deepEqual(
    kusurlu,
    [],
    `Ölçek dışı punto; en yakın basamağı kullan:\n${kusurlu.join('\n')}`,
  );
});

test('ölçek küçükten büyüğe, tekrarsız', () => {
  const adımlar = Object.values(font);
  assert.deepEqual([...adımlar].sort((a, b) => a - b), adımlar, 'basamaklar sıralı değil');
  assert.equal(new Set(adımlar).size, adımlar.length, 'iki basamak aynı puntoyu veriyor');
});

test('küçük harfli metnin tabanı on iki punto', () => {
  // `label` bunun altında ama o yalnızca büyük harf, harf aralıklı mono
  // etiketler için — küçük harfli bir cümle oraya düşerse okunmaz.
  for (const [ad, punto] of Object.entries(font)) {
    if (ad === 'label') continue;
    assert.ok(punto >= 12, `${ad} (${punto}) okunabilir tabanın altında`);
  }
  assert.ok(font.label >= 10.5, 'mono etiket de bir tabana muhtaç');
});

test('basamaklar arası fark gözle seçilebiliyor', () => {
  // Ölçeğin tek işi bu: iki basamak birbirinden ayırt edilemiyorsa
  // aslında tek basamaktır ve hangisinin kullanılacağı keyfî kalır.
  const adımlar = Object.values(font);
  for (let i = 1; i < adımlar.length; i++) {
    const oran = adımlar[i] / adımlar[i - 1];
    assert.ok(
      oran >= 1.06,
      `${adımlar[i - 1]} → ${adımlar[i]} farkı çok küçük (${oran.toFixed(3)})`,
    );
  }
});
