import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PLAN_IDS, PlanId } from '../data/subscription';
import { CefrLevel } from '../data/curriculum';

export type Toast = { title: string; note: string } | null;

/** The decks a learner moves through, each tracked separately per level. */
export type DeckKind = 'vocab' | 'grammar' | 'reading' | 'listening' | 'speaking';

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

  const [goals, setGoals] = useState<string[]>(['Kariyer']);
  const [dailyTime, setDailyTime] = useState('10 dk');
  const [skills, setSkills] = useState<string[]>(['Konuşma', 'Kelime']);
  const [cefr, setCefr] = useState<CefrLevel>('B1');

  const [game, setGame] = useState<GameState>({
    combo: 1,
    arenaXp: 0,
    arenaFound: 3,
    arenaStreak: 4,
    duelMe: 7,
    duelOp: 6,
  });

  const [positions, setPositions] = useState<Record<string, number>>({});
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [joinedClub, setJoinedClub] = useState(true);
  const [plan, setPlan] = useState<PlanId>(PLAN_IDS.yearly);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));

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
    }),
    [toast, fire, goals, dailyTime, skills, cefr, game, positions, savedWords, liked, following, joinedClub, plan],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
