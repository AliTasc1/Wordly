/**
 * İki palet: koyu ve açık.
 *
 * ------------------------------------------------------- neden aynı anahtarlar
 * Uygulamada `colors.*` 528 yerde geçiyor. Yeniden adlandırma, tema eklemenin
 * yanına 528 dokunuş daha koymak ve ikisini aynı anda doğrulamak demekti.
 * Anahtarlar aynı kaldı; değişen yalnızca değerler. Böylece tema altyapısı tek
 * başına doğrulanabiliyor, ekran tasarımı ayrı bir adım olarak geliyor.
 *
 * ------------------------------------------------- açık tema neden ters çevirme değil
 * Koyu paleti ters çevirmek çalışmıyor. Koyuda parlayan bir renk (camgöbeği
 * #22D3EE) beyaz üstünde okunmuyor; koyuda ayırıcı olan beyaz saydamlık, açıkta
 * görünmez oluyor. Her rengin açık karşılığı, aynı **işi** yapacak şekilde
 * ayrıca seçildi: kontrast oranları WCAG AA'yı (normal metin 4.5:1) tutuyor.
 *
 * Açık zemin saf beyaz değil (#F7F8FC): saf beyaz, uzun okumada kamaştırıyor ve
 * kartlar zeminden ayrılamıyor. Kart beyaz, zemin bir tık gri — kartlar öne
 * çıkıyor.
 */

export type ThemeName = 'dark' | 'light';

export type Palette = {
  // Marka
  primary: string;
  primaryPressed: string;
  secondary: string;
  secondaryPressed: string;
  accent: string;
  accentSoft: string;

  // Anlamsal
  success: string;
  successSoft: string;
  successText: string;
  warning: string;
  warningSoft: string;
  warningText: string;
  error: string;
  errorSoft: string;
  errorText: string;
  errorTint: string;
  orange: string;

  // Yüzeyler
  bg: string;
  /*
    Yüzey basamakları.

    On tane vardı: `surface`, `surfaceRaised`, `surfaceElevated`,
    `surfaceHigh`, `surfaceCard`, `surfaceDeep`, `surfaceSlot`,
    `surfaceBubble`, `surfaceNode`. Dokuzu bir ya da iki yerde
    kullanılıyordu ve adları nerede durduklarını söylemiyordu:
    `surfaceCard` aslında `surface`ten **koyuydu**, yani kartın üstünde
    değil altındaydı. Token seçen kişi yanlış seçiyordu.

    Dört kaldı ve sırası adında: `bg` sayfa, `surface` sayfadaki kart,
    `sunken` kartın içindeki oyuk, `raised` kartın üstündeki şey.
  */
  surface: string;
  /** Kartın içine gömülü: giriş kutusu, harf yuvası, ilerleme kanalı. */
  sunken: string;
  /** Kartın üstünde duran: baloncuk, düğüm, açılır katman. */
  raised: string;

  // Metin
  text: string;
  textBright: string;
  textBody: string;
  textSubtle: string;
  textMuted: string;
  textDim: string;
  textFaint: string;
  textGhost: string;
  textDisabled: string;
  textRail: string;
  link: string;
  linkHover: string;
  /** Parlak zemin üstündeki metin — açık temada da koyu kalıyor. */
  onLight: string;
  /** Marka renkli dolgu üstündeki metin. */
  onBrand: string;

  // Tonlar
  violetSoft: string;
  violetText: string;
  blueSoft: string;
  blueTint: string;
  mintSoft: string;
};

const DARK: Palette = {
  primary: '#2E6BFF',
  primaryPressed: '#2455CC',
  secondary: '#7C5CFF',
  secondaryPressed: '#6349CC',
  accent: '#22D3EE',
  accentSoft: '#7FE6F5',

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

  // Basamaklar arası fark ölçülerek açıldı. Tasarımdan gelen değerlerde
  // `sunken` ile `surface` arasında 255'lik ölçekte 3,1 birim vardı — kartın
  // içindeki oyuk gözle seçilmiyordu. Sayfa bir tık koyulaştı, kart bir tık
  // açıldı; aradaki üç aralık da beşin üstüne çıktı.
  bg: '#05080F',
  surface: '#111831',
  sunken: '#0B1122',
  raised: '#161E36',

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
  onBrand: '#FFFFFF',

  violetSoft: '#C4B5FF',
  violetText: '#B9A8FF',
  blueSoft: '#9FB0D4',
  blueTint: '#4D8BFF',
  mintSoft: '#9DEFC0',
};

