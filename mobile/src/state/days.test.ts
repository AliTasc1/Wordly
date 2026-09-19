import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iso, streakOf, today } from './days';

/**
 * Serinin sınavı.
 *
 * Seri, ana ekranda gösterilen tek sayı ve öğrencinin uygulamaya dönme
 * sebebi. Yanlış hesaplanması, hak edilmiş bir seriyi silmek ya da hiç
 * çalışılmamış günü saymak demek — ikisi de öğrenciye yalan söylemektir.
 *
 * Bütün durumlar sabit bir "şimdi" ile kuruluyor: gerçek saate bakan bir
 * test, gece yarısı çalıştığında başka sonuç verir ve kimse sebebini
 * anlamaz.
 */

/** Sabit bir referans günü: 15 Mayıs 2026, Cuma. */
const NOW = new Date(2026, 4, 15, 20, 30);

/** NOW'dan n gün önce. */
function daysAgo(n: number): string {
  return iso(new Date(2026, 4, 15 - n));
}

test('kayıt yoksa seri sıfır', () => {
  assert.equal(streakOf([], NOW), 0);
});

test('yalnızca bugün çalışıldıysa seri bir', () => {
  assert.equal(streakOf([daysAgo(0)], NOW), 1);
});

test('kesintisiz günler sayılır', () => {
  assert.equal(streakOf([daysAgo(0), daysAgo(1), daysAgo(2)], NOW), 3);
});

test('bugün çalışılmadıysa seri dünden geriye sayılır', () => {
  // Akşam sekizde uygulamayı açan birine "serin bitti" demek, gün daha
  // bitmeden yanlış olur.
  assert.equal(streakOf([daysAgo(1), daysAgo(2), daysAgo(3)], NOW), 3);
});

test('iki gün üst üste boşluk seriyi keser', () => {
  assert.equal(streakOf([daysAgo(2), daysAgo(3)], NOW), 0);
});

test('seri yalnızca kesintisiz kısmı sayar, toplam günü değil', () => {
  // Beş gün kayıt var ama arada boşluk: seri iki.
  assert.equal(
    streakOf([daysAgo(0), daysAgo(1), daysAgo(4), daysAgo(5), daysAgo(6)], NOW),
    2,
  );
});

test('sıralama bozuk gelse de sonuç değişmez', () => {
  assert.equal(streakOf([daysAgo(2), daysAgo(0), daysAgo(1)], NOW), 3);
});

test('aynı gün iki kez geçse seriyi şişirmez', () => {
  assert.equal(streakOf([daysAgo(0), daysAgo(0), daysAgo(1)], NOW), 2);
});

test('gelecekteki bir tarih seriyi bozmaz', () => {
  // Cihazın saati ileri alınmış ve geri çevrilmiş olabilir.
  assert.equal(streakOf([iso(new Date(2026, 4, 20)), daysAgo(0), daysAgo(1)], NOW), 2);
});

test('ay sınırını doğru geçer', () => {
  const firstOfMonth = new Date(2026, 5, 1, 10, 0);
  const days = [
    iso(new Date(2026, 5, 1)),
    iso(new Date(2026, 4, 31)),
    iso(new Date(2026, 4, 30)),
  ];
  assert.equal(streakOf(days, firstOfMonth), 3);
});

test('yıl sınırını doğru geçer', () => {
  const newYear = new Date(2027, 0, 1, 10, 0);
  const days = [iso(new Date(2027, 0, 1)), iso(new Date(2026, 11, 31))];
  assert.equal(streakOf(days, newYear), 2);
});

test('gün yerel saate göre yazılıyor', () => {
  // UTC kullanılsaydı akşam çalışan birinin XP'si ertesi güne yazılır ve
  // serisi hiç görmediği bir günde kopardı.
  assert.equal(today(new Date(2026, 4, 15, 23, 59)), '2026-05-15');
  assert.equal(today(new Date(2026, 4, 15, 0, 1)), '2026-05-15');
});

test('tek haneli ay ve gün sıfırla doldurulur', () => {
  // Sıralama ve karşılaştırma metin üzerinden yapılıyor; "2026-5-3" biçimi
  // "2026-05-03"ten önce gelir ve haftalık grafik kayardı.
  assert.equal(iso(new Date(2026, 0, 3)), '2026-01-03');
});
