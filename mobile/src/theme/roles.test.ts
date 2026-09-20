import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { PALETTES, type ColorRole, type ThemeName } from './palette';
import { achievementsOf } from '../content/achievements';
import { alertsOf } from '../content/alerts';
import { ARENA_GLYPH } from '../data/play';
import { ERROR_STATES, INTRO, TOKEN_PILLS } from '../data/onboarding';

/*
  İçerik dosyalarındaki renk rolleri.

  Önce donmuş altılık kodlar taşıyorlardı (`tint: colors.warning`) ve o
  kodlar koyu temanın değerleriydi. Tema açığa geçince yerlerinde kalıyor,
  kimi beyaz zeminde okunmuyordu.

  Artık rol adı taşınıyor. Kazandığı esnekliğin bedeli, yazım hatasının
  artık tip denetiminden kaçabilmesi: `keyof Palette` bir dize alt türü,
  yani elle yazılmış bir dize de geçiyor. `t.colors['warnig']` sessizce
  `undefined` döner ve React Native siyaha düşer. Bu test onu yakalıyor.
*/

const TEMALAR: ThemeName[] = ['dark', 'light'];

function doğrula(nereden: string, roller: ColorRole[]) {
  for (const rol of roller) {
    for (const tema of TEMALAR) {
      assert.equal(
        typeof PALETTES[tema][rol],
        'string',
        `${nereden}: ${tema} paletinde "${rol}" yok`,
      );
    }
  }
}

/** Her rozeti üreten, dolayısıyla her rolü dolaşan bir durum. */
const ROZETLER = achievementsOf({
  streak: 100,
  xp: 50_000,
  words: 500,
  lessons: 50,
  texts: 100,
  levelsDone: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
});

/** Her bildirimi doğuran durum. */
const BİLDİRİMLER = alertsOf({
  streak: 7,
  todayXp: 0,
  mistakes: 5,
  place: 3,
  syncProblem: 'sunucuya ulaşılamadı',
  signedIn: true,
});

test('başarım rozetlerinin rolleri gerçek', () => {
  doğrula('achievementsOf', ROZETLER.map((a) => a.tint));
});

test('bildirim rollerinin karşılığı var', () => {
  doğrula('alertsOf', BİLDİRİMLER.map((a) => a.tint));
});

test('arena modlarının rolleri gerçek', () => {
  doğrula('ARENA_GLYPH', Object.values(ARENA_GLYPH).map((m) => m.tint));
});

test('açılış ve tasarım referansı rolleri gerçek', () => {
  doğrula('INTRO.stats', INTRO.stats.map((s) => s.tint));
  doğrula('TOKEN_PILLS', TOKEN_PILLS.map((p) => p.tint));
  doğrula('ERROR_STATES', ERROR_STATES.map((e) => e.tint));
});

test('listelerin hiçbiri boş değil', () => {
  // Boş bir liste yukarıdaki testleri sessizce geçerdi.
  assert.ok(ROZETLER.length > 0);
  assert.ok(BİLDİRİMLER.length > 0);
  assert.ok(Object.keys(ARENA_GLYPH).length > 0);
  assert.ok(INTRO.stats.length > 0);
  assert.ok(TOKEN_PILLS.length > 0);
  assert.ok(ERROR_STATES.length > 0);
});
