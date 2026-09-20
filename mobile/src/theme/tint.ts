import { parse } from './contrast';

/**
 * Bir rengin saydam tonu.
 *
 * Uygulamada yüzlerce yerde elle yazılmış tonlar vardı:
 * `rgba(34,197,94,.14)` — yani "yeşilin %14'ü". Üç sorunu vardı.
 *
 * Birincisi, rengin kendisi değişirse ton geride kalıyordu; yeşili
 * değiştiren kişi otuz ayrı `rgba` satırını bulmak zorundaydı.
 *
 * İkincisi ve önemlisi: o sayılar koyu zemine göre seçilmişti. Beyaz
 * zeminde aynı ton neredeyse görünmüyor, çünkü koyuda "biraz aydınlatmak"
 * olan şey açıkta "biraz karartmak" oluyor ve %14 orada yetmiyor.
 *
 * Üçüncüsü, `rgba(34,197,94,.14)` okunduğunda hangi renk olduğu
 * anlaşılmıyor. `tint(t.colors.success, 0.14)` anlaşılıyor.
 */
export function tint(color: string, alpha: number): string {
  const [r, g, b] = parse(color);
  return `rgba(${r},${g},${b},${alpha})`;
}
