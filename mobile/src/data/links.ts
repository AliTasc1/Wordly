/**
 * Uygulamanın dışarı açılan adresleri.
 *
 * Tek yerde duruyorlar çünkü alan adı değişecek: site bugün GitHub Pages'in
 * verdiği adreste yayında, kendi alan adı bağlandığında `SITE` tek satırda
 * güncellenip bitiyor.
 *
 * Bugünkü adres bilerek seçildi. Alan adı hazır olana kadar beklemek, mağaza
 * başvurusunun zorunlu tuttuğu gizlilik metni bağlantısını da bekletirdi;
 * oysa metinler hazır ve zaten yayında. Çalışan bir adres, doğru ama henüz
 * olmayan bir adresten iyidir.
 */
const SITE = 'https://alitasc1.github.io/Wordly';

export const LINKS = {
  site: SITE,
  privacy: `${SITE}/gizlilik.html`,
  terms: `${SITE}/sartlar.html`,
  support: `${SITE}/destek.html`,
};
