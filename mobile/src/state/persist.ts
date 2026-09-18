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
