/**
 * Profilde gösterilen kimlik.
 *
 * Profil başlığı tasarımdan gelen sabitleri gösteriyordu: "Ali Yılmaz",
 * "@aliyilmaz · 42 gündür üye", "LV 24", "ALTIN". Uygulamayı ilk açan
 * herkes Ali Yılmaz'dı ve kırk iki gündür üyeydi.
 *
 * Buradaki her değer gerçek bir kaynaktan geliyor ya da hiç gösterilmiyor.
 * Saf fonksiyonlar — `identity.test.ts` içinde sınanıyor.
 */

/**
 * Ekranda gösterilecek ad.
 *
 * Sıra: kullanıcının kendi seçtiği ad → e-postanın yerel kısmı → "Öğrenci".
 *
 * Hesapsız kullanıcıya uydurma bir ad vermiyoruz. "Öğrenci" bir isim değil,
 * bir hitap: kim olduğunu bilmediğimizi saklamıyor.
 */
export function displayNameOf(
  chosen: string | null | undefined,
  email: string | null | undefined,
): string {
  const picked = chosen?.trim();
  if (picked) return picked;

  const local = email?.split('@')[0]?.trim();
  if (local) return local;

  return 'Öğrenci';
}

/** Adın baş harfi. Emoji ile başlayan adlar bölünmüyor. */
export function initialOf(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toLocaleUpperCase('tr-TR') : '?';
}

/**
 * Hesabın kaç gündür açık olduğu.
 *
 * Gün farkı gece yarısına yuvarlanmış tarihlerden hesaplanıyor: saat farkı
 * yüzünden "1 gün" ile "0 gün" arasında gidip gelen bir sayı, öğrencinin
 * gözünde uygulamayı güvenilmez yapar.
 */
export function memberDays(createdAt: string, now: Date = new Date()): number | null {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return null;

  const from = new Date(created);
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const days = Math.floor((b - a) / 86_400_000);
  // İleri tarihli bir kayıt (cihaz saati geride) eksi gün üretmesin.
  return days < 0 ? 0 : days;
}

/**
 * Profildeki alt satır.
 *
 * Hesap yoksa üyelik de yok; "bu cihazda" demek hem doğru hem de hesabın ne
 * işe yaradığını hatırlatıyor.
 */
export function memberText(
  createdAt: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!createdAt) return 'Bu cihazda çalışıyor';

  const days = memberDays(createdAt, now);
  if (days == null) return 'Hesap bağlı';
  if (days === 0) return 'Bugün katıldı';
  if (days === 1) return 'Dünden beri üye';
  return `${days} gündür üye`;
}

/**
 * Saate göre selam.
 *
 * Tasarımda "İyi akşamlar, Ali 👋" sabitti: sabah altıda açan kişi de iyi
 * akşamlar diliyordu, adı ne olursa olsun Ali'ydi.
 */
export function greetingFor(name: string, now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 6) return `İyi geceler, ${name} 👋`;
  if (hour < 12) return `Günaydın, ${name} 👋`;
  if (hour < 18) return `İyi günler, ${name} 👋`;
  return `İyi akşamlar, ${name} 👋`;
}

/**
 * Selamın altındaki satır.
 *
 * Yerinde "Bugün 3 görevin var" yazıyordu; görev diye bir şey yok ve sayı
 * hiç değişmiyordu. Bunun yerine bugün gerçekten kazanılan XP var.
 */
export function todayLine(todayXp: number, streak: number): string {
  if (todayXp > 0) return `Bugün ${todayXp} XP kazandın`;
  if (streak > 0) return `Serin ${streak} günde — bugün henüz başlamadın`;
  return 'Bugün henüz başlamadın';
}
