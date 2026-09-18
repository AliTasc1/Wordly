/**
 * The single door between the app and `assets/content/`.
 *
 * Metro resolves `require` at build time, so every content file has to be
 * named in a literal require somewhere — a computed path would silently
 * produce an empty bundle. Hence the explicit tables below. The requires sit
 * inside the accessor functions rather than at module scope so that opening
 * the Home screen does not parse four megabytes of B2 vocabulary.
 *
 * Nothing here caches: Metro's module registry already evaluates each file
 * once and returns the same object afterwards.
 */

import type {
  GrammarLesson,
  GrammarManifest,
  Level,
  ListeningItem,
  Placement,
  ReadingItem,
  SpeakingItem,
  TextsManifest,
  VocabCard,
  VocabManifest,
  WritingSet,
} from './types';

export * from './types';

const VOCAB = {
  A1: () => require('../../assets/content/a1.json') as VocabCard[],
  A2: () => require('../../assets/content/a2.json') as VocabCard[],
  B1: () => require('../../assets/content/b1.json') as VocabCard[],
  B2: () => require('../../assets/content/b2.json') as VocabCard[],
  C1: () => require('../../assets/content/c1.json') as VocabCard[],
  C2: () => require('../../assets/content/c2.json') as VocabCard[],
};

const GRAMMAR = {
  A1: () => require('../../assets/content/grammar-a1.json') as GrammarLesson[],
  A2: () => require('../../assets/content/grammar-a2.json') as GrammarLesson[],
  B1: () => require('../../assets/content/grammar-b1.json') as GrammarLesson[],
  B2: () => require('../../assets/content/grammar-b2.json') as GrammarLesson[],
  C1: () => require('../../assets/content/grammar-c1.json') as GrammarLesson[],
  C2: () => require('../../assets/content/grammar-c2.json') as GrammarLesson[],
};

const READING = {
  A1: () => require('../../assets/content/reading-a1.json') as ReadingItem[],
  A2: () => require('../../assets/content/reading-a2.json') as ReadingItem[],
  B1: () => require('../../assets/content/reading-b1.json') as ReadingItem[],
  B2: () => require('../../assets/content/reading-b2.json') as ReadingItem[],
  C1: () => require('../../assets/content/reading-c1.json') as ReadingItem[],
  C2: () => require('../../assets/content/reading-c2.json') as ReadingItem[],
};

const LISTENING = {
  A1: () => require('../../assets/content/listening-a1.json') as ListeningItem[],
  A2: () => require('../../assets/content/listening-a2.json') as ListeningItem[],
  B1: () => require('../../assets/content/listening-b1.json') as ListeningItem[],
  B2: () => require('../../assets/content/listening-b2.json') as ListeningItem[],
  C1: () => require('../../assets/content/listening-c1.json') as ListeningItem[],
  C2: () => require('../../assets/content/listening-c2.json') as ListeningItem[],
};

const SPEAKING = {
  A1: () => require('../../assets/content/speaking-a1.json') as SpeakingItem[],
  A2: () => require('../../assets/content/speaking-a2.json') as SpeakingItem[],
  B1: () => require('../../assets/content/speaking-b1.json') as SpeakingItem[],
  B2: () => require('../../assets/content/speaking-b2.json') as SpeakingItem[],
  C1: () => require('../../assets/content/speaking-c1.json') as SpeakingItem[],
  C2: () => require('../../assets/content/speaking-c2.json') as SpeakingItem[],
};

/**
 * Yazma setleri.
 *
 * Diğer tabloların aksine burada altı seviye yok: yazma bölümü seviye seviye
 * yazılıyor ve henüz tamamlanmayan seviyenin dosyası yok. Metro `require`'ı
 * derleme anında çözdüğü için olmayan bir dosyayı burada anmak paketi bozar —
 * bu yüzden tabloya yalnızca üretilmiş dosyalar giriyor ve `writingOf` eksik
 * seviyede boş liste döndürüyor. Seviye tamamlandıkça buraya bir satır eklenir.
 */
const WRITING: Partial<Record<Level, () => WritingSet[]>> = {
  A1: () => require('../../assets/content/writing-a1.json') as WritingSet[],
  A2: () => require('../../assets/content/writing-a2.json') as WritingSet[],
  B1: () => require('../../assets/content/writing-b1.json') as WritingSet[],
};

export const vocabOf = (level: Level): VocabCard[] => VOCAB[level]();
export const grammarOf = (level: Level): GrammarLesson[] => GRAMMAR[level]();
export const readingOf = (level: Level): ReadingItem[] => READING[level]();
export const listeningOf = (level: Level): ListeningItem[] => LISTENING[level]();
export const speakingOf = (level: Level): SpeakingItem[] => SPEAKING[level]();

/** Bir seviyenin yazma setleri; o seviye henüz yazılmadıysa boş liste. */
export const writingOf = (level: Level): WritingSet[] => WRITING[level]?.() ?? [];

/** Yazma bölümü bu seviyede var mı — ekranlar buna göre kilitli gösteriyor. */
export const hasWriting = (level: Level): boolean => level in WRITING;

export const placement = (): Placement =>
  require('../../assets/content/placement.json') as Placement;

export const vocabManifest = (): VocabManifest =>
  require('../../assets/content/manifest.json') as VocabManifest;

export const grammarManifest = (): GrammarManifest =>
  require('../../assets/content/grammar-manifest.json') as GrammarManifest;

export const textsManifest = (): TextsManifest =>
  require('../../assets/content/texts-manifest.json') as TextsManifest;

/**
 * The attribution lines the Settings screen must show. `LICENSES.md` requires
 * these to be visible in the app before release, because the word list and the
 * pronunciation data are third-party.
 */
export const attribution = (): string[] => vocabManifest().attribution;

/** Looks a lesson up by id across every level, for deep links and resume. */
export function grammarLesson(id: string): GrammarLesson | undefined {
  const level = id.slice(0, 2).toUpperCase() as Level;
  if (!(level in GRAMMAR)) return undefined;
  return grammarOf(level).find((lesson) => lesson.id === id);
}

export function readingItem(id: string): ReadingItem | undefined {
  const level = id.slice(0, 2).toUpperCase() as Level;
  if (!(level in READING)) return undefined;
  return readingOf(level).find((item) => item.id === id);
}

export function listeningItem(id: string): ListeningItem | undefined {
  const level = id.slice(0, 2).toUpperCase() as Level;
  if (!(level in LISTENING)) return undefined;
  return listeningOf(level).find((item) => item.id === id);
}

export function speakingItem(id: string): SpeakingItem | undefined {
  const level = id.slice(0, 2).toUpperCase() as Level;
  if (!(level in SPEAKING)) return undefined;
  return speakingOf(level).find((item) => item.id === id);
}
