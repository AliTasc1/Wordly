/** Splash, intro, goal picker and the design-system reference screens. */

import { colors, scales } from '../theme/tokens';
import type { ScreenId } from '../navigation/routes';

export const SPLASH = {
  tagline: 'İngilizce öğren. Oyna. Konuş.',
  loading: 'Hesabın hazırlanıyor',
  primary: 'Ücretsiz Başla',
  secondary: 'Hesabım var · Giriş yap',
  legal: 'Devam ederek Kullanım Koşulları’nı kabul edersin.',
};

export const INTRO = {
  skip: 'Atla',
  art: 'görsel: harf arenası sahnesi',
  title: 'Ders çalışıyormuş gibi olmadan İngilizce öğren.',
  body: 'Günde 10 dakika oyna, gerçek insanlarla yarış, AI koçunla konuşarak pratik yap. Seviyeni CEFR standardına göre takip ederiz.',
  stats: [
    { value: '4.9M', label: 'öğrenci', tint: colors.accent },
    { value: '18 dk', label: 'ortalama süre', tint: colors.secondary },
    { value: '+2 kur', label: '3 ayda', tint: colors.success },
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

export const TOKEN_PILLS = [
  { label: 'B1+', tint: colors.accent },
  { label: '🔥 42 gün', tint: colors.warning },
  { label: 'LV 24', tint: colors.secondary },
  { label: '+50 XP', tint: colors.primary },
  { label: 'ALTIN LİG', tint: colors.warning },
  { label: 'DOĞRU', tint: colors.success },
  { label: 'YANLIŞ', tint: colors.error },
  { label: 'PREMIUM', tint: colors.secondary },
  { label: 'KİLİTLİ', tint: colors.textGhost },
];

export const TOKEN_TEXT = {
  title: 'Tipografi · Manrope + Plus Jakarta Sans',
  display: 'Display 30 / 800',
  heading: 'Başlık 21 / 800',
  subheading: 'Alt başlık 15 / 700',
  body: 'Gövde 14/1.6 — Türkçe, İngilizce, Almanca, İspanyolca ve Fransızca diakritikleri destekler: şğıöçü äöüß ñáé àèç.',
  mono: 'Mono 11 · XP, süre, sıralama',
  surfaces: ['bg', 'surface', 'elevated', 'glass'],
  a11y:
    'Erişilebilirlik: gövde metni ≥ 4.5:1 kontrast, dokunma hedefleri ≥ 44px, durum bilgisi asla yalnızca renkle verilmez (ikon + etiket eşlik eder), azaltılmış hareket tercihi tüm animasyonları kapatır.',
};

export type EmptyState = {
  title: string;
  text: string;
  cta: string;
  target: ScreenId;
  art: string;
};

export const EMPTY_STATES: EmptyState[] = [
  { title: 'Henüz arkadaşın yok', text: 'Arkadaş ekleyince düello yapabilir, serilerinizi karşılaştırabilirsin.', cta: 'Arkadaş davet et', target: 'friends', art: 'arkadaş listesi görseli' },
  { title: 'Mesaj yok', text: 'Kulüp sohbetlerinde bir soru sorarak başla. Topluluk yanıtlamayı sever.', cta: 'Kulüplere göz at', target: 'clubs', art: 'sohbet baloncukları' },
  { title: 'Hiç kulübe katılmadın', text: 'İlgi alanına uygun kulüpte haftalık turnuvalara katıl.', cta: 'Kulüp bul', target: 'clubs', art: 'kulüp amblemleri' },
  { title: 'Başarım yok', text: 'İlk dersini bitir, ilk rozetin hemen açılır.', cta: 'Derse başla', target: 'lesson', art: 'rozet çerçevesi' },
  { title: 'Kayıtlı kelime yok', text: 'Kelime kartındaki yıldıza dokunarak defterine ekle.', cta: 'Kelime çalış', target: 'vocab', art: 'kelime kartı' },
  { title: 'Bildirim yok', text: 'Her şey güncel. Yeni bir düello geldiğinde haber vereceğiz.', cta: 'Ana sayfaya dön', target: 'home', art: 'boş zil' },
];

export type ErrorState = {
  glyph: string;
  title: string;
  text: string;
  code: string;
  primary: string;
  secondary: string;
  tint: string;
};

export const ERROR_STATES: ErrorState[] = [
  { glyph: '📡', title: 'Bağlantı yok', text: 'İnterneti kontrol et. Çevrimdışı indirilen üniteler çalışmaya devam eder.', code: 'ERR_NETWORK', primary: 'Tekrar dene', secondary: 'Çevrimdışı derslerim', tint: colors.warning },
  { glyph: '🎙', title: 'Mikrofon izni kapalı', text: 'Konuşma pratiği için mikrofon erişimine ihtiyacımız var. Ayarlar → Wordly → Mikrofon.', code: 'ERR_MIC_PERMISSION', primary: 'Ayarları aç', secondary: 'Yazarak devam et', tint: colors.error },
  { glyph: '🔇', title: 'Ses yüklenemedi', text: 'Telaffuz kaydına şu an ulaşamıyoruz. Metinle devam edebilirsin.', code: 'ERR_AUDIO_404', primary: 'Tekrar yükle', secondary: 'Metinle devam', tint: colors.warning },
  { glyph: '💳', title: 'Ödeme alınamadı', text: 'Bankan işlemi onaylamadı. Kart bilgilerini kontrol et veya başka yöntem dene.', code: 'ERR_PAYMENT_DECLINED', primary: 'Kartı güncelle', secondary: 'Başka yöntem', tint: colors.error },
  { glyph: '⏳', title: 'Oturum süresi doldu', text: 'Güvenliğin için çıkış yaptık. Seri ve XP’lerin korunuyor.', code: 'ERR_SESSION_EXPIRED', primary: 'Yeniden giriş yap', secondary: 'Yardım', tint: colors.secondary },
];
