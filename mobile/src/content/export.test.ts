import assert from 'node:assert/strict';
import { test } from 'node:test';
import { exportOf, exportFileName, type ExportInput } from './export';
import { EMPTY, type Saved } from '../state/persist';

const AT = Date.UTC(2026, 8, 19, 12, 0, 0); // 19 Eylül 2026

function input(saved: Partial<Saved> = {}, account: ExportInput['account'] = null) {
  return {
    saved: { ...EMPTY, ...saved } as Saved,
    account,
    appVersion: '2.4.0',
    at: AT,
  };
}

test('hesapsız kullanımda hesap alanı null ve not bunu söylüyor', () => {
  const out = exportOf(input());
  assert.equal(out.hesap, null);
  assert.match(out.hakkinda.not, /Hesabın yok/);
});

test('hesap varken kimlik, e-posta ve üyelik tarihi geçiyor', () => {
  const out = exportOf(
    input({}, { id: 'u-1', email: 'a@b.c', createdAt: '2026-09-01T00:00:00.000Z' }),
  );
  assert.deepEqual(out.hesap, {
    kimlik: 'u-1',
    ePosta: 'a@b.c',
    uyelikTarihi: '2026-09-01T00:00:00.000Z',
  });
});

test('günlük XP iki cihazın katkısını topluyor', () => {
  const out = exportOf(
    input({
      daily: { '2026-09-18': 100, '2026-09-19': 40 },
      remoteDaily: { '2026-09-19': 60, '2026-09-17': 20 },
    }),
  );

  assert.deepEqual(out.ilerleme.gunlukXp, {
    '2026-09-17': 20,
    '2026-09-18': 100,
    '2026-09-19': 100,
  });
});

test('seri diğer cihazların günlerini de sayıyor', () => {
  // 17'si yalnızca uzakta, 18-19'u yerelde. Tek cihaza bakan biri seriyi
  // 2 görürdü; öğrenci üç gün çalıştı.
  const out = exportOf(
    input({
      daily: { '2026-09-18': 10, '2026-09-19': 10 },
      remoteDaily: { '2026-09-17': 10 },
    }),
  );
  assert.equal(out.ilerleme.gunlukSeri, 3);
});

test('hata defteri dizi oluyor ve en yeni başta geliyor', () => {
  const out = exportOf(
    input({
      mistakes: {
        eski: {
          kind: 'vocab',
          level: 'A1',
          id: 'a1-w-003',
          q: 0,
          text: 'eski soru',
          answer: 'x',
          times: 1,
          at: '2026-09-10',
        },
        yeni: {
          kind: 'reading',
          level: 'B1',
          id: 'b1-r-02',
          q: 2,
          text: 'yeni soru',
          answer: 'y',
          times: 3,
          at: '2026-09-18',
        },
      },
    }),
  );

  assert.equal(out.hataDefteri.length, 2);
  assert.equal(out.hataDefteri[0].soru, 'yeni soru');
  assert.equal(out.hataDefteri[0].kacKezYanlis, 3);
  assert.equal(out.hataDefteri[1].soru, 'eski soru');
});

test('iç anahtarlar dışarı sızmıyor', () => {
  // `vocab:a1-w-003:0` iç kullanım için üretilmiş bir dizge; dosyayı açan
  // kullanıcı için anlamı yok.
  const out = exportOf(
    input({
      mistakes: {
        'vocab:a1-w-003:0': {
          kind: 'vocab',
          level: 'A1',
          id: 'a1-w-003',
          q: 0,
          text: 'soru',
          answer: 'x',
          times: 1,
          at: '2026-09-10',
        },
      },
    }),
  );
  assert.ok(!JSON.stringify(out).includes('vocab:a1-w-003:0'));
});

