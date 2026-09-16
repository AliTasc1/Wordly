import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from '../components/Gradient';
import { Press } from '../components/Buttons';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, shadows } from '../theme/tokens';
import { go, TabName } from './routes';

const ITEMS: { name: TabName; icon: string; label: string }[] = [
  { name: 'HomeTab', icon: '🏠', label: 'Ana' },
  { name: 'LearnTab', icon: '📚', label: 'Öğren' },
  { name: 'PlayTab', icon: '🎮', label: 'Oyna' },
  { name: 'SocialTab', icon: '👥', label: 'Sosyal' },
  { name: 'ProfileTab', icon: '👤', label: 'Profil' },
];

/**
 * Bottom navigation plus the AI coach FAB, both lifted from the design's
 * `showNav` block.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = insets.bottom || 22;
  const activeName = state.routes[state.index]?.name;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Press
        onPress={() => go('coach')}
        scale={0.94}
        accessibilityRole="button"
        accessibilityLabel="AI Koç"
        style={[styles.fabWrap, { bottom: bottomPad + 74 }]}>
        <Gradient colors={gradients.violetCyan} style={styles.fab}>
          <Txt f="m" s={15} w={800}>
            AI
          </Txt>
        </Gradient>
      </Press>

      <View style={[styles.bar, { height: 66 + bottomPad, paddingBottom: bottomPad }]}>
        {Platform.OS !== 'android' ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <Gradient
          deg={180}
          colors={['rgba(7,10,20,.4)', 'rgba(7,10,20,.96)', 'rgba(7,10,20,.96)']}
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
                <Gradient deg={90} colors={gradients.progress} style={styles.dot} />
              ) : null}
              <Txt s={19} style={styles.icon}>
                {item.icon}
              </Txt>
              <Txt s={10.5} w={700} c={focused ? colors.text : colors.textGhost}>
                {item.label}
              </Txt>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: alpha.w08,
    overflow: 'hidden',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  icon: { lineHeight: 22 },
  dot: { position: 'absolute', top: 2, width: 22, height: 3, borderRadius: 9 },
  fabWrap: { position: 'absolute', right: 16 },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: alpha.w18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.fab,
  },
});
