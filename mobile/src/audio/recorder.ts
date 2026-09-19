import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { playUri, stopClips } from './player';

/**
 * Konuşma kaydı.
 *
 * Konuşma ekranındaki mikrofon düğmesi bugüne kadar hiçbir şey kaydetmiyordu:
 * yalnızca kırmızıya dönen bir arayüz durumuydu. Artık gerçekten kaydediyor
 * ve öğrenci kendi sesini model sesle yan yana dinleyebiliyor.
 *
 * **Puan vermiyoruz.** Telaffuz puanı için konuşma tanıma servisi gerekiyor;
 * o yokken üretilecek her sayı uydurma olurdu ve öğrenciye telaffuzu hakkında
 * yanlış bir şey öğretirdi. Karşılaştırma öğrencinin kendi kulağına bırakılıyor
 * — bu, sahte bir "%87" den hem daha dürüst hem daha öğreticidir.
 */

export type RecorderPhase =
  /** Henüz kayıt yok. */
  | 'idle'
  /** Mikrofon izni isteniyor. */
  | 'asking'
  /** Kaydediyor. */
  | 'recording'
  /** Kayıt var, dinlenebilir. */
  | 'ready'
  /** İzin verilmedi ya da kayıt alınamadı. */
  | 'blocked';

export type Recorder = {
  phase: RecorderPhase;
  /** Kayıt sürerken geçen süre (saniye). */
  seconds: number;
  /**
   * Anlık giriş seviyesi, 0–1.
   *
   * Dalga çizimi bunu kullanıyor. Önceki dalga sabit bir diziyle
   * oynatılıyordu, yani mikrofon kapalı olsa bile kıpırdıyordu; öğrenci
   * sesinin alındığını sanırdı.
   */
  level: number;
  /**
   * Her ölçüm güncellemesinde değişen sayaç.
   *
   * Dalga çizimi buna bakarak bir adım ilerliyor. Yalnızca `level`'a bakmak,
   * seviye iki ölçümde aynı kaldığında dalgayı dondururdu.
   */
  tick: number;
  /** Kayıt dosyası; yoksa null. */
  uri: string | null;
  /** İzin reddedildiğinde ya da kayıt başarısız olduğunda sebep. */
  problem: string | null;

  start: () => void;
  stop: () => void;
  /** Kendi kaydını çalar. */
  playBack: () => void;
  /** Kaydı atar — yeni bir deneme için. */
  discard: () => void;
};

/**
 * dBFS ölçümünü 0–1 aralığına indirir.
 *
 * `metering` desibel veriyor: sessizlik yaklaşık -60, en yüksek 0. Doğrudan
 * çizersek konuşma sesi çubukların en altında kalır, çünkü insan sesi tipik
 * olarak -30 ile -10 arasında geziyor. -50'yi taban alıp oradan ölçekliyoruz.
 */
const FLOOR_DB = -50;

function levelOf(metering: number | undefined): number {
  if (metering == null || !Number.isFinite(metering)) return 0;
  const clamped = Math.max(FLOOR_DB, Math.min(0, metering));
  return (clamped - FLOOR_DB) / -FLOOR_DB;
}

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

export function useRecorder(): Recorder {
  const recorder = useAudioRecorder(OPTIONS);

  // Varsayılan 500 ms saniyede iki ölçüm demek; 26 çubuklu dalga on üç
  // saniyede dolardı ve konuşmayı değil, konuşmanın kabasını gösterirdi.
  // 100 ms'de 26 çubuk yaklaşık 2,5 saniyelik pencere — söylenen cümlenin
  // ritmi görünüyor.
  //
  // Sabit veriliyor: `useAudioRecorderState` bu değeri yalnızca ilk çalışmada
  // okuyor (efekt bağımlılığı `[recorder.id]`), yani duruma göre değiştirmek
  // işe yaramazdı. Boştayken de yokluyor ama durum değişmedikçe React'e
  // yazmıyor, dolayısıyla yeniden çizim olmuyor.
  const state = useAudioRecorderState(recorder, 100);

  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [uri, setUri] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  // Ekrandan çıkarken kaydı kapatabilmek için: `stop()` asenkron ve temizlik
  // sırasında React durumuna yazmak istemiyoruz.
  const recording = useRef(false);
  recording.current = phase === 'recording';

  useEffect(
    () => () => {
      if (recording.current) void recorder.stop().catch(() => {});
      void setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    },
    [recorder],
  );

  const start = useCallback(() => {
    setProblem(null);
    void (async () => {
      setPhase('asking');
      try {
        let granted = (await getRecordingPermissionsAsync()).granted;
        if (!granted) granted = (await requestRecordingPermissionsAsync()).granted;

        if (!granted) {
          setPhase('blocked');
          setProblem(
            'Mikrofon izni verilmedi. Telefonun ayarlarından WORDLY için mikrofonu açabilirsin.',
          );
          return;
        }

        // Kendi kaydını dinlerken model ses çalıyor olabilir; ikisi üst üste
        // binerse mikrofon hoparlörü de kaydeder.
        stopClips();

        // iOS'ta kayıt için bu şart. Kayıt bitince geri kapatılıyor, yoksa
        // sonraki çalmalarda ses kısık geliyor.
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

        await recorder.prepareToRecordAsync(OPTIONS);
        recorder.record();
        setUri(null);
        setPhase('recording');
      } catch (error) {
        setPhase('blocked');
        setProblem(error instanceof Error ? error.message : 'Kayıt başlatılamadı.');
      }
    })();
  }, [recorder]);

  const stop = useCallback(() => {
    void (async () => {
      try {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

        const file = recorder.uri;
        if (!file) {
          setPhase('idle');
          setProblem('Kayıt alınamadı. Tekrar dene.');
          return;
        }
        setUri(file);
        setPhase('ready');
      } catch (error) {
        setPhase('idle');
        setProblem(error instanceof Error ? error.message : 'Kayıt durdurulamadı.');
      }
    })();
  }, [recorder]);

  const playBack = useCallback(() => {
    if (uri) playUri(uri);
  }, [uri]);

  const discard = useCallback(() => {
    stopClips();
    setUri(null);
    setProblem(null);
    setPhase('idle');
  }, []);

  return {
    phase,
    seconds: Math.floor((state.durationMillis ?? 0) / 1000),
    level: phase === 'recording' ? levelOf(state.metering) : 0,
    tick: state.durationMillis ?? 0,
    uri,
    problem,
    start,
    stop,
    playBack,
    discard,
  };
}
