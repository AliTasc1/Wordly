import type { ThemeName } from './palette';

/**
 * Tema seçimi.
 *
 * Üç seçenek var ve varsayılan `system`. Telefonunu akşam karanlık temaya
 * alan kişi uygulamanın da onu izlemesini bekliyor; açılışta "koyu" ya da
 * "açık" demek, o beklentiyi kırıp kullanıcıyı iki yerde ayar yapmaya
 * zorlamak olurdu. İsteyen sabitliyor.
 *
 * Bu dosya React Native'i içeri almıyor — kararın kendisi burada dursun ki
 * testi çalıştırılabilsin.
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Kayıt anahtarı. Sürüm numarası, ileride biçim değişirse eskiyi görmezden gelmek için. */
export const THEME_KEY = 'wordly:theme:v1';

export const MODES: { mode: ThemeMode; label: string; glyph: string; note: string }[] = [
  { mode: 'system', label: 'Sistem', glyph: '⚙️', note: 'Telefonun ayarını izler' },
  { mode: 'light', label: 'Açık', glyph: '☀️', note: 'Her zaman aydınlık' },
  { mode: 'dark', label: 'Koyu', glyph: '🌙', note: 'Her zaman karanlık' },
];

/** Kayıtlı değeri okur; tanımadığı her şey varsayılana düşer. */
export function parseMode(raw: string | null | undefined): ThemeMode {
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

/**
 * React Native'in `useColorScheme()` dönüşü.
 *
 * `'light'` ve `'dark'` dışında iki cevap daha var: Android'de `null` ve
 * bazı sürümlerde `'unspecified'`. İkisi de "telefon söylemiyor" demek.
 */
export type SystemScheme = 'light' | 'dark' | 'unspecified' | null | undefined;

/**
 * Seçim + telefonun durumu → hangi palet.
 *
 * Telefon bir şey söylemiyorsa koyuya düşüyoruz, çünkü uygulamanın kendi
 * kimliği koyu. Yalnızca açık isteyene açık veriliyor.
 */
export function resolveName(mode: ThemeMode, system: SystemScheme): ThemeName {
  if (mode !== 'system') return mode;
  return system === 'light' ? 'light' : 'dark';
}

