/** Course content: CEFR levels, units, the unit map and the lesson breakdown. */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type CefrSummary = {
  title: string;
  description: string;
  /** Display string — "Kilitli" for levels that are not open yet. */
  progressLabel: string;
  units: number;
  words: number;
  time: string;
  /** Numeric progress driving the bar. */
  progress: number;
};

export const CEFR: Record<CefrLevel, CefrSummary> = {
  A1: {
    title: 'A1 · Başlangıç',
    description: 'Temel selamlaşma, sayılar, günlük kalıplar.',
    progressLabel: '%100',
    units: 12,
    words: 600,
    time: '6 sa',
    progress: 100,
  },
  A2: {
    title: 'A2 · Temel',
    description: 'Kısa diyaloglar, geçmiş zaman, yön sorma.',
    progressLabel: '%100',
    units: 16,
    words: 1100,
    time: '9 sa',
    progress: 100,
  },
  B1: {
    title: 'B1 · Orta',
    description: 'Fikir belirtme, deneyim anlatma, iş yazışması.',
    progressLabel: '%60',
    units: 20,
    words: 1800,
    time: '14 sa',
    progress: 60,
  },
  B2: {
    title: 'B2 · İyi',
    description: 'Tartışma, soyut konular, akademik metin.',
    progressLabel: '%12',
    units: 22,
    words: 2600,
    time: '18 sa',
    progress: 12,
  },
  C1: {
    title: 'C1 · İleri',
    description: 'Nüans, deyim, resmi sunum.',
    progressLabel: 'Kilitli',
    units: 24,
    words: 3400,
    time: '24 sa',
    progress: 0,
  },
  C2: {
    title: 'C2 · Ustalık',
    description: 'Anadile yakın akıcılık.',
    progressLabel: 'Kilitli',
    units: 20,
    words: 4000,
    time: '20 sa',
    progress: 0,
  },
};

export type UnitState = 'BİTTİ' | 'DEVAM' | 'YENİ' | 'KİLİTLİ';

export type Unit = {
  no: string;
  name: string;
  sub: string;
  progress: number;
  state: UnitState;
};

export const UNITS: Partial<Record<CefrLevel, Unit[]>> = {
  B1: [
    { no: '01', name: 'Günlük rutinler', sub: 'Present Simple · 24 kelime', progress: 100, state: 'BİTTİ' },
    { no: '10', name: 'Seyahat planları', sub: 'Future forms · 30 kelime', progress: 100, state: 'BİTTİ' },
    { no: '12', name: 'Deneyimler', sub: 'Present Perfect · 28 kelime', progress: 33, state: 'DEVAM' },
    { no: '13', name: 'Koşullar', sub: 'If clauses · 26 kelime', progress: 0, state: 'YENİ' },
    { no: '14', name: 'İş görüşmesi', sub: 'Modals · 32 kelime', progress: 0, state: 'KİLİTLİ' },
  ],
};

export type MapNodeKind = 'done' | 'now' | 'next' | 'lock';

export type MapNode = {
  no: string;
  name: string;
  sub: string;
  kind: MapNodeKind;
  icon: string;
};

export const MAP_NODES: MapNode[] = [
  { no: '01', name: 'Günlük rutinler', sub: '6/6 bölüm', kind: 'done', icon: '✓' },
  { no: '10', name: 'Seyahat planları', sub: '6/6 bölüm', kind: 'done', icon: '✓' },
  { no: '11', name: 'Alışkanlıklar', sub: '6/6 bölüm', kind: 'done', icon: '✓' },
  { no: '12', name: 'Deneyimler', sub: '2/6 bölüm · şimdi', kind: 'now', icon: '▶' },
  { no: '13', name: 'Koşullar', sub: 'Yeni', kind: 'next', icon: '13' },
  { no: '14', name: 'İş görüşmesi', sub: 'Kilitli', kind: 'lock', icon: '🔒' },
  { no: '15', name: 'Ünite sınavı', sub: 'Kilitli', kind: 'lock', icon: '🏆' },
];

/** Section of the open unit; `target` is the screen each section opens. */
export type LessonStep = {
  name: string;
  sub: string;
  target: 'Vocab' | 'Grammar' | 'Listen' | 'Read' | 'Speak';
  glyph: string;
  tag: string;
};

export const LESSON_STEPS: LessonStep[] = [
  { name: 'Kelime', sub: '28 yeni kelime', target: 'Vocab', glyph: '🔤', tag: 'BİTTİ' },
  { name: 'Gramer', sub: 'Present Perfect', target: 'Grammar', glyph: '📐', tag: 'DEVAM' },
  { name: 'Dinleme', sub: 'Havaalanı diyaloğu', target: 'Listen', glyph: '🎧', tag: '2 dk' },
  { name: 'Okuma', sub: 'Bir gezi günlüğü', target: 'Read', glyph: '📖', tag: '3 dk' },
  { name: 'Konuşma', sub: 'AI ile pratik', target: 'Speak', glyph: '🎙', tag: '4 dk' },
  { name: 'Tekrar', sub: 'Aralıklı tekrar', target: 'Vocab', glyph: '🔁', tag: '12 kart' },
];

export const OPEN_UNIT = {
  number: 'ÜNİTE 12',
  title: 'Present Perfect ile deneyimlerini anlat',
  meta: '6 bölüm · ~14 dakika · 240 XP',
  progress: 33,
};
