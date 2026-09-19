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
import { CefrLevel } from '../data/curriculum';
import {
  clear,
  clearBase,
  deviceId,
  EMPTY,
  flush,
  load,
  loadBase,
  save,
  saveBase,
  streakOf,
  today,
  withMistake,
  type Mistake,
  type Saved,
} from './persist';
import { useAuth } from './AuthContext';
import { syncOnce } from '../server/sync';
import type { DefaultProfile, LocalState } from '../server/merge';
import type { ArenaMode } from '../content/arena-game';
import { setHapticsEnabled } from '../audio/feel';

/** Uygulama açıkken eşitleme aralığı. */
const SYNC_EVERY_MS = 5 * 60 * 1000;

/**
 * Kurulum varsayılanları.
 *
 * `merge` bunlara bakarak "bu cihazda gerçek bir tercih var mı, yoksa hâlâ
 * varsayılan mı?" diye soruyor: ikinci bir cihaza giriş yapıldığında
 * varsayılanların sunucudaki gerçek cevapları ezmemesi buna bağlı.
 */
const DEFAULT_PROFILE: DefaultProfile = {
  cefr: EMPTY.cefr,
  goals: EMPTY.goals,
  dailyTime: EMPTY.dailyTime,
  skills: EMPTY.skills,
};

export type { Mistake } from './persist';

export type Toast = { title: string; note: string } | null;

/** The decks a learner moves through, each tracked separately per level. */
export type DeckKind =
  | 'vocab'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing';

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

  /**
   * Ham konum tablosu. Profil ve istatistik ekranları toplamları buradan
   * türetiyor; tek tek `position()` çağırmak altı seviye × beş bölüm demek.
   */
  positions: Record<string, number>;

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

  /**
   * Kazanılan toplam XP ve kesintisiz çalışma serisi (gün).
   *
   * Bu üç alan **her zaman toplamı** veriyor: bu cihazın kazandığı artı
   * hesaba bağlı diğer cihazlardan eşitlenen. Sunucuya gönderilen pay ayrı
   * tutuluyor ve buradan hiç görünmüyor; ekranların yanlış tabloyu okuması
   * mümkün olmasın diye ayrım context'in içinde kalıyor.
   */
  xp: number;
  streak: number;
  /** Gün → o gün kazanılan XP. Haftalık grafik buradan çiziliyor. */
  daily: Record<string, number>;

  /** Yanlış yapılan sorular — hata defteri ve koç önerisi. */
  mistakes: Record<string, Mistake>;
  /** Bir yanlışı deftere işler. Aynı soru tekrarlanırsa sayacı artar. */
  recordMistake: (m: Omit<Mistake, 'times' | 'at'>) => void;
  /** Öğrenci "öğrendim" dediğinde kaydı siler. */
  forgetMistake: (key: string) => void;
  /**
   * XP verir ve bugünü çalışılan günlere işler.
   *
   * Ekranlar zaten "+20 XP" diye bildirim gösteriyordu; o XP'nin bir yere
   * yazılması gerekiyordu, yoksa her seferinde aynı sayıyı vaat edip
   * unutuyorduk.
   */
  award: (points: number) => void;

  /**
   * Arena'da oynanacak mod.
   *
   * Navigasyon parametre taşımıyor (`go(id)` yalnızca ekran kimliği alıyor),
   * bu yüzden Play merkezinden seçilen mod buradan geçiyor.
   */
  arenaMode: ArenaMode;
  setArenaMode: (mode: ArenaMode) => void;

  /** Titreşim açık mı. Ayarlardaki anahtar bunu gerçekten değiştiriyor. */
  haptics: boolean;
  setHaptics: (on: boolean) => void;

  /**
   * Günlük çalışma hedefi — kurulumda seçilen sürenin gerçek karşılığı.
   *
   * O soru uzun süre sorulup hiçbir yerde kullanılmıyordu. Artık süre
   * gerçekten ölçülüyor (`useStudyClock`) ve hedef buradan okunuyor.
   */
  goal: {
    /** Bugün çalışılan saniye — bu cihaz ve diğerleri birlikte. */
    studiedToday: number;
    /** Sayaç bağlamak için: alıştırma ekranları `useStudyClock`'a veriyor. */
    addStudy: (seconds: number) => void;
    activityAt: React.RefObject<number>;
    /** Hareket bildirimi — cevap, kart geçişi, ses. */
    ping: () => void;
  };

  /** Cihazdaki ilerlemeyi siler — Ayarlar'daki "ilerlemeyi sıfırla". */
  resetProgress: () => void;

  /**
   * Kaydedilen durumun tamamı — "Verilerimi indir" bunu dosyaya yazıyor.
   *
   * Tek tek alanları toplamak yerine bütünü veriyor: dışa aktarmanın eksik
   * kalmaması, elde tam nesnenin olmasına bağlı.
   */
  saved: Saved;

  /** Eşitleme durumu. Hesap yoksa hepsi boş kalır, bu bir hata değil. */
  sync: {
    running: boolean;
    /** Son başarılı eşitlemenin zamanı (ms), hiç olmadıysa null. */
    at: number | null;
    /** Son denemede sunucudan dönen sorun. Başarıda temizleniyor. */
    problem: string | null;
    /** Elle eşitleme — Ayarlar'daki düğme. */
    now: () => void;
  };
};

