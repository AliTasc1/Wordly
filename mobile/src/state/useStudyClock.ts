import React, { useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { IDLE_MS } from '../content/study-clock';

/** Saniyede bir mi, daha seyrek mi — sayaç adımı. */
const TICK_MS = 1000;

/**
 * Alıştırma ekranlarında geçen süreyi sayar.
 *
 * Günlük hedef "10 dakika" diyorsa ölçülecek şey dakikadır. XP'den süre
 * türetmek bir satırlık iş olurdu ve uydurma: hızlı çözen ile takılan aynı
 * süreyi görürdü.
 *
 * ------------------------------------------------------------ ne sayılmaz
 * Üç durumda sayaç durur; üçü de "öğrenci şu an çalışmıyor" demek:
 *
 *   1. Uygulama arka plandaysa. Telefon cebe girdiğinde saat işlemeye
 *      devam etseydi, akşam "bugün 4 saat çalıştın" yazardı.
 *   2. Ekran odakta değilse. Başka sekmeye geçilmiş, ekran arkada duruyor.
 *   3. İki dakikadır hiçbir şey olmadıysa. Bu sonuncusu olmadan, uygulamayı
 *      açık unutan kişiye çalışmadığı süre yazılırdı — ve bu, hedefin
 *      kendisini anlamsız kılardı. Hedefin işi ne zaman durabileceğini
 *      söylemek; yanlış ölçülen bir hedef hiç hedef koymamaktan kötüdür.
 *
 * Hareket ölçüsü `activityAt`: ekranlar soru cevaplayınca, kart çevirince
 * ya da ses çalınca `ping()` çağırıyor. Sayaç değil, `AppContext` bu damgayı
 * tutuyor — çünkü hareket ekran değiştirse de sürüyor.
 */
export function useStudyClock(
  add: (seconds: number) => void,
  activityAt: React.RefObject<number>,
): void {
  // `add` her çizimde yeniden kurulabilir; efekti ona bağlamak sayacı
  // saniyede bir yeniden kurardı.
  const addRef = useRef(add);
  addRef.current = add;

  const running = useRef(false);

  useFocusEffect(
    useCallback(() => {
      running.current = true;

      const sub = AppState.addEventListener('change', (next) => {
        running.current = next === 'active';
      });

      const timer = setInterval(() => {
        if (!running.current) return;
        if (Date.now() - activityAt.current > IDLE_MS) return;
        addRef.current(TICK_MS / 1000);
      }, TICK_MS);

      return () => {
        running.current = false;
        clearInterval(timer);
        sub.remove();
      };
    }, [activityAt]),
  );
}
