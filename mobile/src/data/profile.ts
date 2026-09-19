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

export type NotificationItem = {
  glyph: string;
  title: string;
  text: string;
  kind: string;
  tint: string;
  time: string;
  unread: boolean;
  target: ScreenId;
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    glyph: '⚔',
    title: 'Gözde seni düelloya çağırdı',
    text: '"Skorumu geç." · Altın Lig',
    kind: 'DÜELLO',
    tint: colors.error,
    time: '2 dk',
    unread: true,
    target: 'duel',
  },
  {
    glyph: '🏅',
    title: 'Başarım açıldı',
    text: '“1.000 Kelime” rozeti koleksiyonunda',
    kind: 'BAŞARIM',
    tint: colors.warning,
    time: '1 sa',
    unread: true,
    target: 'achv',
  },
  {
    glyph: '🔥',
    title: 'Serini koru',
    text: 'Bugün 120 XP daha gerek',
    kind: 'SERİ',
    tint: colors.warning,
    time: '3 sa',
    unread: false,
    target: 'home',
  },
  {
    glyph: '🤖',
    title: 'AI Koç yeni plan hazırladı',
    text: 'Past Perfect · 3 dakika',
    kind: 'KOÇ',
    tint: colors.secondary,
    time: '5 sa',
    unread: false,
    target: 'coach',
  },
  {
    glyph: '🏛',
    title: 'Developers English',
    text: 'Haftalık turnuva 2 gün sonra',
    kind: 'KULÜP',
    tint: colors.success,
    time: 'Dün',
    unread: false,
    target: 'club',
  },
  {
    glyph: '📈',
    title: 'Haftalık raporun hazır',
    text: '+%18 XP · konuşma gelişti',
    kind: 'RAPOR',
    tint: colors.primary,
    time: '2 gün',
    unread: false,
    target: 'stats',
  },
];

/** The four micro-interaction toasts the design exposes as triggers. */
export const FX = {
  xp: { title: '+50 XP kazanıldı', note: 'Günlük hedefe 120 XP kaldı' },
  level: { title: 'Seviye 24 → 25', note: 'Yeni ünite kilidi açıldı' },
  streak: { title: '🔥 Seri 43 güne çıktı', note: 'En uzun serine 5 gün kaldı' },
  achievement: { title: 'Başarım açıldı', note: '“1.000 Kelime” rozeti koleksiyonunda' },
};
