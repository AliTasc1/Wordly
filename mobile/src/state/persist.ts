import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CefrLevel } from '../data/curriculum';
import type { TestResult } from './AppContext';

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
  /** Çalışılan günler, ISO tarih (YYYY-MM-DD). Seri buradan hesaplanıyor. */
  days: string[];
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
  days: [],
};

/**
 * Kaydı okur.
 *
 * Bozuk ya da eski bir kayıt uygulamayı açılışta çökertmemeli; okunamayan
 * her durumda boş başlangıca dönüyoruz. Alanlar tek tek doğrulanıyor, çünkü
 * sürüm atlarında eksik alan gelmesi normaldir ve o yüzden `EMPTY` ile
 * birleştiriliyor.
 */
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
      days: Array.isArray(saved.days) ? saved.days : [],
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
