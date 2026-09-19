import assert from 'node:assert/strict';
import { test } from 'node:test';
import { durationText, goalProgress, goalSeconds, goalText, isKnownGoal } from './goal';
import { TIME_OPTIONS } from '../data/onboarding';

test('kurulumdaki her seçeneğin bir saniye karşılığı var', () => {
  // Seçenek listesi değişirse bu test düşer. Sessizce 10 dakikaya düşmek,
  // "30+ dk" seçen öğrenciye üçte birlik bir hedef vermek olurdu.
  for (const option of TIME_OPTIONS) {
    assert.ok(
      isKnownGoal(option),
      `${option} tanınmıyor ve sessizce varsayılana düşüyor`,
    );
  }
  assert.equal(isKnownGoal('bilinmeyen'), false);
});

test('seçenekler dakikaya doğru çevriliyor', () => {
  assert.equal(goalSeconds('5 dk'), 300);
  assert.equal(goalSeconds('10 dk'), 600);
  assert.equal(goalSeconds('20 dk'), 1200);
  assert.equal(goalSeconds('30+ dk'), 1800);
});

test('bilinmeyen değer hedefi sıfırlamıyor', () => {
  // 0 döndürseydi hedef her gün "zaten tamam" olurdu.
  assert.ok(goalSeconds('') > 0);
  assert.ok(goalSeconds('abc') > 0);
});

test('yüzde hedefe bir saniye kala 100 olmuyor', () => {
  const p = goalProgress(599, '10 dk');
  assert.equal(p.pct, 99);
  assert.equal(p.done, false);
  assert.equal(p.remaining, 1);
});

test('hedef dolunca yüzde 100 ve kalan sıfır', () => {
  const tam = goalProgress(600, '10 dk');
  assert.equal(tam.pct, 100);
  assert.equal(tam.done, true);
  assert.equal(tam.remaining, 0);

  // Aşmak da aynı: kalan eksiye düşmüyor, yüzde 100'ü geçmiyor.
  const asan = goalProgress(5000, '10 dk');
  assert.equal(asan.pct, 100);
  assert.equal(asan.remaining, 0);
});

test('bozuk süre çökme üretmiyor', () => {
  assert.equal(goalProgress(-50, '10 dk').studied, 0);
  assert.equal(goalProgress(-50, '10 dk').pct, 0);
  assert.equal(goalProgress(12.7, '10 dk').studied, 12);
});

test('süre metni birimi duruma göre seçiyor', () => {
  assert.equal(durationText(0), '0 sn');
  assert.equal(durationText(45), '45 sn');
  assert.equal(durationText(60), '1 dk');
  assert.equal(durationText(59 * 60), '59 dk');
  assert.equal(durationText(60 * 60), '1 sa');
  assert.equal(durationText(65 * 60), '1 sa 5 dk');
});

test('hedef dolduğunda metin devam etmeye itmiyor', () => {
  const metin = goalText(goalProgress(600, '10 dk'));
  assert.equal(metin, 'Bugünkü hedefin tamam');
  assert.ok(!/devam|daha|kaldı/i.test(metin));
});

test('hiç çalışılmamışsa hedefin kendisi yazıyor', () => {
  assert.equal(goalText(goalProgress(0, '20 dk')), 'Bugün 20 dk hedefin var');
});

test('başlanmışsa kalan süre yazıyor', () => {
  assert.equal(goalText(goalProgress(300, '20 dk')), 'Hedefe 15 dk kaldı');
});
