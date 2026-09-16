import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow, GlowSpec } from './Glow';
import { colors, spacing } from '../theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Radial washes layered behind the content. */
  glows?: GlowSpec[];
  /** Design top padding. Grown to clear the notch when the inset is larger. */
  padTop?: number;
  /** Horizontal gutter. `0` for screens whose header bleeds edge to edge. */
  padH?: number;
  padBottom?: number;
  /** Adds room for the bottom tab bar (design: `padding-bottom:112px`). */
  tabbed?: boolean;
  /** Vertical rhythm between children (design: `gap:14px` on most screens). */
  gap?: number;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Rendered above the scroll area and pinned (used by the arena timer bar). */
  background?: React.ReactNode;
};

export function Screen({
  children,
  glows,
  padTop = 62,
  padH = spacing.gutter,
  padBottom = 40,
  tabbed = false,
  gap = 14,
  scroll = true,
  style,
  contentStyle,
  background,
}: Props) {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(padTop, insets.top + 8);
  const paddingBottom = tabbed
    ? spacing.tabBar + insets.bottom
    : padBottom + insets.bottom;

  const inner: StyleProp<ViewStyle> = [
    { paddingTop, paddingHorizontal: padH, paddingBottom, gap },
    contentStyle,
  ];

  return (
    <View style={[styles.root, style]}>
      {glows ? <Glow glows={glows} /> : null}
      {background}
      {scroll ? (
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.grow, inner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, inner]}>{children}</View>
      )}
    </View>
  );
}

/** `flex:1` spacer — the design's `<div style="flex:1"></div>`. */
export const Spacer = () => <View style={styles.fill} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});
