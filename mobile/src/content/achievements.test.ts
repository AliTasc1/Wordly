import { test } from 'node:test';
import assert from 'node:assert/strict';
import { achievementsOf, summarize, type Facts } from './achievements';

/**
 * Rozetlerin sınavı.
 *
 * Bir rozetin tek anlamı kazanılmış olmasıdır. Hak edilmeden açılan rozet,
 * hak edilenleri de değersizleştirir — bu yüzden buradaki sınırlar tam
 * olarak sınanıyor.
 */

function facts(over: Partial<Facts> = {}): Facts {
  return { streak: 0, xp: 0, words: 0, lessons: 0, texts: 0, levelsDone: [], ...over };
}

function find(f: Facts, name: string) {
  const badge = achievementsOf(f).find((a) => a.name === name);
  assert.ok(badge, `rozet bulunamadı: ${name}`);
  return badge;
}

test('yeni öğrencide hiçbir rozet açık değil', () => {
  // Uygulamayı ilk açan kişiye "1.000 Kelime · AÇILDI" göstermek, rozeti
  // hiç vermemekten kötüdür.
  const summary = summarize(achievementsOf(facts()));
  assert.equal(summary.unlocked, 0);
  assert.equal(summary.pct, 0);
  assert.ok(summary.total > 0);
});

test('eşiğe varmadan rozet açılmaz', () => {
  assert.equal(find(facts({ xp: 999 }), '1.000 XP').done, false);
});

test('eşiğe tam varınca açılır', () => {
  assert.equal(find(facts({ xp: 1000 }), '1.000 XP').done, true);
});

test('eşiği aşınca açık kalır', () => {
  assert.equal(find(facts({ xp: 1500 }), '1.000 XP').done, true);
});

test('eşiğe çok yaklaşmak rozeti açmaz ve çubuğu doldurmaz', () => {
  // 999/1000 yuvarlanınca %100 ediyordu: çubuk doluyor, ekran rozeti açık
  // gösteriyor, altında "999/1.000" yazıyordu.
  const badge = find(facts({ xp: 999 }), '1.000 XP');
  assert.equal(badge.done, false);
  assert.ok(badge.pct < 100, `yüzde 100'e ulaşmamalı, ${badge.pct} geldi`);
  assert.equal(badge.progress, '999/1.000');
});

test('yüzde 100 ile açık olmak aynı şey', () => {
  // Ekran kilidi `done` ile çiziyor, çubuğu `pct` ile. İkisi ayrışırsa
  // dolu çubuklu kilitli rozet ya da tersi çıkar.
  for (const xp of [0, 1, 499, 999, 1000, 9999, 10000, 60000]) {
    for (const badge of achievementsOf(facts({ xp }))) {
      assert.equal(badge.done, badge.pct === 100, `${badge.name} · xp ${xp}`);
    }
  }
});

test('eşiği aşan değer çubuğu taşırmaz', () => {
  assert.equal(find(facts({ xp: 999999 }), '1.000 XP').pct, 100);
});

test('seri rozetleri kademeli açılır', () => {
  const f = facts({ streak: 7 });
  assert.equal(find(f, '3 Günlük Seri').done, true);
  assert.equal(find(f, '7 Günlük Seri').done, true);
  assert.equal(find(f, '30 Günlük Seri').done, false);
});

test('seviye rozeti yalnızca bitirilmiş seviyede açılır', () => {
  const f = facts({ levelsDone: ['A1', 'A2'] });
  assert.equal(find(f, 'A1 Tamamlandı').done, true);
  assert.equal(find(f, 'A2 Tamamlandı').done, true);
  assert.equal(find(f, 'B1 Tamamlandı').done, false);
  assert.equal(find(f, 'B1 Tamamlandı').progress, 'KİLİTLİ');
});

test('özet açılan rozetleri sayar', () => {
  const list = achievementsOf(facts({ streak: 3, xp: 1000, words: 100 }));
  const summary = summarize(list);
  assert.equal(summary.unlocked, 3);
  assert.equal(summary.total, list.length);
  assert.equal(summary.pct, Math.round((3 / list.length) * 100));
});

test('ölçülmeyen beceriler için rozet yok', () => {
  // Düello ve telaffuz puanı henüz ölçülmüyor. Ölçmediği bir şey için rozet
  // vaat eden uygulama, o rozeti de değersizleştirir.
  const names = achievementsOf(facts()).map((a) => a.name.toLowerCase());
  assert.ok(!names.some((n) => n.includes('düello')));
  assert.ok(!names.some((n) => n.includes('telaffuz')));
});