/*
  Açık palet.

  Marka mavisi (#2E6BFF) beyazda 4.6:1 veriyor, metin için sınırda geçiyor —
  ama ince yazıda zorlanıyor, o yüzden metin rolünde bir tık koyusu kullanılıyor.

  Camgöbeği asıl sorun: #22D3EE beyaz üstünde 1.8:1, yani okunmuyor. Açıkta
  rolünü #0E7C90 devralıyor; aynı "ikincil vurgu" işini görüyor ve 4.8:1 veriyor.

  Yeşil, turuncu ve kırmızının koyu tema değerleri de beyazda zayıf kalıyor.
  Hepsinin açık karşılığı, dolgu olarak değil **metin ve simge** olarak
  okunabilecek şekilde koyulaştırıldı.
*/
const LIGHT: Palette = {
  primary: '#2558E0',
  primaryPressed: '#1C46B8',
  secondary: '#6742E8',
  secondaryPressed: '#5433C4',
  accent: '#0E7C90',
  accentSoft: '#0A6274',

  success: '#15803D',
  successSoft: '#166534',
  successText: '#14532D',
  warning: '#B45309',
  warningSoft: '#92400E',
  warningText: '#7C2D12',
  error: '#DC2626',
  errorSoft: '#B91C1C',
  errorText: '#991B1B',
  errorTint: '#DC2626',
  orange: '#C2410C',

  // Zemin bir tık gri, kartlar beyaz: kart zeminden ayrılıyor. Saf beyaz
  // zeminde kart ile arka plan aynı olur ve hiyerarşi kaybolurdu.
  bg: '#F7F8FC',
  surface: '#FFFFFF',
  sunken: '#ECEFF7',
  // Açık temada yükselti renkle anlatılamıyor: beyazın üstü yok. Kart ile
  // aynı beyaz duruyor, farkı gölge veriyor (`shadows.card`). Koyu temada
  // ise gölge işe yaramıyor ve fark renkte — iki tema, iki dil.
  raised: '#FFFFFF',

  // Saf siyah değil: koyu lacivert, koyu temadaki karakteri koruyor ve
  // uzun okumada saf siyahtan yumuşak.
  text: '#0B1020',
  textBright: '#131A2E',
  textBody: '#1F2840',
  textSubtle: '#2B3550',
  textMuted: '#3E4A68',
  textDim: '#505C7A',
  textFaint: '#5A6684',
  textGhost: '#6B7794',
  // #8A94AC zeminde 2,86:1 veriyordu; kontrast testi yakaladı.
  textDisabled: '#7E88A0',
  textRail: '#B4BCCE',
  link: '#2558E0',
  linkHover: '#1C46B8',
  onLight: '#0B1122',
  onBrand: '#FFFFFF',

  violetSoft: '#5B3FD4',
  violetText: '#4A31B8',
  blueSoft: '#4A5878',
  blueTint: '#2558E0',
  mintSoft: '#15803D',
};

/**
 * Anlamsal renk rolü.
 *
 * İçerik dosyaları (başarımlar, bildirimler, oyun modları) renk taşıyordu:
 * `tint: colors.warning` — yani koyu temanın turuncusu, donmuş hâlde. Tema
 * açığa geçince o değerler yerinde kalıyordu ve kimi beyaz zeminde
 * okunmuyordu.
 *
 * Artık rolün **adı** taşınıyor, rengi çizim anında tema veriyor. İçerik
 * "bu bir uyarı" diyor; hangi turuncu olduğuna tema karar veriyor.
 */
export type ColorRole = keyof Palette;

export const PALETTES: Record<ThemeName, Palette> = { dark: DARK, light: LIGHT };

/**
 * Saydam katmanlar.
 *
 * Koyuda beyaz saydamlıkla açılıyor, açıkta siyah saydamlıkla koyulaşıyor.
 * Aynı anahtar (`w08`) iki temada da "zeminden bir tık ayrılmış yüzey"
 * demek — rengi değil işi sabit.
 *
 * Açıktaki oranlar koyudakinin birebir aynısı değil: siyah saydamlık beyaz
 * üstünde daha hızlı görünür oluyor, aynı sayı kullanılsaydı açık tema
 * kirli görünürdü.
 */
export type AlphaSet = {
  w02: string; w03: string; w04: string; w05: string; w06: string;
  w07: string; w08: string; w09: string; w10: string; w12: string;
  w14: string; w16: string; w18: string; w20: string; w24: string; w30: string;
  black28: string; black30: string; black34: string; black35: string; black40: string;
};

const DARK_ALPHA: AlphaSet = {
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
};

const LIGHT_ALPHA: AlphaSet = {
  w02: 'rgba(11,16,32,.015)',
  w03: 'rgba(11,16,32,.022)',
  w04: 'rgba(11,16,32,.03)',
  w05: 'rgba(11,16,32,.035)',
  w06: 'rgba(11,16,32,.045)',
  w07: 'rgba(11,16,32,.05)',
  w08: 'rgba(11,16,32,.06)',
  w09: 'rgba(11,16,32,.07)',
  w10: 'rgba(11,16,32,.08)',
  w12: 'rgba(11,16,32,.09)',
  w14: 'rgba(11,16,32,.10)',
  w16: 'rgba(11,16,32,.12)',
  w18: 'rgba(11,16,32,.13)',
  w20: 'rgba(11,16,32,.15)',
  w24: 'rgba(11,16,32,.18)',
  w30: 'rgba(11,16,32,.22)',
  // Gölgeler açıkta da siyah ama çok daha hafif: beyaz zeminde koyu temanın
  // gölgesi leke gibi duruyor.
  black28: 'rgba(11,16,32,.08)',
  black30: 'rgba(11,16,32,.09)',
  black34: 'rgba(11,16,32,.10)',
  black35: 'rgba(11,16,32,.10)',
  black40: 'rgba(11,16,32,.12)',
};

export const ALPHAS: Record<ThemeName, AlphaSet> = {
  dark: DARK_ALPHA,
  light: LIGHT_ALPHA,
};
