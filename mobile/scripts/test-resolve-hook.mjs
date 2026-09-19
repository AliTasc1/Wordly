import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Uzantısız içe aktarmaları çözer.
 *
 * Uygulama kodu `./days` diye yazıyor ve bunu Metro çözüyor. Node ESM ise
 * uzantıyı kendisi tamamlamaz, dolayısıyla testten çağrılan her modül
 * zincirinde patlardı.
 *
 * Seçenek, uygulamadaki yüzlerce içe aktarmaya `.ts` eklemekti: Node'un
 * kısıtını ürün koduna taşımak olurdu ve tek bir testin çalışması için
 * yazılmış bir kural, okuyan herkese sebebini sormak zorunda bırakırdı.
 * Kısıt burada, yalnızca testlerin çalıştığı yerde duruyor.
 *
 * `.tsx` kasıtlı olarak yok: Node tip sıyırma yapıyor ama JSX'i çeviremiyor.
 * Bir test React bileşenine uzanırsa açıkça patlaması doğrusu — bu
 * çalıştırıcı bileşen sınamak için değil.
 */
const EXTENSIONS = ['.ts', '/index.ts'];

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith('.')) return next(specifier, context);

  try {
    return await next(specifier, context);
  } catch (error) {
    for (const extension of EXTENSIONS) {
      const candidate = new URL(specifier + extension, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return next(specifier + extension, context);
      }
    }
    throw error;
  }
}
