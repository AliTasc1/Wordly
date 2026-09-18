import {
  grammarManifest,
  textsManifest,
  vocabManifest,
  writingOf,
  type Level,
} from './index';

export type LevelSummary = {
  words: number;
  lessons: number;
  reading: number;
  listening: number;
  speaking: number;
  /** Yazma setleri; henüz yazılmamış seviyelerde sıfır. */
  writing: number;
  /** Rough total study time, in minutes. */
  minutes: number;
};

/**
 * Bir yazma seti için varsayılan süre: sekiz cümleyi çevir, sonra kısa metni
 * yaz. Yazmak seçmekten yavaştır, o yüzden gramer dersinden uzun tutuldu.
 */
const WRITING_MINUTES = 12;

/**
 * Minutes assumed for one grammar lesson: read the rule, work the exercises.
 * Every lesson now carries ten exercises rather than five, so the old estimate
 * of six minutes was counting a lesson that no longer exists.
 */
const GRAMMAR_MINUTES = 9;

/**
 * What a level actually contains, read off the build manifests.
 *
 * The design shipped round numbers — 600 words for A1, 4.000 for C2. The real
 * shape is different and worth showing honestly: C1 and C2 hold *fewer* cards
 * than B2 (1.040 and 929 against 2.755), because the advanced levels add
 * precision rather than bulk. Everything here comes from the manifests, so no
 * content file is parsed to draw a summary card.
 */
export function levelSummary(level: Level): LevelSummary {
  const vocab = vocabManifest().levels[level];
  const grammar = grammarManifest().levels.find((l) => l.level === level);
  const texts = textsManifest();

  const row = (kind: 'reading' | 'listening' | 'speaking') =>
    texts[kind].find((l) => l.level === level);

  const lessons = grammar?.lessons ?? 0;
  const writing = writingOf(level).length;
  const minutes =
    lessons * GRAMMAR_MINUTES +
    writing * WRITING_MINUTES +
    (row('reading')?.minutes ?? 0) +
    (row('listening')?.minutes ?? 0) +
    (row('speaking')?.minutes ?? 0);

  return {
    words: vocab?.total ?? 0,
    lessons,
    reading: row('reading')?.items ?? 0,
    listening: row('listening')?.items ?? 0,
    speaking: row('speaking')?.items ?? 0,
    writing,
    minutes,
  };
}

/** "3 sa 20 dk" / "50 dk" — the summary card's time figure. */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} dk`;
  return rest ? `${hours} sa ${rest} dk` : `${hours} sa`;
}