/*
  Bu testin tamamı tek bir hatayı yakalamak için: dışa aktarmanın
  `Saved` içindeki bir alanı sessizce atlaması. Böyle bir eksik çökme
  üretmez, dosya yine açılır ve kullanıcı elinde her şeyin kopyası
  olduğunu sanır. Yeni bir alan eklendiğinde bu test düşecek ve onu
  dışa aktarmaya eklemeyi ya da bilerek dışarıda bırakmayı zorlayacak.
*/
/**
 * `Saved` içindeki her alanın dosyada nereye düştüğü.
 *
 * Tablo elle yazılıyor ve asıl işi bu: `Saved`'e yeni bir alan eklendiğinde
 * ilk test düşüyor, yazan kişi alanı ya buraya ya `'disarida'` listesine
 * koymak zorunda kalıyor. Otomatik bir eşleme (alan adlarını karşılaştırmak
 * gibi) bu işi göremezdi, çünkü anahtarlar bilerek Türkçeleştirildi.
 */
const NEREYE: Record<keyof Saved, ((out: ReturnType<typeof exportOf>) => unknown) | 'disarida'> =
  {
    goals: (o) => o.tercihler.hedefler,
    dailyTime: (o) => o.tercihler.gunlukSure,
    skills: (o) => o.tercihler.odakBeceriler,
    cefr: (o) => o.tercihler.seviye,
    haptics: (o) => o.tercihler.titresim,
    testResult: (o) => o.seviyeTesti,
    positions: (o) => o.ilerleme.kaldiginYerler,
    savedWords: (o) => o.ilerleme.kaydettiginKelimeler,
    xp: (o) => o.ilerleme.toplamXp,
    arena: (o) => ({
      xp: o.harfArenasi.enIyiXp,
      found: o.harfArenasi.bulunanKelime,
      streak: o.harfArenasi.enUzunSeri,
    }),
    mistakes: (o) => o.hataDefteri,

    // Bu cihazın payı ile diğerlerininki `gunlukXp` altında toplanmış hâlde
    // veriliyor; ikisini ayrı vermek, iç eşitleme muhasebesini kullanıcının
    // önüne koymak olurdu.
    daily: 'disarida',
    remoteDaily: 'disarida',
    // Çakışma çözümünün çalışma notu. Kullanıcının verisi değil.
    profileAt: 'disarida',
  };

test('Saved içindeki her alan tabloda yerini buluyor', () => {
  assert.deepEqual(Object.keys(NEREYE).sort(), Object.keys(EMPTY).sort());
});

test('tabloda yeri olan her alan dosyaya gerçekten taşınıyor', () => {
  // Hepsi EMPTY'den farklı: alan hiç yazılmasa bile testin geçmemesi için.
  const dolu: Saved = {
    ...EMPTY,
    goals: ['Seyahat', 'Sınav'],
    dailyTime: '30 dk',
    skills: ['Yazma'],
    cefr: 'C1',
    haptics: false,
    testResult: {
      level: 'C1',
      byLevel: {},
      right: 7,
      asked: 10,
    } as Saved['testResult'],
    positions: { 'vocab:C1': 9, 'reading:C1': 2 },
    savedWords: ['c1-w-004', 'c1-w-011'],
    xp: 3450,
    arena: { xp: 88, found: 31, streak: 6 },
    mistakes: {
      'grammar:c1-g-02:1': {
        kind: 'grammar',
        level: 'C1',
        id: 'c1-g-02',
        q: 1,
        text: 'soru',
        answer: 'cevap',
        times: 2,
        at: '2026-09-15',
      },
    },
  };

  const out = exportOf(input(dolu));

  for (const [alan, nereye] of Object.entries(NEREYE) as [
    keyof Saved,
    (typeof NEREYE)[keyof Saved],
  ][]) {
    if (nereye === 'disarida') continue;

    const cikan = nereye(out);
    assert.notDeepEqual(
      cikan,
      (EMPTY as Record<string, unknown>)[alan],
      `${alan} dosyada varsayılan değeriyle duruyor — taşınmamış olabilir`,
    );
    assert.ok(cikan != null, `${alan} dosyada yok`);
  }

  // Tabloya güvenmeyen birkaç doğrudan kontrol.
  assert.equal(out.ilerleme.toplamXp, 3450);
  assert.equal(out.tercihler.seviye, 'C1');
  assert.equal(out.hataDefteri[0].dogruCevap, 'cevap');
});

test('dosya adı güne göre', () => {
  assert.equal(exportFileName(AT), 'wordly-verilerim-2026-09-19.json');
});
