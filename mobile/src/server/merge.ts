import type { Mistake } from '../state/persist';

/**
 * Çakışma çözümü.
 *
 * Bu dosya ağa da React Native'e da dokunmuyor; girdi veri, çıktı veri. Sebebi
 * sınanabilirlik: aşağıdaki kuralların yanlış olması "bir ekran bozuk görünür"
 * değil, "öğrencinin haftalarca biriktirdiği ilerleme silinir" demek. Bu yüzden
 * kurallar burada, `merge.test.ts` içinde tek tek sınanıyor.
 *
 * Üç yönlü birleştirme yapıyoruz: **yerel**, **sunucu** ve **taban** (son
 * eşitlemede sunucuda ne olduğu). Taban olmadan silme ile "henüz eklenmemiş"
 * ayırt edilemez; o ayrım olmadan silinen her kelime bir sonraki eşitlemede
 * geri dirilir.
 */

/** Hata defterinde tutulacak en fazla kayıt. */
export const MISTAKE_CAP = 200;

export type PositionRow = { kind: string; level: string; position: number };

export type MistakeRow = {
  key: string;
  kind: string;
  level: string;
  content_id: string;
  q: number;
  text: string;
  answer: string;
  times: number;
  at: string;
};

export type DailyRow = {
  day: string;
  device_id: string;
  xp: number;
  /**
   * O gün o cihazda çalışılan saniye.
   *
   * Eski sürümdeki bir cihazın yazdığı satırda bu alan yok; sütunun
   * varsayılanı 0 olduğu için sunucudan 0 dönüyor ve hesap bozulmuyor.
   */
  seconds: number;
};

export type ProfileRow = {
  cefr: string;
  goals: string[];
  daily_time: string | null;
  skills: string[];
  test_result: unknown;
  arena: { xp: number; found: number; streak: number } | null;
  updated_at: string;
};

/** Eşitlemeye giren yerel durum. */
export type LocalState = {
  positions: Record<string, number>;
  savedWords: string[];
  mistakes: Record<string, Mistake>;
  /** **Yalnızca bu cihazın** gün başına kazandığı XP. */
  daily: Record<string, number>;
  /** **Yalnızca bu cihazda** gün başına çalışılan saniye. */
  studied: Record<string, number>;
  cefr: string;
  goals: string[];
  dailyTime: string;
  skills: string[];
  testResult: unknown;
  arena: { xp: number; found: number; streak: number };
  /** Tercihlerin en son ne zaman değiştiği (ms). */
  profileAt: number;
};

/** Son eşitlemede sunucuda ne olduğu. */
export type Base = {
  positions: Record<string, number>;
  savedWords: string[];
  mistakeKeys: string[];
  /** Sunucunun **bu cihaz için** tuttuğu gün başına XP. */
  daily: Record<string, number>;
  /** Sunucunun **bu cihaz için** tuttuğu gün başına saniye. */
  studied: Record<string, number>;
};

export const EMPTY_BASE: Base = {
  positions: {},
  savedWords: [],
  mistakeKeys: [],
  daily: {},
  studied: {},
};

export type ServerState = {
  positions: PositionRow[];
  savedWords: string[];
  mistakes: MistakeRow[];
  daily: DailyRow[];
  profile: ProfileRow | null;
};

export type Push = {
  positions: PositionRow[];
  savedWordsAdd: string[];
  savedWordsRemove: string[];
  mistakesUpsert: MistakeRow[];
  mistakesRemove: string[];
  daily: { day: string; xp: number; seconds: number }[];
  /** Null ise sunucudaki profil daha güncel; yazmıyoruz. */
  profile: Omit<ProfileRow, 'updated_at'> | null;
};

export type MergeResult = {
  /** Cihazda uygulanacak yeni durum. */
  local: {
    positions: Record<string, number>;
    savedWords: string[];
    mistakes: Record<string, Mistake>;
    /** **Başka** cihazların gün başına katkısı. Yerel `daily` buna karışmıyor. */
    remoteDaily: Record<string, number>;
    /** **Başka** cihazların gün başına çalışma süresi. */
    remoteStudied: Record<string, number>;
    /** Sunucudaki profil kazandıysa dolu; yoksa null. */
    profile: {
      cefr: string;
      goals: string[];
      dailyTime: string;
      skills: string[];
      testResult: unknown;
      arena: { xp: number; found: number; streak: number };
      profileAt: number;
    } | null;
  };
  push: Push;
  /** Bir sonraki eşitlemenin tabanı. */
  base: Base;
};

export function positionKey(kind: string, level: string): string {
  return `${kind}:${level}`;
}

function splitKey(key: string): { kind: string; level: string } | null {
  const at = key.indexOf(':');
  if (at <= 0 || at === key.length - 1) return null;
  return { kind: key.slice(0, at), level: key.slice(at + 1) };
}

