import * as Speech from 'expo-speech';
import type { Level } from '../content/types';
import { playClip, playClips, stopClips } from './player';

/**
 * Seslendirme katmanı — iki motor, tek arayüz.
 *
 * Bir repliğin üretilmiş ses dosyası varsa o çalınır (Google Cloud TTS ile
 * bir kez üretildi, bkz. content/build-audio.py); yoksa cihazın kendi
 * seslendirmesine düşülür. Ekranlar hangisinin kullanıldığını bilmez ve
 * Speech'i doğrudan çağırmaz — bu ayrım sayesinde seslendirme bir seviyede
 * varken diğerinde yokken de uygulama çalışır.
 *
 * Bir diyalogda iki motor karıştırılmıyor: ya hepsi dosya, ya hepsi cihaz
 * sesi. Yarısı stüdyo yarısı robot bir diyalog, ikisinden de kötüdür.
 */

/**
 * Seviyeye göre konuşma hızı.
 *
 * Cihazın 1.0 hızı gerçek konuşma hızıdır ve A1'de öğrenci kelimeleri
 * birbirinden ayıramaz. Seviye yükseldikçe gerçek hıza yaklaşıyoruz; B2'den
 * sonra yavaşlatmak öğrenciye yalan söylemek olur, çünkü gerçek hayatta kimse
 * onun için yavaşlamayacak.
 */
const RATE: Record<Level, number> = {
  A1: 0.72,
  A2: 0.8,
  B1: 0.9,
  B2: 1,
  C1: 1,
  C2: 1,
};

/** Diyalogda iki konuşmacıyı ayırmak için kullanılacak ses kimlikleri. */
let cast: string[] = [];
let casting: Promise<void> | null = null;

/**
 * Cihazdaki İngilizce sesleri bulup en fazla ikisini seçer.
 *
 * İki konuşmacı aynı sesle okunursa diyalog diyalog olmaktan çıkar. Cihazda
 * birden fazla İngilizce ses yoksa liste boş kalır ve her replik varsayılan
 * sesle okunur — bu da çalışır, sadece daha az ayırt edilir.
 */
export function primeVoices(): Promise<void> {
  if (casting) return casting;
  casting = Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const english = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));
      // Amerikan İngilizcesi ürünün yazım standardı; varsa onu yeğliyoruz.
      const us = english.filter((v) => v.language?.toLowerCase().startsWith('en-us'));
      const pool = us.length >= 2 ? us : english;
      cast = pool.slice(0, 2).map((v) => v.identifier);
    })
    .catch(() => {
      // Ses listesi alınamazsa sorun değil: varsayılan sesle okunur.
      cast = [];
    });
  return casting;
}

type SpeakOptions = {
  level: Level;
  /** Diyalogdaki konuşmacı sırası; 0 ve 1 farklı seslerle okunur. */
  speaker?: number;
  /** Kullanıcının seçtiği hız çarpanı (1, 0.75, 0.5). */
  speed?: number;
  onStart?: () => void;
  onDone?: () => void;
};

function options(opts: SpeakOptions): Speech.SpeechOptions {
  const voice = opts.speaker != null ? cast[opts.speaker % Math.max(cast.length, 1)] : undefined;
  return {
    language: 'en-US',
    rate: RATE[opts.level] * (opts.speed ?? 1),
    voice,
    onStart: opts.onStart,
    onDone: opts.onDone,
  };
}

/** Tek bir cümleyi seslendirir: dosya varsa dosyayı, yoksa cihaz sesini. */
export function speakLine(text: string, opts: SpeakOptions & { clip?: number }): void {
  if (opts.clip != null) {
    stopSpeech();
    opts.onStart?.();
    playClip(opts.clip, { rate: opts.speed ?? 1, onDone: opts.onDone });
    return;
  }
  Speech.speak(text, options(opts));
}

/** Konuşan ya da çalan varsa susturur ve sıradakileri iptal eder. */
export function stopSpeech(): void {
  generation += 1;
  Speech.stop();
  stopClips();
}

/**
 * Sıralı okuma sırasında hangi çağrının güncel olduğunu tutar.
 *
 * Speech.stop() sıradaki replikleri iptal ederken onDone tetiklenebiliyor;
 * numara değiştiği için eski çağrının geri bildirimleri yok sayılıyor ve
 * durdurulmuş bir diyalog kendi kendine ilerlemiyor.
 */
let generation = 0;

export type Utterance = {
  text: string;
  speaker: number;
  /** Varsa üretilmiş ses dosyası (require() modül kimliği). */
  clip?: number;
};

/**
 * Bir diyaloğu replik replik okur.
 *
 * Her repliğin başında `onLine` çağrılır; ekran o repliği vurgular. Diyalog
 * bitince `onDone` gelir. Dönen fonksiyon okumayı durdurur.
 */
export function speakSequence(
  lines: Utterance[],
  opts: { level: Level; speed?: number; from?: number; onLine?: (index: number) => void; onDone?: () => void },
): () => void {
  stopSpeech();
  const mine = generation;
  const start = opts.from ?? 0;

  // Diyalogdaki her repliğin dosyası varsa dosya motoru kullanılıyor.
  // Eksik tek bir replik bile varsa tamamı cihaz sesiyle okunur; iki motoru
  // aynı diyalogda karıştırmak sesi replik başına değiştirir.
  const clips = lines.map((l) => l.clip);
  if (clips.every((c): c is number => c != null)) {
    playClips(clips, {
      from: start,
      rate: opts.speed ?? 1,
      onIndex: (index) => {
        if (generation === mine) opts.onLine?.(index);
      },
      onDone: () => {
        if (generation === mine) opts.onDone?.();
      },
    });
    return stopSpeech;
  }

  lines.slice(start).forEach((line, offset) => {
    const index = start + offset;
    const last = index === lines.length - 1;
    speakLine(line.text, {
      level: opts.level,
      speaker: line.speaker,
      speed: opts.speed,
      onStart: () => {
        if (generation === mine) opts.onLine?.(index);
      },
      onDone: () => {
        if (generation === mine && last) opts.onDone?.();
      },
    });
  });

  return stopSpeech;
}
