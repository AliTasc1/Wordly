import type { ColorRole } from '../theme/palette';
import type { BoardEntry, MyPlace } from '../server/leaderboard';

/**
 * Lider tablosunun sunum hesapları.
 *
 * Ağdan ve React'ten bağımsız — `board.test.ts` içinde sınanıyor. Buradaki
 * her sayı öğrenciye gösteriliyor, dolayısıyla yanlışı bozuk bir ekran değil
 * yanlış bilgi demek.
 */

/** Adın baş harfleri. İki kelimeye kadar alınıyor. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  const letters = words.slice(0, 2).map((w) => [...w][0] ?? '');
  return letters.join('').toLocaleUpperCase('tr-TR');
}

/**
 * Ada göre sabit bir renk çifti.
 *
 * Rastgele seçilseydi her açılışta aynı kişi başka renkte görünürdü ve
 * tablo tanıdık olmaktan çıkardı. Ad aynıysa renk de aynı.
 */
const PALETTE: readonly (readonly [ColorRole, ColorRole])[] = [
  ['primary', 'accent'],
  ['secondary', 'accent'],
  ['warning', 'orange'],
  ['success', 'accent'],
  ['orange', 'error'],
  ['secondary', 'primary'],
];

export function avatarOf(name: string): readonly [ColorRole, ColorRole] {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) % 100_000;
  return PALETTE[hash % PALETTE.length];
}

/**
 * Bir üstteki kişiye XP farkı.
 *
 * Birinciysen ya da sıran yoksa null. "Sıfır fark" yazmak, aslında önde
 * kimse olmadığını gizlerdi.
 */
export function gapToNext(entries: BoardEntry[], mine: MyPlace | null): number | null {
  if (!mine || mine.place <= 1) return null;
  const above = entries
    .filter((e) => e.place < mine.place)
    .sort((a, b) => b.place - a.place)[0];
  return above ? Math.max(above.xp - mine.xp, 0) : null;
}

/**
 * Haftanın bitmesine kalan süre.
 *
 * Hafta pazartesi başlıyor (sunucudaki `date_trunc('week', …)` ile aynı).
 * Metin, sayacın yalan söylememesi için kabaca yazılıyor: "2 gün 4 saat".
 */
export function weekEndsIn(now: Date = new Date()): { days: number; hours: number } {
  // Pazartesi 0 olacak şekilde: JS'te pazar 0.
  const weekday = (now.getDay() + 6) % 7;
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (7 - weekday),
  );
  const ms = nextMonday.getTime() - now.getTime();
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
  };
}

export function weekEndsText(now: Date = new Date()): string {
  const { days, hours } = weekEndsIn(now);
  if (days > 0) return `Hafta ${days} gün ${hours} saat sonra sıfırlanıyor`;
  if (hours > 0) return `Hafta ${hours} saat sonra sıfırlanıyor`;
  return 'Hafta birazdan sıfırlanıyor';
}