/**
 * Hata defterini sınıra indirir.
 *
 * Sıralama hem tarihe hem anahtara göre: yalnızca tarihe bakmak, aynı gün
 * eklenmiş kayıtlarda iki cihazın farklı kayıtları atmasına yol açardı ve o
 * fark her eşitlemede birbirini kovalardı.
 */
export function capMistakes(book: Record<string, Mistake>): Record<string, Mistake> {
  const keys = Object.keys(book);
  if (keys.length <= MISTAKE_CAP) return book;

  keys.sort((a, b) =>
    book[a].at === book[b].at ? a.localeCompare(b) : book[a].at.localeCompare(book[b].at),
  );

  const kept: Record<string, Mistake> = {};
  for (const key of keys.slice(keys.length - MISTAKE_CAP)) kept[key] = book[key];
  return kept;
}

/**
 * Profil "hiç doldurulmamış" mı?
 *
 * Kayıt olan herkese sunucuda boş bir profil satırı açılıyor ve o satırın
 * `updated_at` değeri **şimdi**dir. Yalnızca tarihe bakan bir kural, aylardır
 * çevrimdışı çalışmış birinin hesap açtığı anda bütün tercihlerini silerdi:
 * bir saniye önce doğmuş boş satır, aylık emekten "daha yeni"dir. Bu yüzden
 * önce doluluk, sonra tarih soruluyor.
 */
function serverProfileIsEmpty(p: ProfileRow): boolean {
  return (
    p.test_result == null &&
    p.goals.length === 0 &&
    p.skills.length === 0 &&
    (p.daily_time == null || p.daily_time === '')
  );
}

/**
 * Yerel profil hâlâ kurulum varsayılanlarında mı?
 *
 * İkinci bir cihaza giriş yapıldığında yerelde gerçek bir tercih yok, sadece
 * varsayılanlar var. Onların sunucudaki gerçek cevapları ezmemesi gerekiyor.
 */
function localProfileIsDefault(local: LocalState, defaults: DefaultProfile): boolean {
  return (
    local.testResult == null &&
    local.cefr === defaults.cefr &&
    local.dailyTime === defaults.dailyTime &&
    sameSet(local.goals, defaults.goals) &&
    sameSet(local.skills, defaults.skills)
  );
}

export type DefaultProfile = {
  cefr: string;
  goals: string[];
  dailyTime: string;
  skills: string[];
};

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((v) => set.has(v));
}

export function merge(
  local: LocalState,
  server: ServerState,
  base: Base,
  deviceId: string,
  defaults: DefaultProfile,
): MergeResult {
  const positions = mergePositions(local, server);
  const words = mergeSavedWords(local, server, base);
  const mistakes = mergeMistakes(local, server, base);

  return {
    local: {
      positions: positions.local.positions,
      savedWords: words.local.savedWords,
      mistakes: mistakes.local.mistakes,
      remoteDaily: remoteDailyOf(server.daily, deviceId),
      remoteStudied: remoteStudiedOf(server.daily, deviceId),
      profile: profileToAdopt(local, server.profile, defaults),
    },
    push: {
      positions: positions.push,
      savedWordsAdd: words.push.savedWordsAdd,
      savedWordsRemove: words.push.savedWordsRemove,
      mistakesUpsert: mistakes.push.mistakesUpsert,
      mistakesRemove: mistakes.push.mistakesRemove,
      daily: dailyToPush(local.daily, local.studied, base),
      profile: profileToPush(local, server.profile, defaults),
    },
    // Taban, eşitleme **başarıyla bittikten sonra** sunucuda ne olacağını
    // anlatıyor: yerel olarak hesapladığımız birleşim artı gönderdiğimiz
    // günlük XP. Yazma başarısız olursa bu taban kaydedilmiyor, yoksa
    // gönderilmemiş bir satırı gönderilmiş sayardık.
    base: {
      positions: positions.local.positions,
      savedWords: words.local.savedWords,
      mistakeKeys: Object.keys(mistakes.local.mistakes),
      daily: { ...local.daily },
      studied: { ...local.studied },
    },
  };
}

// ----------------------------------------------------------------- konumlar

/**
 * İlerleme geri sarmaz: her bölüm için büyük olan kazanır.
 *
 * Aynı kural sunucuda da bir tetikleyici olarak duruyor. İkisi birden var,
 * çünkü burası hızı (gereksiz yazma yapmamak), oradaki ise doğruyu garanti
 * ediyor: istemcide bir hata küçük değer gönderse bile sunucu kabul etmez.
 */
