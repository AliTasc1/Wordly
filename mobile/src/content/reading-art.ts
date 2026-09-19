/**
 * Okuma parçalarının görselleri.
 *
 * Okuma ekranında metnin üstünde bir görsel alanı vardı ve tasarımdan bu yana
 * boştu: `StripeArt`, üretilmemiş görselin yerini tutan çizgili bir dikdörtgen.
 * Yer tutucu, eksikliği gizlemek yerine adını yazarak duruyordu — dürüsttü ama
 * bir yıl daha öyle kalabilirdi.
 *
 * Görsel, okuma parçasında süs değil: konuyu tek kelime okumadan önce veriyor.
 * "Benim günüm" parçasının yanındaki sabah penceresi, öğrencinin metne hangi
 * bağlamla gireceğini belirliyor. Dil öğretiminde buna görsel iskele deniyor ve
 * özellikle A1–A2'de okuduğunu anlamayı ölçülebilir biçimde artırıyor.
 *
 * ------------------------------------------------------------ neden harita
 * Metro `require()` çağrılarını derleme anında çözüyor; yol bir değişkenden
 * kurulamıyor. `clips.ts` ile aynı sebep, aynı çözüm: statik bir harita.
 *
 * Harita `content/build-reading-art.py` tarafından üretiliyor. Elle
 * düzenlenmemeli — klasöre dosya ekleyip betiği çalıştırmak yeterli.
 *
 * -------------------------------------------------------- neden boş olabilir
 * Görseli olmayan parça eksik sayılmıyor: `artFor` null döndürüyor ve ekran
 * eski yer tutucuyu göstermeye devam ediyor. Yüz elli görselin hepsi aynı anda
 * gelmek zorunda değil; A1'den başlayıp ilerleyebiliriz ve arada hiçbir ekran
 * bozulmuyor.
 */
export const READING_ART: Record<string, number> = {
};

/** Bir okuma parçasının görseli; üretilmemişse null. */
export function artFor(id: string): number | null {
  return READING_ART[id] ?? null;
}
