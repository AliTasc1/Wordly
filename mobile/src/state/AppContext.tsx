import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { PLAN_IDS, PlanId } from '../data/subscription';
import { CefrLevel } from '../data/curriculum';
import { clear, EMPTY, flush, load, save, type Saved } from './persist';

export type Toast = { title: string; note: string } | null;

/** The decks a learner moves through, each tracked separately per level. */
export type DeckKind = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking';

/**
 * What the placement test found. Navigation carries no params, so the result
 * travels from the test screen to the result screen through here.
 */
export type TestResult = {
  level: CefrLevel;
  byLevel: Record<CefrLevel, { right: number; asked: number }>;
  right: number;
  asked: number;
};

type GameState = {
  combo: number;
  arenaXp: number;
  arenaFound: number;
  arenaStreak: number;
  duelMe: number;
  duelOp: number;
};

type AppValue = {
  /** Transient toast, auto-dismissed after 2.2s — the design's `fire()`. */
  toast: Toast;
  fire: (title: string, note: string) => void;

  // Onboarding answers
  goals: string[];
  toggleGoal: (goal: string) => void;
  dailyTime: string;
  setDailyTime: (t: string) => void;
  skills: string[];
  toggleSkill: (skill: string) => void;

  // Curriculum
  cefr: CefrLevel;
  setCefr: (level: CefrLevel) => void;

  /** Null until the placement test has actually been taken. */
  testResult: TestResult | null;
  setTestResult: (result: TestResult) => void;

  // Game progress, shared between the arena and duels
  game: GameState;
  arenaSolved: (gained: number) => void;
  arenaMissed: () => void;
  duelCorrect: () => void;

  /**
   * Where the learner is in each deck. Keyed by kind *and* level, because
   * switching to A2 and back should not lose the B1 position, and the reading
   * position has nothing to do with the vocabulary one.
   */
  position: (kind: DeckKind, level: CefrLevel) => number;
  setPosition: (kind: DeckKind, level: CefrLevel, index: number) => void;

  /** Saved words, by card id. */
  savedWords: string[];
  isSaved: (id: string) => boolean;
  toggleSavedWord: (id: string) => void;
  liked: boolean;
  toggleLiked: () => void;
  following: boolean;
  toggleFollowing: () => void;
  joinedClub: boolean;
  toggleJoinedClub: () => void;
  plan: PlanId;
  setPlan: (p: PlanId) => void;

  /** Cihazdaki ilerlemeyi siler — Ayarlar'daki "ilerlemeyi sıfırla". */
  resetProgress: () => void;
};

const AppContext = createContext<AppValue | null>(null);

