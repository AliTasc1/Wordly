# Ekran görüntüleri

Site, uygulamanın arayüzünü sayfanın içinde HTML olarak çiziyor. Gerçek
ekran görüntüsü koyulduğunda çizimin yerine o geçiyor.

## Dosya adları

Yedi yer var. Bir kısmını koyup bir kısmını boş bırakabilirsin; her yer
ayrı ayrı bakılıyor.

| Dosya | Hangi ekran | Nerede görünüyor |
|---|---|---|
| `ana.webp` | Ana sayfa | Giriş bölümü |
| `yol.webp` | Öğren → yol haritası | "2 · Her gün" |
| `seviye.webp` | Seviye testi sonucu | "1 · Başlangıç" |
| `gramer.webp` | Gramer sorusu (cevaplanmış) | "3 · Çalışma" |
| `arena.webp` | Harf Arenası | "4 · Oyun" |
| `defter.webp` | Hata defteri | "5 · Hatalar" |
| `okuma.webp` | Okuma parçası | "6 · Okuma" |

## Nasıl olmalı

- **Oran:** yaklaşık 300 × 620 (telefonun kendi ekran oranı). Kadraj
  bozulmasın diye çerçeve `object-fit: cover` uyguluyor, yani kenarlardan
  bir miktar kırpabilir.
- **Biçim:** `.webp` tercih ediliyor (aynı kalitede en küçük dosya);
  `.png`, `.jpg` de kabul ediliyor.
- **Durum çubuğu görünmesin:** saat, pil ve şebeke, ekranın kendisinden
  çok telefonun durumunu anlatıyor ve sayfadaki telefon çerçevesiyle iki
  kez çerçeve olmuş oluyor. Kırparak çıkar.
- **Gerçek veriyle:** uygulamayı birkaç gün kullandıktan sonra çekilen
  ekran, sıfır XP ve boş ilerleme gösteren ekrandan daha ikna edici.
- **İki tema için tek dosya yeter.** Site iki temalı ama görüntü tek;
  koyu temada çekilmiş bir ekran açık temalı sayfada da kabul edilebilir
  duruyor. İstersen yalnızca koyu temayı çek.

## Koyduktan sonra

```
python3 content/build-site.py
```

Çıktının sonunda hangi görüntülerin kullanıldığı yazıyor.
