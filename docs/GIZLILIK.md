# WORDLY — Gizlilik Politikası

**Yürürlük tarihi:** 19 Eylül 2026
**Son güncelleme:** 19 Eylül 2026

---

> ## ⚠️ YAYINDAN ÖNCE DOLDURULACAK
>
> Aşağıdaki üç alan gerçek bilgiyle değiştirilmeden yayınlanamaz. İkisi yasal
> zorunluluk, biri mağaza şartı.
>
> | Yer tutucu | Ne yazılacak |
> |---|---|
> | `[VERİ SORUMLUSU]` | Uygulamayı yayınlayan kişi ya da şirketin tam adı |
> | `[ADRES]` | KVKK'nın veri sorumlusu için istediği açık adres |
> | `[DESTEK E-POSTA]` | Çalışan bir adres — kişisel Gmail yerine alan adına bağlı biri önerilir |
>
> Bu satırlar doldurulunca bu uyarı kutusu silinir.

---

## Kısa özet

WORDLY'yi **hesap açmadan** kullanabilirsin. Açmazsan hiçbir bilgin
telefonundan çıkmaz.

Hesap açarsan yalnızca ilerlemeni ikinci bir cihaza taşımak için gereken
şeyler sunucuya gider. Reklam yok, izleme yok, veri satışı yok, çerez yok.

Mikrofon kayıtların **hiçbir koşulda** telefonundan çıkmaz.

## 1. Veri sorumlusu

6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) anlamında veri
sorumlusu:

- **Ad:** [VERİ SORUMLUSU]
- **Adres:** [ADRES]
- **E-posta:** [DESTEK E-POSTA]

## 2. Hesapsız kullanım — hiçbir veri toplanmaz

Uygulamanın tamamı hesapsız çalışır: altı seviye, tüm beceriler, oyunlar,
istatistikler, başarımlar ve hata defteri.

Bu durumda ilerlemen **yalnızca telefonunun kendi deposunda** tutulur
(`AsyncStorage`). Bize gönderilmez, göremeyiz, elimizde bir kopyası olmaz.
Uygulamayı silersen o veri de gider.

Bu, uygulamanın eksik bir kullanım biçimi değil; varsayılanı budur.

## 3. Hesap açarsan toplanan veriler

Hesap **tamamen isteğe bağlıdır** ve tek amacı ilerlemeni cihazlar arasında
taşımaktır.

### 3.1 Kimlik ve iletişim

| Veri | Neden | Hukuki sebep |
|---|---|---|
| E-posta adresi | Girişi yapmak, şifre sıfırlamak | Sözleşmenin ifası (KVKK m.5/2-c) |
| Şifre | Girişi doğrulamak | Sözleşmenin ifası |
| Görünen ad (isteğe bağlı) | Liderlik tablosunda görünmek | Açık rıza (KVKK m.5/1) |

Şifreni **düz metin olarak görmeyiz ve saklamayız.** Supabase Auth şifreyi
tek yönlü olarak özetler (bcrypt); özetten şifre geri üretilemez.

### 3.2 Öğrenme verisi

| Veri | Ne demek |
|---|---|
| Seviye (A1–C2) | Hangi seviyede çalıştığın |
| Hedefler, günlük süre, odak beceriler | Kurulumda seçtiklerin |
| Seviye testi sonucu | Testi çözdüysen sonucu |
| Kaldığın yerler | Her beceri ve seviyede kaçıncı karttasın |
| Günlük XP | Gün ve cihaz başına kazandığın puan |
| Kaydettiğin kelimeler | Tekrar listene aldığın kartların kimlikleri |
| Hata defteri | Yanlış yaptığın soru, verdiğin cevap ve tarihi |
| Arena puanı | Harf Arenası'ndaki en iyi skorun |
| Cihaz kimliği | Telefonunda üretilen rastgele bir numara |

**Cihaz kimliği hakkında:** Bu numara telefonunda rastgele üretilir. Reklam
kimliği (IDFA/GAID) değildir, telefonunun seri numarası değildir, seni başka
uygulamalarda tanımaya yaramaz. Tek işi, iki cihazdan aynı gün kazanılan XP'yi
birbirine karıştırmadan toplayabilmektir.

### 3.3 Toplamadıklarımız

Bunlar bilinçli birer karar; ileride değişirse bu metin önce güncellenir:

- Reklam kimliği, izleme pikseli, çerez
- Konum bilgisi
- Rehber, fotoğraf, dosya erişimi
- Analitik SDK'sı — uygulamada **hiçbir** üçüncü taraf izleme kütüphanesi yok
- Doğum tarihi, cinsiyet, telefon numarası
- Ödeme bilgisi — ücretli bir plan yok

## 4. Mikrofon ve ses kayıtları

Konuşma alıştırmasında kendi sesini kaydedip dinleyebilirsin.

**Bu kayıtlar telefonundan çıkmaz.** Sunucuya yüklenmez, bize gönderilmez,
üçüncü bir tarafa iletilmez, yapay zekâya analiz ettirilmez.

Kayıt telefonun geçici dosya alanında tutulur ve şunlardan biri olduğunda
silinir: yeni bir kayıt alırsın, kaydı atarsın, ekrandan çıkarsın.

