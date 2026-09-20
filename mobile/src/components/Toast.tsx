import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gradient } from './Gradient';
import { Txt } from './Txt';
import { font, radii } from '../theme/tokens';
import { useApp } from '../state/AppContext';

/**
 * Global toast, positioned and animated like the design's `wup` keyframe
 * (10px rise + fade over 300ms).
 */
export function ToastHost() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: toast ? 1 : 0,
      duration: toast ? 300 : 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [toast, anim]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          top: Math.max(64, insets.top + 10),
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        },
      ]}>
      <View style={styles.card}>
        <Gradient colors={t.gradients.cyan} deg={135} style={styles.icon}>
          <Txt f="m" s={font.body} w={800}>
            ✓
          </Txt>
        </Gradient>
        <View style={styles.body}>
          <Txt f="m" s={font.body} w={800}>
            {toast.title}
          </Txt>
          <Txt s={font.caption} c={t.colors.textMuted}>
            {toast.note}
          </Txt>
        </View>
      </View>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 18, right: 18, zIndex: 90 },
    card: {
      backgroundColor: tint(t.colors.sunken, 0.94),
      borderWidth: 1,
      borderColor: tint(t.colors.accent, 0.4),
      borderRadius: radii.input,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      boxShadow: t.shadows.toast,
    },
    icon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1 },
  });
