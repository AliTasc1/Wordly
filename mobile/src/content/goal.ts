/**
 * Günlük çalışma hedefi.
 *
 * Kurulumda "Günde ne kadar?" diye soruluyordu ve cevap hiçbir şeye
 * yaramıyordu: yalnızca Ayarlar'da geri gösteriliyordu. Sahte bir sayı
 * göstermiyordu ama sahte bir söz veriyordu — hedef koydurup unutmak,
 * hedefi hiç sormamaktan kötüdür.
 *
 * ----------------------------------------------------- neden gerçek süre
 * En kolay yol XP'den süre türetmekti: "100 XP ≈ 10 dakika". Bir satır kod
 * ve tamamen uydurma — hızlı çözen ile takılan aynı süreyi görürdü. Hedef
 * "günde 10 dakika" ise ölçülecek şey dakikadır. Süre gerçekten sayılıyor;
 * nasıl sayıldığı `state/useStudyClock.ts` içinde.
 */

/** Kurulumdaki seçeneklerin saniye karşılığı. */
const SECONDS: Record<string, number> = {
  '5 dk': 5 * 60,
  '10 dk': 10 * 60,
  '20 dk': 20 * 60,
  '30+ dk': 30 * 60,
};

/** Seçenek listesinde olmayan bir değer gelirse kullanılan hedef. */
const FALLBACK = 10 * 60;

/**
 * Hedefin saniye karşılığı.
 *
 * Bilinmeyen bir değer için 10 dakikaya düşüyor. Alternatif 0 döndürmekti —
 * o da hedefi "zaten tamamlandı" yapardı ve bozuk bir ayar, öğrenciye her
 * gün boşuna kutlama gösterirdi.
 */
export function goalSeconds(dailyTime: string): number {
  return SECONDS[dailyTime] ?? FALLBACK;
}

/**
 * Bu değerin kendi karşılığı var mı, yoksa varsayılana mı düşüyor.
 *
 * Yalnızca test için: "10 dk" ile bilinmeyen bir değer aynı sayıyı veriyor
 * (ikisi de 600) ve sonuca bakarak hangisinin tanındığı anlaşılamıyor.
 * Kurulumdaki seçeneklerin tanındığını doğrulamanın başka yolu yok.
 */
export function isKnownGoal(dailyTime: string): boolean {
  return dailyTime in SECONDS;
}

export type GoalProgress = {
  /** Bugün çalışılan saniye. */
  studied: number;
  /** Hedef saniye. */
  goal: number;
  /** 0–100 arası, hedefi aşınca 100'de duruyor. */
  pct: number;
  /** Hedefe kalan saniye; dolduysa 0. */
  remaining: number;
  done: boolean;
};

export function goalProgress(studied: number, dailyTime: string): GoalProgress {
  const goal = goalSeconds(dailyTime);
  const safe = Math.max(0, Math.floor(studied));
  const done = safe >= goal;

  return {
    studied: safe,
    goal,
    // Hedefe bir saniye kala %100 göstermemek için aşağı yuvarlanıyor, ama
    // 99'da da takılmıyor: hedef gerçekten dolduğunda 100 yazıyor.
    pct: done ? 100 : Math.min(Math.floor((safe / goal) * 100), 99),
    remaining: done ? 0 : goal - safe,
    done,
  };
}

/** `7 dk`, `45 sn`, `1 sa 5 dk` */
export function durationText(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  if (safe < 60) return `${safe} sn`;

  const minutes = Math.floor(safe / 60);
  if (minutes < 60) return `${minutes} dk`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
}

/**
 * Ana sayfadaki tek satır.
 *
 * Hedef dolduğunda "devam et" demiyoruz. Günlük hedefin işi, ne zaman
 * durabileceğini söylemek; dolduktan sonra da itmek, hedefi anlamsız kılar.
 * İsteyen çalışmaya devam ediyor, ama bunu uygulama istemiyor.
 */
export function goalText(progress: GoalProgress): string {
  if (progress.done) return 'Bugünkü hedefin tamam';
  if (progress.studied === 0) return `Bugün ${durationText(progress.goal)} hedefin var`;
  return `Hedefe ${durationText(progress.remaining)} kaldı`;
}
