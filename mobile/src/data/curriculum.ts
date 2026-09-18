/** CEFR levels and the one-line description shown for each. */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Editorial copy only. Counts and progress used to live here as round
 * invented numbers; they now come from the build manifests via
 * `src/content/summary.ts` and from the learner's real position.
 */
export type CefrSummary = {
  title: string;
  description: string;
};

export const CEFR: Record<CefrLevel, CefrSummary> = {
  A1: {
    title: 'A1 · Başlangıç',
    description: 'Temel selamlaşma, sayılar, günlük kalıplar.',
  },
  A2: {
    title: 'A2 · Temel',
    description: 'Kısa diyaloglar, geçmiş zaman, yön sorma.',
  },
  B1: {
    title: 'B1 · Orta',
    description: 'Fikir belirtme, deneyim anlatma, iş yazışması.',
  },
  B2: {
    title: 'B2 · İyi',
    description: 'Tartışma, soyut konular, akademik metin.',
  },
  C1: {
    title: 'C1 · İleri',
    description: 'Nüans, deyim, resmi sunum.',
  },
  C2: {
    title: 'C2 · Ustalık',
    description: 'Anadile yakın akıcılık.',
  },
};
