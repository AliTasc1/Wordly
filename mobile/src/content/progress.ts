import { levelSummary } from './summary';
import type { Level } from './index';
import { CEFR_LEVELS } from '../data/curriculum';
import type { DeckKind } from '../state/AppContext';

/**
 * Öğrencinin gerçekte nerede olduğu.
 *
 * Profil ve istatistik ekranları bugüne kadar tasarımdan gelen sabit sayılar
 * gösteriyordu ("1.284 kelime", "%68 düello kazanma"). Artık ilerleme cihazda
 * saklandığına göre bu sayıların uydurma olmasına gerek yok: hepsi kaydedilen
 * konumlardan ve manifestlerden türetiliyor.
 *
 * Buradaki her sayı, öğrencinin gerçekten gördüğü kart ve ders sayısıdır —
 * "öğrendiği" değil. İkisini karıştırmamak önemli: aralıklı tekrar henüz yok,
 * ve bir kartı bir kez görmek onu bilmek demek değil.
 */

export type DeckProgress = {
  kind: DeckKind;
  label: string;
  done: number;
  total: number;
  pct: number;
};

const LABELS: Record<DeckKind, string> = {
  vocab: 'Kelime',
  grammar: 'Gramer',
  reading: 'Okuma',
  listening: 'Dinleme',
  speaking: 'Konuşma',
  writing: 'Yazma',
};

function sizes(level: Level): Record<DeckKind, number> {
  const s = levelSummary(level);
  return {
    vocab: s.words,
    grammar: s.lessons,
    reading: s.reading,
    listening: s.listening,
    speaking: s.speaking,
    writing: s.writing,
  };
}

/** Bir seviyedeki beş bölümün durumu, sırayla. */
export function deckProgress(
  positions: Record<string, number>,
  level: Level,
): DeckProgress[] {
  const total = sizes(level);
  return (Object.keys(LABELS) as DeckKind[]).map((kind) => {
    const size = total[kind];
    // Konum, sıradaki kartın sırasıdır; yani o kadarı görülmüştür.
    const done = Math.min(positions[`${kind}:${level}`] ?? 0, size);
    return {
      kind,
      label: LABELS[kind],
      done,
      total: size,
      pct: size ? Math.round((done / size) * 100) : 0,
    };
  });
}

export type Totals = { words: number; lessons: number; texts: number };

/** Bütün seviyeler toplamı — profil kartındaki üç sayı. */
export function totals(positions: Record<string, number>): Totals {
  const sum = (kind: DeckKind) =>
    CEFR_LEVELS.reduce((n, level) => {
      const size = sizes(level)[kind];
      return n + Math.min(positions[`${kind}:${level}`] ?? 0, size);
    }, 0);

  return {
    words: sum('vocab'),
    lessons: sum('grammar'),
    texts: sum('reading') + sum('listening') + sum('speaking'),
  };
}

/** "1.284" — binlik ayracı nokta, Türkçe yazım. */
export function tr(n: number): string {
  return n.toLocaleString('tr-TR');
}
