import type { Saved } from '../state/persist';
import { streakOf } from '../state/days';

/**
 * "Verilerimi indir" — taşınabilirlik hakkının karşılığı.
 *
 * KVKK m.11 ve GDPR m.20 kullanıcıya verisinin bir kopyasını isteme hakkı
 * veriyor. Gizlilik metni bunu önce "bize yazın, gönderelim" diye çözüyordu;
 * çalışan bir cevap ama iyi bir cevap değil. Veriyi vermek iki dokunuşken
 * geri almak e-posta yazmaya bağlıysa, hak kâğıt üstünde kalır.
 *
 * ------------------------------------------------------------ neden saf
 * Burada dosya yazma, paylaşma, ağ yok — girdiden çıktıyı üreten tek bir
 * fonksiyon. Böylece içeriği test edilebiliyor: dışa aktarmanın asıl riski
 * çökmesi değil, **bir alanı sessizce atlaması**. Eksik dışa aktarma, hiç
 * dışa aktarmamaktan kötüdür; kullanıcı elinde tamamı olduğunu sanır.
 *
 * -------------------------------------------------- neden Türkçe anahtarlar
 * Dosyayı açacak olan kullanıcı. "positions" ile "kaldiginYerler" arasında
 * makine için fark yok, insan için var. Yasanın istediği "makineyle
 * okunabilir" şartını JSON zaten karşılıyor; okunabilirliği insana bırakmak
 * için bir sebep yok.
 */

export type ExportAccount = {
  id: string;
  email: string | null;
  /** Hesabın açıldığı an (ISO). */
  createdAt: string | null;
};

export type ExportInput = {
  saved: Saved;
  /** Oturum yoksa null — hesapsız kullanımda da dışa aktarma çalışmalı. */
  account: ExportAccount | null;
  appVersion: string;
  /** Şimdi (ms). Testin tarih uydurabilmesi için parametre. */
  at: number;
};

export type ExportFile = ReturnType<typeof exportOf>;

/** Gün → iki tablonun toplamı: bu cihaz ve diğerleri birlikte. */
function mergedByDay(
  mine: Record<string, number>,
  others: Record<string, number>,
): Record<string, number> {
  const days = new Set([...Object.keys(mine), ...Object.keys(others)]);
  const out: Record<string, number> = {};
  for (const day of [...days].sort()) {
    out[day] = (mine[day] ?? 0) + (others[day] ?? 0);
  }
  return out;
}

export function exportOf({ saved, account, appVersion, at }: ExportInput) {
  const daily = mergedByDay(saved.daily, saved.remoteDaily);
  const studied = mergedByDay(saved.studied, saved.remoteStudied);

  return {
    hakkinda: {
      aciklama:
        'WORDLY uygulamasındaki verilerinin tam kopyası. Bu dosya senin; ' +
        'istediğin gibi saklayabilir, taşıyabilir ya da silebilirsin.',
      olusturulma: new Date(at).toISOString(),
      uygulamaSurumu: appVersion,
      not:
        account === null
          ? 'Hesabın yok. Bu veri yalnızca bu telefonda tutuluyor; sunucuda bir kopyası bulunmuyor.'
          : 'Bu veri hem telefonunda hem hesabında tutuluyor.',
    },

    hesap:
      account === null
        ? null
        : {
            kimlik: account.id,
            ePosta: account.email,
            uyelikTarihi: account.createdAt,
          },

    tercihler: {
      seviye: saved.cefr,
      hedefler: saved.goals,
      gunlukSure: saved.dailyTime,
      odakBeceriler: saved.skills,
      titresim: saved.haptics,
    },

    ilerleme: {
      toplamXp: saved.xp,
      // Seri kayıtlı bir sayı değil, günlerden hesaplanıyor — burada da
      // hesaplanmalı. Hesap `daily` değil `daily + remoteDaily` üzerinden:
      // `AppContext` ekranda seriyi böyle gösteriyor ve iki cihazdan çalışan
      // birinin serisi, tek cihaza bakıldığında kopuk görünür.
      gunlukSeri: streakOf(Object.keys(daily), new Date(at)),
      gunlukXp: daily,
      /** Gün → çalışılan saniye. Günlük hedef bunun üzerinden ölçülüyor. */
      gunlukCalismaSaniyesi: studied,
      kaldiginYerler: saved.positions,
      kaydettiginKelimeler: saved.savedWords,
    },

    seviyeTesti: saved.testResult,

    harfArenasi: {
      enIyiXp: saved.arena.xp,
      bulunanKelime: saved.arena.found,
      enUzunSeri: saved.arena.streak,
    },

    // Nesne yerine dizi: hata defterinin anahtarları iç kullanım için üretilmiş
    // (`vocab:a1-w-003:0` gibi) ve dışarıdan bakan için bir anlam taşımıyor.
    hataDefteri: Object.entries(saved.mistakes)
      .sort(([, a], [, b]) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .map(([, m]) => ({
        bolum: m.kind,
        seviye: m.level,
        icerik: m.id,
        soruNo: m.q,
        soru: m.text,
        dogruCevap: m.answer,
        kacKezYanlis: m.times,
        sonTarih: m.at,
      })),
  };
}

/** `wordly-verilerim-2026-09-19.json` */
export function exportFileName(at: number): string {
  return `wordly-verilerim-${new Date(at).toISOString().slice(0, 10)}.json`;
}
