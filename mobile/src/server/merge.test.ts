import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Mistake } from '../state/persist';
import {
  capMistakes,
  EMPTY_BASE,
  merge,
  MISTAKE_CAP,
  remoteDailyOf,
  type Base,
  type DefaultProfile,
  type LocalState,
  type MistakeRow,
  type ServerState,
} from './merge';

/**
 * Birleştirme kurallarının sınavı.
 *
 * `node --test src/server/merge.test.ts` — Node 22 TypeScript'i doğrudan
 * çalıştırıyor, derleme adımı yok.
 *
 * Buradaki her durum bir veri kaybı senaryosu: silinen kelimenin dirilmesi,
 * ilerlemenin geri sarması, XP'nin kendi kendini katlaması, hesap açan
 * öğrencinin tercihlerinin boş bir satır tarafından ezilmesi.
 */

const DEFAULTS: DefaultProfile = {
  cefr: 'B1',
  goals: ['Kariyer'],
  dailyTime: '10 dk',
  skills: ['Konuşma', 'Kelime'],
};

const DEVICE = 'telefon';

function mistake(over: Partial<Mistake> = {}): Mistake {
  return {
    kind: 'grammar',
    level: 'B1',
    id: 'b1-01',
    q: 3,
    text: 'She ___ to school.',
    answer: 'goes',
    times: 1,
    at: '2026-09-10',
    ...over,
  };
}

function row(key: string, over: Partial<MistakeRow> = {}): MistakeRow {
  return {
    key,
    kind: 'grammar',
    level: 'B1',
    content_id: 'b1-01',
    q: 3,
    text: 'She ___ to school.',
    answer: 'goes',
    times: 1,
    at: '2026-09-10',
    ...over,
  };
}

function localState(over: Partial<LocalState> = {}): LocalState {
  return {
    positions: {},
    savedWords: [],
    mistakes: {},
    daily: {},
    studied: {},
    cefr: DEFAULTS.cefr,
    goals: DEFAULTS.goals,
    dailyTime: DEFAULTS.dailyTime,
    skills: DEFAULTS.skills,
    testResult: null,
    arena: { xp: 0, found: 0, streak: 0 },
    profileAt: 0,
    ...over,
  };
}

function serverState(over: Partial<ServerState> = {}): ServerState {
  return {
    positions: [],
    savedWords: [],
    mistakes: [],
    daily: [],
    profile: null,
    ...over,
  };
}

function run(local: LocalState, server: ServerState, base: Base = EMPTY_BASE) {
  return merge(local, server, base, DEVICE, DEFAULTS);
}

// ----------------------------------------------------------------- konumlar

test('ilerleme geri sarmaz: büyük olan kazanır', () => {
  const result = run(
    localState({ positions: { 'vocab:B1': 40, 'grammar:B1': 5 } }),
    serverState({
      positions: [
        { kind: 'vocab', level: 'B1', position: 12 },
        { kind: 'grammar', level: 'B1', position: 30 },
      ],
    }),
  );

  assert.equal(result.local.positions['vocab:B1'], 40);
  assert.equal(result.local.positions['grammar:B1'], 30);
});

test('sunucuda olmayan konum yerelden alınır, aynı olan gönderilmez', () => {
  const result = run(
    localState({ positions: { 'vocab:B1': 7, 'read:B1': 3 } }),
    serverState({ positions: [{ kind: 'vocab', level: 'B1', position: 7 }] }),
  );

  assert.deepEqual(result.push.positions, [{ kind: 'read', level: 'B1', position: 3 }]);
});

test('yalnızca sunucuda olan konum cihaza iner', () => {
  const result = run(
    localState(),
    serverState({ positions: [{ kind: 'listening', level: 'A2', position: 9 }] }),
  );

  assert.equal(result.local.positions['listening:A2'], 9);
  assert.deepEqual(result.push.positions, []);
});

// ------------------------------------------------------------ kelime defteri

test('burada silinen kelime sunucudan geri dirilmez', () => {
  const base: Base = { ...EMPTY_BASE, savedWords: ['apple', 'bridge'] };
  const result = run(
    localState({ savedWords: ['apple'] }),
    serverState({ savedWords: ['apple', 'bridge'] }),
    base,
  );

  assert.deepEqual(result.local.savedWords, ['apple']);
  assert.deepEqual(result.push.savedWordsRemove, ['bridge']);
});

