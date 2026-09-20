/** Game hub, Harf Arenası and the AI coach. */

import { colors } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

/*
  Mod listesi `content/arena-game.ts` içindeki MODE_LIST'ten geliyor.

  Burada altı mod sabit yazılıydı: Düello, Battle Royale ve Takım Savaşı hiç
  yazılmamıştı — üçü de gerçek zamanlı sunucu eşleşmesi istiyor. Olmayan bir
  şeyi menüye koymak, kullanıcıya dokunduğunda öğreneceği bir söz vermektir.

  Kalan üç mod artık gerçekten farklı oynanıyor: süre, hak ve XP çarpanı
  birbirinden ayrı.
*/

/** Modların görünüşü. Kural `content/arena-game.ts` içinde; burası yalnızca simge ve renk. */
export const ARENA_GLYPH: Record<string, { glyph: string; tint: string }> = {
  time: { glyph: '⚡', tint: colors.accent },
  survival: { glyph: '🛡', tint: colors.secondary },
  solo: { glyph: '🎯', tint: colors.success },
};

export const PLAY_HERO = {
  kicker: 'İMZA OYUN · 2× XP',
  title: 'Harf Arenası',
  sub: 'Dairedeki harflerden kelime kur. Kombo yap, süreyi yönet.',
  primary: 'Oyna',
  secondary: 'Nasıl oynanır?',
};

// "Haftalık Turnuva · 2.480 katılımcı · 1 gün 6 saat kaldı" buradaydı:
// turnuva diye bir şey yok, katılımcı sayısı uydurmaydı ve "Katıl" düğmesi
// lider tablosunu açıyordu. Liderlik artık gerçek ve kendi yerinde duruyor.

/**
 * Harf Arenası kabuğu. Kelime, harfler ve ipucu artık öğrencinin kendi
 * seviyesindeki sözlükten üretiliyor (`src/content/arena.ts`); burada yalnızca
 * turun sabitleri kalıyor.
 */
export const ARENA = {
  readyHint: 'kontrol et',
  submitReady: 'Gönder',
};

// Buradan silinenler: `mode` ve `time` sabit metinlerdi ("SÜRE ATAĞI",
// "00:24") ve süre hiç işlemiyordu; `timePct` sabit %40'tı; `found` "/8"
// diye olmayan bir hedef gösteriyordu; `baseReward` artık mod kurallarıyla
// birlikte `content/arena-game.ts` içinde.

// "AI Koç" ekranının sabit metinleri buradaydı: uydurma bir sohbet, uydurma
// bir hafıza ("son 7 günde 9 hata"). Ekran artık gerçek hata defterini
// gösteriyor; dil modeline bağlanacak sohbet kutusu o gün geri gelecek.

/** AI speaking practice: hotel check-in role play. */
