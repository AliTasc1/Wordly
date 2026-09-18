import * as Speech from 'expo-speech';
import type { Level } from '../content/types';

/**
 * Seslendirme katmanı — bugün cihazın kendi TTS'i.
 *
 * Dinleme bölümünün 150 diyaloğu metin olarak hazır ama stüdyo sesi henüz
 * üretilmedi. Sesi olmayan bir dinleme bölümü aslında ikinci bir okuma
 * bölümüdür, o yüzden cihazın TTS'i geçici bir çözüm değil, bugünkü çözüm.
 *
 * Gerçek ses dosyaları üretildiğinde (bkz. content/build-audio.py) değişecek
 * tek yer bu modüldür: `speakLine` metin okumak yerine dosya çalar, ekranlar
 * aynı kalır. Bu yüzden ekranlar Speech'i doğrudan çağırmıyor.
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

/** Tek bir cümleyi okur. Okuma sırasında başka bir çağrı gelirse sıraya girer. */
export function speakLine(text: string, opts: SpeakOptions): void {
  Speech.speak(text, options(opts));
}

/** Konuşan varsa susturur ve sıradakileri iptal eder. */
export function stopSpeech(): void {
  generation += 1;
  Speech.stop();
}

/**
 * Sıralı okuma sırasında hangi çağrının güncel olduğunu tutar.
 *
 * Speech.stop() sıradaki replikleri iptal ederken onDone tetiklenebiliyor;
 * numara değiştiği için eski çağrının geri bildirimleri yok sayılıyor ve
 * durdurulmuş bir diyalog kendi kendine ilerlemiyor.
 */
let generation = 0;

export type Utterance = { text: string; speaker: number };

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