test('başka cihazda eklenen kelime buraya iner', () => {
  const base: Base = { ...EMPTY_BASE, savedWords: ['apple'] };
  const result = run(
    localState({ savedWords: ['apple'] }),
    serverState({ savedWords: ['apple', 'candle'] }),
    base,
  );

  assert.deepEqual(result.local.savedWords, ['apple', 'candle']);
  assert.deepEqual(result.push.savedWordsAdd, []);
});

test('burada eklenen kelime sunucuya gönderilir', () => {
  const result = run(localState({ savedWords: ['dawn'] }), serverState());

  assert.deepEqual(result.push.savedWordsAdd, ['dawn']);
  assert.deepEqual(result.local.savedWords, ['dawn']);
});

test('ilk eşitlemede iki taraf birleşir (taban boş)', () => {
  const result = run(
    localState({ savedWords: ['apple'] }),
    serverState({ savedWords: ['bridge'] }),
  );

  assert.deepEqual(result.local.savedWords, ['apple', 'bridge']);
  assert.deepEqual(result.push.savedWordsAdd, ['apple']);
  assert.deepEqual(result.push.savedWordsRemove, []);
});

// -------------------------------------------------------------- hata defteri

test('aynı hatanın sayacı toplanmaz, büyüğü alınır', () => {
  const result = run(
    localState({ mistakes: { 'grammar:b1-01:3': mistake({ times: 2 }) } }),
    serverState({ mistakes: [row('grammar:b1-01:3', { times: 5 })] }),
  );

  assert.equal(result.local.mistakes['grammar:b1-01:3'].times, 5);
});

test('"öğrendim" denen hata sunucudan geri gelmez', () => {
  const base: Base = { ...EMPTY_BASE, mistakeKeys: ['grammar:b1-01:3'] };
  const result = run(
    localState({ mistakes: {} }),
    serverState({ mistakes: [row('grammar:b1-01:3')] }),
    base,
  );

  assert.deepEqual(result.local.mistakes, {});
  assert.deepEqual(result.push.mistakesRemove, ['grammar:b1-01:3']);
});

test('başka cihazda silinen hata buradan da düşer', () => {
  const base: Base = { ...EMPTY_BASE, mistakeKeys: ['grammar:b1-01:3'] };
  const result = run(
    localState({ mistakes: { 'grammar:b1-01:3': mistake() } }),
    serverState({ mistakes: [] }),
    base,
  );

  assert.deepEqual(result.local.mistakes, {});
  assert.deepEqual(result.push.mistakesUpsert, []);
});

test('son yanılma tarihinde geç olan kazanır', () => {
  const result = run(
    localState({ mistakes: { k: mistake({ at: '2026-09-01' }) } }),
    serverState({ mistakes: [row('k', { at: '2026-09-15' })] }),
  );

  assert.equal(result.local.mistakes.k.at, '2026-09-15');
});

test('sınır aşılınca en eski hatalar düşer ve sunucudan da silinir', () => {
  const mistakes: Record<string, Mistake> = {};
  for (let i = 0; i < MISTAKE_CAP + 3; i += 1) {
    const day = String(i).padStart(3, '0');
    mistakes[`grammar:b1:${i}`] = mistake({ q: i, at: `2026-01-${day}` });
  }

  const result = run(
    localState({ mistakes }),
    serverState({ mistakes: [row('grammar:b1:0', { at: '2026-01-000' })] }),
  );

  assert.equal(Object.keys(result.local.mistakes).length, MISTAKE_CAP);
  assert.ok(!('grammar:b1:0' in result.local.mistakes));
  assert.deepEqual(result.push.mistakesRemove, ['grammar:b1:0']);
});

test('sınırlama iki cihazda aynı sonucu verir', () => {
  const book: Record<string, Mistake> = {};
  // Hepsi aynı gün: sıralama yalnızca tarihe bakarsa belirsiz kalır.
  for (let i = 0; i < MISTAKE_CAP + 5; i += 1) {
    book[`k${String(i).padStart(3, '0')}`] = mistake({ at: '2026-05-05' });
  }

  const forward = capMistakes(book);
  const shuffled: Record<string, Mistake> = {};
  for (const key of Object.keys(book).reverse()) shuffled[key] = book[key];

  assert.deepEqual(
    Object.keys(capMistakes(shuffled)).sort(),
    Object.keys(forward).sort(),
  );
});

// ----------------------------------------------------------------- günlük XP

