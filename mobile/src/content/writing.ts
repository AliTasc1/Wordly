import type { WritingTrap } from './types';

/**
 * Yazılan cevabın denetimi.
 *
 * Bu kuralların birebir aynısı `content/build-writing.py` içinde de yazılı:
 * betik içeriği doğrularken, burası telefonda çalışırken kullanıyor. İkisi
 * ayrışırsa betikte geçen bir cevap telefonda yanlış sayılır ve bunu kimse
 * fark etmez — öğrenci doğru yazdığını sanıp hata alır.
 *
 * Bu yüzden ortak vakalar `content/writing-cases.json` dosyasında duruyor ve
 * iki taraf da ona karşı sınanıyor. Kurala dokunan önce oraya vaka ekler.
 */

/**
 * Karşılaştırma için sadeleştirir.
 *
 * Öğrenciyi noktalama ve büyük harf yüzünden yanlışa düşürmek istemiyoruz:
 * ölçtüğümüz şey cümleyi kurabilmesi. Kesme işaretinin eğik biçimi (’) düz
 * biçime çevriliyor, çünkü telefon klavyeleri çoğu zaman eğik olanı yazıyor
 * ve öğrenci hangisini yazdığını bilmiyor bile.
 */
export function norm(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?;:"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Yazılan, beklenen cevaplardan birine uyuyor mu. */
export function accepts(answers: string[], typed: string): boolean {
  const key = norm(typed);
  return key.length > 0 && answers.some((a) => norm(a) === key);
}

/**
 * Tuzak kalıbı cevapta tam kelime dizisi olarak geçiyor mu.
 *
 * Ham alt dizgi araması yetmiyor: "he is my sister" düpedüz "she is my
 * sister"ın içindedir, "two brother" da "two brothers"ın. Alt dizgiyle
 * baksaydık doğru yazan öğrenciye hata açıklaması gösterirdik.
 *
 * `at: 'start'` kalıbı cümle başına sabitler. Özne düşmesi için gerekli —
 * Türkçe konuşanın en tipik hatası — çünkü "am a teacher" doğru cevabın
 * içinde de geçiyor; hatalı yapan, onun cümlenin BAŞINDA olması.
 */
export function contains(answer: string, trap: string, at?: string): boolean {
  const words = norm(answer).split(' ').filter(Boolean);
  const needle = norm(trap).split(' ').filter(Boolean);
  if (!needle.length) return false;

  const matchesAt = (i: number) => needle.every((w, k) => words[i + k] === w);
  if (at === 'start') return matchesAt(0);

  for (let i = 0; i + needle.length <= words.length; i++) {
    if (matchesAt(i)) return true;
  }
  return false;
}

/**
 * Yanlış bir cevaba verilecek açıklama.
 *
 * Tuzaklardan ilk uyanı döner. Uymuyorsa null: o zaman ekran doğru cevabı
 * gösteriyor, uydurma bir teşhis koymuyor. "Neyi yanlış yaptığını bilmiyorum"
 * demek, yanlış bir sebep söylemekten iyidir.
 */
export function diagnose(traps: WritingTrap[] | undefined, typed: string): string | null {
  if (!traps) return null;
  const hit = traps.find((t) => contains(typed, t.has, t.at));
  return hit ? hit.note : null;
}
