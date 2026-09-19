import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportOf, exportFileName, type ExportInput } from '../content/export';

/**
 * Dışa aktarmanın dosya ve paylaşım tarafı.
 *
 * İçeriğin ne olduğu `content/export.ts` içinde ve saf; burada yalnızca onu
 * diske yazıp işletim sisteminin paylaşım sayfasını açan kısım var. Ayrı
 * durmalarının sebebi, içeriğin test edilebilir kalması: bu dosya cihaz
 * olmadan çalıştırılamaz.
 *
 * ------------------------------------------------------- neden paylaşım
 * "İndir" demek mobilde doğrudan bir karşılığı olmayan bir masaüstü
 * alışkanlığı. Telefonda kullanıcının dosyayla yapmak isteyeceği şey
 * değişiyor: kendine e-postayla göndermek, buluta atmak, Dosyalar'a
 * kaydetmek. Paylaşım sayfası bunların hepsini kullanıcının kendi seçimine
 * bırakıyor; bizim bir yere kaydedip "şuraya koyduk" dememizden iyi.
 *
 * -------------------------------------------------------- neden önbellek
 * Dosya önbellek klasörüne yazılıyor. Kullanıcı paylaşım sayfasından
 * kalıcı bir yere koyduğunda asıl kopya orası oluyor; bizim yazdığımız
 * geçici. Kalıcı klasöre yazsaydık, öğrencinin telefonunda her dışa
 * aktarmada bir kopya daha birikirdi ve bunları temizlemek onun işi olurdu.
 */
export type ExportResult = { ok: true } | { ok: false; problem: string };

export async function shareExport(input: ExportInput): Promise<ExportResult> {
  try {
    // Paylaşım yoksa dosyayı yazmanın anlamı da yok: kullanıcının ona
    // ulaşacağı bir yol kalmıyor.
    if (!(await Sharing.isAvailableAsync())) {
      return {
        ok: false,
        problem: 'Bu cihazda paylaşım penceresi açılamıyor.',
      };
    }

    const file = new File(Paths.cache, exportFileName(input.at));

    // `overwrite` şart: aynı gün ikinci kez dışa aktaran kullanıcı aynı
    // dosya adına denk gelir ve `create` varsayılan hâlinde hata verir.
    file.create({ overwrite: true });

    // İki boşluk girinti: dosyayı açan kullanıcı okuyabilsin. Tek satırlık
    // JSON makine için aynı, insan için okunmaz.
    file.write(JSON.stringify(exportOf(input), null, 2));

    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
      dialogTitle: 'WORDLY verilerin',
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      problem: error instanceof Error ? error.message : 'Dosya hazırlanamadı.',
    };
  }
}
