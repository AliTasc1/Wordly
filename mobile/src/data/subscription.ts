/** Subscription usage, paywall and settings. */

import { colors } from '../theme/tokens';

export const PLAN_IDS = { yearly: 'yearly', monthly: 'monthly' } as const;
export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

// SETTING_GROUPS buradaydı: on üç satır, her biri "Açık"/"Kapalı" gösteren
// birer etiketti ve dokununca "Ayar ekranı açılır · demo" diyordu. Hiçbiri
// bir şey değiştirmiyordu ve dördü var olmayan özelliklere aitti (düello
// daveti, kulüp etkinliği, indirilenler, günlük hatırlatma).
//
// Ayarlar ekranı artık kendi satırlarını kendisi kuruyor ve hepsi gerçek:
// seviye testine ve hedeflere gidiyor, titreşimi gerçekten kapatıyor.
// Değiştirilemeyen iki şey (arayüz dili, aksan) bilgi satırı olarak duruyor —
// tek seçenekli bir anahtar, anahtar değildir.

/**
 * Uygulama sürümü — `app.json` ile aynı tutulmalı.
 *
 * Ayrı bir sabit olmasının sebebi, sürümün artık iki yere gitmesi: ekranın
 * altındaki satır ve dışa aktarılan dosyanın başlığı. Dosyaya
 * "WORDLY 2.4.0 · iOS 17+ / Android 11+" yazmak, sürüm alanına bir cümle
 * koymak olurdu.
 */
export const APP_VERSION = '2.4.0';

export const SETTINGS_FOOTER = {
  premium: { title: 'Plan', sub: 'Şu an her şey ücretsiz' },
  signOut: 'Çıkış yap',
  version: `WORDLY ${APP_VERSION} · iOS 17+ / Android 11+`,
};
