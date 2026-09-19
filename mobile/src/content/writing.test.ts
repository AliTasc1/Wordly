import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { accepts, contains, norm } from './writing';

/**
 * Cevap denetiminin iki dildeki uygulamasının aynı kaldığının sınavı.
 *
 * Aynı kural iki yerde yazılı: `content/build-writing.py` içeriği doğrularken,
 * `writing.ts` telefonda çalışırken. Ayrışırlarsa betikte geçen bir cevap
 * telefonda yanlış sayılır — ve bunu kimse fark etmez, çünkü ikisi hiçbir
 * zaman yan yana çalışmıyor. Öğrenci doğru yazdığını sanıp hata alır.
 *
 * Vakalar tek bir yerde, `content/writing-cases.json` içinde tarif ediliyor.
 * Python tarafı `build-writing.py --test` ile aynı dosyaya karşı koşuyor.
 * Kurala dokunan önce oraya vaka ekler; iki taraf da kendiliğinden sınanır.
 */

type Cases = {
  norm: { in: string; out: string; why: string }[];
  accepts: { answers: string[]; typed: string; ok: boolean; why: string }[];
  traps: { has: string; at?: string; typed: string; hit: boolean; why: string }[];
};

const cases = JSON.parse(
  readFileSync(new URL('../../../content/writing-cases.json', import.meta.url), 'utf8'),
) as Cases;

test('ortak vaka dosyası boş değil', () => {
  // Dosya bulunamaz ya da boşalırsa aşağıdaki testler sessizce sıfır vakayla
  // geçerdi: yeşil ama hiçbir şey sınamayan bir takım.
  assert.ok(cases.norm.length > 0);
  assert.ok(cases.accepts.length > 0);
  assert.ok(cases.traps.length > 0);
});

for (const c of cases.norm) {
  test(`norm: ${c.why} — ${JSON.stringify(c.in)}`, () => {
    assert.equal(norm(c.in), c.out);
  });
}

for (const c of cases.accepts) {
  test(`accepts: ${c.why} — ${JSON.stringify(c.typed)}`, () => {
    assert.equal(accepts(c.answers, c.typed), c.ok);
  });
}

for (const c of cases.traps) {
  test(`trap: ${c.why} — ${JSON.stringify(c.typed)}`, () => {
    assert.equal(contains(c.typed, c.has, c.at), c.hit);
  });
}
