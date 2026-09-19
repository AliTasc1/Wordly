# Telefonda çalıştırma ve açılmıyorsa ne yapmalı

Proje **Expo SDK 57** üzerinde. SDK 57 şu an Expo'nun `latest` sürümü, yani
mağazadaki güncel Expo Go bu projeyi açabiliyor.

## Normal akış

```
git pull
cd mobile
npm install
npx expo start
```

`npm install` her `git pull` sonrası gerekiyor: yeni paketler eklendiğinde
(Supabase istemcisi, derin bağlantı, kayıt) atlanırsa uygulama açılışta
"module not found" ile çöker.

**`git pull` büyük olabilir.** Depoda 9.461 kelime telaffuzu duruyor (63 MB).
Uygulama şu an onları kullanmıyor — paket boyutu ölçüldü ve gömülmemesine
karar verildi (bkz. `content/build-audio.py`) — ama dosyalar ileride
sunucudan indirilmek üzere saklanıyor.

Sonra QR'ı okut:

- **Android:** Kamerayla değil, **Expo Go uygulamasını açıp içindeki
  "Scan QR code"** ile. Android'de kamera uygulaması Expo Go'ya bağlanmaz.
- **iPhone:** Kamera uygulamasıyla okutup çıkan bildirime dokun.

## Açılmıyorsa — sırayla

Sıralama rastgele değil; en sık çıkan sebepten en seyrekine doğru.

### 1. Telefon ile bilgisayar aynı ağda mı?

En sık sebep bu. QR'daki adres `exp://192.168.x.x:8081` gibi bir **yerel ağ**
adresi. Telefon mobil veride ya da misafir Wi-Fi'ındaysa o adrese ulaşamaz ve
Expo Go sessizce bekler.

Denemesi kolay: telefonun tarayıcısına terminalde yazan `http://192.168.x.x:8081`
adresini yaz. Sayfa açılmıyorsa sorun ağda, uygulamada değil.

### 2. Ağı tamamen atla

```
npm run tunnel
```

Bu, bağlantıyı Expo'nun sunucusu üzerinden kurar; aynı Wi-Fi şartı kalkar,
güvenlik duvarı da devreden çıkar. İlk açılışta bir kerelik `@expo/ngrok`
kurulumu ister, "y" de. Yerel ağdan yavaştır ama çalışır.

### 3. Güvenlik duvarı (Windows'ta çok olur)

Windows ilk `expo start`'ta "Node.js ağa erişsin mi?" diye sorar. Bu kutuda
yanlışlıkla "Cancel" denmişse 8081 portu kapalı kalır. Windows Defender
Firewall → "Allow an app through firewall" → Node.js'i **Private** ağda işaretle.

### 4. İlk yükleme yavaş, çökmüş değil

Geliştirme paketi **13 MB** ve içinde 1.953 ses dosyası kayıtlı. Telefon bunu
indirip derlerken açılış ekranı yarım dakika kadar durabilir. Terminalde
yüzdeyi göster — ilerliyorsa beklemek yeterli.

### 5. Bağımlılıklar eski

Depoyu son değişiklikten önce klonladıysan yerli modül sürümleri Expo Go'nun
taşıdığı sürümlerle uyuşmaz ve uygulama açılışta kapanır:

```
git pull
npm install
npx expo start -c        # -c: Metro önbelleğini temizler
```

### 6. Expo Go güncel mi?

Play Store / App Store → Expo Go → "Update" görünüyorsa güncelle.

## Uygulama açılıyor ama güncelleme gelmemiş

Ayrı bir sorun: bu durumda telefon bağlanıyor, uygulama çalışıyor — sadece
içeriği eski. Yeni yazılan ekran yok, kaldırılan düğme hâlâ duruyor.

**Telefonda hiçbir şey yapma.** Sebep neredeyse her zaman bilgisayarda:
`git pull` düşündüğün şeyi yapmamıştır.

### Önce bunu çalıştır

`npx expo start` yazdığın **aynı klasörde**, aynı terminalde:

```
git log --oneline -1
```

Tek satır yazar. O satırdaki kod, telefona giden sürümdür. Beklediğin
değişikliğin commit'i değilse mesele kapanmıştır: paket doğru, klasör eski.

### `git pull` neden sessizce başarısız olur

| Terminalde gördüğün | Anlamı |
|---|---|
| `Already up to date.` | Yanlış klasördesin ya da yanlış daldasın |
| `error: Your local changes would be overwritten` | Pull hiç olmadı; elle değiştirdiğin dosya var |
| `fatal: not a git repository` | Klasör ZIP olarak indirilmiş, klon değil |
| Uzun süre durup hata veren indirme | Depoda 63 MB ses var; yarıda kopmuş |