function mergePositions(local: LocalState, server: ServerState) {
  const onServer: Record<string, number> = {};
  for (const row of server.positions)
    onServer[positionKey(row.kind, row.level)] = row.position;

  const next: Record<string, number> = { ...onServer };
  for (const [key, value] of Object.entries(local.positions)) {
    next[key] = Math.max(value, onServer[key] ?? 0);
  }

  const push: PositionRow[] = [];
  for (const [key, value] of Object.entries(next)) {
    if (value === (onServer[key] ?? -1)) continue;
    const parts = splitKey(key);
    if (parts) push.push({ ...parts, position: value });
  }

  return { local: { positions: next }, push };
}

// ------------------------------------------------------------ kelime defteri

/**
 * Kelime defteri: silme geri dirilmemeli.
 *
 * Kural, tabana göre yön belirliyor. Taban olmasaydı yalnızca "yerelde yok,
 * sunucuda var" görülürdü ve bu iki ayrı olaya uyar: kullanıcı sildi, ya da
 * başka cihaz ekledi. İlkinde silinmeli, ikincisinde eklenmeli; ayırt eden
 * tek şey tabanda olup olmadığı.
 *
 * Kasıtlı taraf tutma: bir kelime burada silinmiş, başka cihazda yeniden
 * eklenmişse silme kazanıyor. Zaman damgası tutmadan hangisinin sonra olduğu
 * bilinemez; "sildiğim şey geri gelmesin" yanılma hâlinde daha az rahatsız
 * edicidir.
 */
function mergeSavedWords(local: LocalState, server: ServerState, base: Base) {
  const inBase = new Set(base.savedWords);
  const onServer = new Set(server.savedWords);
  const here = new Set(local.savedWords);

  const addedHere = local.savedWords.filter((w) => !inBase.has(w));
  const removedHere = base.savedWords.filter((w) => !here.has(w));

  const next = new Set(onServer);
  for (const word of addedHere) next.add(word);
  for (const word of removedHere) next.delete(word);

  return {
    local: { savedWords: [...next].sort() },
    push: {
      savedWordsAdd: addedHere.filter((w) => !onServer.has(w)),
      savedWordsRemove: removedHere.filter((w) => onServer.has(w)),
    },
  };
}

// -------------------------------------------------------------- hata defteri

/**
 * Hata defteri.
 *
 * `times` çakışmada **toplanmıyor, büyüğü alınıyor**. Toplamak iki cihazdan
 * gelen aynı yanlışı iki kez sayardı; buradaki amaç puan değil, hangi sorunun
 * ısrarla yanlış yapıldığını görmek.
 *
 * Silme yönü kelime defteriyle aynı mantıkta: tabanda olup bir tarafta
 * olmayan kayıt silinmiştir.
 */
function mergeMistakes(local: LocalState, server: ServerState, base: Base) {
  const inBase = new Set(base.mistakeKeys);
  const onServer = new Map(server.mistakes.map((m) => [m.key, m]));

  const removedHere = base.mistakeKeys.filter((k) => !(k in local.mistakes));
  const removedThere = base.mistakeKeys.filter((k) => !onServer.has(k));
  const dropped = new Set([...removedHere, ...removedThere]);

  const next: Record<string, Mistake> = {};

  for (const [key, row] of onServer) {
    if (dropped.has(key)) continue;
    next[key] = fromRow(row);
  }

  for (const [key, mine] of Object.entries(local.mistakes)) {
    if (dropped.has(key)) continue;
    const theirs = next[key];
    next[key] = theirs
      ? {
          ...mine,
          times: Math.max(mine.times, theirs.times),
          at: mine.at >= theirs.at ? mine.at : theirs.at,
        }
      : mine;
  }

  const capped = capMistakes(next);

  // Sınıra takılıp düşen kayıtlar da silinmiş sayılıyor. Sınır bir ürün
  // kuralı ("en yeni 200 hata"); yalnızca bu cihazda uygulanırsa sunucu
  // sınırsız büyür ve her eşitlemede aynı kayıtlar geri iner.
  const removedByCap = Object.keys(next).filter((k) => !(k in capped));

  const upsert: MistakeRow[] = [];
  for (const [key, mistake] of Object.entries(capped)) {
    const there = onServer.get(key);
    if (there && there.times === mistake.times && there.at === mistake.at) continue;
    upsert.push(toRow(key, mistake));
  }

  const remove = [...removedHere, ...removedByCap].filter(
    (k) => onServer.has(k) && !(k in capped),
  );

  return {
    local: { mistakes: capped },
    push: { mistakesUpsert: upsert, mistakesRemove: [...new Set(remove)] },
  };
}

function fromRow(row: MistakeRow): Mistake {
  return {
    kind: row.kind as Mistake['kind'],
    level: row.level as Mistake['level'],
    id: row.content_id,
    q: row.q,
    text: row.text,
    answer: row.answer,
    times: row.times,
    at: row.at,
  };
}

