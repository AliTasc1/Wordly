import { AuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';

/**
 * Sunucu hatasını Türkçeye çevirir.
 *
 * Tanımadığımız bir kod geldiğinde uydurma bir açıklama yazmıyoruz: genel bir
 * cümle veriyoruz ve sunucunun kendi metnini `raw` içinde saklıyoruz. Ekran
 * onu küçük puntoyla gösteriyor. Sebebi gizlemek, kullanıcının da bizim de
 * neyin ters gittiğini öğrenmemizi engellerdi.
 */
export type Problem = { text: string; raw?: string };

const BY_CODE: Record<string, string> = {
  invalid_credentials: 'E-posta veya şifre hatalı.',
  email_not_confirmed: 'Önce e-postandaki doğrulama bağlantısına tıkla.',
  user_already_exists: 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.',
  email_exists: 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.',
  email_address_invalid: 'E-posta adresi geçerli görünmüyor.',
  // Supabase'in varsayılan e-posta servisi yalnızca proje ekibindeki
  // adreslere gönderiyor. Gerçek bir SMTP bağlanana kadar başka her adres
  // bu hatayı alır; sebebi söylemezsek kullanıcı kendi adresinde sorun
  // olduğunu sanır.
  email_address_not_authorized:
    'Bu adrese e-posta gönderilemiyor. Uygulama henüz kendi e-posta sunucusuna bağlı değil.',
  validation_failed: 'Girdiğin bilgilerde eksik ya da hatalı bir şey var.',
  weak_password: 'Şifre yeterince güçlü değil.',
  same_password: 'Yeni şifre eskisiyle aynı olamaz.',
  over_email_send_rate_limit: 'Çok fazla e-posta istendi. Birkaç dakika bekle.',
  over_request_rate_limit: 'Çok sık denedin. Biraz bekleyip tekrar dene.',
  otp_expired: 'Bağlantının süresi dolmuş. Yeni bir tane iste.',
  signup_disabled: 'Yeni kayıtlar şu an kapalı.',
  email_provider_disabled: 'E-posta ile giriş şu an kapalı.',
  user_banned: 'Bu hesap askıya alınmış.',
  user_not_found: 'Böyle bir hesap bulunamadı.',
  session_expired: 'Oturumun süresi doldu. Tekrar giriş yap.',
  request_timeout: 'Sunucu zamanında cevap vermedi. Tekrar dene.',
  captcha_failed: 'Güvenlik doğrulaması geçilemedi.',
};

export function problemOf(error: unknown): Problem {
  if (!error) return { text: 'Bilinmeyen bir hata oldu.' };

  // Ağ hatası koda bakılmadan önce ayrılıyor: burada sorun hesapta değil,
  // bağlantıda. Kullanıcıya şifresini sorgulatmanın anlamı yok.
  if (isAuthRetryableFetchError(error)) {
    return { text: 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.' };
  }

  if (error instanceof AuthError) {
    const known = error.code ? BY_CODE[error.code] : undefined;
    if (known) return { text: known };
    return { text: 'İşlem tamamlanamadı.', raw: error.message };
  }

  if (error instanceof Error) {
    if (/network request failed/i.test(error.message)) {
      return { text: 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.' };
    }
    return { text: 'İşlem tamamlanamadı.', raw: error.message };
  }

  return { text: 'İşlem tamamlanamadı.', raw: String(error) };
}

/**
 * Şifre kuralları.
 *
 * Sunucu da altı karakter şartını uyguluyor; buradaki kontrol ağ turunu
 * beklemeden aynı şeyi söylemek için var, onun yerine geçmek için değil.
 * Sunucudan `weak_password` dönerse yine gösteriyoruz.
 */
export const MIN_PASSWORD = 8;

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD)
    return `Şifre en az ${MIN_PASSWORD} karakter olmalı.`;
  if (!/[a-zA-Z]/.test(password)) return 'Şifrede en az bir harf olmalı.';
  if (!/[0-9]/.test(password)) return 'Şifrede en az bir rakam olmalı.';
  return null;
}

/**
 * E-posta biçimi.
 *
 * Kasıtlı olarak gevşek: geçerli adreslerin tamamını tarif eden bir kalıp
 * yazmak mümkün değil ve denemek gerçek adresleri reddetmekle biter. Tek
 * amacı "@" unutulduğunda ağ turunu boşa harcamamak; son sözü sunucu söylüyor.
 */
export function emailProblem(email: string): string | null {
  const value = email.trim();
  if (!value) return 'E-posta adresi gerekli.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'E-posta adresi eksik görünüyor.';
  return null;
}
