import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Gradient } from './Gradient';
import { Press } from './Buttons';
import { Txt } from './Txt';
import { font, radii } from '../theme/tokens';

/**
 * The design's repeated card surface:
 * `background:linear-gradient(180deg,#121A31,#0E1426);border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:16px`
 */
export function Card({
  children,
  style,
  gap = 12,
  padding = 16,
  radius = radii.section,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  padding?: number;
  radius?: number;
}) {
  const t = useTheme();
  return (
    <Gradient
      deg={180}
      colors={t.gradients.card}
      style={[
        {
          borderWidth: 1,
          borderColor: t.alpha.w08,
          borderRadius: radius,
          padding,
          gap,
        },
        style,
      ]}>
      {children}
    </Gradient>
  );
}

/** Flat surface card — `background:#0E1426;border:1px solid rgba(255,255,255,.07)`. */
export function Panel({
  children,
  style,
  gap,
  padding = 15,
  radius = radii.tile,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
  padding?: number;
  radius?: number;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.alpha.w07,
          borderRadius: radius,
          padding,
          gap,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/**
 * The tinted rounded icon square that fronts almost every list row.
 * `background:<tint>22;border:1px solid <tint>4d`
 */
export function IconTile({
  glyph,
  tint,
  size = 44,
  radius = 15,
  fontSize,
  solid,
  style,
}: {
  glyph: string;
  tint: string;
  size?: number;
  radius?: number;
  fontSize?: number;
  /** Filled variant (no tint wash) for "in progress" rows. */
  solid?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const body = (
    <Txt s={fontSize ?? Math.round(size * 0.41)} c={t.colors.text}>
      {glyph}
    </Txt>
  );
  const box: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  };
  if (solid) {
    return (
      <Gradient colors={solid} style={[box, style]}>
        {body}
      </Gradient>
    );
  }
  return (
    <View
      style={[
        box,
        { backgroundColor: `${tint}22`, borderWidth: 1, borderColor: `${tint}4d` },
        style,
      ]}>
      {body}
    </View>
  );
}

/** Status pill — `background:<tint>1f;border:1px solid <tint>59;color:<tint>`. */
export function Pill({
  label,
  tint,
  size = 10.5,
  style,
}: {
  label: string;
  tint: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: radii.chip,
          backgroundColor: `${tint}1f`,
          borderWidth: 1,
          borderColor: `${tint}59`,
        },
        style,
      ]}>
      <Txt f="mono" s={size} w={800} c={tint}>
        {label}
      </Txt>
    </View>
  );
}

/** Compact monospace tag used on list rows (`ODAK`, `CANLI`, `SENİN`). */
export function Tag({
  label,
  tint,
  size = 9.5,
  style,
}: {
  label: string;
  tint: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  if (!label) return null;
  return (
    <View
      style={[
        {
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 7,
          backgroundColor: `${tint}1f`,
        },
        style,
      ]}>
      <Txt f="mono" s={size} w={700} c={tint} ls={0.08}>
        {label}
      </Txt>
    </View>
  );
}

/** Selectable chip — `chip(active)` in the design's logic. */
export function Chip({
  label,
  active,
  onPress,
  padV = 10,
  padH = 14,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  padV?: number;
  padH?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Press
      onPress={onPress}
      scale={0.98}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[
        {
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: radii.lg,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          ...(active
            ? {
                backgroundColor: tint(t.colors.primary, 0.2),
                borderColor: t.colors.primary,
                boxShadow: t.shadows.focusRing,
              }
            : { backgroundColor: t.alpha.w04, borderColor: t.alpha.w10 }),
        },
        style,
      ]}>
      <Txt f="m" s={font.footnote} w={700} c={active ? t.colors.text : t.colors.textMuted}>
        {label}
      </Txt>
    </Press>
  );
}

/** The three-up figure tiles (`1.284 / kelime`). */
export function StatTile({
  value,
  label,
  tint,
  size = 17,
  style,
}: {
  value: string;
  label: string;
  tint: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.alpha.w07,
          borderRadius: radii.input,
          padding: 12,
          alignItems: 'center',
        },
        style,
      ]}>
      <Txt f="m" s={size} w={800} c={tint}>
        {value}
      </Txt>
      <Txt s={font.label} c={t.colors.textDim} style={styles.statLabel}>
        {label}
      </Txt>
    </View>
  );
}

/** List row shell — `row(active)` in the design's logic. */
export function Row({
  children,
  active,
  onPress,
  style,
}: {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.panel,
    borderWidth: 1,
    ...(active
      ? { backgroundColor: tint(t.colors.primary, 0.14), borderColor: tint(t.colors.primary, 0.34) }
      : { backgroundColor: t.colors.surface, borderColor: t.alpha.w07 }),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Press onPress={onPress} scale={0.99} style={[base, style]}>
      {children}
    </Press>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.alpha.w07 }, style]} />;
}

/** Kicker + title block that heads the tabbed screens. */
export function ScreenHeading({
  kicker,
  title,
  size = font.jumbo,
}: {
  kicker: string;
  title: string;
  size?: number;
}) {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View>
      <Txt f="mono" s={font.caption} w={700} c={t.colors.textDim} ls={0.14}>
        {kicker}
      </Txt>
      <Txt f="m" s={size} w={800} ls={-0.02} style={styles.heading}>
        {title}
      </Txt>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    statLabel: { marginTop: 2, textAlign: 'center' },
    heading: { marginTop: 4 },
  });