test('kendi XP satırlarımız uzaktan gelen toplama karışmaz', () => {
  const remote = remoteDailyOf(
    [
      { day: '2026-09-18', device_id: DEVICE, xp: 100, seconds: 0 },
      { day: '2026-09-18', device_id: 'tablet', xp: 50, seconds: 0 },
    ],
    DEVICE,
  );

  assert.deepEqual(remote, { '2026-09-18': 50 });
});

test('aynı gün iki başka cihazdan gelen XP toplanır', () => {
  const remote = remoteDailyOf(
    [
      { day: '2026-09-18', device_id: 'tablet', xp: 50, seconds: 0 },
      { day: '2026-09-18', device_id: 'eski-telefon', xp: 20, seconds: 0 },
    ],
    DEVICE,
  );

  assert.deepEqual(remote, { '2026-09-18': 70 });
});

test('eşitleme yerel günlük XP tablosuna dokunmaz', () => {
  const local = localState({ daily: { '2026-09-18': 100 } });
  const result = run(
    local,
    serverState({ daily: [{ day: '2026-09-18', device_id: 'tablet', xp: 50, seconds: 0 }] }),
  );

  // Uzaktan gelen ayrı duruyor; yerel toplamın üstüne yazılsaydı bir sonraki
  // gönderimde 150 bizim payımız sayılır ve her eşitlemede büyürdü.
  assert.deepEqual(result.local.remoteDaily, { '2026-09-18': 50 });
  assert.deepEqual(local.daily, { '2026-09-18': 100 });
});

test('değişmeyen gün tekrar gönderilmez', () => {
  const base: Base = { ...EMPTY_BASE, daily: { '2026-09-17': 80, '2026-09-18': 30 } };
  const result = run(
    localState({ daily: { '2026-09-17': 80, '2026-09-18': 45 } }),
    serverState(),
    base,
  );

  assert.deepEqual(result.push.daily, [{ day: '2026-09-18', xp: 45, seconds: 0 }]);
});

test('çalışma süresi de yerel tabloya karışmadan ayrı duruyor', () => {
  // XP'deki tuzağın aynısı: uzaktan gelen süre yerelin üstüne yazılsaydı,
  // bir sonraki gönderimde toplam bizim payımız sayılır ve her eşitlemede
  // büyürdü. Öğrenci hiç çalışmadan günlük hedefini doldurmuş görünürdü.
  const local = localState({ studied: { '2026-09-19': 600 } });
  const result = run(
    local,
    serverState({
      daily: [{ day: '2026-09-19', device_id: 'tablet', xp: 0, seconds: 300 }],
    }),
  );

  assert.deepEqual(result.local.remoteStudied, { '2026-09-19': 300 });
  assert.deepEqual(local.studied, { '2026-09-19': 600 });
});

test('kendi cihazımızın süresi uzaktan gelen sayılmıyor', () => {
  const result = run(
    localState({ studied: { '2026-09-19': 600 } }),
    serverState({
      daily: [
        { day: '2026-09-19', device_id: 'telefon', xp: 20, seconds: 600 },
        { day: '2026-09-19', device_id: 'tablet', xp: 10, seconds: 180 },
      ],
    }),
  );

  // 'telefon' bu cihaz; kendi satırımızı uzaktan gelenlere katmak, süreyi
  // iki katına çıkarırdı.
  assert.deepEqual(result.local.remoteStudied, { '2026-09-19': 180 });
});

test('yalnızca süresi değişen gün gönderiliyor, XP yeniden yazılmıyor', () => {
  const base: Base = {
    ...EMPTY_BASE,
    daily: { '2026-09-18': 80, '2026-09-19': 40 },
    studied: { '2026-09-18': 300, '2026-09-19': 120 },
  };
  const result = run(
    localState({
      daily: { '2026-09-18': 80, '2026-09-19': 40 },
      studied: { '2026-09-18': 300, '2026-09-19': 900 },
    }),
    serverState(),
    base,
  );

  // 18'i hiç değişmedi. 19'u yalnızca süre yönünden değişti ama satır
  // bütün hâlde gidiyor — XP ve süre aynı satırda duruyor, ayrı
  // gönderilseydi biri diğerini eskitirdi.
  assert.deepEqual(result.push.daily, [{ day: '2026-09-19', xp: 40, seconds: 900 }]);
});

test('XP kazanılmadan çalışılan gün de gönderiliyor', () => {
  // Parçayı okuyup soru cevaplamadan çıkan öğrenci XP almıyor ama çalıştı.
  const result = run(localState({ studied: { '2026-09-19': 420 } }), serverState());
  assert.deepEqual(result.push.daily, [{ day: '2026-09-19', xp: 0, seconds: 420 }]);
});

