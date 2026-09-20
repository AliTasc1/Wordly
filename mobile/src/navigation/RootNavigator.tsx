import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from './TabBar';

import { SplashScreen } from '../screens/SplashScreen';
import { IntroScreen } from '../screens/IntroScreen';
import { GoalScreen } from '../screens/GoalScreen';
import { LevelTestScreen } from '../screens/LevelTestScreen';
import { TestResultScreen } from '../screens/TestResultScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CoachScreen } from '../screens/CoachScreen';
import { LearnScreen } from '../screens/LearnScreen';
import { CourseMapScreen } from '../screens/CourseMapScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { PlayScreen } from '../screens/PlayScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VocabScreen } from '../screens/VocabScreen';
import { GrammarScreen } from '../screens/GrammarScreen';
import { ListenScreen } from '../screens/ListenScreen';
import { ReadScreen } from '../screens/ReadScreen';
import { SpeakScreen } from '../screens/SpeakScreen';
import { WriteScreen } from '../screens/WriteScreen';
import { ArenaScreen } from '../screens/ArenaScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { DesignTokensScreen } from '../screens/DesignTokensScreen';
import { EmptyStatesScreen } from '../screens/EmptyStatesScreen';
import { ErrorStatesScreen } from '../screens/ErrorStatesScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { BoardJoinScreen } from '../screens/BoardJoinScreen';
import { useAuth } from '../state/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Yığın seçenekleri.
 *
 * `contentStyle` zemini veriyor ve zemin temaya bağlı, o yüzden sabit bir
 * nesne olamıyor. Kanca ile üretiliyor; navigasyon her yığını bir bileşen
 * içinde kuruyor, yani çağrı yeri zaten uygun.
 */
function useStackOptions() {
  const t = useTheme();
  return React.useMemo(
    () => ({ headerShown: false, contentStyle: { backgroundColor: t.colors.bg } }) as const,
    [t],
  );
}

/** Tabs carry their own stacks, so detail screens keep the bottom bar. */
function HomeStack() {
  const stackOptions = useStackOptions();
  return (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
  );
}

// Hata defteri kendi sekmesinde. Önce sağ altta yüzen bir düğmedeydi:
// ekranın köşesini kaplıyor ve neye yaradığı ancak dokununca anlaşılıyordu.
function CoachStack() {
  const stackOptions = useStackOptions();
  return (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Coach" component={CoachScreen} />
  </Stack.Navigator>
  );
}

function LearnStack() {
  const stackOptions = useStackOptions();
  return (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Learn" component={LearnScreen} />
    <Stack.Screen name="CourseMap" component={CourseMapScreen} />
    <Stack.Screen name="Lesson" component={LessonScreen} />
  </Stack.Navigator>
  );
}

function PlayStack() {
  const stackOptions = useStackOptions();
  return (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Play" component={PlayScreen} />
  </Stack.Navigator>
  );
}

function ProfileStack() {
  const stackOptions = useStackOptions();
  return (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen name="Stats" component={StatsScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
  );
}

function MainTabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.colors.bg } }}>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="LearnTab" component={LearnStack} />
      <Tab.Screen name="PlayTab" component={PlayStack} />
      <Tab.Screen name="CoachTab" component={CoachStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

/**
 * Root stack. Everything outside `Main` is a full-bleed screen — the design
 * hides the bottom bar on exactly these.
 */
export function RootNavigator() {
  const stackOptions = useStackOptions();
  const { recovering } = useAuth();

  // Sıfırlama bağlantısıyla açılan oturum, sahibi henüz şifresini bilmeyen
  // bir oturumdur. Geri kalan uygulamayı bu durumda göstermek, kullanıcının
  // şifreyi belirlemeden dolaşmasına ve sonra neden çıkış yapamadığını
  // anlamamasına yol açardı — tek çıkış yolu bu ekran.
  if (recovering) {
    return (
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={stackOptions}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="LevelTest" component={LevelTestScreen} />
      <Stack.Screen name="TestResult" component={TestResultScreen} />
      <Stack.Screen name="Main" component={MainTabs} />

      <Stack.Screen name="Vocab" component={VocabScreen} />
      <Stack.Screen name="Grammar" component={GrammarScreen} />
      <Stack.Screen name="Listen" component={ListenScreen} />
      <Stack.Screen name="Read" component={ReadScreen} />
      <Stack.Screen name="Speak" component={SpeakScreen} />
      <Stack.Screen name="Write" component={WriteScreen} />
      <Stack.Screen name="Arena" component={ArenaScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="BoardJoin" component={BoardJoinScreen} />

      {/* Design-system reference screens — not linked from the product UI. */}
      <Stack.Screen name="DesignTokens" component={DesignTokensScreen} />
      <Stack.Screen name="EmptyStates" component={EmptyStatesScreen} />
      <Stack.Screen name="ErrorStates" component={ErrorStatesScreen} />
    </Stack.Navigator>
  );
}
