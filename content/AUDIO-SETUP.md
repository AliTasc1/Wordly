# Ses üretimi için Google Cloud kurulumu

`build-audio.py`'nin çalışması için bir Google Cloud API anahtarı gerekiyor.
Aşağıdaki adımlar konsolun **İngilizce** arayüzüne göre yazıldı; menü adları
tırnak içinde İngilizce, açıklamalar Türkçe.

Google zaman zaman konsoldaki etiketleri değiştiriyor. Bir düğmeyi tam o adla
bulamazsan, aynı bölümde çok benzer bir ad arayın — adımların sırası ve mantığı
değişmiyor.

---

## 1. Projeyi oluştur

<https://console.cloud.google.com> adresine Google hesabınla gir.

Üst çubuktaki proje seçiciye tıkla → **"New Project"**. Adı `wordly` olsun →
**"Create"**.

Oluştuktan sonra üst çubuktan o projenin **seçili** olduğundan emin ol. Sonraki
her adım seçili projeye işliyor; yanlış projede açılan API işe yaramaz.

## 2. Faturalandırmayı aç

Sol menü (☰) → **"Billing"** → **"Link a billing account"** (hesabın hiç yoksa
**"Manage billing accounts"** → **"Create account"**) → kart bilgisi.

Bu adım atlanamaz: Google ücretsiz kotayı bile faturalandırma açıkken veriyor.
Yeni hesaplara ayrıca deneme kredisi tanımlanıyor.

## 3. Bütçe uyarısı kur — bunu atlama

**"Billing"** → **"Budgets & alerts"** → **"Create budget"**.

- **"Amount"**: `5` USD
- **"Actions"** / uyarı eşikleri: `50%` ve `100%` işaretli, e-posta açık
- **"Finish"**

Bizim iş ücretsiz kotaya sığıyor, ama kota aşılırsa Google otomatik
ücretlendiriyor. Bu uyarı senin güvenlik ağın.

## 4. Text-to-Speech API'sini etkinleştir

Sol menü → **"APIs & Services"** → **"Library"** → arama kutusuna
`Cloud Text-to-Speech API` yaz → çıkan sonuca tıkla → **"Enable"**.

## 5. API anahtarı oluştur

Sol menü → **"APIs & Services"** → **"Credentials"** →
**"+ Create credentials"** → **"API key"**.

Anahtar bir kutuda görünecek. Kopyala ama **hiçbir sohbete, mesaja ya da dosyaya
yapıştırma** (bkz. aşağıdaki bölüm).

## 6. Anahtarı kısıtla — bu önemli

Anahtar kutusunda **"Edit API key"**e tıkla (ya da listede anahtarın adına).

- **"API restrictions"** → **"Restrict key"** seç → açılan listeden yalnızca
  **"Cloud Text-to-Speech API"**'yi işaretle.
- **"Application restrictions"** → **"None"** kalsın. (Betik sunucu tarafından
  çağırıyor; IP kısıtlaması burada işe yaramaz çünkü çalıştığı makinenin IP'si
  sabit değil.)
- **"Save"**

Bu kısıtlamayla anahtar bir yere sızsa bile yalnızca metni sese çevirmek için
kullanılabilir; hesabındaki başka hiçbir servise dokunamaz.

## 7. İş bitince anahtarı sil

Ses üretimi **tek seferlik** bir iş. Dosyalar üretilip depoya girdikten sonra
**"Credentials"** → anahtarın yanındaki çöp kutusu → **"Delete"**.

Duran bir anahtar, unutulmuş bir anahtardır.

---

## Anahtarı nasıl kullanmalı

**Sohbete, commit'e, koda yapıştırma.** Bir kez yazıldığı yerde kalır.

**Seçenek A — kendi bilgisayarında (en güvenlisi, anahtar cihazından çıkmaz):**

```
git clone https://github.com/AliTasc1/Wordly.git
cd Wordly/content
python3 build-audio.py                        # önce ne yapacağını göster
GOOGLE_TTS_KEY=anahtar python3 build-audio.py --run
```

Python 3 dışında kurulum gerekmiyor. Sonra:

```
cd ..
git add mobile/assets/audio
git commit -m "Dinleme sesleri"
git push
```

**Seçenek B — Claude Code ortamında:** Anahtarı ortam değişkeni olarak tanımla
(ortam ayarları → environment variables), adı `GOOGLE_TTS_KEY` olsun. Böylece
anahtar konuşma kaydına girmez.

---

## Ne üretilecek

```
1953 ses parçası   115.137 karakter   ~150 dakika
```

Yalnızca dinleme diyalogları. Kelime telaffuzları öntanımlı değil; gerekçesi
README'nin "Ses" bölümünde.

Google'ın en iyi ses ailesinde bile aylık ücretsiz kota 1 milyon karakter
olduğundan bu iş **ücretsiz kotaya sığıyor**. İçerik sabit olduğu için de tek
seferlik: bir kez üretilir, bir daha API çağrısı yapılmaz.

## Sonra ne olacak

Dosyalar geldiğinde uygulama onları **henüz çalamaz**. Dosya oynatma katmanı
(expo-audio) o zaman eklenecek; ses katmanı (`mobile/src/audio/speech.ts`)
baştan bu geçişe hazır yazıldı, ekranların değişmesi gerekmeyecek.

Yani anahtarı almak acele değil — hazır olduğunda yap.
