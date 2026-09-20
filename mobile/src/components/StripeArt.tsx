import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { Txt } from './Txt';
import { radii } from '../theme/tokens';

let patternId = 0;

/**
 * The design's image placeholders —
 * `repeating-linear-gradient(135deg, <a> 0 10px, <b> 10px 20px)` with a
 * caption chip naming the asset that still has to be produced.
 */
export function StripeArt({
  label,
  height = 132,
  radius = radii.input,
  a = 'rgba(46,107,255,.16)',
  b = 'rgba(124,92,255,.08)',
  deg = 45,
  band = 10,
  children,
  style,
}: {
  label?: string;
  height?: number;
  radius?: number;
  a?: string;
  b?: string;
  deg?: number;
  band?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles(makeStyles);
  const id = React.useMemo(() => `stripe-${patternId++}`, []);
  return (
    <View
      style={[
        styles.wrap,
        { height, borderRadius: radius },
        style,
      ]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id={id}
            width={band * 2}
            height={band * 2}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${deg})`}>
            <Rect x={0} y={0} width={band} height={band * 2} fill={a} />
            <Rect x={band} y={0} width={band} height={band * 2} fill={b} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
      {label ? (
        <View style={styles.caption}>
          <Txt f="mono" s={10.5} w={600} c="rgba(255,255,255,.62)">
            {label}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: t.alpha.w08,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    backgroundColor: 'rgba(7,10,20,.7)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

/** Circular striped art used by the empty states. */
export function StripeCircle({ label, size = 104 }: { label: string; size?: number }) {
  const t = useTheme();
  return (
    <StripeArt
      label={label}
      height={size}
      radius={size / 2}
      a="rgba(46,107,255,.14)"
      b="rgba(124,92,255,.07)"
      band={8}
      style={{ width: size, borderColor: t.alpha.w18, borderStyle: 'dashed' }}
    />
  );
}

/** Dashed ring overlay used on the onboarding hero. */
export const DashedRing = ({ size = 150 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: 'rgba(255,255,255,.28)',
    }}
  />
);

/**
 * Yer tutucu altyazısının rengi.
 *
 * Sabit bir dışa aktarımdı; temaya bağlanınca modül yüklenirken okunamaz
 * oldu. Fonksiyon olarak duruyor — çağıran zaten temayı elinde tutuyor.
 */
export const captionColor = (t: Theme) => t.colors.textDim;
