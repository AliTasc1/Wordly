/** Every question, exercise and scripted answer in the app. */

export type TestQuestion = {
  type: string;
  prompt: string;
  /** Plain text; the emphasised word is carried separately so RN can style it. */
  text: string;
  emphasis?: string;
  options: string[];
  answer: number;
  level: string;
  /** Countdown shown next to the question, e.g. `00:18`. */
  timer: string;
  audio: boolean;
  note: string;
};

export const TEST_QUESTIONS: TestQuestion[] = [
  {
    type: 'GRAMER',
    prompt: 'Doğru seçeneği işaretle',
    text: 'She ___ in London since 2019.',
    options: ['has lived', 'lived', 'is living', 'live'],
    answer: 0,
    level: 'B1',
    timer: '18',
    audio: false,
    note: '“Since + geçmiş bir tarih” Present Perfect ister.',
  },
  {
    type: 'KELİME',
    prompt: 'Anlamı en yakın kelime',
    text: 'The instructions were rather vague.',
    emphasis: 'vague',
    options: ['unclear', 'strict', 'loud', 'simple'],
    answer: 0,
    level: 'B2',
    timer: '22',
    audio: false,
    note: 'vague = belirsiz, muğlak.',
  },
  {
    type: 'DİNLEME',
    prompt: 'Kaydı dinle ve cevapla',
    text: 'Konuşmacı toplantıyı neden erteliyor?',
    options: ['Uçuşu gecikti', 'Hasta', 'Rapor bitmedi', 'Müşteri iptal etti'],
    answer: 2,
    level: 'B1',
    timer: '30',
    audio: true,
    note: '“I still need to finish the report” ipucuydu.',
  },
];

/** Level test result: overall CEFR + per-skill breakdown. */
export const TEST_RESULT = {
  level: 'B1+',
  ringPct: 62,
  summary:
    'Günlük konuşmaları rahat anlıyorsun. Konuşma akıcılığın diğer becerilerinin gerisinde.',
  strength: { label: 'GÜÇLÜ YANIN', value: 'Kelime · B2' },
  focus: { label: 'ODAK ALANIN', value: 'Konuşma · A2+' },
  skills: [
    { name: 'Kelime', level: 'B2', pct: 82 },
    { name: 'Gramer', level: 'B1', pct: 64 },
    { name: 'Okuma', level: 'B1+', pct: 72 },
    { name: 'Dinleme', level: 'B1', pct: 62 },
    { name: 'Konuşma', level: 'A2+', pct: 44 },
    { name: 'Yazma', level: 'B1', pct: 60 },
  ],
};

/** Grammar screen — concept card plus exercise 3/4. */
export const GRAMMAR = {
  level: 'B1',
  title: 'Gramer · Present Perfect',
  flow: 'Kavram → Örnek → Alıştırma → Meydan okuma',
  concept: {
    kicker: 'KAVRAM',
    leadIn: 'Bitmiş bir eylemin ',
    highlight: 'şimdiye etkisi',
    leadOut: ' varsa Present Perfect kullanılır.',
    formulaLeft: 'have / has',
    formulaRight: 'V3',
    exampleBefore: '"I ',
    exampleHighlight: 'have visited',
    exampleAfter: ' London twice."',
    exampleNote: 'Londra’ya iki kez gittim. (ne zaman değil, deneyim önemli)',
  },
  exercise: {
    kicker: 'ALIŞTIRMA 3/4',
    question: 'Doğru cümleyi seç.',
    options: [
      'I have finish my homework.',
      'I have finished my homework.',
      'I has finished my homework.',
    ],
    answer: 1,
    correctTitle: 'Doğru! +25 XP',
    wrongTitle: 'Yanlış — “have + V3” gerekiyor',
    note: 'Yardımcı fiil “have/has” + fiilin 3. hali (finished). “finish” yalın haliyle kullanılmaz.',
    toast: { title: '+25 XP · Doğru', note: '3/4 alıştırma tamam' },
  },
  challenge: {
    title: 'Mini meydan okuma',
    sub: '60 saniyede 8 cümle · 2× XP',
    cta: 'Başla',
  },
};

/** Listening screen — player, transcript and the cloze exercise. */
export const LISTENING = {
  title: 'Dinleme · Havaalanında',
  meta: 'B1 · 0:48 · İngiliz aksanı',
  elapsed: '0:18',
  duration: '0:48',
  progress: 38,
  speeds: ['1.0×', '0.75×', '1.25×'],
  transcript: {
    before: '"Good afternoon. I\'m afraid the flight to Berlin ',
    highlight: 'has been delayed',
    after: ' by two hours. We\'ll issue meal vouchers at the desk."',
    translation:
      'İyi günler. Berlin uçuşu iki saat gecikti. Yemek fişlerini bankoda vereceğiz.',
  },
  cloze: {
    kicker: 'BOŞLUĞU DOLDUR',
    before: 'The flight ',
    after: ' by two hours.',
    placeholder: '________',
    options: ['has been delayed', 'delayed', 'was delay'],
    answer: 0,
    correctToast: { title: '+15 XP · Doğru', note: 'Edilgen + present perfect' },
    wrongToast: { title: 'Tekrar dene', note: '“delay” burada edilgen olmalı' },
  },
};

/** Reading screen — passage, tappable words and the comprehension question. */
export const READING = {
  title: 'Okuma · A Long Journey',
  meta: '182 kelime · ~2 dk · B1',
  art: 'görsel: tren penceresi fotoğrafı',
  passage: {
    a: 'Last summer I took the train from İstanbul to Sofia. The ',
    word1: 'journey',
    b: ' lasted eleven hours, and I ',
    word2: 'barely',
    c: ' slept. Still, watching the countryside change slowly was worth every minute.',
  },
  hint: 'Bilmediğin kelimeye dokun: anlamı, telaffuzu ve çeviri anında açılır, kelime defterine eklenir.',
  taps: {
    journey: { title: 'journey · /ˈdʒɜːni/', note: 'yolculuk — kelime defterine eklendi' },
    barely: { title: 'barely · /ˈbeəli/', note: 'neredeyse hiç — kelime defterine eklendi' },
  },
  question: {
    kicker: 'ANLAMA SORUSU',
    prompt: 'Yazar yolculuk hakkında ne düşünüyor?',
    options: [
      'Yorucuydu ama değdi',
      'Tamamen zaman kaybıydı',
      'Beklediğinden kısa sürdü',
    ],
    answer: 0,
    toast: { title: '+20 XP · Doğru', note: '“Still, it was worth every minute”' },
  },
  stats: [
    { value: '148', label: 'kelime/dk' },
    { value: '%92', label: 'anlama' },
    { value: '3', label: 'yeni kelime' },
  ],
};

/** Duel question and the scripted opponent. */
export const DUEL = {
  me: { name: 'Ali', meta: 'B1+ · Lv 24', initials: 'A' },
  opponent: { name: 'Gözde', meta: 'B2 · Lv 31', initials: 'G' },
  time: '07',
  questionNo: 'SORU 8/12',
  prompt: 'Boşluğu doldur',
  question: 'If I ___ more time, I would travel the world.',
  options: ['had', 'have', 'would have', 'having'],
  answer: 0,
  waiting: 'Gözde cevaplıyor…',
  answered: 'Gözde: doğru cevap · +1',
};
