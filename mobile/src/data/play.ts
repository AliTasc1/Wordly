/** Game hub, Harf Arenası and the AI coach. */

import { colors } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

export type GameMode = {
  glyph: string;
  name: string;
  sub: string;
  tag: string;
  tint: string;
  target: ScreenId;
};

export const MODES: GameMode[] = [
  { glyph: '⚡', name: 'Süre Atağı', sub: '60 saniye, sınırsız kelime', tag: '2× XP', tint: colors.accent, target: 'arena' },
  { glyph: '🛡', name: 'Hayatta Kalma', sub: '3 hata hakkın var', tag: 'SIRALI', tint: colors.secondary, target: 'arena' },
  { glyph: '⚔', name: 'Düello', sub: '1v1 gerçek zamanlı', tag: 'CANLI', tint: colors.error, target: 'duel' },
  { glyph: '👑', name: 'Battle Royale', sub: '100 oyuncu, tek kazanan', tag: 'YENİ', tint: colors.warning, target: 'duel' },
  { glyph: '🤝', name: 'Takım Savaşı', sub: '5v5 kulüp maçı', tag: 'KULÜP', tint: colors.success, target: 'club' },
  { glyph: '🎯', name: 'Solo', sub: 'Baskı yok, sadece pratik', tag: 'SERBEST', tint: colors.textDim, target: 'arena' },
];

export const PLAY_HERO = {
  kicker: 'İMZA OYUN · 2× XP',
  title: 'Harf Arenası',
  sub: 'Dairedeki harflerden kelime kur. Kombo yap, süreyi yönet.',
  primary: 'Oyna',
  secondary: 'Nasıl oynanır?',
};

export const TOURNAMENT = {
  glyph: '🏁',
  title: 'Haftalık Turnuva',
  sub: '2.480 katılımcı · 1 gün 6 saat kaldı',
  cta: 'Katıl',
};

/**
 * Harf Arenası kabuğu. Kelime, harfler ve ipucu artık öğrencinin kendi
 * seviyesindeki sözlükten üretiliyor (`src/content/arena.ts`); burada yalnızca
 * turun sabitleri kalıyor.
 */
export const ARENA = {
  mode: 'SÜRE ATAĞI',
  time: '24',
  timePct: 40,
  readyHint: 'kontrol et',
  found: '/8',
  submitReady: 'Gönder',
  submitIdle: 'Harf seç',
  baseReward: 50,
};

/** AI coach screen. */
export const COACH = {
  header: { title: 'AI Koç', sub: 'Seni 42 gündür takip ediyor' },
  plan: {
    title: 'Bugünün planı',
    sub: '3 dakika · zayıf noktalarına göre',
    message:
      '"Ali, dün Past Perfect\'te 4 hatadan 3\'ünü yaptın ve konuşmada \'th\' sesi puanını düşürdü. Önce 8 soruluk hızlı bir drill, sonra 90 saniyelik telaffuz çalışması yapalım."',
    cta: 'Şimdi pratik yap',
  },
  memoryTitle: 'Koçun hatırladıkları',
  memory: [
    { glyph: '📐', title: 'Past Perfect', sub: 'Son 7 günde 9 hata · en zayıf konun', tag: 'ODAK', tint: colors.error },
    { glyph: '🔤', title: '“th” sesi', sub: 'Telaffuz puanı 64/100', tag: 'GELİŞİYOR', tint: colors.warning },
    { glyph: '🎯', title: 'Hedefin: Kariyer', sub: 'İş görüşmesi modülü önerildi', tag: 'HEDEF', tint: colors.primary },
    { glyph: '📈', title: '42 günlük geçmiş', sub: '1.284 kelime · 96 ders · 38 düello', tag: 'ARŞİV', tint: colors.success },
  ],
  askTitle: 'Koça sor',
  chips: ['Past Perfect anlat', 'Hatalarımı göster', 'Görüşme pratiği', 'Kelime testi'],
  inputPlaceholder: 'Bir şey yaz…',
};

/** AI speaking practice: hotel check-in role play. */