const AppContext = createContext<AppValue | null>(null);

const MAX_COMBO = 5;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
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
  const [xp, setXp] = useState(0);
  const [daily, setDaily] = useState<Record<string, number>>({});
  // Diğer cihazlardan eşitlenen gün başına XP. `daily` ile karıştırılmıyor:
  // `daily` sunucuya bu cihazın payı olarak gönderiliyor, uzaktan geleni
  // onun üstüne yazmak o payı her eşitlemede kendi üstüne eklerdi.
  const [remoteDaily, setRemoteDaily] = useState<Record<string, number>>({});
  // Çalışma süresi, XP ile aynı iki tabloyu kullanıyor: bu cihazın payı ve
  // diğerlerinden eşitlenen. Sebebi de aynı — kendi payımızı kendi üstümüze
  // eklemeden sunucuya gönderebilmek.
  const [studied, setStudied] = useState<Record<string, number>>({});
  const [remoteStudied, setRemoteStudied] = useState<Record<string, number>>({});

  /*
    Son hareket damgası.

    Sayaç buna bakıp duruyor: iki dakikadır hiçbir şey olmadıysa öğrenci
    çalışmıyordur. Durum değil ref, çünkü her cevapta yeniden çizim
    yaptırmasının bir sebebi yok — kimse bu sayıyı görmüyor.
  */
  const activityAt = useRef(Date.now());
  const ping = useCallback(() => {
    activityAt.current = Date.now();
  }, []);
  const [mistakes, setMistakes] = useState<Record<string, Mistake>>({});
  // Tercihlerin yaşı — profil çakışmasında "son yazan kazanır" için.
  const [profileAt, setProfileAt] = useState(0);
  // Kayıt okunana kadar hiçbir şey çizilmiyor: varsayılanlarla bir kare
  // çizmek, o karede yazılan bir değerin kaydı ezmesi demek olurdu.
  const [hydrated, setHydrated] = useState(false);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [joinedClub, setJoinedClub] = useState(true);
  // `plan` durumu buradaydı ("yearly" varsayılanıyla). Hiçbir şeyi
  // kilitlemiyordu ve hiçbir ekran okumuyordu: ödeme altyapısı gelince,
  // yetkiyi mağazadan okuyan gerçek hâliyle geri gelecek.
  const [arenaMode, setArenaMode] = useState<ArenaMode>('time');
  const [haptics, setHaptics] = useState(EMPTY.haptics);

  // Titreşim çağrıları bileşenlerin dışından da geliyor; ayar modül düzeyinde
  // bir bayrağa kopyalanıyor.
  useEffect(() => setHapticsEnabled(haptics), [haptics]);

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
      setter((cur) =>
        cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      );

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
      setXp(saved.xp);
      setDaily(saved.daily);
      setStudied(saved.studied);
      setRemoteStudied(saved.remoteStudied);
      setRemoteDaily(saved.remoteDaily);
      setMistakes(saved.mistakes);
      setProfileAt(saved.profileAt);
      setHaptics(saved.haptics);
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

  /*
    Kaydedilen durumun tamamı.

    Önce yalnızca kaydetme efektinin içinde kuruluyordu. "Verilerimi indir"
    de aynı nesneye ihtiyaç duyunca ikinci bir kopya yazmak gerekecekti ve
    iki ayrı yerde kurulan bir nesne, er geç birbirinden geride kalır:
    `Saved`'e eklenen bir alan birine yazılır, diğerine unutulur. Tek yerde
    kuruluyor.
  */
  const saved = useMemo<Saved>(
    () => ({
      goals,
      dailyTime,
      skills,
      cefr,
      testResult,
      positions,
      savedWords,
      arena: { xp: game.arenaXp, found: game.arenaFound, streak: game.arenaStreak },
      xp,
      daily,
      mistakes,
      remoteDaily,
      studied,
      remoteStudied,
      profileAt,
      haptics,
    }),
    [
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
      xp,
      daily,
      mistakes,
      remoteDaily,
      studied,
      remoteStudied,
      profileAt,
      haptics,
    ],
  );

  // Değişen her şeyi yaz. save() içeride geciktiriyor, bu yüzden her kart
  // geçişinde çağrılması sorun değil.
  useEffect(() => {
    if (!hydrated) return;
    save(saved);
  }, [hydrated, saved]);

  // Uygulama arka plana alınırken bekleyen yazma hemen yapılır; aksi hâlde
  // son dersin ilerlemesi 700 ms'lik gecikmenin içinde kaybolabilir.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') void flush();
    });
    return () => sub.remove();
  }, []);

  const award = useCallback((points: number) => {
    // Her XP bir hareket: sayaç öğrencinin orada olduğunu buradan anlıyor.
    activityAt.current = Date.now();
    setXp((n) => n + points);
    // Gün tablosu sınırsız büyümesin; seri ve haftalık grafik için son bir
    // yıldan fazlası zaten kullanılmıyor.
    setDaily((cur) => {
      const next = { ...cur, [today()]: (cur[today()] ?? 0) + points };
      const keys = Object.keys(next).sort();
      for (const old of keys.slice(0, Math.max(keys.length - 400, 0))) delete next[old];
      return next;
    });
  }, []);

  /** Sayaçtan gelen saniyeleri bugüne yazar. */
  const addStudy = useCallback((seconds: number) => {
    setStudied((cur) => {
      const next = { ...cur, [today()]: (cur[today()] ?? 0) + seconds };
      const keys = Object.keys(next).sort();
      for (const old of keys.slice(0, Math.max(keys.length - 400, 0))) delete next[old];
      return next;
    });
  }, []);

  const recordMistake = useCallback((m: Omit<Mistake, 'times' | 'at'>) => {
    setMistakes((cur) => withMistake(cur, m));
  }, []);

  const forgetMistake = useCallback((key: string) => {
    setMistakes((cur) => {
      const next = { ...cur };
      delete next[key];
      return next;
    });
  }, []);

  /**
   * Tercih değiştiğinde yaşını da işaretler.
   *
   * Profil çakışması "son yazan kazanır" kuralıyla çözülüyor; damgayı
   * koymazsak iki dolu profilden hangisinin yeni olduğu bilinemez ve
   * öğrencinin az önce verdiği cevap, aylar önceki bir kayda yenilir.
   */
  const touchProfile = useCallback(() => setProfileAt(Date.now()), []);

  const resetProgress = useCallback(() => {
    void clear();
    void clearBase();
    setXp(0);
    setDaily({});
    setStudied({});
    setRemoteStudied({});
    setRemoteDaily({});
    setMistakes({});
    setGoals(EMPTY.goals);
    setDailyTime(EMPTY.dailyTime);
    setSkills(EMPTY.skills);
    setCefr(EMPTY.cefr);
    setTestResult(null);
    setPositions({});
    setSavedWords([]);
    setProfileAt(0);
    setHaptics(EMPTY.haptics);
    setGame((g) => ({ ...g, arenaXp: 0, arenaFound: 0, arenaStreak: 0, combo: 1 }));
  }, []);

  /**
   * Ekranlara verilen gün tablosu: bu cihaz artı diğerleri.
   *
   * Birleştirme burada yapılıyor ki hiçbir ekranın "hangi tablo?" diye
   * sorması gerekmesin — dışarıdan tek bir doğru tablo görünüyor.
   */
  const dailyTotal = useMemo(() => {
    const total: Record<string, number> = { ...daily };
    for (const [day, points] of Object.entries(remoteDaily)) {
      total[day] = (total[day] ?? 0) + points;
    }
    return total;
  }, [daily, remoteDaily]);

  /** Bugün çalışılan toplam saniye: bu cihaz artı diğerleri. */
  const studiedToday = useMemo(
    () => (studied[today()] ?? 0) + (remoteStudied[today()] ?? 0),
    [studied, remoteStudied],
  );

  const goal = useMemo(
    () => ({ studiedToday, addStudy, activityAt, ping }),
    [studiedToday, addStudy, ping],
  );

  const xpTotal = useMemo(
    () => xp + Object.values(remoteDaily).reduce((n, v) => n + v, 0),
    [xp, remoteDaily],
  );

  // ------------------------------------------------------------- eşitleme

  const userId = session?.user.id ?? null;
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncAt, setSyncAt] = useState<number | null>(null);
  const [syncProblem, setSyncProblem] = useState<string | null>(null);

  // Tek tur çalışsın: iki eşitleme aynı anda koşarsa ikisi de aynı tabanı
  // okur ve ikincisi birincinin yazdığını görmeden karar verir.
  const inFlight = useRef(false);
  const device = useRef<string | null>(null);

  // `runSync` bağımlılıklarına bütün durumu koymak, her XP'de yeni bir
  // fonksiyon üretip zamanlayıcıları sıfırlardı. Güncel durumu ref ile
  // okuyoruz; efektler sabit kalıyor.
  const snapshot = useRef<LocalState | null>(null);
  snapshot.current = {
    positions,
    savedWords,
    mistakes,
    daily,
    studied,
    cefr,
    goals,
    dailyTime,
    skills,
    testResult,
    arena: { xp: game.arenaXp, found: game.arenaFound, streak: game.arenaStreak },
    profileAt,
  };

  const runSync = useCallback(async () => {
    const id = userId;
    const local = snapshot.current;
    if (!id || !local || inFlight.current) return;

    inFlight.current = true;
    setSyncRunning(true);
    try {
      if (!device.current) device.current = await deviceId();
      const base = await loadBase(id);
      const outcome = await syncOnce(id, device.current, local, base, DEFAULT_PROFILE);

      if (!outcome.ok) {
        setSyncProblem(outcome.reason);
        return;
      }

      const { applied } = outcome;
      setPositions(applied.positions);
      setSavedWords(applied.savedWords);
      setMistakes(applied.mistakes);
      setRemoteDaily(applied.remoteDaily);
      setRemoteStudied(applied.remoteStudied);

      if (applied.profile) {
        setCefr(applied.profile.cefr as CefrLevel);
        setGoals(applied.profile.goals);
        setDailyTime(applied.profile.dailyTime);
        setSkills(applied.profile.skills);
        setTestResult(applied.profile.testResult as TestResult | null);
        setGame((g) => ({
          ...g,
          arenaXp: applied.profile!.arena.xp,
          arenaFound: applied.profile!.arena.found,
          arenaStreak: applied.profile!.arena.streak,
        }));
        setProfileAt(applied.profile.profileAt);
      }

      // Taban ancak yazma bittikten sonra kaydediliyor. Önce kaydedilseydi
      // yarıda kalan bir yazma "gönderildi" sayılır ve o satırlar bir daha
      // hiç gönderilmezdi.
      await saveBase(id, outcome.base);
      setSyncProblem(null);
      setSyncAt(Date.now());
    } finally {
      inFlight.current = false;
      setSyncRunning(false);
    }
  }, [userId]);

  /**
   * Ne zaman eşitleniyor.
   *
   * Her değişiklikte değil: eşitlemenin sonucu yerel duruma yazılıyor ve o
   * yazma yeni bir eşitlemeyi tetiklerdi — kendi kuyruğunu kovalayan bir
   * döngü. Bunun yerine belirli anlar seçildi; ikisinin arasında kaybolan
   * bir şey yok, çünkü ilerleme zaten cihazda duruyor.
   *
   * - Giriş yapıldığında (ya da uygulama girişliyken açıldığında)
   * - Uygulama önplana geldiğinde ve arka plana giderken
   * - Açıkken beş dakikada bir
   */
  useEffect(() => {
    if (!hydrated || !userId) return;

    void runSync();
    const every = setInterval(() => void runSync(), SYNC_EVERY_MS);

    // Diske yazmayı burada değil, yukarıdaki dinleyici yapıyor; o hesapsız
    // kullanımda da çalışmak zorunda.
    const sub = AppState.addEventListener('change', () => void runSync());

    return () => {
      clearInterval(every);
      sub.remove();
    };
  }, [hydrated, userId, runSync]);

  // Çıkış yapılınca diğer cihazların XP'si ekranda kalmamalı: o hesabın
  // verisi, bu cihazın değil.
  useEffect(() => {
    if (!userId) setRemoteDaily({});
  }, [userId]);

  const value = useMemo<AppValue>(
    () => ({
      toast,
      fire,
      goals,
      toggleGoal: (goal: string) => {
        toggle(setGoals)(goal);
        touchProfile();
      },
      dailyTime,
      setDailyTime: (t: string) => {
        setDailyTime(t);
        touchProfile();
      },
      skills,
      toggleSkill: (skill: string) => {
        toggle(setSkills)(skill);
        touchProfile();
      },
      cefr,
      setCefr: (level: CefrLevel) => {
        setCefr(level);
        touchProfile();
      },
      testResult,
      setTestResult: (result: TestResult) => {
        setTestResult(result);
        touchProfile();
      },
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
      positions,
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
      xp: xpTotal,
      streak: streakOf(Object.keys(dailyTotal)),
      daily: dailyTotal,
      mistakes,
      recordMistake,
      forgetMistake,
      award,
      arenaMode,
      setArenaMode,
      haptics,
      setHaptics,
      resetProgress,
      saved,
      goal,
      sync: {
        running: syncRunning,
        at: syncAt,
        problem: syncProblem,
        now: () => void runSync(),
      },
    }),
    [
      toast,
      fire,
      goals,
      dailyTime,
      skills,
      cefr,
      testResult,
      game,
      positions,
      savedWords,
      liked,
      following,
      joinedClub,
      xpTotal,
      dailyTotal,
      mistakes,
      recordMistake,
      forgetMistake,
      award,
      resetProgress,
      saved,
      touchProfile,
      syncRunning,
      syncAt,
      syncProblem,
      runSync,
    ],
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
