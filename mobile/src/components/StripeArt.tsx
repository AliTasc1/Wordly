import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { Txt } from './Txt';
import { font, radii } from '../theme/tokens';

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
  a,
  b,
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
  const t = useTheme();
  const styles = useStyles(makeStyles);
  a ??= tint(t.colors.primary, 0.16);
  b ??= tint(t.colors.secondary, 0.08);
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
          <Txt f="mono" s={font.label} w={600} c={t.alpha.w30}>
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
      backgroundColor: tint(t.colors.bg, 0.7),
      paddingVertical: 6,
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
      a={tint(t.colors.primary, 0.14)}
      b={tint(t.colors.secondary, 0.07)}
      band={8}
      style={{ width: size, borderColor: t.alpha.w18, borderStyle: 'dashed' }}
    />
  );
}

/** Dashed ring overlay used on the onboarding hero. */
export function DashedRing({ size = 150 }: { size?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: t.alpha.w30,
      }}
    />
  );
}

/**
 * Yer tutucu altyazısının rengi.
 *
 * Sabit bir dışa aktarımdı; temaya bağlanınca modül yüklenirken okunamaz
 * oldu. Fonksiyon olarak duruyor — çağıran zaten temayı elinde tutuyor.
 */
export const captionColor = (t: Theme) => t.colors.textDim;
