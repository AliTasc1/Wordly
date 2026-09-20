import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Gradient } from './Gradient';
import { Txt } from './Txt';
import { HIT_SLOP, font } from '../theme/tokens';

type Base = {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The design's `style-active="transform:scale(.97)"`, applied consistently to
 * every pressable surface.
 */
export function Press({
  children,
  scale = 0.97,
  style,
  ...rest
}: PressableProps & { scale?: number; children: React.ReactNode }) {
  return (
    <Pressable
      hitSlop={HIT_SLOP}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        state.pressed && { transform: [{ scale }], opacity: 0.94 },
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

/** Full-width gradient CTA — `background:linear-gradient(135deg,#2E6BFF,#7C5CFF)`. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  height = 56,
  radius = 18,
  size = 16.5,
  colorsPair,
  shadow,
  style,
}: Base & {
  label: string;
  height?: number;
  radius?: number;
  size?: number;
  colorsPair?: readonly [string, string, ...string[]];
  shadow?: string;
}) {
  const t = useTheme();
  colorsPair ??= t.gradients.brand;
  shadow ??= t.shadows.ctaBrand;
  const styles = useStyles(makeStyles);
  if (disabled) {
    return (
      <View
        style={[
          styles.center,
          { height, borderRadius: radius, backgroundColor: t.alpha.w06 },
          style,
        ]}>
        <Txt f="m" s={size} w={800} c={t.colors.textDisabled}>
          {label}
        </Txt>
      </View>
    );
  }
  return (
    <Press onPress={onPress} style={style}>
      <Gradient
        colors={colorsPair}
        style={[styles.center, { height, borderRadius: radius, boxShadow: shadow }]}>
        <Txt f="m" s={size} w={800}>
          {label}
        </Txt>
      </Gradient>
    </Press>
  );
}

/** Outlined secondary action — `border:1px solid rgba(255,255,255,.12)`. */
export function GhostButton({
  label,
  onPress,
  height = 48,
  radius = 16,
  size = 14,
  color,
  fill = 'transparent',
  border,
  style,
}: Base & {
  label: string;
  height?: number;
  radius?: number;
  size?: number;
  color?: string;
  fill?: string;
  border?: string;
}) {
  const t = useTheme();
  color ??= t.colors.textSubtle;
  border ??= t.alpha.w12;
  const styles = useStyles(makeStyles);
  return (
    <Press
      onPress={onPress}
      style={[
        styles.center,
        {
          height,
          borderRadius: radius,
          backgroundColor: fill,
          borderWidth: 1,
          borderColor: border,
        },
        style,
      ]}>
      <Txt f="m" s={size} w={700} c={color}>
        {label}
      </Txt>
    </Press>
  );
}

/** The 38×38 `‹` control that heads most detail screens. */
export function BackButton({
  onPress,
  size = 38,
  strong = false,
  style,
}: Base & { size?: number; strong?: boolean }) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      style={[
        styles.center,
        {
          width: size,
          height: size,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: strong ? t.alpha.w14 : t.alpha.w10,
          backgroundColor: strong ? t.alpha.w07 : t.alpha.w04,
        },
        style,
      ]}>
      <Txt f="m" s={font.callout} w={700}>
        ‹
      </Txt>
    </Press>
  );
}

/** Small solid action button used inside cards (`Yap`, `Katıl`, `Başla`). */
export function TinyButton({
  label,
  onPress,
  bg,
  color,
  style,
}: Base & { label: string; bg?: string; color?: string }) {
  const t = useTheme();
  bg ??= t.colors.primary;
  color ??= t.colors.text;
  const styles = useStyles(makeStyles);
  return (
    <Press
      onPress={onPress}
      style={[styles.tiny, { backgroundColor: bg }, style]}>
      <Txt f="m" s={font.caption} w={800} c={color}>
        {label}
      </Txt>
    </Press>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    tiny: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
