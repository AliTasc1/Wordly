import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Gradient } from './Gradient';
import { Txt } from './Txt';

/**
 * `av(c1, c2, size)` from the design — a gradient disc with initials,
 * font size always `size / 2.4`.
 */
export function Avatar({
  initials,
  from,
  to,
  size = 30,
  radius,
  style,
}: {
  initials: string;
  from: string;
  to: string;
  size?: number;
  /** Squircle variant used for the profile header and duel cards. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Gradient
      colors={[from, to]}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius ?? size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Txt f="m" s={size / 2.4} w={700} c={t.colors.text}>
        {initials}
      </Txt>
    </Gradient>
  );
}

/** Online/offline dot anchored to an avatar's corner. */
const makeStyles = (t: Theme) =>
  StyleSheet.create({
    dot: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2.5,
    },
  });
