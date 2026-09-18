import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from './TabBar';
import { colors } from '../theme/tokens';

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
import { SocialScreen } from '../screens/SocialScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ClubsScreen } from '../screens/ClubsScreen';
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
import { DuelScreen } from '../screens/DuelScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { PostScreen } from '../screens/PostScreen';
import { ClubDetailScreen } from '../screens/ClubDetailScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { DesignTokensScreen } from '../screens/DesignTokensScreen';
import { EmptyStatesScreen } from '../screens/EmptyStatesScreen';
import { ErrorStatesScreen } from '../screens/ErrorStatesScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { NewPasswordScreen } from '../screens/NewPasswordScreen';
import { useAuth } from '../state/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const;

/** Tabs carry their own stacks, so detail screens keep the bottom bar. */
const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Coach" component={CoachScreen} />
  </Stack.Navigator>
);

const LearnStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Learn" component={LearnScreen} />
    <Stack.Screen name="CourseMap" component={CourseMapScreen} />
    <Stack.Screen name="Lesson" component={LessonScreen} />
  </Stack.Navigator>
);

const PlayStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Play" component={PlayScreen} />
  </Stack.Navigator>
);

const SocialStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Social" component={SocialScreen} />
    <Stack.Screen name="Friends" component={FriendsScreen} />
    <Stack.Screen name="Clubs" component={ClubsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen name="Stats" component={StatsScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="LearnTab" component={LearnStack} />
      <Tab.Screen name="PlayTab" component={PlayStack} />
      <Tab.Screen name="SocialTab" component={SocialStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

/**
 * Root stack. Everything outside `Main` is a full-bleed screen — the design
 * hides the bottom bar on exactly these.
 */
export function RootNavigator() {
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
      <Stack.Screen name="Duel" component={DuelScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal' }}
      />

      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Design-system reference screens — not linked from the product UI. */}
      <Stack.Screen name="DesignTokens" component={DesignTokensScreen} />
      <Stack.Screen name="EmptyStates" component={EmptyStatesScreen} />
      <Stack.Screen name="ErrorStates" component={ErrorStatesScreen} />
    </Stack.Navigator>
  );
}
