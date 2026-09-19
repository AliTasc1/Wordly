# Sunucu tarafı

Supabase projesi: **Wordly** · `qlbhedgcronlonlqpyvq` · `eu-central-1` (Frankfurt)
API adresi: `https://qlbhedgcronlonlqpyvq.supabase.co`

## Neden sunucu

Uygulama **önce cihaz** çalışıyor ve öyle kalıyor. Bu tablolar cihazdaki
kaydın yerine geçmiyor, üstüne ekleniyor: çevrimdışıyken her şey çalışır, ağ
geldiğinde eşitlenir. Tersi olsaydı otobüste açılmayan bir dil uygulaması
elde ederdik.

Gerçekten sunucu gerektiren dört iş var — bu şema birincisini karşılıyor:

1. Hesap ve cihazlar arası eşitleme ← **bu şema**
2. Lider tablosu, arkadaş, kulüp, düello (tanımı gereği başka insan gerekiyor)
3. Yazma ve konuşmaya serbest geri bildirim (dil modeli sunucuda çalışmalı;
   anahtar uygulamaya gömülemez, gömülürse sökülür)
4. Satın alma doğrulaması

## Çakışma nasıl çözülüyor

Bu şemanın biçimini belirleyen şey tablo listesi değil, iki cihazın aynı anda
ilerlemesi hâlinde ne olacağı sorusu.

| Veri | Kural | Neden |
|---|---|---|
| `positions` | **En büyüğü kazanır** | İlerleme geriye gitmez. Kural veritabanında bir tetikleyicide, istemcide değil: istemcide bir hata ya da eski bir sürüm küçük değer gönderirse öğrencinin ilerlemesi silinirdi. |
| `daily_xp` | **Cihaz başına satır, toplam sunucuda** | Aynı gün telefonda 100, tablette 50 XP kazanılırsa gerçek toplam 150'dir ama her cihaz yalnızca kendi payını bilir. Tek satırda biri diğerini ezerdi. `(kullanıcı, gün, cihaz)` anahtarı sayesinde aynı cihaz kaç kez gönderirse göndersin sonuç değişmez. |
| `mistakes.times` | **Büyüğü alınır, toplanmaz** | Toplamak iki cihazdan gelen aynı yanlışı iki kez sayardı. Buradaki amaç puan değil, hangi sorunun ısrarla yanlış yapıldığını görmek. |
| `saved_words` | **Satır var / yok** | Silme gerçek silmedir; mezar taşı tutmaya değmeyecek kadar düşük riskli. |
| `profiles` | **Son yazan kazanır** | Bunlar tercih: öğrenci en son nerede değiştirdiyse kastı odur. |

## Güvenlik

Beş tablonun beşinde de RLS açık ve her politika `auth.uid()` ile sınırlı.

Publishable anahtar (`sb_publishable_…`) uygulamanın içinde taşınıyor ve bu
tasarım gereği böyle: onu koruyan şey gizliliği değil, buradaki politikalar.
RLS'siz tek bir tablo, o anahtarı tüm veritabanının anahtarı hâline getirir.

`service_role` anahtarı uygulamaya **girmez**. RLS'i tamamen atlar; istemciye
konulursa herkesin verisi okunur. Yalnızca sunucu tarafında (Edge Function)
kullanılır.

`select` ile `insert`/`update`/`delete` politikaları ayrı ayrı yazıldı. Hepsini
tek `for all` politikasına toplamak kısa görünür ama `with check`'i unutmaya
açıktır; o unutulduğunda kullanıcı başkasının adına satır yazabilir.

## Hesap akışı (e-posta + şifre)

Uygulama tarafı `mobile/src/server/` ve `mobile/src/state/AuthContext.tsx`
içinde. İki kural şeklini belirliyor:

- **Hesap zorunlu değil.** Uygulama girişsiz tam çalışıyor; giriş yalnızca
  ilerlemeyi ikinci bir cihaza taşımak için. Öğrenmeye başlamadan kayıt
  dayatmak, henüz hiçbir şey vermeden bedel istemek olurdu.
- **Çıkış ilerlemeyi silmez.** Cihazdaki kayıt yerinde kalır.

