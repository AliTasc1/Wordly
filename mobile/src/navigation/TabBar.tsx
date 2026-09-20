import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { TabName } from './routes';
import { font } from '../theme/tokens';

/*
  Beş sekme, hepsi gerçek bir şeye gidiyor.

  "Sosyal" sekmesi çıkarıldı: akış, arkadaş ve kulüp yazılmadı, dolayısıyla o
  sekme çoğunlukla "burada henüz bir şey yok" diyen bir ekrana gidiyordu.
  Olmayan bir bölüm için sekme ayırmak, menüdeki en değerli yerlerden birini
  bir açıklamaya harcamaktı. Çalışan tek sosyal şey — haftalık liderlik —
  ana sayfadan ve profilden erişiliyor.

  Yerine hata defteri geldi. Daha önce sağ altta yüzen bir düğmedeydi:
  ekranın köşesini kaplıyor, parmağın altında kalıyor ve neye yaradığı
  yalnızca dokununca anlaşılıyordu. Menüde adıyla duruyor.
*/
const ITEMS: { name: TabName; icon: string; label: string }[] = [
  { name: 'HomeTab', icon: '🏠', label: 'Ana' },
  { name: 'LearnTab', icon: '📚', label: 'Öğren' },
  { name: 'PlayTab', icon: '🎮', label: 'Oyna' },
  { name: 'CoachTab', icon: '📓', label: 'Defter' },
  { name: 'ProfileTab', icon: '👤', label: 'Profil' },
];

/** Alt menü. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom || 22;
  const activeName = state.routes[state.index]?.name;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.bar, { height: 66 + bottomPad, paddingBottom: bottomPad }]}>
        {Platform.OS !== 'android' ? (
          <BlurView intensity={30} tint={t.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : null}
        <Gradient
          deg={180}
          colors={t.gradients.tabBar}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        {ITEMS.map((item) => {
          const focused = activeName === item.name;
          return (
            <Press
              key={item.name}
              scale={0.96}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={item.label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes.find((r) => r.name === item.name)?.key ?? '',
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) navigation.navigate(item.name);
              }}
              style={styles.item}>
              {focused ? (
                <Gradient deg={90} colors={t.gradients.progress} style={styles.dot} />
              ) : null}
              <Txt s={font.headline} style={styles.icon}>
                {item.icon}
              </Txt>
              <Txt s={font.label} w={700} c={focused ? t.colors.text : t.colors.textGhost}>
                {item.label}
              </Txt>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    bar: {
      flexDirection: 'row',
      paddingTop: 8,
      paddingHorizontal: 10,
      borderTopWidth: 1,
      borderTopColor: t.alpha.w08,
      overflow: 'hidden',
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    icon: { lineHeight: 22 },
    dot: { position: 'absolute', top: 2, width: 22, height: 3, borderRadius: 9 },
  });
