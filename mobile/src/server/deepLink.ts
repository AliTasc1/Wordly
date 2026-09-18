import * as Linking from 'expo-linking';
import { supabase } from './client';

/**
 * E-postadaki bağlantının uygulamaya dönüşü.
 *
 * Supabase doğrulama ve şifre sıfırlama e-postalarındaki bağlantı, tıklandıktan
 * sonra bizim verdiğimiz adrese yönleniyor ve jetonları URL'nin **çapa**
 * kısmında (`#access_token=…`) taşıyor. Tarayıcıda `detectSessionInUrl` bunu
 * kendisi okurdu; React Native'de `window.location` olmadığı için o ayar kapalı
 * ve çözümlemeyi burada yapıyoruz.
 *
 * Hata durumu da aynı yerden geliyor (`#error=…&error_description=…`) — süresi
 * dolmuş bir bağlantı sessizce hiçbir şey yapmamalı değil, sebebini söylemeli.
 */
export type LinkResult =
  | { kind: 'recovery' }
  | { kind: 'signedIn' }
  | { kind: 'error'; code: string; message: string }
  | { kind: 'ignored' };

/** E-postaların geri döneceği adres. Expo Go'da `exp://…`, derlenmiş uygulamada `wordly://…`. */
export function authRedirectUrl() {
  return Linking.createURL('/auth');
}

function paramsOf(url: string): URLSearchParams | null {
  const hash = url.indexOf('#');
  if (hash >= 0 && hash < url.length - 1) return new URLSearchParams(url.slice(hash + 1));
  // Bazı akışlar jetonu sorgu dizesinde döndürüyor; ikisine de bakmak
  // yanlış bir şey kaybetmekten ucuz.
  const query = url.indexOf('?');
  if (query >= 0 && query < url.length - 1) {
    return new URLSearchParams(url.slice(query + 1, hash >= 0 ? hash : undefined));
  }
  return null;
}

export async function handleAuthUrl(url: string): Promise<LinkResult> {
  const params = paramsOf(url);
  if (!params) return { kind: 'ignored' };

  const error = params.get('error_code') ?? params.get('error');
  if (error) {
    return {
      kind: 'error',
      code: error,
      // `+` işaretlerini elle boşluğa çevirmiyoruz: `URLSearchParams` bunu
      // zaten yapıyor ve tekrar yapmak, gerçekten `%2B` ile kodlanmış bir
      // artı işaretini boşluğa dönüştürürdü.
      message: params.get('error_description') ?? '',
    };
  }

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return { kind: 'ignored' };

  const { error: setError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (setError) {
    return {
      kind: 'error',
      code: setError.code ?? 'unexpected_failure',
      message: setError.message,
    };
  }

  // `type=recovery` "bu kişi şifresini unuttu" demek. Oturum açıldı ama onu
  // ana ekrana atmak yarım iş olurdu; yeni şifreyi belirlemesi gerekiyor.
  return params.get('type') === 'recovery' ? { kind: 'recovery' } : { kind: 'signedIn' };
}

/**
 * Hem uygulama açıkken gelen bağlantıyı hem de uygulamayı *açan* bağlantıyı
 * dinler. İkincisi kolayca unutulur: uygulama kapalıyken tıklanan bağlantı
 * `addEventListener`'a hiç uğramaz, yalnızca `getInitialURL()` ile alınır.
 */
export function watchAuthLinks(onResult: (result: LinkResult) => void) {
  let alive = true;

  const consume = (url: string | null) => {
    if (!url || !alive) return;
    void handleAuthUrl(url).then((result) => {
      if (alive && result.kind !== 'ignored') onResult(result);
    });
  };

  void Linking.getInitialURL().then(consume);
  const sub = Linking.addEventListener('url', ({ url }) => consume(url));

  return () => {
    alive = false;
    sub.remove();
  };
}
