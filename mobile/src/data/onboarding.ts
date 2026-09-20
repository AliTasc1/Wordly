/** Splash, intro, goal picker and the design-system reference screens. */

import { scales } from '../theme/tokens';
import type { ColorRole } from '../theme/palette';
import type { ScreenId } from '../navigation/routes';

export const SPLASH = {
  tagline: 'İngilizce öğren. Oyna. Konuş.',
  // `loading` buradaydı ("Hesabın hazırlanıyor"). Hazırlanan bir şey yoktu:
  // ekran açılır açılmaz hazırdı. Bekleme taklidi, kullanıcının zamanını
  // çalmanın kibar hâlidir.
  primary: 'Ücretsiz Başla',
  secondary: 'Hesabım var · Giriş yap',
  legal: 'Devam ederek Kullanım Koşulları’nı kabul edersin.',
};

/*
  Açılış metni, yeni kullanıcının okuduğu ilk cümle. Üç uydurma iddia
  taşıyordu:

  - "gerçek insanlarla yarış" — yalnızca haftalık sıralama var, karşılıklı
    yarışma yok.
  - "AI koçunla konuşarak pratik yap" — böyle bir koç yok.
  - "4.9M öğrenci · 18 dk ortalama süre · +2 kur 3 ayda" — üçü de uydurma.
    Sonuncusu ayrıca bir etkinlik iddiası: üç ayda iki kur atlatacağını
    söyleyip tutmamak, öğrenciyi kandırmaktır.

  Yerlerindeki sayılar kendi içeriğimizden sayıldı ve doğrulanabilir.
*/
export const INTRO: {
  skip: string;
  title: string;
  body: string;
  stats: { value: string; label: string; tint: ColorRole }[];
  cta: string;
} = {
  skip: 'Atla',
  title: 'Ders çalışıyormuş gibi olmadan İngilizce öğren.',
  body: 'Kelime, gramer, okuma, dinleme, konuşma ve yazma — altı seviye boyunca, CEFR standardına göre. Her şey çevrimdışı çalışır.',
  stats: [
    { value: '9.461', label: 'kelime', tint: 'accent' },
    { value: '1.040', label: 'gramer alıştırması', tint: 'secondary' },
    { value: 'A1–C2', label: 'altı seviye', tint: 'success' },
  ],
  cta: 'Devam et',
};

export const GOAL_SCREEN = {
  step: '2/5',
  progress: 42,
  title: 'Hedefin ne?',
  sub: 'Birden fazla seçebilirsin. Müfredatını buna göre kuruyoruz.',
  timeTitle: 'Günde ne kadar pratik yapabilirsin?',
  skillTitle: 'Neyi geliştirmek istersin?',
  cta: 'Seviyemi Bul',
  emptySummary: 'En az bir hedef seç',
};

export const GOALS = [
  { label: 'Seyahat', sub: 'uçuş, otel, yol' },
  { label: 'Kariyer', sub: 'toplantı, e-posta' },
  { label: 'Okul', sub: 'sınav, ödev' },
  { label: 'Konuşma', sub: 'akıcılık' },
  { label: 'Sınavlar', sub: 'IELTS, TOEFL' },
  { label: 'Eğlence', sub: 'dizi, oyun' },
  { label: 'Kişisel gelişim', sub: 'günlük pratik' },
];

export const TIME_OPTIONS = ['5 dk', '10 dk', '20 dk', '30+ dk'];

export const SKILL_OPTIONS = ['Kelime', 'Gramer', 'Konuşma', 'Dinleme', 'Okuma', 'Yazma'];

/* ---------------------------------------------------------------- *
 * Design-system reference screens
 * ---------------------------------------------------------------- */

export const TOKEN_SCALES = [
  { name: 'Primary · Electric Blue', base: '#2E6BFF', steps: scales.primary },
  { name: 'Secondary · Violet', base: '#7C5CFF', steps: scales.secondary },
  { name: 'Neutral · Navy', base: '#0E1426', steps: scales.neutral },
  { name: 'Semantic', base: '#22C55E', steps: scales.semantic },
];

export const BUTTON_STATES = [
  { name: 'Varsayılan', label: 'Devam et' },
  { name: 'Basılı', label: 'Devam et' },
  { name: 'Devre dışı', label: 'Devam et' },
  { name: 'Yükleniyor', label: '••• Bekle' },
  { name: 'Başarı', label: '✓ Tamam' },
  { name: 'Hata', label: '✕ Tekrar dene' },
];