test('süre alanından önce kaydedilmiş taban her günü yeniden göndertmiyor', () => {
  // Eski sürümden kalan taban: daily dolu, studied hiç yok.
  const base: Base = { ...EMPTY_BASE, daily: { '2026-09-18': 80 } };
  const result = run(localState({ daily: { '2026-09-18': 80 } }), serverState(), base);
  assert.deepEqual(result.push.daily, []);
});

// -------------------------------------------------------------------- profil

test('hesap açan öğrencinin tercihlerini boş sunucu satırı ezmez', () => {
  // Kayıt tetikleyicisi az önce boş bir profil açtı: tarihi "şimdi", yani
  // aylardır çevrimdışı biriken yerel tercihlerden daha yeni görünüyor.
  const result = run(
    localState({
      cefr: 'A2',
      goals: ['Seyahat'],
      skills: ['Yazma'],
      testResult: { level: 'A2' },
      profileAt: Date.parse('2026-01-01T00:00:00Z'),
    }),
    serverState({
      profile: {
        cefr: 'B1',
        goals: [],
        daily_time: null,
        skills: [],
        test_result: null,
        arena: null,
        updated_at: new Date().toISOString(),
      },
    }),
  );

  assert.equal(result.local.profile, null);
  assert.equal(result.push.profile?.cefr, 'A2');
  assert.deepEqual(result.push.profile?.goals, ['Seyahat']);
});

test('ikinci cihazda varsayılanlar sunucudaki gerçek cevapları ezmez', () => {
  const result = run(
    localState({ profileAt: Date.now() }),
    serverState({
      profile: {
        cefr: 'C1',
        goals: ['Sınav'],
        daily_time: '30 dk',
        skills: ['Dinleme'],
        test_result: { level: 'C1' },
        arena: { xp: 10, found: 2, streak: 1 },
        updated_at: '2026-02-02T00:00:00Z',
      },
    }),
  );

  assert.equal(result.local.profile?.cefr, 'C1');
  assert.deepEqual(result.local.profile?.goals, ['Sınav']);
  assert.equal(result.push.profile, null);
});

test('iki taraf da doluysa son değiştiren kazanır', () => {
  const server = serverState({
    profile: {
      cefr: 'C1',
      goals: ['Sınav'],
      daily_time: '30 dk',
      skills: ['Dinleme'],
      test_result: { level: 'C1' },
      arena: null,
      updated_at: '2026-02-02T00:00:00Z',
    },
  });

  const older = run(
    localState({
      cefr: 'A2',
      testResult: { level: 'A2' },
      profileAt: Date.parse('2026-01-01T00:00:00Z'),
    }),
    server,
  );
  assert.equal(older.local.profile?.cefr, 'C1');

  const newer = run(
    localState({
      cefr: 'A2',
      testResult: { level: 'A2' },
      profileAt: Date.parse('2026-03-03T00:00:00Z'),
    }),
    server,
  );
  assert.equal(newer.local.profile, null);
  assert.equal(newer.push.profile?.cefr, 'A2');
});

test('arena sayaçları profil sunucudan gelse bile geri sarmaz', () => {
  const result = run(
    localState({
      arena: { xp: 500, found: 40, streak: 3 },
      profileAt: Date.now(),
    }),
    serverState({
      profile: {
        cefr: 'C1',
        goals: ['Sınav'],
        daily_time: '30 dk',
        skills: ['Dinleme'],
        test_result: { level: 'C1' },
        arena: { xp: 100, found: 60, streak: 1 },
        updated_at: '2026-02-02T00:00:00Z',
      },
    }),
  );

  assert.deepEqual(result.local.profile?.arena, { xp: 500, found: 60, streak: 3 });
});

// ------------------------------------------------------------------- taban

test('taban bir sonraki eşitlemede silmeyi doğru okur', () => {
  // Birinci tur: kelime ekleniyor.
  const first = run(localState({ savedWords: ['apple'] }), serverState());
  assert.deepEqual(first.base.savedWords, ['apple']);

  // İkinci tur: kullanıcı sildi, sunucuda hâlâ duruyor.
  const second = run(
    localState({ savedWords: [] }),
    serverState({ savedWords: ['apple'] }),
    first.base,
  );

  assert.deepEqual(second.local.savedWords, []);
  assert.deepEqual(second.push.savedWordsRemove, ['apple']);
});
