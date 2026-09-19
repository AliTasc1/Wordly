import { useApp } from './AppContext';
import { useStudyClock } from './useStudyClock';

/**
 * Bir alıştırma ekranını çalışma sayacına bağlar.
 *
 * Yedi ekranda üç satır yazmak yerine tek satır: `useStudySession()`.
 * Bağlamı ve sayacı bir arada tuttuğu için de ekranların `goal` nesnesinin
 * içini bilmesi gerekmiyor — sayacın nasıl çalıştığı değişirse ekranlara
 * dokunulmuyor.
 *
 * Dönen `ping`, ekranın "öğrenci bir şey yaptı" demesi için. `award()` bunu
 * kendisi çağırıyor, yani soru cevaplayan ekranların ayrıca söylemesi
 * gerekmiyor; XP vermeyen hareketler (kelime kartını çevirmek, sesi
 * dinlemek) için lazım.
 */
export function useStudySession(): { ping: () => void } {
  const { goal } = useApp();
  useStudyClock(goal.addStudy, goal.activityAt);
  return { ping: goal.ping };
}