// Seviye numarası, lig ve premium etiketleri çıkarıldı: üçü de üründe yok.
// Tasarım referansında var olmayan bir kavramın rozetini tutmak, ileride
// birinin onu var sanmasına yol açar.
export const TOKEN_PILLS: { label: string; tint: ColorRole }[] = [
  { label: 'B1', tint: 'accent' },
  { label: '🔥 12 gün', tint: 'warning' },
  { label: '+50 XP', tint: 'primary' },
  { label: 'DOĞRU', tint: 'success' },
  { label: 'YANLIŞ', tint: 'error' },
  { label: 'AÇILDI', tint: 'secondary' },
  { label: 'KİLİTLİ', tint: 'textGhost' },
];

export const TOKEN_TEXT = {
  title: 'Tipografi · Manrope + Plus Jakarta Sans',
  display: 'Display 30 / 800',
  heading: 'Başlık 21 / 800',
  subheading: 'Alt başlık 15 / 700',
  body: 'Gövde 14/1.6 — Türkçe, İngilizce, Almanca, İspanyolca ve Fransızca diakritikleri destekler: şğıöçü äöüß ñáé àèç.',
  mono: 'Mono 11 · XP, süre, sıralama',
  surfaces: ['bg', 'surface', 'elevated', 'glass'],
  a11y: 'Erişilebilirlik: gövde metni ≥ 4.5:1 kontrast, dokunma hedefleri ≥ 44px, durum bilgisi asla yalnızca renkle verilmez (ikon + etiket eşlik eder), azaltılmış hareket tercihi tüm animasyonları kapatır.',
};

export type EmptyState = {
  title: string;
  text: string;
  cta: string;
  target: ScreenId;
  /** Madalyonun içindeki simge. */
  glyph: string;
};

// Arkadaş, mesaj ve kulüp boş durumları silindi: o ekranlar da silindi.
// Var olmayan bir ekranın "boş hâli"ni tasarım referansında tutmak, ileride
// birinin onu var sanmasına yol açar.
export const EMPTY_STATES: EmptyState[] = [
  {
    title: 'Başarım yok',
    text: 'İlk dersini bitir, ilk rozetin hemen açılır.',
    cta: 'Derse başla',
    target: 'lesson',
    glyph: '🏅',
  },
  {
    title: 'Kayıtlı kelime yok',
    text: 'Kelime kartındaki yıldıza dokunarak defterine ekle.',
    cta: 'Kelime çalış',
    target: 'vocab',
    glyph: '📇',
  },
  {
    title: 'Bildirim yok',
    text: 'Bekleyen bir şey yok. Burası yalnızca gerçekten ilgilenmen gereken bir şey olduğunda dolar.',
    cta: 'Ana sayfaya dön',
    target: 'home',
    glyph: '🔕',
  },
];

export type ErrorState = {
  glyph: string;
  title: string;
  text: string;
  code: string;
  primary: string;
  secondary: string;
  tint: ColorRole;
};

export const ERROR_STATES: ErrorState[] = [
  {
    glyph: '📡',
    title: 'Bağlantı yok',
    text: 'İnterneti kontrol et. Çevrimdışı indirilen üniteler çalışmaya devam eder.',
    code: 'ERR_NETWORK',
    primary: 'Tekrar dene',
    secondary: 'Çevrimdışı derslerim',
    tint: 'warning',
  },
  {
    glyph: '🎙',
    title: 'Mikrofon izni kapalı',
    text: 'Konuşma pratiği için mikrofon erişimine ihtiyacımız var. Ayarlar → Wordly → Mikrofon.',
    code: 'ERR_MIC_PERMISSION',
    primary: 'Ayarları aç',
    secondary: 'Yazarak devam et',
    tint: 'error',
  },
  {
    glyph: '🔇',
    title: 'Ses yüklenemedi',
    text: 'Telaffuz kaydına şu an ulaşamıyoruz. Metinle devam edebilirsin.',
    code: 'ERR_AUDIO_404',
    primary: 'Tekrar yükle',
    secondary: 'Metinle devam',
    tint: 'warning',
  },
  {
    glyph: '💳',
    title: 'Ödeme alınamadı',
    text: 'Bankan işlemi onaylamadı. Kart bilgilerini kontrol et veya başka yöntem dene.',
    code: 'ERR_PAYMENT_DECLINED',
    primary: 'Kartı güncelle',
    secondary: 'Başka yöntem',
    tint: 'error',
  },
  {
    glyph: '⏳',
    title: 'Oturum süresi doldu',
    text: 'Güvenliğin için çıkış yaptık. Seri ve XP’lerin korunuyor.',
    code: 'ERR_SESSION_EXPIRED',
    primary: 'Yeniden giriş yap',
    secondary: 'Yardım',
    tint: 'secondary',
  },
];
