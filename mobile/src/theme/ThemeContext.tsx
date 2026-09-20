import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, type Theme, type ThemeName } from './theme';
import { THEME_KEY, parseMode, resolveName, type ThemeMode } from './mode';

export type { ThemeMode };

type ThemeValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Kayıt okunana kadar true. Ekranı kilitlemiyor. */
  loading: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (alive) setModeState(parseMode(raw));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    // Yazma başarısız olursa tema bu oturumda yine değişiyor; bir sonraki
    // açılışta eski tercihe dönüyor. Kullanıcıyı hata bildirimiyle
    // rahatsız etmeye değmez.
    void AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const theme = useMemo(() => THEMES[resolveName(mode, system)], [mode, system]);

  const value = useMemo(
    () => ({ theme, mode, setMode, loading }),
    [theme, mode, setMode, loading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme, ThemeProvider içinde çağrılmalı.');
  return ctx.theme;
}

export function useThemeMode(): Omit<ThemeValue, 'theme'> {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode, ThemeProvider içinde çağrılmalı.');
  const { theme: _theme, ...rest } = ctx;
  return rest;
}

/**
 * Temaya bağlı stil sayfası.
 *
 * `StyleSheet.create` modül yüklenirken bir kez çalışıyor; içindeki renkler
 * de o an donuyor. Tema değişince o stiller değişmiyordu — uygulamayı
 * yeniden başlatmadan.
 *
 * Bu kanca stil sayfasını temanın kendisine bağlıyor. Sayfa tema başına bir
 * kez üretilip saklanıyor: iki tema var, yani ekran ömrü boyunca en fazla
 * iki kez. Her çizimde yeniden üretmek, `StyleSheet.create`in varlık
 * sebebini ortadan kaldırırdı.
 */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T,
): T {
  const theme = useTheme();
  const cache = React.useRef(new Map<ThemeName, T>());

  let sheet = cache.current.get(theme.name);
  if (!sheet) {
    sheet = factory(theme);
    cache.current.set(theme.name, sheet);
  }
  return sheet;
}
