import { colors } from '../theme/tokens';
import { CEFR_LEVELS, type CefrLevel } from '../data/curriculum';
import { deckProgress, totals, tr } from './progress';

/**
 * Başarımlar — hepsi gerçek ilerlemeden hesaplanıyor.
 *
 * Önceki liste tasarımdan geliyordu ve uygulamayı ilk açan kişiye "1.000
 * Kelime · AÇILDI" gösteriyordu. Bir rozetin tek işlevi kazanılmış olmaktır;
 * bedava dağıtılan rozet rozet değildir.
 *
 * Düello ve konuşma rozetleri burada yok: ikisi de henüz ölçülmüyor. Ölçmediği
 * bir şey için rozet vaat eden uygulama, o rozeti de değersizleştirir.
 */

export type Achievement = {
  glyph: string;
  name: string;
  sub: string;
  pct: number;
  progress: string;
  tint: string;
};

type Rule = {
  glyph: string;
  name: string;
  /** Kilidi açan eşik. */
  goal: number;
  /** Eşiğin birimi, alt satırda yazılıyor. */
  unit: string;
  tint: string;
};

export type Facts = {
  streak: number;
  xp: number;
  words: number;
  lessons: number;
  texts: number;
  /** Beş bölümü de bitirilmiş seviyeler. */
  levelsDone: CefrLevel[];
};

/** Öğrencinin durumunu kayıttan ve manifestlerden çıkarır. */
export function facts(
  positions: Record<string, number>,
  xp: number,
  streak: number,
): Facts {
  const t = totals(positions);
  return {
    streak,
    xp,
    words: t.words,
    lessons: t.lessons,
    texts: t.texts,
    levelsDone: CEFR_LEVELS.filter((level) =>
      deckProgress(positions, level).every((deck) => deck.total > 0 && deck.done >= deck.total),
    ),
  };
}

const STREAK: Rule[] = [
  { glyph: '🔥', name: '3 Günlük Seri', goal: 3, unit: 'gün', tint: colors.warning },
  { glyph: '🔥', name: '7 Günlük Seri', goal: 7, unit: 'gün', tint: colors.warning },
  { glyph: '🔥', name: '30 Günlük Seri', goal: 30, unit: 'gün', tint: colors.orange },
  { glyph: '🔥', name: '100 Günlük Seri', goal: 100, unit: 'gün', tint: colors.orange },
];

const XP: Rule[] = [
  { glyph: '💎', name: '1.000 XP', goal: 1000, unit: 'XP', tint: colors.accent },
  { glyph: '💎', name: '10.000 XP', goal: 10000, unit: 'XP', tint: colors.accent },
  { glyph: '💎', name: '50.000 XP', goal: 50000, unit: 'XP', tint: colors.accent },
];

const WORDS: Rule[] = [
  { glyph: '📖', name: '100 Kelime', goal: 100, unit: 'kelime', tint: colors.secondary },
  { glyph: '🏅', name: '500 Kelime', goal: 500, unit: 'kelime', tint: colors.secondary },
  { glyph: '🏆', name: '1.000 Kelime', goal: 1000, unit: 'kelime', tint: colors.secondary },
];

const LESSONS: Rule[] = [
  { glyph: '📐', name: '10 Gramer Dersi', goal: 10, unit: 'ders', tint: colors.primary },
  { glyph: '📐', name: '50 Gramer Dersi', goal: 50, unit: 'ders', tint: colors.primary },
];

const TEXTS: Rule[] = [
  { glyph: '📚', name: '25 Metin', goal: 25, unit: 'metin', tint: colors.success },
  { glyph: '📚', name: '100 Metin', goal: 100, unit: 'metin', tint: colors.success },
];

function badge(rule: Rule, value: number): Achievement {
  const done = value >= rule.goal;
  return {
    glyph: rule.glyph,
    name: rule.name,
    sub: done ? `${tr(rule.goal)} ${rule.unit}` : `${tr(value)}/${tr(rule.goal)} ${rule.unit}`,
    // Yüzde 100'de kırpılıyor: eşiği aşmak çubuğu taşırmasın.
    pct: Math.min(Math.round((value / rule.goal) * 100), 100),
    progress: done ? 'AÇILDI' : `${tr(value)}/${tr(rule.goal)}`,
    tint: rule.tint,
  };
}

/** Bir seviyenin beş bölümünü de bitirmek. */
function levelBadge(level: CefrLevel, done: boolean): Achievement {
  return {
    glyph: '🚀',
    name: `${level} Tamamlandı`,
    sub: done ? 'Beş bölümün hepsi' : 'Beş bölümü de bitir',
    pct: done ? 100 : 0,
    progress: done ? 'AÇILDI' : 'KİLİTLİ',
    tint: colors.primary,
  };
}

export function achievementsOf(f: Facts): Achievement[] {
  return [
    ...STREAK.map((r) => badge(r, f.streak)),
    ...XP.map((r) => badge(r, f.xp)),
    ...WORDS.map((r) => badge(r, f.words)),
    ...LESSONS.map((r) => badge(r, f.lessons)),
    ...TEXTS.map((r) => badge(r, f.texts)),
    ...CEFR_LEVELS.map((level) => levelBadge(level, f.levelsDone.includes(level))),
  ];
}

export type AchievementsSummary = { unlocked: number; total: number; pct: number };

export function summarize(list: Achievement[]): AchievementsSummary {
  const unlocked = list.filter((a) => a.pct === 100).length;
  return {
    unlocked,
    total: list.length,
    pct: list.length ? Math.round((unlocked / list.length) * 100) : 0,
  };
}
