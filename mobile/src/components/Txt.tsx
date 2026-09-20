import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { jakarta, JakartaWeight, manrope, ManropeWeight, mono } from '../theme/typography';

type Family = 'm' | 'j' | 'mono';

export type TxtProps = TextProps & {
  /** `m` = Manrope, `j` = Plus Jakarta Sans, `mono` = ui-monospace. */
  f?: Family;
  /** Font size in px, exactly as the design writes it. */
  s?: number;
  /** Font weight. Defaults: Manrope 800, Jakarta 500, mono 700. */
  w?: 400 | 500 | 600 | 700 | 800;
  /** Colour. Defaults to the design's primary text white. */
  c?: string;
  /** Line height as a multiplier (`13px/1.5` → `lh={1.5}`). */
  lh?: number;
  /** Letter spacing in em (`letter-spacing:.14em` → `ls={0.14}`). */
  ls?: number;
};

/**
 * Text with the design's CSS font shorthand mapped onto props, so
 * `font:800 17px Manrope` reads as `<Txt f="m" s={17} w={800}>`.
 */
export function Txt({ f = 'j', s = 13, w, c, lh, ls, style, ...rest }: TxtProps) {
  const t = useTheme();
  // Varsayılan renk temadan geliyor; parametre listesinde duramaz, orada
  // `t` henüz tanımlı değil.
  c ??= t.colors.text;
  let base: TextStyle;
  if (f === 'm') base = manrope(s, (w ?? 800) as ManropeWeight);
  else if (f === 'mono') base = mono(s, String(w ?? 700) as '600' | '700' | '800');
  else base = jakarta(s, (w ?? 500) as JakartaWeight);

  return (
    <Text
      style={[
        base,
        { color: c },
        lh != null && { lineHeight: s * lh },
        ls != null && { letterSpacing: s * ls },
        style,
      ]}
      {...rest}
    />
  );
}
