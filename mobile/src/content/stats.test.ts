import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Mistake } from '../state/persist';
import { iso } from '../state/days';
import { mistakesByKind, rankedMistakes, weekBars, weekStats } from './stats';

/**
 * Haftalık istatistiğin sınavı.
 *
 * Bu sayılar öğrenciye "ne kadar ilerledin" diye cevap veriyor. Yanlışları
 * bozuk bir ekran değil, yanlış bilgi demek: olmayan bir artışı kutlamak ya
 * da gerçek emeği görünmez kılmak.
 *
 * Referans gün sabit — gerçek saate bakan bir test, gece yarısı ya da başka
 * bir ayda çalıştığında başka sonuç verir.
 */

/** 15 Mayıs 2026, Cuma akşamı. */
const NOW = new Date(2026, 4, 15, 20, 30);

function daysAgo(n: number): string {
  return iso(new Date(2026, 4, 15 - n));
}

function mistake(over: Partial<Mistake> = {}): Mistake {
  return {
    kind: 'grammar',
    level: 'B1',
    id: 'b1-01',
    q: 1,
    text: 'soru',
    answer: 'cevap',
    times: 1,
    at: '2026-05-10',
    ...over,
  };
}

// ------------------------------------------------------------ haftalık çubuk

test('yedi çubuk döner ve bugün en sağdadır', () => {
  const bars = weekBars({}, 0, NOW);
  assert.equal(bars.length, 7);
  assert.equal(bars[6].date, daysAgo(0));
  assert.equal(bars[0].date, daysAgo(6));
});

test('gün adı doğru: 15 Mayıs 2026 Cuma', () => {
  const bars = weekBars({}, 0, NOW);
  assert.equal(bars[6].name, 'Cuma');
  assert.equal(bars[6].label, 'Cum');
});

test('kaydı olmayan gün sıfır gösterir, boş değil', () => {
  const bars = weekBars({ [daysAgo(0)]: 40 }, 0, NOW);
  assert.equal(bars[6].value, 40);
  assert.equal(bars[5].value, 0);
});

test('önceki hafta yedi gün geriden okunur', () => {
  const bars = weekBars({ [daysAgo(7)]: 99 }, 7, NOW);
  assert.equal(bars[6].date, daysAgo(7));
  assert.equal(bars[6].value, 99);
});

test('ay sınırını geçen hafta doğru kurulur', () => {
  // 2 Haziran: haftanın yarısı mayısta.
  const bars = weekBars({}, 0, new Date(2026, 5, 2, 12, 0));
  assert.equal(bars[6].date, '2026-06-02');
  assert.equal(bars[0].date, '2026-05-27');
});

// ----------------------------------------------------------------- özet

test('toplam, ortalama ve çalışılan gün sayısı', () => {
  const week = weekStats({ [daysAgo(0)]: 100, [daysAgo(2)]: 40 }, NOW);
  assert.equal(week.total, 140);
  assert.equal(week.activeDays, 2);
  assert.equal(week.average, 20); // 140 / 7
});

test('en iyi gün en çok XP kazanılan gündür', () => {
  const week = weekStats({ [daysAgo(0)]: 30, [daysAgo(3)]: 90 }, NOW);
  assert.equal(week.best?.date, daysAgo(3));
  assert.equal(week.best?.value, 90);
});

test('hiç çalışılmamış haftada en iyi gün yok', () => {
  // Sıfır XP'li bir günü "en iyi gün" diye göstermek, olmayan bir başarıyı
  // kutlamak olurdu.
  const week = weekStats({}, NOW);
  assert.equal(week.best, null);
  assert.equal(week.total, 0);
});

test('önceki hafta boşsa değişim yüzdesi yok', () => {
  // "+%100" demek karşılaştırılacak bir şey olduğunu ima eder; yok.
  const week = weekStats({ [daysAgo(0)]: 100 }, NOW);
  assert.equal(week.delta, null);
});

test('önceki hafta doluysa değişim hesaplanır', () => {
  const week = weekStats({ [daysAgo(0)]: 150, [daysAgo(8)]: 100 }, NOW);
  assert.equal(week.delta, 50);
});

test('düşüş eksi değer verir', () => {
  const week = weekStats({ [daysAgo(0)]: 50, [daysAgo(8)]: 100 }, NOW);
  assert.equal(week.delta, -50);
});

test('bu hafta boş ama geçen hafta doluysa değişim -100', () => {
  const week = weekStats({ [daysAgo(8)]: 100 }, NOW);
  assert.equal(week.total, 0);
  assert.equal(week.delta, -100);
});

// ----------------------------------------------------------- hata defteri

test('en çok yanılınan hata önce gelir', () => {
  const ranked = rankedMistakes({
    a: mistake({ times: 2 }),
    b: mistake({ times: 7 }),
    c: mistake({ times: 4 }),
  });
  assert.deepEqual(
    ranked.map((m) => m.key),
    ['b', 'c', 'a'],
  );
});

test('eşit sayıda yanılmada en yeni önce gelir', () => {
  const ranked = rankedMistakes({
    eski: mistake({ times: 3, at: '2026-01-01' }),
    yeni: mistake({ times: 3, at: '2026-05-01' }),
  });
  assert.equal(ranked[0].key, 'yeni');
});

test('bölüm dağılımı yanılma sayısını toplar', () => {
  const byKind = mistakesByKind({
    a: mistake({ kind: 'grammar', times: 3 }),
    b: mistake({ kind: 'vocab', times: 5 }),
    c: mistake({ kind: 'grammar', times: 2 }),
  });

  // Gramer 3 + 2 = 5, kelime 5. Eşitlikte sıra önemli değil ama sayılar
  // doğru olmalı: koç ekranı "neyi çalışmalıyım"ı buradan yanıtlıyor.
  const tally = Object.fromEntries(byKind.map((k) => [k.kind, k.count]));
  assert.deepEqual(tally, { grammar: 5, vocab: 5 });
});

test('boş defterde dağılım boş', () => {
  assert.deepEqual(mistakesByKind({}), []);
});