Son satır burada en sık çıkanı. `git pull` yarıda koparsa Git hiçbir şeyi
uygulamaz — ya hepsi iner ya hiçbiri. Ekrandaki hata kaçarsa "indi" sanırsın.

### Doğru klasörde olduğundan emin ol

En çok karışan şey bu: `git pull` proje **kökünde**, `npx expo start` ise
`mobile/` içinde çalışır. İki ayrı terminal penceresi açıksa, biri eski
klasörde kalmış olabilir. `pwd` (Windows'ta `cd`) ile ikisini de kontrol et.

### Dal doğru mu

```
git status -sb
```

İlk satır `## main...origin/main` demeli. Başka bir dal adı yazıyorsa
değişiklikler o dala gelmiyor:

```
git checkout main
git pull
```

### Hepsi doğruysa, paketi zorla tazele

Sıra önemli:

```
npm install
npx expo start -c
```

Sonra telefonda Expo Go'yu **görev listesinden tamamen kapat** ve yeniden aç.
Expo Go arka planda kalırsa eski paketi bellekten sürdürebiliyor.

### Güncellemenin geldiğini gözle doğrula

Alt menüye bak. Güncel sürümde beş sekme şu:

**🏠 Ana · 📚 Öğren · 🎮 Oyna · 📓 Defter · 👤 Profil**

Menüde "Sosyal" yazıyorsa ya da sağ altta yüzen yuvarlak bir düğme duruyorsa,
telefon hâlâ eski paketi çalıştırıyor demektir.

## Hata yazısını nasıl okuturum

Bir yere takılırsa lazım olan iki şey var:

1. **Telefonda** görünen kırmızı ekranın ilk üç satırı.
2. **Terminalde** QR'ı okuttuktan sonra beliren satırlar.

İkisi olmadan sebebi tahmin etmek zorunda kalırız; ikisiyle birlikte genelde
tek bakışta anlaşılır.

## Neden sürümler tam sayı olarak sabit

`package.json`'daki `react-native-svg` ve `@react-native-async-storage/async-storage`
bilerek `^` ya da `~` olmadan yazıldı. Bu paketlerin yerli tarafı **Expo Go'nun
içinde** geliyor; JS tarafı bir yama sürüm ileri giderse ikisi uyuşmaz ve
uygulama açılışta kapanır. Expo Go hangi sürümü taşıyorsa `package.json` da onu
yazmalı — doğru liste `node_modules/expo/bundledNativeModules.json` dosyasında.


## Hesap açmayı denemek

Uygulama hesapsız da tam çalışıyor; hesap yalnızca ilerlemeyi ikinci bir
cihaza taşımak için. Denemek istersen:

**Ayarlar → Hesabını bağla → Kayıt ol**

Üç şeyi bilmen gerekiyor:

### 1. E-posta yalnızca kendi Supabase adresine gidiyor

Supabase'in varsayılan e-posta servisi **yalnızca projenin ekibindeki
adreslere** gönderiyor. Başka bir adresle kayıt olursan sunucu reddeder ve
uygulama "Bu adrese e-posta gönderilemiyor" der — bu uygulamanın hatası
değil.

Test için **Supabase'e giriş yaptığın e-postayı** kullan.

### 2. Panelde yönlendirme adresleri tanımlı olmalı

Supabase → Authentication → URL Configuration → Redirect URLs:

```
wordly://**
exp://**
```

Bunlar yoksa e-postadaki bağlantı uygulamaya geri dönmez.

### 3. Expo Go'da bağlantı Expo Go'yu açar

Doğrulama bağlantısı geliştirme sırasında `exp://` şemasını kullanıyor,
yani Expo Go'yu açıyor. Bu normal. `wordly://` yalnızca gerçek derlemede
(EAS build) devreye girer.

## Neyi test etmeye değer

| Ekran | Bak |
|---|---|
| Ana sayfa | Selam saate göre mi, "bugün X XP" gerçek mi |
| Öğren → herhangi bir bölüm | Kaldığın yer kapatıp açınca duruyor mu |
| Oyna → Süre Atağı | Sayaç gerçekten işliyor mu, süre dolunca tur bitiyor mu |
| Oyna → Hayatta Kalma | Üç hatada tur bitiyor mu |
| Konuşma | Mikrofon gerçekten kaydediyor mu, kendi sesini duyuyor musun |
| Profil | Ad ve "üye" satırı gerçek mi |
| Ayarlar → Titreşim | Kapatınca arenada titreşim duruyor mu, kapalı kalıyor mu |
| Bildirimler | Gerçekten senin durumunu mu anlatıyor |
| Defter | Hata defteri menüden açılıyor mu |
| Abonelik | Para isteyen hiçbir şey yok |
