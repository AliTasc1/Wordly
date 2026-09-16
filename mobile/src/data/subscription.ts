/** Subscription usage, paywall and settings. */

import { colors } from '../theme/tokens';

export const PLAN_IDS = { yearly: 'yearly', monthly: 'monthly' } as const;
export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export const CURRENT_PLAN = {
  kicker: 'MEVCUT PLAN',
  name: 'Ücretsiz',
  status: 'AKTİF',
  note: 'Günlük limitlerle öğrenmeye devam edebilirsin. Limitler her gün 00:00’da sıfırlanır.',
};

export const USAGE = [
  { name: 'Günlük ders', value: '3 / 5', pct: 60, note: '2 ders kaldı' },
  { name: 'AI konuşma', value: '1 / 1', pct: 100, note: 'Limit doldu · yarın 00:00' },
  { name: 'Oyun turu', value: '6 / 10', pct: 60, note: '4 tur kaldı' },
  { name: 'Analiz', value: 'Temel', pct: 30, note: 'Gelişmiş analiz Premium' },
];

export const BENEFITS = [
  { glyph: '∞', name: 'Sınırsız ders', sub: 'Günlük limit yok', free: 'Free: 5', tint: colors.primary },
  { glyph: '🤖', name: 'AI İngilizce Koçu', sub: 'Hafızalı kişisel öğretmen', free: 'Free: 1', tint: colors.secondary },
  { glyph: '🎙', name: 'Sınırsız konuşma', sub: 'Telaffuz analizi dahil', free: 'Free: 1', tint: colors.accent },
  { glyph: '📈', name: 'Gelişmiş analiz', sub: 'Beceri trendleri, hata defteri', free: 'Free: —', tint: colors.success },
  { glyph: '🗂', name: 'Kişisel müfredat', sub: 'Hedefine göre yeniden kurulur', free: 'Free: —', tint: colors.warning },
  { glyph: '📥', name: 'Çevrimdışı öğrenme', sub: 'Uçakta bile devam et', free: 'Free: —', tint: colors.orange },
];

export type Plan = {
  id: PlanId;
  name: string;
  sub: string;
  price: string;
  unit: string;
  tag: string;
  trialNote: string;
  trialToast: string;
};

export const PLANS: Plan[] = [
  {
    id: PLAN_IDS.yearly,
    name: 'Yıllık',
    sub: '1.099 TL/yıl',
    price: '₺91',
    unit: 'aylık',
    tag: '2 AY BEDAVA',
    trialNote: '7 gün sonra ₺1.099/yıl (₺91/ay)',
    trialToast: 'Yıllık plan · 6 Ekim’a kadar ücretsiz',
  },
  {
    id: PLAN_IDS.monthly,
    name: 'Aylık',
    sub: 'Her ay yenilenir',
    price: '₺149',
    unit: 'aylık',
    tag: '',
    trialNote: '7 gün sonra ₺149/ay',
    trialToast: 'Aylık plan · 6 Ekim’a kadar ücretsiz',
  },
];

export const PAYWALL = {
  badge: 'WORDLY PREMIUM',
  title: 'İngilizce potansiyelini aç.',
  sub: 'Kişisel AI destekli İngilizce koçun.',
  cta: '7 gün ücretsiz dene',
  legal: 'İstediğin an iptal edebilirsin · Otomatik yenilenir',
  links: ['Koşullar', 'Gizlilik', 'Geri yükle'],
  trialStarted: '7 günlük deneme başladı',
};

export const SUBSCRIPTION_CTA = {
  upgrade: 'Premium’a geç · 7 gün ücretsiz',
  restore: 'Satın alımları geri yükle',
  usageTitle: 'Bugünkü kullanımın',
};

export type SettingItem = {
  glyph: string;
  name: string;
  sub: string;
  value: string;
  tint: string;
};

export const SETTING_GROUPS: { name: string; items: SettingItem[] }[] = [
  {
    name: 'HESAP',
    items: [
      { glyph: '👤', name: 'Profil bilgileri', sub: 'Ad, kullanıcı adı, avatar', value: 'Düzenle', tint: colors.primary },
      { glyph: '🎯', name: 'Hedefler', sub: 'Kariyer · 10 dk/gün', value: 'Değiştir', tint: colors.secondary },
      { glyph: '📊', name: 'Seviye', sub: 'B1+ · yeniden test', value: 'B1+', tint: colors.accent },
    ],
  },
  {
    name: 'BİLDİRİMLER',
    items: [
      { glyph: '🔔', name: 'Günlük hatırlatma', sub: '20:00', value: 'Açık', tint: colors.warning },
      { glyph: '⚔', name: 'Düello daveti', sub: 'Anında bildirim', value: 'Açık', tint: colors.error },
      { glyph: '🏛', name: 'Kulüp etkinliği', sub: 'Haftalık özet', value: 'Kapalı', tint: colors.success },
    ],
  },
  {
    name: 'SES VE ERİŞİLEBİLİRLİK',
    items: [
      { glyph: '🔊', name: 'Ses efektleri', sub: 'Doğru/yanlış tonları', value: 'Açık', tint: colors.accent },
      { glyph: '📳', name: 'Titreşim', sub: 'Harf seçimi ve kombo', value: 'Açık', tint: colors.secondary },
      { glyph: '🐢', name: 'Azaltılmış hareket', sub: 'Animasyonları kapat', value: 'Kapalı', tint: colors.textDim },
      { glyph: '🔠', name: 'Büyük metin', sub: 'Sistem ayarını kullan', value: 'Açık', tint: colors.primary },
    ],
  },
  {
    name: 'UYGULAMA',
    items: [
      { glyph: '🌍', name: 'Arayüz dili', sub: 'Türkçe', value: 'TR', tint: colors.primary },
      { glyph: '🎧', name: 'Aksan', sub: 'İngiliz İngilizcesi', value: 'UK', tint: colors.accent },
      { glyph: '📥', name: 'İndirilenler', sub: 'Çevrimdışı 3 ünite', value: 'Premium', tint: colors.warning },
    ],
  },
];

export const SETTINGS_FOOTER = {
  premium: { title: 'Premium’a geç', sub: '7 gün ücretsiz · sınırsız her şey' },
  signOut: 'Çıkış yap',
  version: 'WORDLY 2.4.0 · iOS 17+ / Android 11+',
  settingToast: 'Ayar ekranı açılır · demo',
};
