import { Platform, TextStyle } from 'react-native';

/**
 * The design uses three families:
 *   Manrope              — headings, numerals, buttons  (500/600/700/800)
 *   Plus Jakarta Sans    — body copy                    (400/500/600/700)
 *   ui-monospace         — XP, timers, ranks, kickers
 *
 * CSS shorthand like `font:800 19px Manrope` becomes `manrope(19, 800)`.
 */

const MANROPE = {
  500: 'Manrope_500Medium',
  600: 'Manrope_600SemiBold',
  700: 'Manrope_700Bold',
  800: 'Manrope_800ExtraBold',
} as const;

const JAKARTA = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
} as const;

/** `ui-monospace, Menlo, monospace` resolved per platform. */
export const MONO_FAMILY = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export type ManropeWeight = keyof typeof MANROPE;
export type JakartaWeight = keyof typeof JAKARTA;

export const manrope = (size: number, weight: ManropeWeight = 800): TextStyle => ({
  fontFamily: MANROPE[weight],
  fontSize: size,
});

export const jakarta = (size: number, weight: JakartaWeight = 500): TextStyle => ({
  fontFamily: JAKARTA[weight],
  fontSize: size,
});

/**
 * Monospace runs carry weight through the family on iOS only, so bold mono is
 * approximated with `fontWeight` — visually equivalent at the 9–12px sizes the
 * design uses it at.
 */
export const mono = (size: number, weight: '600' | '700' | '800' = '700'): TextStyle => ({
  fontFamily: MONO_FAMILY,
  fontSize: size,
  fontWeight: weight,
});

/** `letter-spacing: .12em` at a given size — CSS em units are relative to font size. */
export const tracking = (size: number, em: number) => size * em;

/** Named styles that repeat across many screens. */
export const type = {
  /** Section kicker: `font:700 10-11px ui-monospace; letter-spacing:.14em` */
  kicker: (size = 11, em = 0.14): TextStyle => ({
    ...mono(size),
    letterSpacing: tracking(size, em),
  }),
  /** Screen title: `font:800 26px Manrope; letter-spacing:-.02em` */
  screenTitle: (size = 26): TextStyle => ({
    ...manrope(size, 800),
    letterSpacing: tracking(size, -0.02),
  }),
  /** Body copy: `font:500 13px/1.5 'Plus Jakarta Sans'` */
  body: (size = 13, lineHeight = 1.5, weight: JakartaWeight = 500): TextStyle => ({
    ...jakarta(size, weight),
    lineHeight: size * lineHeight,
  }),
};
