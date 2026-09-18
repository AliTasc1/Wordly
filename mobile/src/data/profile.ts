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

export type Achievement = {
  glyph: string;
  name: string;
  sub: string;
  pct: number;
  progress: string;
  tint: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { glyph: '🔥', name: '7 Günlük Seri', sub: 'Kesintisiz 7 gün', pct: 100, progress: 'AÇILDI', tint: colors.warning },
  { glyph: '🔥', name: '30 Günlük Seri', sub: 'Kesintisiz 30 gün', pct: 100, progress: 'AÇILDI', tint: colors.warning },
  { glyph: '🔥', name: '100 Günlük Seri', sub: '42/100 gün', pct: 42, progress: '42/100', tint: colors.orange },
  { glyph: '⚔', name: 'İlk Düello', sub: 'Bir düello tamamla', pct: 100, progress: 'AÇILDI', tint: colors.error },
  { glyph: '🏆', name: '10 Düello Galibiyeti', sub: '26/10 galibiyet', pct: 100, progress: 'AÇILDI', tint: colors.error },
  { glyph: '🏅', name: '1.000 Kelime', sub: '1.284/1.000 kelime', pct: 100, progress: 'AÇILDI', tint: colors.secondary },
  { glyph: '💎', name: '10.000 XP', sub: '18.240/10.000 XP', pct: 100, progress: 'AÇILDI', tint: colors.accent },
  { glyph: '🎙', name: 'İlk Konuşma', sub: 'Bir AI oturumu tamamla', pct: 100, progress: 'AÇILDI', tint: colors.success },
  { glyph: '🚀', name: 'B2 Seviyesi', sub: 'B1+ · %68 tamam', pct: 68, progress: '%68', tint: colors.primary },
  { glyph: '📚', name: '500 Kelime Ustalığı', sub: '318/500 kelime', pct: 64, progress: '318/500', tint: colors.secondary },
];

export const ACHIEVEMENTS_HEADER = {
  title: 'Başarımlar',
  sub: '14 / 48 açıldı · 2.400 bonus XP',
  pct: 29,
  summary: '14 / 48 açıldı',
};

export const WEEK_BARS = [
  { label: 'Pzt', value: 420 },
  { label: 'Sal', value: 560 },
  { label: 'Çar', value: 300 },
  { label: 'Per', value: 680 },
  { label: 'Cum', value: 520 },
  { label: 'Cmt', value: 1120 },
  { label: 'Paz', value: 880 },
];

export const WEEK_SUMMARY = {
  title: 'Haftalık XP',
  total: '4.480',
  delta: '+%18',
  best: { kicker: 'EN İYİ GÜN', value: 'Cumartesi', sub: '1.120 XP · 3 düello' },
  average: { kicker: 'ORTALAMA', value: '24 dk/gün', sub: 'hedefin 10 dk' },
};

export const TRENDS = [
  { name: 'Kelime', pct: 82, delta: '+6' },
  { name: 'Gramer', pct: 64, delta: '+3' },
  { name: 'Dinleme', pct: 62, delta: '+8' },
  { name: 'Okuma', pct: 72, delta: '+2' },
  { name: 'Konuşma', pct: 44, delta: '+11' },
  { name: 'Yazma', pct: 60, delta: '-1' },
];

export const MISTAKE_BOOK = {
  title: 'Hata defteri',
  sub: '32 kayıt · 9’u Past Perfect',
  cta: 'TEKRAR ET',
};

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
