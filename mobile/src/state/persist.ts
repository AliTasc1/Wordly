import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CefrLevel } from '../data/curriculum';
import type { DeckKind, TestResult } from './AppContext';

/**
 * İlerlemenin cihazda saklanması.
 *
 * Uygulama şimdiye kadar her kapanışta her şeyi unutuyordu: 450 metin ve
 * 104 ders yazdık ama öğrenci ikinci gün en baştan başlıyordu. Bunun için
 * sunucu gerekmiyor — ilerleme önce cihazda durur, hesap geldiğinde sunucuya
 * *ek olarak* yazılır. Tersi değil: çevrimdışı çalışmayan bir dil uygulaması
 * otobüste açılmaz.
 */

const KEY = 'wordly:state:v1';

/**
 * Yanlış yapılan bir soru.
 *
 * Hata defteri ve koç ekranı buradan besleniyor. Soru metnini ve doğru cevabı
 * da saklıyoruz: öğrenci haftalar sonra baktığında "gramer, 3. soru" hiçbir şey
 * anlatmaz, sorunun kendisi anlatır.
 */
export type Mistake = {
  kind: DeckKind;
  level: CefrLevel;
  /** İçerik kimliği — ders, metin ya da diyalog. */
  id: string;
  /** O içerikteki sorunun sırası. */
  q: number;
  /** Sorunun kendisi. */
  text: string;
  /** Doğru cevap. */
  answer: string;
  /** Aynı soruda kaç kez yanılındı. */
  times: number;
  /** Son yanılma tarihi (YYYY-MM-DD). */
  at: string;
};

/** Hata defterinde tutulacak en fazla kayıt. */
const MISTAKE_CAP = 200;

/** Bir hatanın kimliği: aynı soru iki kayıt açmasın. */
export function mistakeKey(m: Pick<Mistake, 'kind' | 'id' | 'q'>): string {
  return `${m.kind}:${m.id}:${m.q}`;
}

/**
 * Diske yazılanlar.
 *
 * Bilerek dışarıda bırakılanlar:
 *
 * - `plan` (abonelik): yetkilendirme mağazadan gelmeli. Kullanıcının
 *   düzenleyebildiği bir dosyadan okunan abonelik, abonelik değildir.
 *   RevenueCat bağlanınca oradan gelecek.
 * - `liked` / `following` / `joinedClub` ve düello sayaçları: bunlar henüz
 *   örnek veriyle çalışan sosyal ekranların durumu. Sahte bir sayıyı kalıcı
 *   yapmak onu gerçek göstermez, sadece yalanı kalıcılaştırır.
 */
export type Saved = {
  goals: string[];
  dailyTime: string;
  skills: string[];
  cefr: CefrLevel;
  testResult: TestResult | null;
  positions: Record<string, number>;
  savedWords: string[];
  arena: { xp: number; found: number; streak: number };
  /** Kazanılan toplam XP. */
  xp: number;
  /**
   * Gün → o gün kazanılan XP (YYYY-MM-DD).
   *
   * Önce yalnızca çalışılan günlerin listesiydi; haftalık grafik "ne kadar"ı
   * soruyor, "çalıştı mı"yı değil. Seri hâlâ anahtarlardan hesaplanıyor, yani
   * bu alan ikisini birden karşılıyor.
   */
  daily: Record<string, number>;
  /** Hata defteri — soru kimliğine göre. */
  mistakes: Record<string, Mistake>;
};

/** Kayıt yoksa ya da okunamazsa uygulama bu değerlerle açılır. */
export const EMPTY: Saved = {
  goals: ['Kariyer'],
  dailyTime: '10 dk',
  skills: ['Konuşma', 'Kelime'],
  cefr: 'B1',
  testResult: null,
  positions: {},
  savedWords: [],
  arena: { xp: 0, found: 0, streak: 0 },
  xp: 0,
  daily: {},
  mistakes: {},
};

/**
 * Kaydı okur.
 *
 * Bozuk ya da eski bir kayıt uygulamayı açılışta çökertmemeli; okunamayan
 * her durumda boş başlangıca dönüyoruz. Alanlar tek tek doğrulanıyor, çünkü
 * sürüm atlarında eksik alan gelmesi normaldir ve o yüzden `EMPTY` ile
 * birleştiriliyor.
 */
