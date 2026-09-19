/**
 * Design tokens, transcribed 1:1 from the WORDLY design system screen
 * (`WORDLY.dc.html` → `s.tokens`, `tokenRows`, `scaleData`).
 */

export const colors = {
  // Brand
  primary: '#2E6BFF',
  primaryPressed: '#2455CC',
  secondary: '#7C5CFF',
  secondaryPressed: '#6349CC',
  accent: '#22D3EE',
  accentSoft: '#7FE6F5',

  // Semantic
  success: '#22C55E',
  successSoft: '#7EE2A8',
  successText: '#C9F7DC',
  warning: '#F5A524',
  warningSoft: '#FFCE8A',
  warningText: '#FFC768',
  error: '#FF4D5E',
  errorSoft: '#FF9AA5',
  errorText: '#FFD5D9',
  errorTint: '#FFAEB6',
  orange: '#FF7A59',

  // Surfaces (Neutral · Navy scale)
  bg: '#070A14',
  surface: '#0E1426',
  surfaceRaised: '#121A31',
  surfaceElevated: '#161E36',
  surfaceHigh: '#141C33',
  surfaceCard: '#0B1122',
  surfaceDeep: '#0B1020',
  surfaceSlot: '#0C1223',
  surfaceBubble: '#151D35',
  surfaceNode: '#1A2342',

  // Text
  text: '#FFFFFF',
  textBright: '#E4EAF8',
  textBody: '#D3DCF0',
  textSubtle: '#C7D2EC',
  textMuted: '#A9B6D4',
  textDim: '#94A0BC',
  textFaint: '#8E9BBA',
  textGhost: '#6E7B9C',
  textDisabled: '#5E6B8A',
  textRail: '#4E5A78',
  link: '#6E9BFF',
  linkHover: '#9FBEFF',
  onLight: '#0B1122',

  // Tints used repeatedly in the design
  violetSoft: '#C4B5FF',
  violetText: '#B9A8FF',
  blueSoft: '#9FB0D4',
  blueTint: '#4D8BFF',
  mintSoft: '#9DEFC0',
} as const;

/** Colour scales from the "Jetonlar ve bileşenler" screen. */
export const scales = {
  primary: [
    '#EAF1FF', '#C9DCFF', '#9FC0FF', '#74A3FF', '#4D8BFF',
    '#2E6BFF', '#2455CC', '#1B4099', '#122B66', '#091633',
  ],
  secondary: [
    '#F1EDFF', '#DCD3FF', '#C4B5FF', '#AB95FF', '#9378FF',
    '#7C5CFF', '#6349CC', '#4A3799', '#312566', '#191233',
  ],
  neutral: [
    '#F4F6FB', '#D8DEEC', '#B4BFD6', '#94A0BC', '#6E7B9C',
    '#4E5A78', '#2C3654', '#161E36', '#0E1426', '#070A14',
  ],
  semantic: [
    '#22C55E', '#7EE2A8', '#F5A524', '#FFCE8A', '#FF4D5E',
    '#FF9AA5', '#22D3EE', '#7FE6F5', '#0E1426', '#070A14',
  ],
} as const;

/** Gradient colour pairs, always drawn at the design's 135°/140°/160° feel. */
export const gradients = {
  brand: ['#2E6BFF', '#7C5CFF'] as const,
  brandPressed: ['#2455CC', '#6349CC'] as const,
  cyan: ['#2E6BFF', '#22D3EE'] as const,
  violetCyan: ['#7C5CFF', '#22D3EE'] as const,
  logo: ['#2E6BFF', '#7C5CFF', '#22D3EE'] as const,
  progress: ['#2E6BFF', '#22D3EE'] as const,
  progressViolet: ['#7C5CFF', '#22D3EE'] as const,
  danger: ['#FF7A59', '#FF4D5E'] as const,
  success: ['#22C55E', '#22D3EE'] as const,
  warm: ['#F5A524', '#FF7A59'] as const,
  card: ['#121A31', '#0E1426'] as const,
  cardHigh: ['#141C33', '#0E1426'] as const,
} as const;

/** Translucent fills, mirroring the rgba(255,255,255,.0x) values in the design. */
export const alpha = {
  w02: 'rgba(255,255,255,.02)',
  w03: 'rgba(255,255,255,.03)',
  w04: 'rgba(255,255,255,.04)',
  w05: 'rgba(255,255,255,.05)',
  w06: 'rgba(255,255,255,.06)',
  w07: 'rgba(255,255,255,.07)',
  w08: 'rgba(255,255,255,.08)',
  w09: 'rgba(255,255,255,.09)',
  w10: 'rgba(255,255,255,.10)',
  w12: 'rgba(255,255,255,.12)',
  w14: 'rgba(255,255,255,.14)',
  w16: 'rgba(255,255,255,.16)',
  w18: 'rgba(255,255,255,.18)',
  w20: 'rgba(255,255,255,.20)',
  w24: 'rgba(255,255,255,.24)',
  w30: 'rgba(255,255,255,.30)',
  black28: 'rgba(0,0,0,.28)',
  black30: 'rgba(0,0,0,.30)',
  black34: 'rgba(0,0,0,.34)',
  black35: 'rgba(0,0,0,.35)',
  black40: 'rgba(0,0,0,.40)',
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  chipSm: 9,
  chip: 10,
  pill: 11,
  md: 12,
  lg: 13,
  card: 14,
  input: 16,
  option: 16,
  panel: 18,
  tile: 20,
  section: 22,
  hero: 24,
  screen: 26,
  full: 999,
} as const;

export const spacing = {
  /** Screen gutter used by nearly every screen (`padding: … 18px`). */
  gutter: 18,
  /** Narrower gutter used by the onboarding/test flow (`padding: … 22px`). */
  gutterTight: 22,
  /** Space reserved for the bottom tab bar on tabbed screens. */
  tabBar: 112,
} as const;

/**
 * Shadows are written as CSS `boxShadow` strings, which React Native 0.86
 * supports directly — this keeps them identical to the design source.
 */
export const shadows = {
  ctaBrand: '0px 14px 34px rgba(46,107,255,.42)',
  ctaBrandLarge: '0px 16px 38px rgba(46,107,255,.45)',
  ctaBrandSmall: '0px 12px 28px rgba(46,107,255,.38)',
  ctaViolet: '0px 12px 28px rgba(124,92,255,.4)',
  ctaCyan: '0px 14px 34px rgba(34,211,238,.4)',
  card: '0px 24px 60px rgba(0,0,0,.45)',
  cardSoft: '0px 22px 50px rgba(0,0,0,.4)',
  toast: '0px 18px 40px rgba(0,0,0,.5)',
  tileBrand: '0px 10px 24px rgba(46,107,255,.4)',
  node: '0px 14px 34px rgba(46,107,255,.45)',
  avatar: '0px 14px 34px rgba(124,92,255,.4)',
  glowCyan: '0px 0px 16px rgba(34,211,238,.5)',
  glowCyanSoft: '0px 0px 14px rgba(34,211,238,.5)',
} as const;

/** Minimum touch target the design commits to on the accessibility note. */
export const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 } as const;

/**
 * Hex + alpha helper. The design writes these as `#2E6BFF22`-style suffixes;
 * this keeps that shorthand readable at call sites.
 */
export const withAlpha = (hex: string, aa: string) => `${hex}${aa}`;
