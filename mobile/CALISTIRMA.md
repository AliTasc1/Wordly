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
