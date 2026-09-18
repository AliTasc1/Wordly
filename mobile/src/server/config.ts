/**
 * Sunucu adresi ve istemci anahtarı.
 *
 * Buradaki anahtar gizli değil — "publishable" anahtar tam da istemciye
 * gömülmek için üretilmiştir. Onu koruyan şey saklanması değil, veritabanındaki
 * satır bazlı güvenlik (RLS) kuralları: anahtarı eline geçiren biri yalnızca
 * kendi oturumunun görmeye hakkı olan satırları görebilir.
 *
 * `service_role` anahtarı ise RLS'i tamamen atlar. O anahtar bu dosyaya, bu
 * depoya veya uygulamanın herhangi bir yerine ASLA girmez.
 */
export const SUPABASE_URL = 'https://qlbhedgcronlonlqpyvq.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_gDW__yYcvUM48AfX-6Rcew_pL8aSjM5';
