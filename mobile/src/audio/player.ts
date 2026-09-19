import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Üretilmiş ses dosyalarını çalan katman.
 *
 * Diyaloglar replik replik ayrı dosyalar hâlinde duruyor (content/build-audio.py).
 * Burası o dosyaları sırayla çalar; `speech.ts` hangi motorun kullanılacağına
 * karar verir ve ekranlar ikisini de görmez.
 *
 * Tek bir oynatıcı kullanılıyor, her replikte `replace()` ediliyor: her replik
 * için yeni oynatıcı yaratmak yüzlerce yerli nesne demek olurdu ve bırakılan
 * her biri bellekte kalırdı.
 */

let player: AudioPlayer | null = null;
let listener: { remove: () => void } | null = null;

/**
 * Sessiz moddayken de çalsın.
 *
 * iPhone'da yan tuş sessizdeyse ses çıkmaz; dil uygulamasında bu, öğrencinin
 * "ses bozuk" diye düşünüp bölümü bırakması demek. Bir kez, ilk çalıştırmada
 * ayarlanıyor.
 */
let modeSet = false;
function ensureMode(): void {
  if (modeSet) return;
  modeSet = true;
  void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {
    // Ayarlanamazsa ses yine çalar, sadece sessiz modda duyulmaz.
  });
}

function instance(): AudioPlayer {
  ensureMode();
  if (!player) player = createAudioPlayer();
  return player;
}

/** Çalmakta olanı durdurur ve bekleyen sırayı iptal eder. */
export function stopClips(): void {
  listener?.remove();
  listener = null;
  try {
    player?.pause();
  } catch {
    // Oynatıcı henüz yüklenmemişse pause atabilir; susturmak zaten amaç.
  }
}

/**
 * Verilen dosyaları sırayla çalar.
 *
 * `clips` require() ile gelen modül kimlikleri. Her parçanın başında `onIndex`,
 * hepsi bitince `onDone` çağrılır.
 */
export function playClips(
  clips: number[],
  opts: {
    from?: number;
    rate?: number;
    onIndex?: (index: number) => void;
    onDone?: () => void;
  },
): void {
  stopClips();
  if (!clips.length) {
    opts.onDone?.();
    return;
  }

  const audio = instance();
  let at = Math.min(Math.max(opts.from ?? 0, 0), clips.length - 1);

  const start = (index: number) => {
    at = index;
    opts.onIndex?.(index);
    audio.replace(clips[index]);
    // Hız her replikte yeniden veriliyor: replace() kaynağı değiştirdiği için
    // önceki hız ayarının korunacağına güvenmek doğru değil.
    audio.setPlaybackRate(opts.rate ?? 1);
    audio.play();
  };

  listener = audio.addListener('playbackStatusUpdate', (status) => {
    if (!status.didJustFinish) return;
    if (at >= clips.length - 1) {
      stopClips();
      opts.onDone?.();
      return;
    }
    start(at + 1);
  });

  start(at);
}

/** Tek bir dosyayı çalar. */
export function playClip(
  clip: number,
  opts: { rate?: number; onDone?: () => void } = {},
): void {
  playClips([clip], { rate: opts.rate, onDone: opts.onDone });
}

/**
 * Cihazdaki bir dosyayı yolundan çalar.
 *
 * Paketlenmiş sesler `require()` ile modül kimliği olarak geliyor; öğrencinin
 * kendi kaydı ise çalışma anında üretilen bir dosya, dolayısıyla yol olarak.
 * Aynı oynatıcıyı kullanıyor: kayıt çalarken model sesin susması doğrusu.
 */
export function playUri(uri: string, opts: { onDone?: () => void } = {}): void {
  stopClips();

  const audio = instance();
  listener = audio.addListener('playbackStatusUpdate', (status) => {
    if (!status.didJustFinish) return;
    stopClips();
    opts.onDone?.();
  });

  audio.replace({ uri });
  audio.setPlaybackRate(1);
  audio.play();
}
