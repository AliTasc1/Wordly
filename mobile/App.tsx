import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/routes';
import { AppProvider } from './src/state/AppContext';
import { AuthProvider } from './src/state/AuthContext';
import { ToastHost } from './src/components/Toast';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

/**
 * Uygulamanın gövdesi.
 *
 * `ThemeProvider`in **içinde** duruyor, çünkü navigasyon teması ve durum
 * çubuğunun rengi de temayı izlemeli. Dışarıda kalsaydı açık temada üstteki
 * saat ve pil simgeleri beyaz kalır, beyaz zeminde görünmezdi.
 */
function Body({ fontsLoaded }: { fontsLoaded: boolean }) {
  const t = useTheme();

  const navTheme = React.useMemo(
    () => ({
      ...DefaultTheme,
      dark: t.dark,
      colors: {
        ...DefaultTheme.colors,
        background: t.colors.bg,
        card: t.colors.surface,
        text: t.colors.text,
      },
    }),
    [t],
  );

  return (
    <>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      {fontsLoaded ? (
        <AuthProvider>
          <AppProvider>
            <NavigationContainer ref={navigationRef} theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
            <ToastHost />
          </AppProvider>
        </AuthProvider>
      ) : (
        <View style={[styles.root, { backgroundColor: t.colors.bg }]} />
      )}
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Body fontsLoaded={fontsLoaded} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  // Kök zemini temasız: `ThemeProvider` bunun içinde duruyor, yani tema
  // burada henüz okunamıyor. Üstüne her hâlükârda temalı bir yüzey
  // geliyor; buradaki renk yalnızca ilk kareyi dolduruyor ve iki temada
  // da kabul edilebilir olması için nötr seçildi.
  root: { flex: 1, backgroundColor: '#05080F' },
});
