/** Weekly league standings. */

import { colors } from '../theme/tokens';

export type Move = '▲' | '▼' | '—';

export type BoardRow = {
  rank: string;
  name: string;
  initials: string;
  xp: string;
  move: Move;
  meta: string;
  avatar: readonly [string, string];
  /** The promotion cut-off line is drawn under rank 5. */
  divider?: boolean;
};

export const LEAGUES = [
  { name: 'Bronz', glyph: '🥉' },
  { name: 'Gümüş', glyph: '🥈' },
  { name: 'Altın', glyph: '🥇' },
  { name: 'Elmas', glyph: '💎' },
  { name: 'Master', glyph: '👑' },
  { name: 'Elit', glyph: '⚡' },
];

export const ACTIVE_LEAGUE = 'Altın';

export const BOARD_ROWS: BoardRow[] = [
  { rank: '1', name: 'Elif', initials: 'EL', xp: '6.240', move: '▲', meta: 'Lv 38 · B2', avatar: [colors.secondary, colors.accent] },
  { rank: '2', name: 'Kaan', initials: 'KA', xp: '5.980', move: '—', meta: 'Lv 35 · B2', avatar: [colors.primary, colors.accent] },
  { rank: '3', name: 'Zeynep', initials: 'ZE', xp: '5.410', move: '▲', meta: 'Lv 33 · B1+', avatar: [colors.warning, colors.orange] },
  { rank: '4', name: 'Mert', initials: 'ME', xp: '4.610', move: '▼', meta: 'Lv 31 · B1+', avatar: [colors.orange, colors.error] },
  { rank: '5', name: 'Gözde', initials: 'GÖ', xp: '4.820', move: '▲', meta: 'Lv 31 · B2', avatar: [colors.secondary, colors.accent], divider: true },
  { rank: '6', name: 'Burak', initials: 'BU', xp: '4.560', move: '▼', meta: 'Lv 28 · B1', avatar: [colors.primary, colors.secondary] },
  { rank: '7', name: 'Sen', initials: 'A', xp: '4.480', move: '▲', meta: 'Lv 24 · B1+', avatar: [colors.primary, colors.secondary] },
  { rank: '8', name: 'Deniz', initials: 'DE', xp: '4.120', move: '—', meta: 'Lv 26 · B1', avatar: [colors.success, colors.accent] },
  { rank: '9', name: 'Ayşe', initials: 'AY', xp: '3.980', move: '▼', meta: 'Lv 22 · B1', avatar: [colors.warning, colors.error] },
  { rank: '10', name: 'Can', initials: 'CA', xp: '3.640', move: '▲', meta: 'Lv 21 · A2+', avatar: [colors.secondary, colors.primary] },
];

/** Three-row preview on the home screen. */
export const BOARD_PREVIEW: BoardRow[] = [
  { rank: '5', name: 'Gözde', initials: 'Gİ', xp: '4.820', move: '▲', meta: '', avatar: [colors.secondary, colors.accent] },
  { rank: '6', name: 'Mert', initials: 'ME', xp: '4.610', move: '▼', meta: '', avatar: [colors.warning, colors.orange] },
  { rank: '7', name: 'Sen', initials: 'A', xp: '4.480', move: '▲', meta: '', avatar: [colors.primary, colors.secondary] },
];

export const BOARD_PROMOTION = {
  title: 'İlk 5’e girenler Elmas Lig’e çıkar',
  sub: '3 gün 4 saat kaldı · sen 7. sıradasın',
  glyph: '🥇',
  dividerLabel: 'YÜKSELME SINIRI',
};

export const BOARD_STATS = [
  { value: '4.480', label: 'haftalık XP', tint: colors.accent },
  { value: '%68', label: 'düello kazanma', tint: colors.secondary },
  { value: '340', label: '5.’ye fark', tint: colors.warning },
];

export const moveColor = (move: Move) =>
  move === '▲' ? colors.success : move === '▼' ? colors.error : colors.textGhost;
