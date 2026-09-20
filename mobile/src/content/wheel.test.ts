import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { KEY_GAP, orbitFor, seats, wheelSize } from './wheel';

const KEY = 50;
const TERCİH = 112;

/** İki nokta arası mesafe. */
function uzaklık(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Bir turda çarka düşebilecek harf sayıları: 5–7 harfli kelime + 4 tuzak. */
const OLASI = [9, 10, 11];

test('harfler çemberi tam dolduruyor', () => {
  for (const n of OLASI) {
    const orbit = orbitFor(n, KEY, TERCİH);
    const k = seats(n, orbit + KEY / 2, orbit);
    // Her komşu çift arasındaki açı eşit olmalı: biri ötekinden genişse
    // çemberde göze çarpan bir boşluk var demektir.
    const açılar = k.map((s) => Math.atan2(s.y - (orbit + KEY / 2), s.x - (orbit + KEY / 2)));
    const farklar = açılar.map((a, i) => {
      const d = açılar[(i + 1) % n] - a;
      return ((d % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    });
    const beklenen = (2 * Math.PI) / n;
    for (const f of farklar) {
      assert.ok(
        Math.abs(f - beklenen) < 1e-9,
        `${n} harfte aralık eşit değil: ${f} ≠ ${beklenen}`,
      );
    }
  }
});

test('komşu harfler birbirine binmiyor', () => {
  // Asıl kusur buydu: on bir harf sabit 36 dereceye sığdırılınca son harf
  // ilkinin üstüne biniyordu.
  for (const n of OLASI) {
    const orbit = orbitFor(n, KEY, TERCİH);
    const merkez = orbit + KEY / 2;
    const k = seats(n, merkez, orbit);
    for (let i = 0; i < n; i++) {
      const d = uzaklık(k[i], k[(i + 1) % n]);
      assert.ok(
        d >= KEY + KEY_GAP - 1e-9,
        `${n} harfte komşular ${d.toFixed(1)} piksel — en az ${KEY + KEY_GAP} olmalı`,
      );
    }
  }
});

test('ilk harf tepede', () => {
  for (const n of OLASI) {
    const k = seats(n, 100, 50);
    assert.ok(Math.abs(k[0].x - 100) < 1e-9, 'ilk harf yatayda ortada değil');
    assert.ok(k[0].y < 100, 'ilk harf tepede değil');
  }
});

test('harf azaldıkça çark gereksiz büyümüyor', () => {
  // Az harfte yarıçapı büyütmenin anlamı yok: çark ortadaki ipucundan
  // kopar ve ekranda yer kaplar.
  assert.equal(orbitFor(6, KEY, TERCİH), TERCİH);
  assert.equal(orbitFor(9, KEY, TERCİH), TERCİH);
});

test('çok harfte yarıçap açılıyor', () => {
  // On altı harf sabit yarıçapa sığmaz; formül onu açmak zorunda.
  assert.ok(orbitFor(16, KEY, TERCİH) > TERCİH);
});

test('kutu, açılan yarıçapı taşıyor', () => {
  for (const n of [...OLASI, 16]) {
    const orbit = orbitFor(n, KEY, TERCİH);
    const kutu = wheelSize(orbit, KEY);
    const k = seats(n, kutu / 2, orbit);
    for (const s of k) {
      assert.ok(s.x - KEY / 2 >= -1e-9, 'harf soldan taşıyor');
      assert.ok(s.y - KEY / 2 >= -1e-9, 'harf üstten taşıyor');
      assert.ok(s.x + KEY / 2 <= kutu + 1e-9, 'harf sağdan taşıyor');
      assert.ok(s.y + KEY / 2 <= kutu + 1e-9, 'harf alttan taşıyor');
    }
  }
});

test('tek harf çökmüyor', () => {
  // `sin(π/1) = 0` — sıfıra bölme. Sınır kasıtlı olarak ele alınıyor.
  assert.equal(orbitFor(1, KEY, TERCİH), TERCİH);
  assert.equal(orbitFor(0, KEY, TERCİH), TERCİH);
  assert.equal(seats(1, 100, 50).length, 1);
});
