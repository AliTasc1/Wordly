import { colors } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

/**
 * Bildirimler — hepsi öğrencinin kendi durumundan türetiliyor.
 *
 * Bu liste tasarımdan gelen altı sabit satırdı: "Gözde seni düelloya çağırdı",
 * "Developers English · haftalık turnuva 2 gün sonra", "AI Koç yeni plan
 * hazırladı". Hiçbiri olmadı ve olmayacaktı; üçü de var olmayan özelliklere
 * aitti. Uygulamayı ilk açan kişi iki okunmamış bildirimle karşılaşıyordu.
 *
 * Buradaki her madde gerçek bir veriye dayanıyor. Gösterecek bir şey yoksa
 * liste boş kalıyor — boşluk, uydurmaktan iyidir.
 *
 * Bilerek dışarıda bırakılanlar: "rozet açıldı" bildirimi (rozetin ne zaman
 * açıldığını tutmuyoruz, dolayısıyla "yeni" diyemeyiz) ve zamanlanmış
 * hatırlatmalar (sistem bildirimi altyapısı yok).
 */

export type Alert = {
  id: string;
  glyph: string;
  title: string;
  text: string;
  kind: string;
  tint: string;
  target: ScreenId;
};

export type AlertFacts = {
  /** Kesintisiz çalışma serisi (gün). */
  streak: number;
  /** Bugün kazanılan XP. */
  todayXp: number;
  /** Hata defterindeki kayıt sayısı. */
  mistakes: number;
  /** Bu hafta liderlik tablosundaki sıra; tabloda değilse null. */
  place: number | null;
  /** Son eşitleme başarısız olduysa sebebi. */
  syncProblem: string | null;
  /** Hesap bağlı mı. */
  signedIn: boolean;
};

export function alertsOf(f: AlertFacts): Alert[] {
  const out: Alert[] = [];

  // Eşitleme sorunu en üstte: ilerlemenin taşınmadığını bilmek, diğer her
  // şeyden önce gelir.
  if (f.syncProblem) {
    out.push({
      id: 'sync',
      glyph: '⚠',
      title: 'Eşitleme yapılamadı',
      text: `İlerlemen telefonda duruyor. ${f.syncProblem}`,
      kind: 'EŞİTLEME',
      tint: colors.warning,
      target: 'settings',
    });
  }

  // Seri yalnızca gerçekten riskteyse uyarıyor: bugün çalışılmışsa seri zaten
  // güvende ve hatırlatmanın bir anlamı yok.
  if (f.streak > 0 && f.todayXp === 0) {
    out.push({
      id: 'streak',
      glyph: '🔥',
      title: `${f.streak} günlük serin sürüyor`,
      text: 'Bugün henüz çalışmadın. Kısa bir bölüm seriyi korur.',
      kind: 'SERİ',
      tint: colors.warning,
      target: 'learn',
    });
  }

  if (f.mistakes > 0) {
    out.push({
      id: 'mistakes',
      glyph: '📓',
      title: `Hata defterinde ${f.mistakes} soru var`,
      text: 'En çok zorlandıklarınla başlamak en hızlı ilerleme yolu.',
      kind: 'TEKRAR',
      tint: colors.secondary,
      target: 'coach',
    });
  }

  if (f.place != null) {
    out.push({
      id: 'board',
      glyph: '🏆',
      title: `Bu hafta ${f.place}. sıradasın`,
      text: 'Hafta pazartesi sıfırlanıyor.',
      kind: 'LİDERLİK',
      tint: colors.accent,
      target: 'board',
    });
  }

  // Hesap önerisi en sona: yararlı ama acil değil ve zorlama değil.
  if (!f.signedIn) {
    out.push({
      id: 'account',
      glyph: '☁',
      title: 'İlerlemen yalnızca bu telefonda',
      text: 'Hesap açarsan diğer cihazlarına da taşınır. Zorunlu değil.',
      kind: 'HESAP',
      tint: colors.primary,
      target: 'signin',
    });
  }

  return out;
}
