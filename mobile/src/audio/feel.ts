import * as Haptics from 'expo-haptics';

/**
 * Titreşim.
 *
 * Ayarlardaki "Titreşim" anahtarı bir şey yapmıyordu: ekranda "Açık" yazıyor,
 * dokununca "demo" diyen bir bildirim çıkıyordu. Artık gerçekten kapatıyor.
 *
 * Ayar React durumunda tutuluyor ama titreşim çağrıları bileşenlerin dışından
 * da geliyor; bu yüzden değer burada modül düzeyinde bir bayrakta kopyalanıyor
 * ve `AppContext` her değişimde güncelliyor. Alternatif, her çağrı yerine
 * context aktarmaktı — dört satırlık bir iş için sekiz dosyayı dolaştırmak.
 */
let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

/** Hafif dokunuş — harf seçimi gibi. */
export function tap(): void {
  if (enabled) void Haptics.selectionAsync().catch(() => {});
}

/** Hafif darbe — düğmeye basma. */
export function press(): void {
  if (enabled)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function ok(): void {
  if (enabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  }
}

export function bad(): void {
  if (enabled) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
  }
}
