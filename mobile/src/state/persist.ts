import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CefrLevel } from '../data/curriculum';
import type { DeckKind, TestResult } from './AppContext';
import { capMistakes, EMPTY_BASE, type Base } from '../server/merge';
import { today } from './days';

// Gün hesabı `days.ts` içine taşındı: depolamaya değil tarihe ait ve orada
// AsyncStorage olmadan sınanabiliyor. Eski içe aktarmalar bozulmasın diye
// buradan yeniden dışa aktarılıyor.
export { iso, streakOf, today } from './days';

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
  /**
   * **Başka** cihazların gün başına katkısı.
   *
   * `daily` yalnızca bu cihazın kazandığı XP'yi tutuyor ve öyle kalmalı: o
   * sayı sunucuya bu cihazın payı olarak gönderiliyor. Uzaktan geleni onun
   * üstüne yazsaydık, gönderdiğimiz pay her eşitlemede kendi üstüne eklenir
   * ve XP hiç çalışmadan büyürdü. Ekranda gösterilen toplam ikisinin
   * toplamı — `AppContext` bunu `dailyTotal` olarak veriyor.
   */
  remoteDaily: Record<string, number>;
  /**
   * Tercihlerin en son ne zaman değiştiği (ms).
   *
   * Profil çakışmasında "son yazan kazanır" diyebilmek için gerekli; onsuz
   * iki dolu profilden hangisinin yeni olduğu bilinemez.
   */
  profileAt: number;
  /**
   * Titreşim açık mı.
   *
   * Ayarlardaki anahtar eskiden yalnızca "Açık" yazan bir etiketti; dokununca
   * "demo" diyen bir bildirim çıkıyordu. Artık gerçekten kapatıyor ve kapalı
   * kalıyor.
   */
  haptics: boolean;
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
  remoteDaily: {},
  profileAt: 0,
  haptics: true,
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
    return Object.fromEntries(
      saved.days.filter((d) => typeof d === 'string').map((d) => [d, 0]),
    );
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
      mistakes:
        typeof saved.mistakes === 'object' && saved.mistakes ? saved.mistakes : {},
      remoteDaily:
        typeof saved.remoteDaily === 'object' && saved.remoteDaily
          ? saved.remoteDaily
          : {},
      // Eski kayıtlarda bu alan yok, yani tercihlerin yaşı bilinmiyor.
      // "Şimdi" diyoruz: bilinmeyeni eski saymak, cihazdaki gerçek cevapları
      // sunucudakine yedirmek olurdu. Ters yön daha güvenli — yeni saymanın
      // bedeli, ikinci cihazda varsayılanların kazanması olurdu ama onu
      // `merge` ayrıca eliyor (varsayılan profil hiçbir zaman kazanmaz).
      profileAt: typeof saved.profileAt === 'number' ? saved.profileAt : Date.now(),
      haptics: typeof saved.haptics === 'boolean' ? saved.haptics : true,
    };
  } catch {
    return EMPTY;
  }
}

// --------------------------------------------------------------- eşitleme

const DEVICE_KEY = 'wordly:device:v1';
const BASE_KEY = 'wordly:sync-base:v1';

/**
 * Bu kuruluma ait sabit kimlik.
 *
 * Günlük XP tablosu cihaz kırılımlı: aynı gün telefonda ve tablette çalışan
 * biri için gerçek toplam ikisinin toplamıdır. Bu kimlik olmadan hangi
 * satırın bizim olduğunu bilemeyiz ve kendi XP'mizi kendi üstümüze ekleriz.
 *
 * Uygulama silinip yeniden kurulursa yeni bir kimlik doğuyor; eski satırlar
 * sunucuda "başka cihaz" olarak kalır. Bu kayıp değil: XP toplamı doğru
 * kalıyor, yalnızca kırılım eskisini ayrı bir cihaz sayıyor.
 */
export async function deviceId(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(DEVICE_KEY);
    if (saved) return saved;
  } catch {
    // Okunamadıysa aşağıda yenisi üretilecek.
  }

  const fresh = `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    await AsyncStorage.setItem(DEVICE_KEY, fresh);
  } catch {
    // Yazılamadıysa bu oturum için geçerli; bir sonraki açılışta yenisi olur.
  }
  return fresh;
}

/**
 * Son eşitlemede sunucuda ne olduğu.
 *
 * Üç yönlü birleştirmenin tabanı. Kullanıcıya göre saklanıyor: başka bir
 * hesaba giriş yapıldığında önceki hesabın tabanı geçerli değildir ve
 * kullanılırsa o hesabın kayıtlarını silinmiş sanardık.
 */
export async function loadBase(userId: string): Promise<Base> {
  try {
    const raw = await AsyncStorage.getItem(BASE_KEY);
    if (!raw) return EMPTY_BASE;
    const saved = JSON.parse(raw) as { userId?: string; base?: Base };
    if (saved.userId !== userId || !saved.base) return EMPTY_BASE;
    return { ...EMPTY_BASE, ...saved.base };
  } catch {
    return EMPTY_BASE;
  }
}

export async function saveBase(userId: string, base: Base): Promise<void> {
  try {
    await AsyncStorage.setItem(BASE_KEY, JSON.stringify({ userId, base }));
  } catch {
    // Yazılamadıysa bir sonraki eşitleme boş tabanla çalışır: birleşim
    // yapılır, silmeler kaçırılır. Veri kaybetmekten iyidir.
  }
}

export async function clearBase(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BASE_KEY);
  } catch {
    // yoksay
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
    if (snapshot)
      void AsyncStorage.setItem(KEY, JSON.stringify(snapshot)).catch(() => {});
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
  // Sınırlama `merge` ile aynı fonksiyondan geliyor. İki ayrı kopya olsaydı
  // biri tarihe, öteki tarihe+anahtara göre elerdi; o fark her eşitlemede
  // cihazların birbirinin kayıtlarını atmasına yol açardı.
  return capMistakes({
    ...book,
    [key]: { ...m, times: (seen?.times ?? 0) + 1, at: today() },
  });
}
