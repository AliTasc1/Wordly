import { vocabOf, type Level, type VocabCard } from './index';

export type ArenaRound = {
  /** The word to spell, upper case. */
  target: string;
  /** Its Turkish meaning, used for the category hint. */
  tr: string;
  /** The wheel: the target's letters plus decoys, shuffled. */
  letters: string[];
  slots: number;
};

const LENGTH = { min: 5, max: 7 };
const DECOYS = 4;
/** Letters that make plausible decoys without being rare. */
const FILLER = 'ABCDEFGHILMNOPRSTU';

/**
 * A tiny deterministic generator.
 *
 * The round has to be stable across re-renders — React will call this again on
 * every state change, and a wheel that reshuffles under the player's finger is
 * unusable. Seeding from the round number gives the same wheel every time
 * while still differing between rounds.
 */
function rng(seed: number) {
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffle<T>(items: T[], next: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Single plain words only: no spaces, hyphens or accents on the wheel. */
const playable = (card: VocabCard) =>
  /^[a-z]+$/.test(card.word) &&
  card.word.length >= LENGTH.min &&
  card.word.length <= LENGTH.max;

/**
 * Builds round `n` for a level from that level's own vocabulary, so the arena
 * drills words the learner is actually meant to know rather than one fixed
 * puzzle.
 */
export function arenaRound(level: Level, round: number): ArenaRound {
  const next = rng(round + 1);
  const pool = vocabOf(level).filter(playable);

  // Every level has thousands of cards, but a level whose pool somehow came
  // back empty should still produce a playable round rather than crash.
  if (pool.length === 0) {
    return { target: 'TICKET', tr: 'bilet', letters: 'TICKETARNO'.split(''), slots: 6 };
  }

  const card = pool[Math.floor(next() * pool.length)];
  const target = card.word.toUpperCase();

  const decoys = Array.from({ length: DECOYS }, () =>
    FILLER[Math.floor(next() * FILLER.length)],
  );

  return {
    target,
    tr: card.tr,
    letters: shuffle([...target.split(''), ...decoys], next),
    slots: target.length,
  };
}
