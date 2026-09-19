/** Home dashboard, profile, achievements and progress analytics. */

import { colors } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

// USER buradaydı: "Ali Yılmaz", "@aliyilmaz · 42 gündür üye", "LV 24",
// "ALTIN". Uygulamayı ilk açan herkes Ali Yılmaz'dı. Ad, baş harf, selam ve
// üyelik süresi artık gerçek hesaptan türetiliyor (content/identity.ts);
// seviye numarası ve lig diye bir şey hiç olmadı.

// COACH_CARD buradaydı: "AI Koçun · HAZIR · 'Ali, dün Past Perfect'te
// zorlandın, 3 dakika birlikte pratik yapalım.'" Böyle bir koç yok ve o
// cümle herkese aynı geliyordu. Ana sayfadaki kart artık gerçek hata
// defterini anlatıyor.

export const DAILY_GAME = {
  kicker: 'GÜNÜN OYUNU',
  title: 'Harf Arenası',
  // "18:00'a kadar" kaldırıldı: öyle bir süre sınırı yok. 2× XP ise gerçek —
  // Süre Atağı modunun çarpanı (content/arena-game.ts).
  sub: 'Süre Atağı · 2× XP',
};

// DUEL_STATS buradaydı: "38 maç · %68 galibiyet". Düello yazılmadı;
// oynanmamış maçların galibiyet oranını göstermek, öğrenciye hiç yapmadığı
// bir şeyin karnesini vermekti.

// Başarımlar, haftalık XP grafiği, beceri trendleri ve hata defteri buradaki
// sabit değerlerden geliyordu. Hepsi artık gerçek ilerlemeden hesaplanıyor:
// bkz. content/achievements.ts ve content/stats.ts.

// NOTIFICATIONS buradaydı: altı sabit satır ve üçü var olmayan özelliklere
// aitti — düello daveti, kulüp turnuvası, "AI Koç yeni plan hazırladı".
// Bildirimler artık öğrencinin kendi durumundan türetiliyor
// (content/alerts.ts) ve gösterecek bir şey yoksa liste boş kalıyor.

// FX buradaydı: dört sahte bildirim tetikleyicisi ("+50 XP kazanıldı",
// "Seviye 24 → 25", "Seri 43 güne çıktı"). Sosyal, abonelik ve bildirim
// ekranlarındaki düğmelere bağlıydılar; hiçbiri gerçek bir olaya karşılık
// gelmiyordu. O düğmeler de o ekranlar da artık yok.
