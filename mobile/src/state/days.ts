/**
 * Gün hesabı.
 *
 * Seri ve günlük XP tablosu tarihe dayanıyor. Bu mantık depolama modülünün
 * içindeydi; oraya ait değildi ve orada sınanamıyordu: `persist.ts`
 * AsyncStorage çekiyor, yani React Native olmadan çalıştırılamıyor. Buradaki
 * fonksiyonlar hiçbir şeye dokunmuyor, dolayısıyla `days.test.ts` içinde tek
 * tek sınanabiliyorlar.
 *
 * Tarihler **cihazın yerel gününe** göre. UTC kullanmak, akşam onda çalışan
 * birinin XP'sini ertesi güne yazardı ve serisi hiç görmediği bir günde
 * kopardı.
 */

/** Bir tarihi `YYYY-MM-DD` olarak yazar (yerel gün). */
export function iso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Bugünün tarihi (YYYY-MM-DD). */
export function today(now: Date = new Date()): string {
  return iso(now);
}

/**
 * Kesintisiz çalışma serisi.
 *
 * Seri, bugünde ya da dünde biten kesintisiz gün dizisidir. Araya giren tek
 * bir boş gün onu keser.
 *
 * Dünden de sayılabilmesi kasıtlı: akşam sekizde uygulamayı açan birine
 * "serin bitti" demek, gün daha bitmeden yanlış olur. Ama hem bugün hem dün
 * boşsa seri gerçekten kopmuştur.
 *
 * `now` yalnızca sınama için dışarıdan veriliyor; uygulama her zaman gerçek
 * günü kullanıyor.
 */
export function streakOf(days: string[], now: Date = new Date()): number {
  if (!days.length) return 0;
  const set = new Set(days);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
