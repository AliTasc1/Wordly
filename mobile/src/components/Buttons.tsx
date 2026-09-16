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
import { alpha, colors, gradients, HIT_SLOP, shadows } from '../theme/tokens';

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
  colorsPair = gradients.brand,
  shadow = shadows.ctaBrand,
  style,
}: Base & {
  label: string;
  height?: number;
  radius?: number;
  size?: number;
  colorsPair?: readonly [string, string, ...string[]];
  shadow?: string;
}) {
  if (disabled) {
    return (
      <View
        style={[
          styles.center,
          { height, borderRadius: radius, backgroundColor: alpha.w06 },
          style,
        ]}>
        <Txt f="m" s={size} w={800} c={colors.textDisabled}>
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
  color = colors.textSubtle,
  fill = 'transparent',
  border = alpha.w12,
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
          borderColor: strong ? alpha.w14 : alpha.w10,
          backgroundColor: strong ? alpha.w07 : alpha.w04,
        },
        style,
      ]}>
      <Txt f="m" s={16} w={700}>
        ‹
      </Txt>
    </Press>
  );
}

/** Small solid action button used inside cards (`Yap`, `Katıl`, `Başla`). */
export function TinyButton({
  label,
  onPress,
  bg = colors.primary,
  color = colors.text,
  style,
}: Base & { label: string; bg?: string; color?: string }) {
  return (
    <Press
      onPress={onPress}
      style={[styles.tiny, { backgroundColor: bg }, style]}>
      <Txt f="m" s={11.5} w={800} c={color}>
        {label}
      </Txt>
    </Press>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  tiny: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
