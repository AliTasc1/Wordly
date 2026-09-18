import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * The 34 screen ids from the design, kept as the app's vocabulary so screen
 * code reads the way the prototype's `this.go('lesson')` did.
 */
export type ScreenId =
  | 'splash'
  | 'onb'
  | 'goal'
  | 'test'
  | 'result'
  | 'home'
  | 'learn'
  | 'map'
  | 'lesson'
  | 'vocab'
  | 'grammar'
  | 'listen'
  | 'read'
  | 'speak'
  | 'write'
  | 'coach'
  | 'play'
  | 'arena'
  | 'duel'
  | 'board'
  | 'social'
  | 'post'
  | 'friends'
  | 'clubs'
  | 'club'
  | 'notif'
  | 'profile'
  | 'achv'
  | 'stats'
  | 'sub'
  | 'paywall'
  | 'settings'
  | 'tokens'
  | 'empty'
  | 'errors'
  // Hesap akışı. Tasarımın 34 ekranında yoktu; hesap sonradan eklendi ve
  // isteğe bağlı olduğu için ürünün ana akışına değil, kenarına oturuyor.
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'newpass';

export type TabName = 'HomeTab' | 'LearnTab' | 'PlayTab' | 'SocialTab' | 'ProfileTab';

/**
 * Where each design screen lives in the navigator. Screens nested under a tab
 * keep the bottom bar visible; root screens are full-bleed — exactly the
 * split the design encodes in its `TABS` array.
 */
type Target = { root: string } | { tab: TabName; screen: string };

export const TARGETS: Record<ScreenId, Target> = {
  splash: { root: 'Splash' },
  onb: { root: 'Intro' },
  goal: { root: 'Goal' },
  test: { root: 'LevelTest' },
  result: { root: 'TestResult' },

  home: { tab: 'HomeTab', screen: 'Home' },
  coach: { tab: 'HomeTab', screen: 'Coach' },
  learn: { tab: 'LearnTab', screen: 'Learn' },
  map: { tab: 'LearnTab', screen: 'CourseMap' },
  lesson: { tab: 'LearnTab', screen: 'Lesson' },
  play: { tab: 'PlayTab', screen: 'Play' },
  social: { tab: 'SocialTab', screen: 'Social' },
  friends: { tab: 'SocialTab', screen: 'Friends' },
  clubs: { tab: 'SocialTab', screen: 'Clubs' },
  profile: { tab: 'ProfileTab', screen: 'Profile' },
  achv: { tab: 'ProfileTab', screen: 'Achievements' },
  stats: { tab: 'ProfileTab', screen: 'Stats' },
  sub: { tab: 'ProfileTab', screen: 'Subscription' },
  settings: { tab: 'ProfileTab', screen: 'Settings' },

  vocab: { root: 'Vocab' },
  grammar: { root: 'Grammar' },
  listen: { root: 'Listen' },
  read: { root: 'Read' },
  speak: { root: 'Speak' },
  write: { root: 'Write' },
  arena: { root: 'Arena' },
  duel: { root: 'Duel' },
  board: { root: 'Leaderboard' },
  post: { root: 'Post' },
  club: { root: 'ClubDetail' },
  notif: { root: 'Notifications' },
  paywall: { root: 'Paywall' },
  tokens: { root: 'DesignTokens' },
  empty: { root: 'EmptyStates' },
  errors: { root: 'ErrorStates' },

  signin: { root: 'SignIn' },
  signup: { root: 'SignUp' },
  forgot: { root: 'ForgotPassword' },
  newpass: { root: 'NewPassword' },
};

export const navigationRef = createNavigationContainerRef();

function args(id: ScreenId): [string, object | undefined] {
  const target = TARGETS[id];
  if ('root' in target) return [target.root, undefined];
  return ['Main', { screen: target.tab, params: { screen: target.screen } }];
}

/** Navigate to a design screen from anywhere. */
export function go(id: ScreenId) {
  if (!navigationRef.isReady()) return;
  const [name, params] = args(id);
  // The navigator is typed structurally at the container; screen ids are the
  // checked surface, so the dispatch itself is cast once here.
  (navigationRef.navigate as (n: string, p?: object) => void)(name, params);
}

/** Replace the whole stack — used when entering or leaving the signed-in app. */
export function reset(id: ScreenId) {
  if (!navigationRef.isReady()) return;
  const [name, params] = args(id);
  navigationRef.reset({ index: 0, routes: [{ name, params }] });
}