E-postadaki bağlantı `wordly://` şemasıyla (Expo Go'da `exp://…`) uygulamaya
döner. Tarayıcı olmadığı için `detectSessionInUrl` kapalı; jetonlar
`src/server/deepLink.ts` içinde elle çözülüyor.

### Panelde yapılması gerekenler

Bunlar SQL ile ayarlanamıyor, Supabase panelinden elle girilmeli:

1. **Authentication → Providers → Email** açık olmalı (varsayılan açık).
2. **Authentication → URL Configuration → Redirect URLs** listesine
   eklenmeli, yoksa e-postadaki bağlantı uygulamaya dönmez:
   - `wordly://**` — derlenmiş uygulama
   - `exp://**` — Expo Go ile geliştirme
3. **Authentication → Sign In / Providers → Email** altındaki **Confirm
   email** açık bırakılırsa kayıttan sonra oturum açılmaz; uygulama bunu
   "E-postanı doğrula" ekranıyla anlatıyor.

### E-posta gönderimi yayın için hazır değil

Supabase'in varsayılan SMTP'si **yalnızca projenin ekibindeki adreslere**
gönderiyor. Dokümandan:

> *"Unless you configure a custom SMTP server for your project, Supabase Auth
> will refuse to deliver messages to addresses that are not part of the
> project's team. All other addresses will fail with the error message
> Email address not authorized."*

Sonuçları:

- **Test ederken** Supabase'e giriş yapılan e-posta kullanılmalı; başka her
  adres `email_address_not_authorized` alır.
- Saatlik gönderim sınırı var ve haber verilmeden değişebiliyor.
- Teslimat garantisi (SLA) yok; servis üretim için tasarlanmamış.

Yayından önce gerçek bir SMTP bağlanmalı (Resend, Postmark, SendGrid,
Amazon SES…). Bu yapılmadan uygulama yayına çıkarsa **kaydolan hiç kimse
doğrulama postası alamaz**.

Uygulama bu hatayı tanıyor ve sebebini söylüyor: adresin kendisinde bir
sorun olduğunu sanmasın diye "uygulama henüz kendi e-posta sunucusuna bağlı
değil" yazıyor.

### Gerçek SMTP nasıl bağlanır

Sıra önemli; her adım bir öncekine dayanıyor.

#### 0. Alan adı — atlanamaz

Resend, Postmark, SendGrid, Brevo: hepsinde **doğrulanmış bir alan adı**
olmadan yalnızca kendi hesap adresine gönderebiliyorsun. Yani domain
alınmadan Supabase'in bugünkü kısıtından kurtulmuş olmuyorsun, sadece
kısıtı başka bir şirkete taşımış oluyorsun.

`wordly.com` alınmıştır; `wordly.app`, `wordlyapp.com`, `wordly.com.tr`
gibi alternatiflere bakılmalı. Yıllık 10–20 $. Cloudflare Registrar maliyet
fiyatına satıyor ve DNS kayıtlarını aynı yerden girmeyi kolaylaştırıyor.

**Tek istisna:** Brevo, alan adı yerine **tek bir gönderici adresi**
doğrulamaya izin veriyor (kendi Gmail'in gibi). Domain almadan çalışır ama
teslimat kalitesi düşük — postalar spam'e düşmeye daha yatkın. Geçici
çözüm olarak kabul edilebilir, yayın için değil.

#### 1. Resend hesabı

`resend.com` → ücretsiz kayıt. Ücretsiz katman **ayda 3.000, günde 100**
e-posta; bu uygulama için fazlasıyla yeterli.

#### 2. Alan adını doğrula

Resend → **Domains** → **Add Domain** → alan adını gir. Resend birkaç DNS
kaydı gösteriyor (DKIM için TXT, SPF, bazen MX). Bunlar alan adını aldığın
yerin DNS panelinde açılıyor. Doğrulama dakikalar sürebilir.

Bu adım e-postanın spam'e düşmemesini sağlayan şeyin kendisi: DKIM ve SPF,
alıcı sunucuya "bu postayı göndermeye gerçekten bu alan adının sahibi izin
verdi" diyor.

#### 3. API anahtarı

Resend → **API Keys** → **Create API Key** → yetki olarak **Sending access**
yeter.

> Anahtar bir kez gösteriliyor. **Sohbete, koda, commit'e yapıştırma** —
> doğrudan Supabase panelindeki alana yapıştır. Bir yere yazılan anahtar,
> yazıldığı yerde kalır.

#### 4. Supabase'e gir

**Authentication → Emails → SMTP Settings**
(`/dashboard/project/<ref>/auth/smtp`)

**Enable Custom SMTP** açılır ve doldurulur:

| Alan | Değer |
|---|---|
| Sender email | `no-reply@<alan-adın>` — doğrulanmış alan adında olmalı |
| Sender name | `WORDLY` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` — API anahtarı değil, bu sabit değer |
| Password | 3. adımdaki API anahtarı |

#### 5. Saatlik sınırı yükselt

Supabase, özel SMTP kaydedilince sınırı **saatte 30 mesaja** düşürüyor —
yeni bir gönderim itibarını korumak için. Dokümandan:

> *"To protect the reputation of your newly set up service a low rate-limit
> of 30 messages per hour is imposed."*

**Authentication → Rate Limits** sayfasından gerçekçi bir değere çekilmeli.

#### 6. Dene

Uygulamadan, **Supabase ekibinde olmayan** bir adresle kayıt ol. Posta
geliyorsa iş bitti. `email_address_not_authorized` hatası hâlâ geliyorsa
özel SMTP kaydedilmemiş demektir.

Yönlendirme adreslerinin de tanımlı olması gerekiyor (yukarıdaki bölüm);
SMTP çalışsa bile onlar yoksa e-postadaki bağlantı uygulamaya dönmez.

## Eşitleme

Uygulama tarafı: `mobile/src/server/merge.ts` (kararlar), `sync.ts` (gidiş
dönüş), `AppContext` (ne zaman).

### Üç yönlü birleştirme

Yerel, sunucu ve **taban** — son eşitlemede sunucuda ne olduğu — karşılaştırılıyor.
Taban `AsyncStorage`'da, kullanıcı kimliğiyle birlikte duruyor.

Taban olmadan "yerelde yok, sunucuda var" iki ayrı olaya uyar: kullanıcı
sildi, ya da başka cihaz ekledi. İlkinde silinmeli, ikincisinde eklenmeli.
Ayırt eden tek şey tabanda olup olmadığı; tabansız bir birleştirmede silinen
her kelime bir sonraki turda geri dirilir.

Taban **yalnızca yazma bittikten sonra** kaydediliyor. Önce kaydedilseydi,
yarıda kalan bir yazma "gönderildi" sayılır ve o satırlar bir daha hiç
gönderilmezdi.

### Bilinçli taraf tutmalar

| Durum | Karar | Neden |
|---|---|---|
| Burada silinen, başka cihazda yeniden eklenen kelime | **Silme kazanır** | Zaman damgası tutmadan hangisinin sonra olduğu bilinemez. "Sildiğim geri gelmesin", yanılma hâlinde daha az rahatsız edici. |
| Hata defteri 200 sınırını aşarsa | **Düşenler sunucudan da silinir** | Sınır bir ürün kuralı. Yalnızca cihazda uygulanırsa sunucu sınırsız büyür ve aynı kayıtlar her turda geri iner. Eleme hem tarihe hem anahtara göre, yoksa iki cihaz farklı kayıtları atar. |
| Kayıt anında sunucudaki boş profil | **Yerel kazanır** | Tetikleyicinin az önce açtığı boş satırın tarihi "şimdi"dir. Yalnızca tarihe bakan bir kural, aylardır çevrimdışı çalışmış birinin tüm tercihlerini hesap açtığı anda silerdi. |
| Arena sayaçları | **Büyük olan** | Bunlar birikimli sayaç, tercih değil; profil sunucudan gelse bile geri sarmamalı. |

### Günlük XP neden iki tabloda

Cihazdaki `daily` **yalnızca bu cihazın** payı ve sunucuya öyle gidiyor.
Diğer cihazlardan gelen `remoteDaily`'de ayrı duruyor. Ekranda gösterilen
toplam ikisinin toplamı.

Uzaktan geleni `daily`'nin üstüne yazsaydık, gönderdiğimiz pay her eşitlemede
kendi üstüne eklenir ve XP hiç çalışmadan katlanarak büyürdü.

### Ne zaman eşitleniyor

Giriş yapıldığında, uygulama önplana/arkaplana geçtiğinde, açıkken beş
dakikada bir, ve Ayarlar'daki düğmeyle elle.

Her değişiklikte değil: eşitlemenin sonucu yerel duruma yazılıyor ve o yazma
yeni bir eşitlemeyi tetiklerdi — kendi kuyruğunu kovalayan bir döngü.
Aralarda kaybolan bir şey yok, çünkü ilerleme zaten cihazda.

### `saved_words` neden `on conflict do nothing`

Bu tablonun yalnızca `insert` ve `delete` politikası var, `update` yok.
Sıradan bir upsert çakışmada UPDATE deneyip RLS'e takılıyor — sınandı ve
reddedildiği doğrulandı. Güncellenecek bir alan da yok: satırın varlığı
bilginin kendisi.

## Liderlik tablosu

Haftalık sıralama, zaten eşitlenen `daily_xp` üzerinden sunucuda
hesaplanıyor. Hafta pazartesi başlıyor (`date_trunc('week', …)`).

### Katılım isteğe bağlı ve varsayılan kapalı

`profiles.leaderboard_opt_in` varsayılanı `false`. Tersi, hesap açan
herkesin adını ve çalışma temposunu diğer bütün kullanıcılara göstermek
olurdu; kimse bunu istemeden vermiş olmamalı.

Katılmak için görünen ad zorunlu — veritabanı kısıtı bunu uyguluyor
(`profiles_opt_in_needs_name`). Ad 2–24 karakter.

### Neden SECURITY DEFINER

`weekly_leaderboard()` ve `my_leaderboard_place()` tanımı gereği
**başkalarının** satırlarını gösteriyor; `profiles` üzerindeki RLS buna
izin vermez. Sızıntı yüzeyi fonksiyonun gövdesiyle sınırlı: yalnızca
katılmayı seçmiş kullanıcıların **adı ve haftalık XP'si** dönüyor.

Güvenlik denetleyicisi bunu uyarı olarak işaretliyor
([0029](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)).
Uyarı yerinde: "bunu bilerek mi yaptın?" diye soruyor. Cevap evet, ve
aşağıdaki sınamalar bunu doğruluyor.

`anon` rolünden `execute` geri alındı. Giriş yapmadan başkalarının adlarını
toplayabilen bir uç nokta, lider tablosu değil veri kaynağıdır.

### Ekranlardan silinenler

Liderlik ekranı tasarımdan gelen dört şeyi kaybetti, hepsi aynı sebeple —
ölçmediğimiz ya da var olmayan bir şeyi göstermiyoruz:

| Silinen | Neden |
|---|---|
| Ligler (Bronz…Elit) | Lig sistemi yok |
| Yükselme sayacı | Yükselme diye bir şey yok; yerine haftanın gerçek sıfırlanma zamanı |
| ▲▼ hareket okları | Geçen haftanın sırası tutulmuyor |
| "%68 düello kazanma" | Düello ölçülmüyor |

Ana sayfadaki üç satırlık önizleme de gerçek tabloya bağlandı. Sabit
kalsaydı iki ekran aynı öğrenci için farklı şeyler söylerdi.

### Henüz yapılmayan: akış, kulüp, yorum

Bunlar **kullanıcı üretimi içerik** demek: moderasyon, şikâyet ve
engelleme gerektiriyor ve App Store bunu şart koşuyor. Plansız açılmadı.

Görünen ad da küçük bir kullanıcı içeriği yüzeyi; şimdilik yalnızca uzunluk
sınırı var. Gerçek moderasyon, akışla birlikte gelmeli.

## Migration'lar

`migrations/` altındaki dosyalar Supabase'e uygulanmış hâlleriyle duruyor.
Supabase'in kendi kaydı tek kopya olmamalı: proje silinse ya da yeniden
kurulsa şema burada.

| Sürüm | Ad |
|---|---|
| 20260918230304 | `wordly_initial_schema` |
| 20260918230333 | `lock_down_trigger_functions` |
| 20260919113347 | `weekly_leaderboard` |

## Doğrulandı

- Güvenlik denetleyicisi (`get_advisors`) temiz.
- "İlerleme geri sarmaz" tetikleyicisi çalıştırılarak sınandı: 40 → 12
  denendiğinde 40'ta kaldı, 40 → 75 denendiğinde 75 oldu.
- Yeni kullanıcı tetikleyicisi sınandı: kullanıcı açılınca profil satırı
  otomatik oluştu.
- Sınama `RAISE EXCEPTION` ile geri alındı; veritabanında sınama satırı
  kalmadı (altı tablonun altısı da sıfır satır).

Eşitleme için ayrıca:

- Birleştirme kuralları 22 otomatik testle sınanıyor: `cd mobile && npm test`.
- İstemcinin yaptığı bütün yazmalar `authenticated` rolüyle, RLS açıkken
  çalıştırıldı: konum geri sarmadı (40 → 12 denemesi 40'ta kaldı), aynı
  cihazın iki kez yazması toplamı değiştirmedi, iki cihazın aynı günü
  toplandı (100 + 50 = 150), hata sayacı güncellendi, profil tetikleyicinin
  açtığı satırın üstüne yazıldı.
- `saved_words` üzerinde düz upsert'in RLS tarafından **reddedildiği** ayrıca
  doğrulandı; `on conflict do nothing` gerçekten gerekliydi.
- İki sınama da geri alındı; tablolar yine sıfır satır.

Liderlik tablosu için ayrıca (hepsi `authenticated` rolüyle, RLS açıkken):

- Katılmayı seçmemiş kullanıcı, **en yüksek XP'ye sahip olmasına rağmen**
  tabloda görünmedi.
- Sıralama XP'ye göre doğru çıktı.
- `my_leaderboard_place()` yalnızca çağıranın satırını döndürdü.
- Başkasının profil satırı hâlâ okunamadı; RLS yerinde.
- Kısıtlar sınandı: adsız katılım, tek harflik ad ve 25 karakterlik ad
  reddedildi; geçerli ad ile katılım geçti.
- Sınamalar geri alındı; tablolar yine sıfır satır.
