import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  displayNameOf,
  greetingFor,
  initialOf,
  memberDays,
  memberText,
  todayLine,
} from './identity';

/**
 * Profil kimliğinin sınavı.
 *
 * Profil başlığı tasarımdan gelen sabitleri gösteriyordu: uygulamayı ilk
 * açan herkes "Ali Yılmaz"dı ve kırk iki gündür üyeydi. Buradaki testler
 * her değerin gerçek bir kaynaktan geldiğini sabitliyor.
 */

const NOW = new Date(2026, 4, 15, 20, 30);

// ------------------------------------------------------------------- ad

test('kullanıcının seçtiği ad her şeyin önünde', () => {
  assert.equal(displayNameOf('Ali T.', 'baska@example.com'), 'Ali T.');
});

test('ad yoksa e-postanın yerel kısmı kullanılır', () => {
  assert.equal(displayNameOf(null, 'alitasci@example.com'), 'alitasci');
});

test('boşluktan ibaret ad yok sayılır', () => {
  assert.equal(displayNameOf('   ', 'ali@example.com'), 'ali');
});

test('hesap yoksa uydurma ad verilmiyor', () => {
  // "Ali Yılmaz" demek, kim olduğunu bilmediğimizi gizlemekti.
  assert.equal(displayNameOf(null, null), 'Öğrenci');
});

test('e-posta bozuksa da çökmüyor', () => {
  assert.equal(displayNameOf(null, '@example.com'), 'Öğrenci');
  assert.equal(displayNameOf(undefined, undefined), 'Öğrenci');
});

// -------------------------------------------------------------- baş harf

test('baş harf Türkçe kuralına göre büyütülür', () => {
  assert.equal(initialOf('irem'), 'İ');
  assert.equal(initialOf('ışıl'), 'I');
});

test('emoji ile başlayan ad bölünmüyor', () => {
  assert.equal(initialOf('🔥ateş'), '🔥');
});

test('boş ad çökertmiyor', () => {
  assert.equal(initialOf('  '), '?');
});

// ---------------------------------------------------------------- üyelik

test('aynı gün açılan hesap sıfır gün', () => {
  assert.equal(memberDays(new Date(2026, 4, 15, 2, 0).toISOString(), NOW), 0);
});

test('gün farkı saatten bağımsız', () => {
  // Dün 23:50'de açılan hesap bugün 00:10'da da "1 gün"dür. Saat farkıyla
  // hesaplansaydı sayı bir ileri bir geri gider ve güven kaybettirirdi.
  const lateYesterday = new Date(2026, 4, 14, 23, 50).toISOString();
  assert.equal(memberDays(lateYesterday, new Date(2026, 4, 15, 0, 10)), 1);
});

test('kırk iki gün doğru sayılıyor', () => {
  assert.equal(memberDays(new Date(2026, 3, 3, 12, 0).toISOString(), NOW), 42);
});

test('ileri tarihli kayıt eksi gün üretmiyor', () => {
  // Cihaz saati geride olabilir.
  assert.equal(memberDays(new Date(2026, 5, 1).toISOString(), NOW), 0);
});

test('bozuk tarih null döner, çökmez', () => {
  assert.equal(memberDays('bu bir tarih değil', NOW), null);
});

// ------------------------------------------------------------------ metin

test('hesapsız kullanıcıya üyelik süresi yazılmıyor', () => {
  assert.equal(memberText(null, NOW), 'Bu cihazda çalışıyor');
});

test('üyelik metni gün sayısına göre değişiyor', () => {
  assert.equal(
    memberText(new Date(2026, 4, 15, 8, 0).toISOString(), NOW),
    'Bugün katıldı',
  );
  assert.equal(
    memberText(new Date(2026, 4, 14, 8, 0).toISOString(), NOW),
    'Dünden beri üye',
  );
  assert.equal(
    memberText(new Date(2026, 3, 3, 8, 0).toISOString(), NOW),
    '42 gündür üye',
  );
});

test('bozuk tarihte sayı uydurulmuyor', () => {
  assert.equal(memberText('bozuk', NOW), 'Hesap bağlı');
});

// ----------------------------------------------------------------- selam

test('selam saate göre değişiyor', () => {
  // Tasarımda "İyi akşamlar" sabitti: sabah altıda açan kişi de iyi
  // akşamlar diliyordu.
  const at = (hour: number) => greetingFor('Ali', new Date(2026, 4, 15, hour, 0));
  assert.equal(at(3), 'İyi geceler, Ali 👋');
  assert.equal(at(9), 'Günaydın, Ali 👋');
  assert.equal(at(15), 'İyi günler, Ali 👋');
  assert.equal(at(21), 'İyi akşamlar, Ali 👋');
});

test('selam sınır saatlerinde doğru', () => {
  const at = (hour: number) => greetingFor('Ali', new Date(2026, 4, 15, hour, 0));
  assert.equal(at(6), 'Günaydın, Ali 👋');
  assert.equal(at(12), 'İyi günler, Ali 👋');
  assert.equal(at(18), 'İyi akşamlar, Ali 👋');
});

// ------------------------------------------------------------ günün satırı

test('bugün kazanılan XP yazılıyor', () => {
  assert.equal(todayLine(120, 4), 'Bugün 120 XP kazandın');
});

test('bugün başlanmadıysa seri hatırlatılıyor', () => {
  assert.equal(todayLine(0, 4), 'Serin 4 günde — bugün henüz başlamadın');
});

test('seri de yoksa sade kalıyor', () => {
  // "Bugün 3 görevin var" diyordu; görev diye bir şey yok ve sayı hiç
  // değişmiyordu.
  assert.equal(todayLine(0, 0), 'Bugün henüz başlamadın');
});
