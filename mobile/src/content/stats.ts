import type { Mistake } from '../state/persist';

/**
 * Haftalık gelişimin sayıları.
 *
 * Gelişim analizi ekranı tasarımdan gelen sabit değerleri gösteriyordu:
 * "4.480 XP", "+%18", "24 dk/gün". Artık gün gün XP kaydedildiğine göre
 * bunların uydurma olmasına gerek yok.
 *
 * Takip etmediğimiz hiçbir ölçü buraya girmiyor. "Günde 24 dakika" bunlardan
 * biriydi: uygulama oturum süresi ölçmüyor, o sayı hiçbir zaman gerçek
 * olamazdı. Ölçmediğimiz şeyi göstermemek, uydurmaktan iyidir.
 */

/** Pazartesiden başlayan Türkçe gün kısaltmaları; JS'in 0=Pazar sırasına göre. */
const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const DAY_NAMES = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

function iso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Bugünden `back` gün öncesi. */
function dayBefore(back: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - back);
  return d;
}

export type Bar = { label: string; value: number; date: string; name: string };

/**
 * Son yedi gün, eskiden yeniye.
 *
 * Bugün her zaman en sağda: grafiğin sabit bir haftaya değil, öğrencinin
 * bulunduğu ana göre kayması gerekiyor.
 */
export function weekBars(daily: Record<string, number>, endingDaysAgo = 0): Bar[] {
  const bars: Bar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayBefore(i + endingDaysAgo);
    const key = iso(d);
    bars.push({
      label: DAY_LABELS[d.getDay()],
      name: DAY_NAMES[d.getDay()],
      date: key,
      value: daily[key] ?? 0,
    });
  }
  return bars;
}

export type WeekStats = {
  bars: Bar[];
  total: number;
  /** Önceki haftaya göre değişim, yüzde. Önceki hafta boşsa null. */
  delta: number | null;
  /** En çok XP kazanılan gün; hafta boşsa null. */
  best: Bar | null;
  /** Günlük ortalama XP (yedi güne bölünmüş). */
  average: number;
  /** Bu hafta kaç gün çalışıldı. */
  activeDays: number;
};

export function weekStats(daily: Record<string, number>): WeekStats {
  const bars = weekBars(daily);
  const total = bars.reduce((n, b) => n + b.value, 0);
  const previous = weekBars(daily, 7).reduce((n, b) => n + b.value, 0);

  const best = bars.reduce<Bar | null>(
    (top, b) => (b.value > 0 && (!top || b.value > top.value) ? b : top),
    null,
  );

  return {
    bars,
    total,
    // Önceki hafta sıfırsa yüzde değişim tanımsız — "+%100" demek yanıltıcı
    // olurdu, çünkü karşılaştırılacak bir şey yok.
    delta: previous > 0 ? Math.round(((total - previous) / previous) * 100) : null,
    best,
    average: Math.round(total / 7),
    activeDays: bars.filter((b) => b.value > 0).length,
  };
}

/** Hata defteri: en çok yanılınan, eşitlikte en yeni olan önce. */
export function rankedMistakes(mistakes: Record<string, Mistake>): (Mistake & { key: string })[] {
  return Object.entries(mistakes)
    .map(([key, m]) => ({ ...m, key }))
    .sort((a, b) => b.times - a.times || b.at.localeCompare(a.at));
}

const KIND_LABELS: Record<Mistake['kind'], string> = {
  vocab: 'Kelime',
  grammar: 'Gramer',
  reading: 'Okuma',
  listening: 'Dinleme',
  speaking: 'Konuşma',
};

export function kindLabel(kind: Mistake['kind']): string {
  return KIND_LABELS[kind];
}

/**
 * Hataların hangi bölümde toplandığı.
 *
 * Koç ekranı "neyi çalışmalıyım" sorusunu buradan yanıtlıyor: en çok yanlış
 * yapılan bölüm, en çok tekrara ihtiyaç duyulan bölümdür.
 */
export function mistakesByKind(
  mistakes: Record<string, Mistake>,
): { kind: Mistake['kind']; label: string; count: number }[] {
  const tally = new Map<Mistake['kind'], number>();
  for (const m of Object.values(mistakes)) {
    tally.set(m.kind, (tally.get(m.kind) ?? 0) + m.times);
  }
  return [...tally.entries()]
    .map(([kind, count]) => ({ kind, label: KIND_LABELS[kind], count }))
    .sort((a, b) => b.count - a.count);
}
