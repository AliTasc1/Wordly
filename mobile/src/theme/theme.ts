import {
  ALPHAS,
  PALETTES,
  type AlphaSet,
  type ColorRole,
  type Palette,
  type ThemeName,
} from './palette';
import { radii, scales, spacing, HIT_SLOP } from './tokens';

export type { ThemeName, Palette, AlphaSet, ColorRole };

/**
 * Gradyanlar.
 *
 * Marka gradyanları iki temada da aynı: dolgu olarak kullanılıyorlar ve
 * üstlerindeki yazı her iki temada da beyaz. Değişen yalnızca **yüzey**
 * gradyanları (`card`, `cardHigh`) — onlar zeminin devamı.
 */
/** En az iki renk: gradyan tüketicileri (svg, linear-gradient) böyle tipli. */
type Stops = readonly [string, string, ...string[]];

export type Gradients = {
  brand: Stops;
  brandPressed: Stops;
  cyan: Stops;
  violetCyan: Stops;
  logo: Stops;
  progress: Stops;
  progressViolet: Stops;
  danger: Stops;
  success: Stops;
  warm: Stops;
  card: Stops;
  cardHigh: Stops;
  /** Alt çubuğun zemini — içerik çubuğun altından geçerken kaybolsun diye. */
  tabBar: Stops;
};

function gradientsOf(name: ThemeName): Gradients {
  const light = name === 'light';
  return {
    brand: ['#2E6BFF', '#7C5CFF'],
    brandPressed: ['#2455CC', '#6349CC'],
    cyan: light ? ['#2558E0', '#0E7C90'] : ['#2E6BFF', '#22D3EE'],
    violetCyan: light ? ['#6742E8', '#0E7C90'] : ['#7C5CFF', '#22D3EE'],
    logo: ['#2E6BFF', '#7C5CFF', '#22D3EE'],
    progress: light ? ['#2558E0', '#0E7C90'] : ['#2E6BFF', '#22D3EE'],
    progressViolet: light ? ['#6742E8', '#0E7C90'] : ['#7C5CFF', '#22D3EE'],
    danger: ['#FF7A59', '#FF4D5E'],
    success: light ? ['#15803D', '#0E7C90'] : ['#22C55E', '#22D3EE'],
    warm: ['#F5A524', '#FF7A59'],
    // Yüzey gradyanları zeminin devamı; açıkta beyazdan beyaza gitmesi
    // gerekiyor, yoksa kartın içinde görünmeyen bir koyu leke kalıyor.
    card: light ? ['#FFFFFF', '#FBFCFE'] : ['#151D38', '#111831'],
    cardHigh: light ? ['#FFFFFF', '#F4F6FC'] : ['#18213E', '#111831'],
    // Üstte saydam başlayıp altta tamamen kapanıyor: kaydırılan içerik
    // çubuğa çarpıp durmuyor, çubuğun altında eriyor.
    tabBar: light
      ? ['rgba(247,248,252,.4)', 'rgba(247,248,252,.96)', 'rgba(247,248,252,.96)']
      : ['rgba(5,8,15,.4)', 'rgba(5,8,15,.96)', 'rgba(5,8,15,.96)'],
  };
}

/**
 * Gölgeler.
 *
 * Koyu temada gölge derinlik veriyor; açık temada aynı gölge beyaz zeminde
 * kir gibi duruyor. Açıkta hepsi hafifletildi ve renkli parıltılar
 * (`glowCyan`) neredeyse kapatıldı — parıltı, karanlıkta çalışan bir etki.
 */
export type Shadows = Record<
  | 'ctaBrand'
  | 'ctaBrandLarge'
  | 'ctaBrandSmall'
  | 'ctaViolet'
  | 'ctaCyan'
  | 'card'
  | 'cardSoft'
  | 'toast'
  | 'tileBrand'
  | 'node'
  | 'avatar'
  | 'glowCyan'
  | 'glowCyanSoft'
  /** Seçili seçeneğin çevresindeki halka — kenarlık değil, kenarlığın yankısı. */
  | 'focusRing'
  | 'focusRingSoft'
  /** Basılı duran harf tuşu. */
  | 'keyLift'
  /** Mikrofon düğmesi: beklerken mavi, kayıttayken kırmızı hale. */
  | 'micIdle'
  | 'micLive',
  string
>;

function shadowsOf(name: ThemeName): Shadows {
  if (name === 'light') {
    return {
      ctaBrand: '0px 8px 20px rgba(37,88,224,.26)',
      ctaBrandLarge: '0px 10px 24px rgba(37,88,224,.28)',
      ctaBrandSmall: '0px 6px 16px rgba(37,88,224,.22)',
      ctaViolet: '0px 6px 16px rgba(103,66,232,.24)',
      ctaCyan: '0px 8px 20px rgba(14,124,144,.24)',
      card: '0px 8px 24px rgba(11,16,32,.08)',
      cardSoft: '0px 6px 18px rgba(11,16,32,.06)',
      toast: '0px 10px 28px rgba(11,16,32,.14)',
      tileBrand: '0px 5px 14px rgba(37,88,224,.22)',
      node: '0px 7px 18px rgba(37,88,224,.24)',
      avatar: '0px 7px 18px rgba(103,66,232,.22)',
      glowCyan: '0px 0px 10px rgba(14,124,144,.22)',
      glowCyanSoft: '0px 0px 8px rgba(14,124,144,.18)',
      // Beyaz zeminde halka koyudan daha görünür oluyor; oranlar koyu temadan
      // biraz yükseltildi, yoksa seçili seçenek seçilmemiş gibi duruyor.
      focusRing: '0px 0px 0px 3px rgba(37,88,224,.18)',
      focusRingSoft: '0px 0px 0px 3px rgba(37,88,224,.14)',
      keyLift: '0px 8px 18px rgba(37,88,224,.3)',
      micIdle: '0px 0px 0px 10px rgba(37,88,224,.14), 0px 12px 28px rgba(37,88,224,.3)',
      micLive: '0px 0px 0px 12px rgba(214,40,57,.16), 0px 12px 28px rgba(214,40,57,.28)',
    };
  }
  return {
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
    focusRing: '0px 0px 0px 3px rgba(46,107,255,.12)',
    focusRingSoft: '0px 0px 0px 3px rgba(46,107,255,.1)',
    keyLift: '0px 10px 24px rgba(46,107,255,.5)',
    micIdle: '0px 0px 0px 10px rgba(46,107,255,.12), 0px 18px 40px rgba(46,107,255,.42)',
    micLive: '0px 0px 0px 12px rgba(255,77,94,.16), 0px 18px 40px rgba(255,77,94,.4)',
  };
}

export type Theme = {
  name: ThemeName;
  /** Koyu tema mı — ikon, durum çubuğu ve blur tonu buna bakıyor. */
  dark: boolean;
  colors: Palette;
  alpha: AlphaSet;
  gradients: Gradients;
  shadows: Shadows;
  radii: typeof radii;
  spacing: typeof spacing;
  scales: typeof scales;
  hitSlop: typeof HIT_SLOP;
};

function build(name: ThemeName): Theme {
  return {
    name,
    dark: name === 'dark',
    colors: PALETTES[name],
    alpha: ALPHAS[name],
    gradients: gradientsOf(name),
    shadows: shadowsOf(name),
    radii,
    spacing,
    scales,
    hitSlop: HIT_SLOP,
  };
}

/** İki tema da bir kez kuruluyor; her çizimde yeniden üretilmiyor. */
export const THEMES: Record<ThemeName, Theme> = {
  dark: build('dark'),
  light: build('light'),
};
