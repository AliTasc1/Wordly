/**
 * Harf Arenası'nın tur kuralları.
 *
 * Ağdan ve React'ten bağımsız; `arena-game.test.ts` içinde sınanıyor.
 *
 * Bu dosya var, çünkü arena bugüne kadar **oyun değildi**. Ekranda "SÜRE
 * ATAĞI · 00:24" yazıyordu ama o sayı sabit bir metindi: süre hiç işlemiyor,
 * tur hiç bitmiyordu. "3 hata hakkın var" diyen mod, hatayı saymıyordu.
 * Kelime sayacının yanındaki "/8" hedefi de uydurmaydı.
 *
 * Başlıkta gösterilen XP ise ömür boyu toplamdı ve bu turun skoruymuş gibi
 * duruyordu: öğrenci ilk kelimesini bulduğunda binlerce puanla başlamış
 * görünüyordu.
 */

export type ArenaMode = 'time' | 'survival' | 'solo';

export type ModeRule = {
  key: ArenaMode;
  name: string;
  sub: string;
  /** Turun süresi (saniye); sınırsızsa null. */
  seconds: number | null;
  /** Kaç hata hakkı var; sınırsızsa null. */
  lives: number | null;
  /** Kazanılan XP'nin çarpanı. */
  multiplier: number;
};

/**
 * Var olan üç mod.
 *
 * Play merkezi altı mod listeliyordu: Düello, Battle Royale ve Takım Savaşı
 * hiç yazılmamıştı — üçü de gerçek zamanlı sunucu eşleşmesi istiyor.
 * Olmayan bir şeyi menüye koymak, kullanıcıya dokunduğunda öğreneceği bir
 * söz vermektir.
 */
export const MODE_RULES: Record<ArenaMode, ModeRule> = {
  time: {
    key: 'time',
    name: 'Süre Atağı',
    sub: '60 saniye, sınırsız kelime',
    seconds: 60,
    lives: null,
    multiplier: 2,
  },
  survival: {
    key: 'survival',
    name: 'Hayatta Kalma',
    sub: '3 hata hakkın var',
    seconds: null,
    lives: 3,
    multiplier: 1,
  },
  solo: {
    key: 'solo',
    name: 'Solo',
    sub: 'Baskı yok, sadece pratik',
    seconds: null,
    lives: null,
    multiplier: 1,
  },
};

export const MODE_LIST: ModeRule[] = [
  MODE_RULES.time,
  MODE_RULES.survival,
  MODE_RULES.solo,
];

/** Doğru kelimenin taban ödülü; kombo ve mod çarpanı bunun üstüne biniyor. */
export const BASE_REWARD = 50;

/** Kombonun üst sınırı: sonsuz büyüyen bir çarpan oyunu anlamsızlaştırır. */
export const MAX_COMBO = 5;

export type ArenaState = {
  mode: ArenaMode;
  /** Kalan süre; süresiz modda null. */
  secondsLeft: number | null;
  /** Kalan hak; sınırsız modda null. */
  livesLeft: number | null;
  /** Bu turda bulunan kelime sayısı. */
  found: number;
  /** Bu turda yapılan hata sayısı. */
  missed: number;
  /** **Bu turda** kazanılan XP. Ömür boyu toplam ayrı tutuluyor. */
  xp: number;
  combo: number;
  /** En uzun doğru dizisi — tur sonunda gösteriliyor. */
  bestStreak: number;
  streak: number;
  over: boolean;
  /** Tur neden bitti; sürüyorsa null. */
  reason: 'time' | 'lives' | 'quit' | null;
};

export function startRound(mode: ArenaMode): ArenaState {
  const rule = MODE_RULES[mode];
  return {
    mode,
    secondsLeft: rule.seconds,
    livesLeft: rule.lives,
    found: 0,
    missed: 0,
    xp: 0,
    combo: 1,
    bestStreak: 0,
    streak: 0,
    over: false,
    reason: null,
  };
}

/** Bir doğru kelimenin kazandırdığı XP. */
export function rewardFor(state: ArenaState): number {
  return BASE_REWARD * state.combo * MODE_RULES[state.mode].multiplier;
}

export function onSolved(state: ArenaState): ArenaState {
  if (state.over) return state;
  const streak = state.streak + 1;
  return {
    ...state,
    found: state.found + 1,
    xp: state.xp + rewardFor(state),
    combo: Math.min(state.combo + 1, MAX_COMBO),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  };
}

export function onMissed(state: ArenaState): ArenaState {
  if (state.over) return state;
  const livesLeft = state.livesLeft == null ? null : state.livesLeft - 1;
  // Hak biterse tur orada biter. Sınırsız modda hata yalnızca komboyu kırar.
  const dead = livesLeft != null && livesLeft <= 0;
  return {
    ...state,
    missed: state.missed + 1,
    combo: 1,
    streak: 0,
    livesLeft,
    over: dead,
    reason: dead ? 'lives' : null,
  };
}

/** Bir saniye geçti. Süresiz modda hiçbir şey değişmiyor. */
export function onTick(state: ArenaState): ArenaState {
  if (state.over || state.secondsLeft == null) return state;
  const secondsLeft = Math.max(state.secondsLeft - 1, 0);
  return {
    ...state,
    secondsLeft,
    over: secondsLeft === 0,
    reason: secondsLeft === 0 ? 'time' : null,
  };
}

/** Öğrenci turu erken bitirdi. */
export function quitRound(state: ArenaState): ArenaState {
  return state.over ? state : { ...state, over: true, reason: 'quit' };
}

/** Sayacın dolduğu oran, 0–1. Süresiz modda 0. */
export function timePct(state: ArenaState): number {
  const total = MODE_RULES[state.mode].seconds;
  if (total == null || state.secondsLeft == null) return 0;
  return state.secondsLeft / total;
}

/** `00:07` biçiminde sayaç. */
export function clock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

/**
 * Tur sonu başlığı.
 *
 * Hiç kelime bulunmadıysa kutlamıyoruz. "Harika!" demek, öğrenciye
 * yapmadığı bir şey için iltifat etmektir ve bir sonraki gerçek övgüyü de
 * değersizleştirir.
 */
export function summaryTitle(state: ArenaState): string {
  if (state.found === 0) return 'Bu tur boş geçti';
  if (state.reason === 'time') return 'Süre doldu';
  if (state.reason === 'lives') return 'Hakların bitti';
  return 'Tur bitti';
}
