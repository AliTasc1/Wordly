/**
 * Harf çarkının yerleşimi.
 *
 * Arena ekranı harfleri sabit 36 derecelik aralıklarla diziyordu:
 *
 *     const a = ((-90 + i * 36) * Math.PI) / 180;
 *
 * Otuz altı derece, on harf demek. Ama bir tur 9 ile 11 harf arasında
 * değişiyor — hedef kelime beş ila yedi harfli, üstüne dört tuzak harf
 * ekleniyor. Yani on harf, üç olasılıktan yalnızca biriydi.
 *
 * Dokuz harfte çemberin 36 derecesi boş kalıyordu; on bir harfte son harf
 * ilkinin üstüne biniyordu. Test eden kişi "üst işaretlediğim yerdeki tüm
 * harfler karmaşık geliyor" dedi — üst üste binen iki harf, tam olarak bu.
 *
 * Burada açı harf sayısından çıkıyor ve yarıçap, iki komşu harfin
 * birbirine değmeyeceği kadar açılıyor.
 */

export type Seat = { x: number; y: number };

/**
 * İki komşu tuşun merkezleri arasındaki en küçük mesafe.
 *
 * Tuşun kendi genişliği artı aradaki nefes payı. Bunun altına düşünce
 * tuşlar görsel olarak birleşiyor ve hangisine bastığın belirsizleşiyor.
 */
export const KEY_GAP = 8;

/**
 * Harf sayısına göre yörünge yarıçapı.
 *
 * Bir çemberde yan yana iki tuşun merkezleri arasındaki kiriş
 * `2 · r · sin(π / n)`. Bu, `key + KEY_GAP`ten küçük olamaz; formül ters
 * çevrilince gereken en küçük yarıçap çıkıyor.
 *
 * `tercih`, tasarımın istediği yarıçap. Harf sayısı azken ondan daha da
 * açmanın anlamı yok — çark ortadaki ipucundan kopardı.
 */
export function orbitFor(count: number, key: number, tercih: number): number {
  if (count < 2) return tercih;
  const gereken = (key + KEY_GAP) / (2 * Math.sin(Math.PI / count));
  return Math.max(tercih, gereken);
}

/**
 * `count` harfin çember üzerindeki merkezleri.
 *
 * İlk harf tepede (saat 12) başlıyor ve saat yönünde dönüyor: gözün
 * okumaya başladığı yer orası.
 */
export function seats(count: number, center: number, orbit: number): Seat[] {
  return Array.from({ length: count }, (_, i) => {
    const açı = ((-90 + (i * 360) / count) * Math.PI) / 180;
    return { x: center + orbit * Math.cos(açı), y: center + orbit * Math.sin(açı) };
  });
}

/**
 * Çarkın kaplayacağı kare.
 *
 * Yarıçap harf sayısıyla büyüyebildiği için kutu da büyümek zorunda,
 * yoksa kenardaki harfler kırpılır.
 */
export function wheelSize(orbit: number, key: number): number {
  return Math.ceil(2 * orbit + key);
}
