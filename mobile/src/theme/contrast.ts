/**
 * Kontrast hesabı — WCAG 2.1 bağıl parlaklık ve oran.
 *
 * Yeniden tasarımda en kolay kaybedilen şey bu: bir rengi bir tık açmak
 * kimseyi rahatsız etmiyor, ama beş tık sonra metin okunmuyor ve bunu fark
 * eden kişi genellikle mağaza yorumunda oluyor. Hesap burada, saf ve test
 * edilebilir; hangi çiftin tutması gerektiği `palette.test.ts` içinde.
 *
 * Eşikler WCAG AA: normal metin 4.5:1, büyük metin (18pt+ ya da 14pt kalın)
 * 3:1, arayüz bileşeni ve sınır 3:1.
 */

export const AA_TEXT = 4.5;
export const AA_LARGE = 3;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** `#RGB`, `#RRGGBB` ya da `rgba(r,g,b,a)` — a yok sayılıyor. */
export function parse(color: string): [number, number, number] {
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3])];

  let hex = color.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (hex.length === 8) hex = hex.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Okunamayan renk: ${color}`);

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

export function luminance(color: string): number {
  const [r, g, b] = parse(color);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 1 (aynı) ile 21 (siyah–beyaz) arası. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