function toRow(key: string, m: Mistake): MistakeRow {
  return {
    key,
    kind: m.kind,
    level: m.level,
    content_id: m.id,
    q: m.q,
    text: m.text,
    answer: m.answer,
    times: m.times,
    at: m.at,
  };
}

// ----------------------------------------------------------------- günlük XP

/**
 * Başka cihazların bugüne kadarki katkısı.
 *
 * Kendi satırlarımızı **dışarıda bırakmak** şart. İçeri alınsaydı her
 * eşitlemede kendi XP'mizi kendi üstümüze eklerdik ve sayı, hiç çalışmadan,
 * her açılışta katlanarak büyürdü.
 */
export function remoteDailyOf(
  rows: DailyRow[],
  deviceId: string,
): Record<string, number> {
  return sumOthers(rows, deviceId, (row) => row.xp);
}

/** Aynısı çalışma süresi için. */
export function remoteStudiedOf(
  rows: DailyRow[],
  deviceId: string,
): Record<string, number> {
  return sumOthers(rows, deviceId, (row) => row.seconds);
}

function sumOthers(
  rows: DailyRow[],
  deviceId: string,
  pick: (row: DailyRow) => number,
): Record<string, number> {
  const sum: Record<string, number> = {};
  for (const row of rows) {
    if (row.device_id === deviceId) continue;
    sum[row.day] = (sum[row.day] ?? 0) + (pick(row) ?? 0);
  }
  return sum;
}

/**
 * Sunucuda bizim adımıza yazılı olandan farklı olan günler.
 *
 * XP ve süre aynı satırda duruyor, o yüzden ikisinden **biri** bile
 * değiştiyse satır gidiyor. Ayrı ayrı gönderseydik, yalnızca süresi değişen
 * bir günün XP'si de yeniden yazılır ve iki alan birbirini eskitirdi.
 */
function dailyToPush(
  mineXp: Record<string, number>,
  mineStudied: Record<string, number>,
  base: Base,
): { day: string; xp: number; seconds: number }[] {
  const days = new Set([...Object.keys(mineXp), ...Object.keys(mineStudied)]);
  const out: { day: string; xp: number; seconds: number }[] = [];

  for (const day of [...days].sort()) {
    const xp = mineXp[day] ?? 0;
    const seconds = mineStudied[day] ?? 0;

    // Tabandaki eksik giriş sıfır sayılıyor. Katı eşitlik (`=== xp`)
    // kullanılsaydı, süre alanı eklenmeden önce kaydedilmiş bir taban
    // yüzünden ilk eşitlemede bütün günler yeniden gönderilirdi — zararsız
    // ama gereksiz. Ayrıca hem XP'si hem süresi sıfır olan bir gün hiç
    // gönderilmiyor: kaydedecek bir şeyi yok.
    if ((base.daily[day] ?? 0) === xp && (base.studied[day] ?? 0) === seconds) continue;
    out.push({ day, xp, seconds });
  }
  return out;
}

// -------------------------------------------------------------------- profil

function decideProfile(
  local: LocalState,
  server: ProfileRow | null,
  defaults: DefaultProfile,
): 'push' | 'adopt' {
  if (!server) return 'push';
  if (serverProfileIsEmpty(server)) return 'push';
  if (localProfileIsDefault(local, defaults)) return 'adopt';
  return Date.parse(server.updated_at) > local.profileAt ? 'adopt' : 'push';
}

function profileToAdopt(
  local: LocalState,
  server: ProfileRow | null,
  defaults: DefaultProfile,
): MergeResult['local']['profile'] {
  if (!server || decideProfile(local, server, defaults) !== 'adopt') return null;
  return {
    cefr: server.cefr,
    goals: server.goals,
    dailyTime: server.daily_time ?? defaults.dailyTime,
    skills: server.skills,
    testResult: server.test_result,
    // Arena sayaçları geri sarmamalı: bunlar birikimli sayaçlar, tercih değil.
    // Profilin geri kalanı sunucudan gelse bile burada büyük olan kalıyor.
    arena: maxArena(local.arena, server.arena),
    profileAt: Date.parse(server.updated_at),
  };
}

function profileToPush(
  local: LocalState,
  server: ProfileRow | null,
  defaults: DefaultProfile,
): Push['profile'] {
  if (decideProfile(local, server, defaults) !== 'push') return null;
  return {
    cefr: local.cefr,
    goals: local.goals,
    daily_time: local.dailyTime,
    skills: local.skills,
    test_result: local.testResult ?? null,
    arena: maxArena(local.arena, server?.arena ?? null),
  };
}

function maxArena(
  a: { xp: number; found: number; streak: number },
  b: { xp: number; found: number; streak: number } | null,
): { xp: number; found: number; streak: number } {
  if (!b) return a;
  return {
    xp: Math.max(a.xp, b.xp),
    found: Math.max(a.found, b.found),
    streak: Math.max(a.streak, b.streak),
  };
}
