import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BoardEntry, MyPlace } from '../server/leaderboard';
import { avatarOf, gapToNext, initialsOf, weekEndsIn } from './board';
import { PALETTES } from '../theme/palette';

/**
 * Lider tablosu sunumunun sınavı.
 *
 * Buradaki sayılar öğrenciye doğrudan gösteriliyor: sıra, fark ve kalan
 * süre. Yanlışları bozuk bir ekran değil, yanlış bilgi demek.
 */

function entry(over: Partial<BoardEntry> = {}): BoardEntry {
  return { userId: 'u', name: 'Ad', xp: 0, place: 1, me: false, ...over };
}

function place(over: Partial<MyPlace> = {}): MyPlace {
  return { xp: 0, place: 1, total: 1, ...over };
}

// ------------------------------------------------------------- baş harfler

test('tek kelimelik addan tek harf', () => {
  assert.equal(initialsOf('Ali'), 'A');
});

test('iki kelimelik addan iki harf', () => {
  assert.equal(initialsOf('Ali Taşçı'), 'AT');
});

test('ikiden fazla kelimede ilk ikisi alınır', () => {
  assert.equal(initialsOf('Ayşe Nur Yılmaz'), 'AN');
});

test('Türkçe harfler doğru büyütülür', () => {
  // JavaScript'in varsayılan toUpperCase'i 'i' harfini 'I' yapar; Türkçede
  // 'İ' olmalı. Yanlışı, İrem'i "Irem" diye göstermek.
  assert.equal(initialsOf('irem'), 'İ');
  assert.equal(initialsOf('ışıl'), 'I');
});

test('fazla boşluk baş harfi bozmaz', () => {
  assert.equal(initialsOf('  Ali   Taşçı  '), 'AT');
});

test('boş ad çökertmez', () => {
  assert.equal(initialsOf('   '), '?');
});

test('emoji ile başlayan ad bölünmez', () => {
  // Basit `name[0]` yazılsaydı emojinin yarısı alınır ve bozuk karakter
  // çizilirdi.
  assert.equal(initialsOf('🔥ateş'), '🔥');
});

// ------------------------------------------------------------------ renk

test('aynı ad her zaman aynı rengi alır', () => {
  assert.deepEqual(avatarOf('Elif'), avatarOf('Elif'));
});

test('renk rolleri palette gerçekten var', () => {
  // Avatar rengi artık ham bir altılık değil, bir rol adı: rengi çizim
  // anında tema veriyor. Rol yanlış yazılırsa `t.colors[rol]` `undefined`
  // döner ve React Native sessizce siyaha düşer.
  for (const name of ['Ali', 'Elif', 'Mert', 'Zeynep', 'Can', 'Deniz', 'Burak']) {
    const pair = avatarOf(name);
    assert.equal(pair.length, 2);
    for (const rol of pair) {
      for (const tema of ['dark', 'light'] as const) {
        assert.equal(
          typeof PALETTES[tema][rol],
          'string',
          `${tema} paletinde "${rol}" yok`,
        );
      }
    }
  }
});

// ------------------------------------------------------------------ fark

test('birinciysen üsttekine fark yok', () => {
  assert.equal(
    gapToNext([entry({ place: 1, xp: 500 })], place({ place: 1, xp: 500 })),
    null,
  );
});

test('tabloda değilsen fark yok', () => {
  assert.equal(gapToNext([entry()], null), null);
});

test('bir üstteki kişiye fark hesaplanır', () => {
  const entries = [
    entry({ userId: 'a', place: 1, xp: 900 }),
    entry({ userId: 'b', place: 2, xp: 700 }),
    entry({ userId: 'c', place: 3, xp: 400, me: true }),
  ];
  assert.equal(gapToNext(entries, place({ place: 3, xp: 400 })), 300);
});

test('üstteki listede yoksa fark uydurulmaz', () => {
  // İlk 50'nin dışındaysan üstteki kişi elinde olmayabilir. Sıfır yazmak
  // "başa baştasın" demek olurdu.
  assert.equal(gapToNext([], place({ place: 80, xp: 100 })), null);
});

test('eşitlikte fark sıfır, null değil', () => {
  const entries = [
    entry({ userId: 'a', place: 1, xp: 500 }),
    entry({ userId: 'b', place: 2, xp: 500 }),
  ];
  assert.equal(gapToNext(entries, place({ place: 2, xp: 500 })), 0);
});

// -------------------------------------------------------------- hafta sonu

test('pazartesi sabahı haftanın tamamı kalır', () => {
  // Pazartesi 00:00'da sıfırlandı; sonraki sıfırlama yedi gün sonra.
  const monday = new Date(2026, 4, 11, 0, 0);
  assert.deepEqual(weekEndsIn(monday), { days: 7, hours: 0 });
});

test('pazar akşamı bir günden az kalır', () => {
  const sunday = new Date(2026, 4, 17, 21, 0);
  const left = weekEndsIn(sunday);
  assert.equal(left.days, 0);
  assert.equal(left.hours, 3);
});

test('hafta ortasında kalan gün doğru', () => {
  // Cuma 20:30 → pazartesi 00:00'a 2 gün 3,5 saat.
  const friday = new Date(2026, 4, 15, 20, 30);
  assert.deepEqual(weekEndsIn(friday), { days: 2, hours: 3 });
});

test('kalan süre hiçbir zaman eksi olmaz', () => {
  for (let day = 11; day <= 17; day += 1) {
    for (const hour of [0, 6, 12, 23]) {
      const left = weekEndsIn(new Date(2026, 4, day, hour, 0));
      assert.ok(left.days >= 0 && left.hours >= 0, `${day}.gün ${hour}:00`);
      assert.ok(left.days <= 7);
    }
  }
});
