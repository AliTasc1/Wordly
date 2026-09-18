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

## Migration'lar

`migrations/` altındaki dosyalar Supabase'e uygulanmış hâlleriyle duruyor.
Supabase'in kendi kaydı tek kopya olmamalı: proje silinse ya da yeniden
kurulsa şema burada.

| Sürüm | Ad |
|---|---|
| 20260918230304 | `wordly_initial_schema` |
| 20260918230333 | `lock_down_trigger_functions` |

## Doğrulandı

- Güvenlik denetleyicisi (`get_advisors`) temiz.
- "İlerleme geri sarmaz" tetikleyicisi çalıştırılarak sınandı: 40 → 12
  denendiğinde 40'ta kaldı, 40 → 75 denendiğinde 75 oldu.
- Yeni kullanıcı tetikleyicisi sınandı: kullanıcı açılınca profil satırı
  otomatik oluştu.
- Sınama `RAISE EXCEPTION` ile geri alındı; veritabanında sınama satırı
  kalmadı (altı tablonun altısı da sıfır satır).
