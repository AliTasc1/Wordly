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

// "AI Koç" ekranının sabit metinleri buradaydı: uydurma bir sohbet, uydurma
// bir hafıza ("son 7 günde 9 hata"). Ekran artık gerçek hata defterini
// gösteriyor; dil modeline bağlanacak sohbet kutusu o gün geri gelecek.

/** AI speaking practice: hotel check-in role play. */
