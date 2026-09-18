/** Home dashboard, profile, achievements and progress analytics. */

import { colors } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

export const USER = {
  name: 'Ali',
  fullName: 'Ali Yılmaz',
  handle: '@aliyilmaz · 42 gündür üye',
  initials: 'A',
  level: 'B1+',
  levelNo: 'LV 24',
  league: 'ALTIN',
  greeting: 'İyi akşamlar, Ali 👋',
  tasks: 'Bugün 3 görevin var',
};

export const COACH_CARD = {
  title: 'AI Koçun',
  status: 'HAZIR',
  message: '"Ali, dün Past Perfect\'te zorlandın. 3 dakika birlikte pratik yapalım."',
  cta: 'Şimdi pratik yap',
};

export const DAILY_GAME = {
  kicker: 'GÜNÜN OYUNU',
  title: 'Harf Arenası',
  sub: '2× XP · 18:00’a kadar',
};

export const DUEL_STATS = {
  title: 'Düello istatistikleri',
  matches: '38 maç',
  win: 68,
  draw: 8,
  loss: 24,
  legend: ['● 26 galibiyet', '● 3 berabere', '● 9 yenilgi'],
};

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
  { glyph: '⚔', title: 'Gözde seni düelloya çağırdı', text: '"Skorumu geç." · Altın Lig', kind: 'DÜELLO', tint: colors.error, time: '2 dk', unread: true, target: 'duel' },
  { glyph: '🏅', title: 'Başarım açıldı', text: '“1.000 Kelime” rozeti koleksiyonunda', kind: 'BAŞARIM', tint: colors.warning, time: '1 sa', unread: true, target: 'achv' },
  { glyph: '🔥', title: 'Serini koru', text: 'Bugün 120 XP daha gerek', kind: 'SERİ', tint: colors.warning, time: '3 sa', unread: false, target: 'home' },
  { glyph: '🤖', title: 'AI Koç yeni plan hazırladı', text: 'Past Perfect · 3 dakika', kind: 'KOÇ', tint: colors.secondary, time: '5 sa', unread: false, target: 'coach' },
  { glyph: '🏛', title: 'Developers English', text: 'Haftalık turnuva 2 gün sonra', kind: 'KULÜP', tint: colors.success, time: 'Dün', unread: false, target: 'club' },
  { glyph: '📈', title: 'Haftalık raporun hazır', text: '+%18 XP · konuşma gelişti', kind: 'RAPOR', tint: colors.primary, time: '2 gün', unread: false, target: 'stats' },
];

/** The four micro-interaction toasts the design exposes as triggers. */
export const FX = {
  xp: { title: '+50 XP kazanıldı', note: 'Günlük hedefe 120 XP kaldı' },
  level: { title: 'Seviye 24 → 25', note: 'Yeni ünite kilidi açıldı' },
  streak: { title: '🔥 Seri 43 güne çıktı', note: 'En uzun serine 5 gün kaldı' },
  achievement: { title: 'Başarım açıldı', note: '“1.000 Kelime” rozeti koleksiyonunda' },
};
