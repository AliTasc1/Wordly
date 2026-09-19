/**
 * Çalışma sayacının kuralı.
 *
 * `state/useStudyClock.ts` içinden ayrı duruyor çünkü o dosya React Native
 * ve navigasyon çekiyor; Node onları çözemiyor ve kural test edilemez hâle
 * geliyordu. `days.ts` de aynı sebeple ayrılmıştı: sınanacak şey, sınanması
 * için cihaz gerektirmemeli.
 */

/** Bu kadar hareketsizlikten sonra saymayı bırakıyor. */
export const IDLE_MS = 2 * 60 * 1000;

/**
 * Saymanın saf kuralı — ekran ve zamanlayıcı olmadan sınanabilsin diye.
 *
 * `useStudyClock` bunu her adımda soruyor.
 */
export function shouldCount(opts: {
  focused: boolean;
  appActive: boolean;
  now: number;
  activityAt: number;
}): boolean {
  if (!opts.focused || !opts.appActive) return false;
  return opts.now - opts.activityAt <= IDLE_MS;
}