const MAX_COMBO = 5;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((title: string, note: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ title, note });
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const [goals, setGoals] = useState<string[]>(EMPTY.goals);
  const [dailyTime, setDailyTime] = useState(EMPTY.dailyTime);
  const [skills, setSkills] = useState<string[]>(EMPTY.skills);
  const [cefr, setCefr] = useState<CefrLevel>(EMPTY.cefr);

  // Arena sayaçları sıfırdan başlıyor. Önceki değerler (3 bulunan, 4 seri)
  // tasarım maketinden kalmıştı; uygulamayı ilk açan kişiye hiç oynamadığı
  // bir serinin sayısını göstermek onu kandırmaktır. Düello sayaçları
  // örnek veriden geliyor, o ekran henüz gerçek değil.
  const [game, setGame] = useState<GameState>({
    combo: 1,
    arenaXp: 0,
    arenaFound: 0,
    arenaStreak: 0,
    duelMe: 7,
    duelOp: 6,
  });

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [savedWords, setSavedWords] = useState<string[]>([]);
  // Kayıt okunana kadar hiçbir şey çizilmiyor: varsayılanlarla bir kare
  // çizmek, o karede yazılan bir değerin kaydı ezmesi demek olurdu.
  const [hydrated, setHydrated] = useState(false);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [joinedClub, setJoinedClub] = useState(true);
  const [plan, setPlan] = useState<PlanId>(PLAN_IDS.yearly);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));

  // Açılışta kaydı oku.
  useEffect(() => {
    let alive = true;
    load().then((saved) => {
      if (!alive) return;
      setGoals(saved.goals);
      setDailyTime(saved.dailyTime);
      setSkills(saved.skills);
      setCefr(saved.cefr);
      setTestResult(saved.testResult);
      setPositions(saved.positions);
      setSavedWords(saved.savedWords);
      setGame((g) => ({
        ...g,
        arenaXp: saved.arena.xp,
        arenaFound: saved.arena.found,
        arenaStreak: saved.arena.streak,
      }));
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Değişen her şeyi yaz. save() içeride geciktiriyor, bu yüzden her kart
  // geçişinde çağrılması sorun değil.
  useEffect(() => {
    if (!hydrated) return;
    const state: Saved = {
      goals,
      dailyTime,
      skills,
      cefr,
      testResult,
      positions,
      savedWords,
      arena: { xp: game.arenaXp, found: game.arenaFound, streak: game.arenaStreak },
    };
    save(state);
  }, [
    hydrated,
    goals,
    dailyTime,
    skills,
    cefr,
    testResult,
    positions,
    savedWords,
    game.arenaXp,
    game.arenaFound,
    game.arenaStreak,
  ]);

  // Uygulama arka plana alınırken bekleyen yazma hemen yapılır; aksi hâlde
  // son dersin ilerlemesi 700 ms'lik gecikmenin içinde kaybolabilir.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') void flush();
    });
    return () => sub.remove();
  }, []);

  const resetProgress = useCallback(() => {
    void clear();
    setGoals(EMPTY.goals);
    setDailyTime(EMPTY.dailyTime);
    setSkills(EMPTY.skills);
    setCefr(EMPTY.cefr);
    setTestResult(null);
    setPositions({});
    setSavedWords([]);
    setGame((g) => ({ ...g, arenaXp: 0, arenaFound: 0, arenaStreak: 0, combo: 1 }));
  }, []);

  const value = useMemo<AppValue>(
    () => ({
      toast,
      fire,
      goals,
      toggleGoal: toggle(setGoals),
      dailyTime,
      setDailyTime,
      skills,
      toggleSkill: toggle(setSkills),
      cefr,
      setCefr,
      testResult,
      setTestResult,
      game,
      arenaSolved: (gained: number) =>
        setGame((g) => ({
          ...g,
          arenaXp: g.arenaXp + gained,
          combo: Math.min(g.combo + 1, MAX_COMBO),
          arenaFound: g.arenaFound + 1,
          arenaStreak: g.arenaStreak + 1,
        })),
      arenaMissed: () => setGame((g) => ({ ...g, combo: 1 })),
      duelCorrect: () =>
        setGame((g) => ({
          ...g,
          duelMe: g.duelMe + 1,
          combo: Math.min(g.combo + 1, MAX_COMBO),
        })),
      position: (kind: DeckKind, level: CefrLevel) => positions[`${kind}:${level}`] ?? 0,
      setPosition: (kind: DeckKind, level: CefrLevel, index: number) =>
        setPositions((cur) => ({ ...cur, [`${kind}:${level}`]: index })),
      savedWords,
      isSaved: (id: string) => savedWords.includes(id),
      toggleSavedWord: (id: string) =>
        setSavedWords((cur) =>
          cur.includes(id) ? cur.filter((w) => w !== id) : [...cur, id],
        ),
      liked,
      toggleLiked: () => setLiked((v) => !v),
      following,
      toggleFollowing: () => setFollowing((v) => !v),
      joinedClub,
      toggleJoinedClub: () => setJoinedClub((v) => !v),
      plan,
      setPlan,
      resetProgress,
    }),
    [toast, fire, goals, dailyTime, skills, cefr, testResult, game, positions, savedWords, liked, following, joinedClub, plan, resetProgress],
  );

  // Kayıt okunmadan çizmiyoruz; bu birkaç milisaniye sürüyor ve uygulama
  // zaten açılış ekranından başlıyor.
  if (!hydrated) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
