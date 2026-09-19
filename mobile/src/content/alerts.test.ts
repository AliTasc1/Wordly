import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alertsOf, type AlertFacts } from './alerts';

/**
 * Bildirimlerin sınavı.
 *
 * Liste tasarımda altı sabit satırdı ve üçü var olmayan özelliklere aitti
 * ("Gözde seni düelloya çağırdı", "Developers English · haftalık turnuva",
 * "AI Koç yeni plan hazırladı"). Uygulamayı ilk açan kişi iki okunmamış
 * bildirimle karşılaşıyordu.
 */

function facts(over: Partial<AlertFacts> = {}): AlertFacts {
  return {
    streak: 0,
    todayXp: 0,
    mistakes: 0,
    place: null,
    syncProblem: null,
    signedIn: true,
    ...over,
  };
}

const ids = (f: AlertFacts) => alertsOf(f).map((a) => a.id);

test('gösterecek bir şey yoksa liste boş', () => {
  // Boşluk uydurmaktan iyidir.
  assert.deepEqual(alertsOf(facts()), []);
});

test('bugün çalışılmışsa seri hatırlatması çıkmıyor', () => {
  // Seri zaten güvende; hatırlatmanın bir anlamı yok.
  assert.ok(!ids(facts({ streak: 5, todayXp: 60 })).includes('streak'));
});

test('seri riskteyse hatırlatılıyor', () => {
  assert.ok(ids(facts({ streak: 5, todayXp: 0 })).includes('streak'));
});

test('seri yokken seri uyarısı verilmiyor', () => {
  assert.ok(!ids(facts({ streak: 0, todayXp: 0 })).includes('streak'));
});

test('hata defteri boşken tekrar önerilmiyor', () => {
  assert.ok(!ids(facts({ mistakes: 0 })).includes('mistakes'));
});

test('hata varsa sayısıyla birlikte yazılıyor', () => {
  const alert = alertsOf(facts({ mistakes: 7 })).find((a) => a.id === 'mistakes');
  assert.ok(alert);
  assert.ok(alert.title.includes('7'));
});

test('liderlik sırası yalnızca tablodayken gösteriliyor', () => {
  assert.ok(!ids(facts({ place: null })).includes('board'));
  assert.ok(ids(facts({ place: 3 })).includes('board'));
});

test('eşitleme sorunu en üstte', () => {
  // İlerlemenin taşınmadığını bilmek diğer her şeyden önce gelir.
  const list = ids(facts({ syncProblem: 'ağ hatası', streak: 3, mistakes: 5 }));
  assert.equal(list[0], 'sync');
});

test('eşitleme sorunu sunucunun metnini taşıyor', () => {
  const alert = alertsOf(facts({ syncProblem: 'bağlantı koptu' })).find(
    (a) => a.id === 'sync',
  );
  assert.ok(alert?.text.includes('bağlantı koptu'));
});

test('hesapsız kullanıcıya hesap öneriliyor ama en sonda', () => {
  const list = ids(facts({ signedIn: false, mistakes: 2 }));
  assert.equal(list[list.length - 1], 'account');
});

test('hesap varken hesap önerisi çıkmıyor', () => {
  assert.ok(!ids(facts({ signedIn: true })).includes('account'));
});

test('her maddenin gidilecek bir yeri var', () => {
  const all = alertsOf(
    facts({
      streak: 3,
      todayXp: 0,
      mistakes: 4,
      place: 2,
      syncProblem: 'x',
      signedIn: false,
    }),
  );
  assert.equal(all.length, 5);
  for (const alert of all) {
    assert.ok(alert.target.length > 0, alert.id);
    assert.ok(alert.title.length > 0, alert.id);
  }
});

test('kimlikler benzersiz', () => {
  const all = alertsOf(
    facts({
      streak: 3,
      todayXp: 0,
      mistakes: 4,
      place: 2,
      syncProblem: 'x',
      signedIn: false,
    }),
  );
  assert.equal(new Set(all.map((a) => a.id)).size, all.length);
});