Uygulamada telaffuz puanlama yoktur. Kaydın bir şey ölçmek için değil, kendi
sesini duyman için alınır.

## 5. Liderlik tablosu

Haftalık liderlik tablosu **varsayılan olarak kapalıdır.** Açık rızanla
katılırsın; Ayarlar'dan istediğin an çıkarsın.

Katıldığında diğer kullanıcılar **yalnızca** şunları görür:

- Seçtiğin görünen ad
- O haftaki XP toplamın
- Sıran

E-posta adresin, seviyen, hataların ve diğer hiçbir verin liderlik tablosunda
görünmez. Katılmazsan tabloda hiç yer almazsın.

## 6. Verilerin nerede tutulduğu

Sunucu tarafı **Supabase** üzerinde çalışır. Veritabanı fiziksel olarak
**Almanya'da (AWS `eu-central-1`, Frankfurt)** bulunur.

**Yurt dışına aktarım:** Verilerin Türkiye dışında, Avrupa Birliği içinde bir
sunucuda tutuluyor. KVKK m.9 uyarınca bu aktarım için **açık rızan** gerekir.
Hesap açarken bu metni onaylaman, söz konusu aktarıma verdiğin açık rızayı
kapsar. Rıza vermek istemiyorsan hesap açmadan kullanabilirsin — uygulamanın
tamamı o hâliyle çalışır.

Supabase'in kendi gizlilik politikası: https://supabase.com/privacy

E-posta gönderimi (doğrulama ve şifre sıfırlama) için bir e-posta servisi
kullanılır; bu servise yalnızca e-posta adresin ve gönderilen iletinin içeriği
ulaşır.

## 7. Saklama süresi

- **Hesabın varken:** Veriler hesabın açık kaldığı sürece saklanır.
- **Hesabını silersen:** Tüm sunucu verin **anında ve geri dönüşsüz** silinir.
  Yedeklerden temizlenmesi en geç 30 gün sürer.
- **Hesapsız kullanımda:** Sunucuda veri yok; telefondaki veriyi uygulamayı
  silerek ya da Ayarlar'daki sıfırlama ile kaldırırsın.

## 8. Haklarının kullanımı

KVKK m.11 ve KVKK'nın uygulanabildiği ölçüde GDPR m.15–22 kapsamında;
verilerine erişme, düzeltme, silme, işlenmesine itiraz etme ve taşınabilirlik
haklarına sahipsin.

Çoğunu uygulamanın içinden, kimseye başvurmadan kullanabilirsin:

| Hak | Nereden |
|---|---|
| Düzeltme | Profil ve Ayarlar ekranları |
| **Hesabı ve tüm veriyi silme** | **Ayarlar → Hesabımı sil** |
| Liderlikten çıkma | Ayarlar → Liderlik tablosu |
| Eşitlemeyi durdurma | Ayarlar → Çıkış yap |

**Verilerinin bir kopyasını isteme (taşınabilirlik):** Şu an bunun uygulama
içinde bir düğmesi yok. [DESTEK E-POSTA] adresine yazarsan hesabındaki tüm
veriyi makineyle okunabilir biçimde (JSON) gönderiyoruz. Uygulama içinden
indirme özelliği hazırlanıyor; geldiğinde bu metin güncellenecek.

Bunların dışında bir talebin olursa [DESTEK E-POSTA] adresine yazabilirsin;
KVKK'nın öngördüğü süre içinde (en geç 30 gün) yanıt veririz.

Başvurunun sonucundan memnun kalmazsan **Kişisel Verileri Koruma Kurumu**'na
şikâyette bulunma hakkın saklıdır.

## 9. Çocukların kullanımı

WORDLY 13 yaşın altındaki çocuklara yönelik değildir ve bilerek 13 yaşın
altından veri toplamayız. Çocuğunuzun hesap açtığını fark ederseniz
[DESTEK E-POSTA] adresine yazın, hesabı ve verisini sileriz.

13–18 yaş arasındaki kullanıcıların hesap açmadan önce veli izni alması
gerekir.

## 10. Güvenlik

- Tüm iletişim TLS ile şifrelenir.
- Veritabanında **satır düzeyinde güvenlik (RLS)** açıktır: her kullanıcı
  teknik olarak yalnızca kendi satırlarını okuyabilir ve yazabilir. Bu, uygulama
  kodundaki bir hatanın başka birinin verisine erişmeye yetmemesi demektir.
- Liderlik tablosu, yalnızca gerekli üç alanı döndüren kısıtlı bir sunucu
  fonksiyonuyla okunur; tablo doğrudan sorgulanamaz.
- Şifreler bcrypt ile özetlenir.

Hiçbir sistemin mutlak güvenlik sunamayacağını biliyoruz. Kişisel verileri
etkileyen bir ihlal olursa KVKK'nın öngördüğü süre içinde Kurum'a ve sana
bildiririz.

## 11. Bu metinde değişiklik

Bu politikayı güncellersek yürürlük tarihini değiştirir ve önemli bir değişiklik
varsa uygulama içinde bildiririz. Topladığımız veri türünü genişleten bir
değişiklik, **yürürlüğe girmeden önce** duyurulur.

## 12. İletişim

[VERİ SORUMLUSU]
[ADRES]
[DESTEK E-POSTA]
