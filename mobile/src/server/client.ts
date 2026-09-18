import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';

/**
 * Supabase istemcisi.
 *
 * React Native'e özgü üç ayar var:
 *
 * - `storage: AsyncStorage` — tarayıcıda `localStorage` olan yer burada yok.
 *   Oturum bu olmadan uygulama kapanınca kaybolurdu.
 * - `detectSessionInUrl: false` — bu bir tarayıcı sekmesi değil; adres
 *   çubuğunda dönen bir bağlantı yok. Açık bırakılırsa istemci olmayan bir
 *   `window.location` arar.
 * - `autoRefreshToken` — jeton bir saatte bir yenilenmeli, ama sadece uygulama
 *   önplandayken (aşağıdaki AppState dinleyicisi). Arka planda zamanlayıcı
 *   döndürmek pil yakar ve iOS zaten çoğunu askıya alır.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/**
 * Jeton yenilemeyi uygulamanın görünürlüğüne bağlar.
 *
 * Uygulama açıldığında bir kez elle çalıştırıyoruz: `AppState` yalnızca
 * *değişimde* haber verir, ilk durumu bildirmez, yoksa uygulama ön planda
 * açılıp hiç arka plana gitmezse yenileme hiç başlamazdı.
 */
export function watchAppStateForTokenRefresh() {
  if (AppState.currentState === 'active') void supabase.auth.startAutoRefresh();

  const sub = AppState.addEventListener('change', (next) => {
    if (next === 'active') void supabase.auth.startAutoRefresh();
    else void supabase.auth.stopAutoRefresh();
  });

  return () => sub.remove();
}
