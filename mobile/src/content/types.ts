/**
 * The shapes emitted by `content/merge-authored.py`, `content/build-grammar.py`
 * and `content/build-texts.py` into `assets/content/`.
 *
 * These mirror the JSON exactly. Where a field is optional here it is because
 * the builder genuinely omits it for some levels — `textTr` only exists on A1
 * and A2 reading passages, for instance — so the optionality is part of the
 * content contract, not defensive typing.
 */

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** A vocabulary card. Definitions are Turkish; there are no synonym lists. */
export type VocabCard = {
  id: string;
  word: string;
  pos: string;
  posLabel: string;
  cefr: Level;
  ipa?: string;
  order: number;
  tr: string;
  definition: string;
  definitionLang: 'tr';
  example: string;
  exampleTr: string;
};

export type GrammarExercise = {
  type: 'choice';
  text: string;
  options: string[];
  answer: number;
  note: string;
};

export type GrammarLesson = {
  id: string;
  level: Level;
  order: number;
  title: string;
  topic: string;
  canDo: string;
  covers: string[];
  concept: {
    summary: string;
    formula?: { left: string; right: string };
    table?: Record<string, string>[];
  };
  examples: { en: string; tr: string; note?: string }[];
  mistakes: { wrong: string; right: string; why: string }[];
  exercises: GrammarExercise[];
};

export type Gloss = { w: string; tr: string };

export type Question = {
  q: string;
  options: string[];
  answer: number;
  note: string;
};

type TextBase = {
  id: string;
  level: Level;
  order: number;
  title: string;
  titleEn: string;
  minutes: number;
  names?: string[];
  glossary: Gloss[];
};

export type ReadingItem = TextBase & {
  kind: 'reading';
  text: string;
  /** Full translation, present on A1 and A2 only. */
  textTr?: string;
  questions: Question[];
};

export type ListeningLine = { who: string; en: string; tr: string };

export type ListeningItem = TextBase & {
  kind: 'listening';
  speakers: string[];
  lines: ListeningLine[];
  questions: Question[];
};

export type SpeakingItem = TextBase & {
  kind: 'speaking';
  situation: string;
  situationTr: string;
  prompts: string[];
  promptsTr: string[];
  usefulPhrases: { en: string; tr: string }[];
};

export type PlacementQuestion = {
  level: Level;
  text: string;
  options: string[];
  answer: number;
  note: string;
};

export type Placement = {
  _meta: { title: string; titleEn: string; questions: number; note: string };
  questions: PlacementQuestion[];
};

export type VocabManifest = {
  vocabTotal: number;
  authored: number;
  levels: Record<Level, { total: number; authored: number }>;
  attribution: string[];
};

export type GrammarManifest = {
  levels: { level: Level; lessons: number; file: string }[];
};

export type TextsManifest = Record<
  'reading' | 'listening' | 'speaking',
  { level: Level; items: number; file: string }[]
> & {
  placement: { questions: number; file: string };
};
