/**
 * Aynı yazılışa sahip kelimelerin diğer anlamları.
 *
 * Gerçek kullanıcı testinden geldi: "take" kartı B1'de isim olarak
 * "görüş, yorum" diyor ve bu doğru. Ama ekranda kelime devasa harflerle,
 * anlamı altında ve türünü söyleyen tek şey köşedeki küçük bir etiket.
 * Test eden kişi kartı "take = görüş" diye okudu ve haklı olarak yanlış
 * buldu.
 *
 * Kart teknik olarak doğruydu, okunduğunda yanlış anlaşılıyordu. Bir
 * öğrenme uygulamasında bu ikisi aynı şey.
 *
 * Destenin **%21'i** (956 kelime, 1.960 kart) aynı yazılışı paylaşıyor,
 * yani istisna değil kural. Çözüm, diğer anlamı gizlemek yerine kartta
 * söylemek: karışıklığı gidermekle kalmıyor, öğretiyor da.
 *
 * İndeks `content/build-senses.py` tarafından üretiliyor; elle düzenlenmez.
 */
import type { Level } from './types';

export type Sense = {
  /** Tür etiketi — "FİİL", "İSİM"… */
  pos: string;
  tr: string;
  cefr: Level;
};

const SENSES = require('../../assets/content/senses.json') as Record<string, Sense[]>;

/** Bu kartın aynı yazılışa sahip diğer anlamları; yoksa boş dizi. */
export function otherSenses(cardId: string): Sense[] {
  return SENSES[cardId] ?? [];
}