/**
 * Günlük XP tablosunu okur, gerekirse eski biçimden çevirir.
 *
 * İlk sürüm yalnızca çalışılan günlerin listesini tutuyordu. O kayıtlarda günün
 * XP'si **bilinmiyor**; eldeki toplamı günlere bölüştürmek grafikte hiç
 * yaşanmamış bir dağılım çizmek olurdu. Bu yüzden eski günler sıfır XP ile
 * geliyor: seri korunuyor, grafik o günler için dürüstçe boş kalıyor.
 */
function dailyOf(saved: Partial<Saved> & { days?: unknown }): Record<string, number> {
  if (saved.daily && typeof saved.daily === 'object') return saved.daily;
  if (Array.isArray(saved.days)) {
    return Object.fromEntries(saved.days.filter((d) => typeof d === 'string').map((d) => [d, 0]));
  }
  return {};
}

export async function load(): Promise<Saved> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Partial<Saved>;
    return {
      ...EMPTY,
      ...saved,
      positions: saved.positions ?? EMPTY.positions,
      savedWords: Array.isArray(saved.savedWords) ? saved.savedWords : EMPTY.savedWords,
      arena: { ...EMPTY.arena, ...(saved.arena ?? {}) },
      xp: typeof saved.xp === 'number' ? saved.xp : 0,
      daily: dailyOf(saved),
      mistakes: typeof saved.mistakes === 'object' && saved.mistakes ? saved.mistakes : {},
    };
  } catch {
    return EMPTY;
  }
}

let pending: ReturnType<typeof setTimeout> | null = null;
let queued: Saved | null = null;

/**
 * Kaydı yazar — ama her tuşta değil.
 *
 * Kelime kartında her "Biliyorum" bir konum değişikliğidir; her birinde diske
 * yazmak hem gereksiz hem de hızlı geçişlerde yazma sırasını şişirir. Son
 * durum 700 ms sonra bir kez yazılıyor.
 */
export function save(state: Saved): void {
  queued = state;
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    const snapshot = queued;
    queued = null;
    if (snapshot) void AsyncStorage.setItem(KEY, JSON.stringify(snapshot)).catch(() => {});
  }, 700);
}

/**
 * Bekleyen yazmayı hemen yapar.
 *
 * Uygulama arka plana alındığında ya da kapatıldığında çağrılıyor: 700 ms'lik
 * gecikme, tam o anda kapatılan uygulamada son dersin kaybolması demek olurdu.
 */
export async function flush(): Promise<void> {
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
  const snapshot = queued;
  queued = null;
  if (snapshot) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      // Yazılamadıysa yapacak bir şey yok; uygulama yine de çalışmalı.
    }
  }
}

/** Ayarlardaki "ilerlemeyi sıfırla" için. */
export async function clear(): Promise<void> {
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
  queued = null;
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // yoksay
  }
}

/** Bugünün tarihi, cihazın yerel gününe göre (YYYY-MM-DD). */
export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Hata defterine bir yanlış işler.
 *
 * Aynı soru tekrar yanlış yapılırsa yeni kayıt açılmıyor, sayacı artıyor —
 * ısrarla yanılınan bir soru, bir kez yanılınandan daha önemlidir ve koç
 * ekranı sıralamayı buna göre yapıyor.
 *
 * Defter sınırsız büyüyemez: 450 metin ve 104 ders binlerce soru demek. Sınır
 * aşılınca en eski kayıtlar düşüyor.
 */
export function withMistake(
  book: Record<string, Mistake>,
  m: Omit<Mistake, 'times' | 'at'>,
): Record<string, Mistake> {
  const key = mistakeKey(m);
  const seen = book[key];
  const next = { ...book, [key]: { ...m, times: (seen?.times ?? 0) + 1, at: today() } };

  const keys = Object.keys(next);
  if (keys.length <= MISTAKE_CAP) return next;
  keys.sort((a, b) => next[a].at.localeCompare(next[b].at));
  for (const old of keys.slice(0, keys.length - MISTAKE_CAP)) delete next[old];
  return next;
}

/**
 * Kesintisiz çalışma serisi.
 *
 * Bugün çalışılmamışsa seri dünden geriye sayılır — akşam sekizde uygulamayı
 * açan birine "serin bitti" demek, gün bitmeden yanlış olur. İki günden fazla
 * boşluk seriyi keser.
 */
export function streakOf(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  const cursor = new Date();
  const iso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Bugün yoksa dünden başla; ikisi de yoksa seri yok.
  if (!set.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(iso(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
