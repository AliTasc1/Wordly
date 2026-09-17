# İçerik üretim hattı

```
sources/     dış kaynaklar (CEFR listeleri, gramer envanteri, IPA, frekans) → LICENSES.md
lexicon/     build-lexicon.py çıktısı: CEFR omurgası (kelime, seviye, IPA, sıra)
authored/    yazdığımız kelime içeriği (Türkçe, tanım, örnek) — parti parti
grammar/     yazdığımız gramer dersleri — seviye klasörü, parti dosyaları
```

## Kelime

```bash
python3 build-lexicon.py     # kaynaklardan omurgayı kurar → lexicon/
python3 merge-authored.py    # omurga + yazılan içerik → mobile/assets/content/
python3 audit.py             # seviye içi ve seviyeler arası kalite taraması
```

`merge-authored.py` aynı zamanda denetleyicidir; şunları yakalar:
- eksik alan (Türkçe, tanım, örnek, çeviri)
- seviyeye göre fazla uzun örnek cümle (A1'de 8 kelime, C2'de 30)
- öğretilen kelimenin örnek cümlede geçmemesi
- aynı kelimenin iki partide yazılması

Sorun bulursa çıkış kodu 1 döner, böylece CI'da kırmızı yanar.

Sadece içeriği yazılmış kelimeler uygulamaya girer; bir seviye yarım kalmışken
uygulama boş kart göstermez.

## Gramer

```bash
python3 build-grammar.py     # dersleri doğrular → mobile/assets/content/grammar-*.json
```

Kelimede omurga kaynaktan mekanik olarak üretiliyordu; gramerde öyle bir omurga
yok. CEFR-J Gramer Profili (`sources/grammar.csv`) "A1'de şu yapılar görülür"
diyen bir envanterdir, ders değil — ne sıraya, ne anlatıma, ne alıştırmaya dair
bir şey söyler. O yüzden dersleri baştan sona biz yazıyoruz ve envanteri denetim
listesi olarak kullanıyoruz: seviyenin her maddesi ya bir dersin `covers`
listesinde geçer ya da `grammar/deferred.json`'da hangi seviyeye neden
ertelendiği yazılıdır. Sessizce atlanan madde kalmaz.

Envanterin bir yapıyı bir seviyeye koyması, o yapının orada *üretileceği*
anlamına gelmez: A1 öğrencisi "made in China" etiketini okur ama edilgen çatıyı
kuramaz. Bu ayrım `deferred.json`'daki gerekçelerin çoğunu açıklar.

Erteleme bir söz olduğu için takip de ediliyor: bir madde A1'de ertelenip A2'ye
yazıldıysa, A2'nin envanterine dahil olur ("Devralınan" sütunu). Orada da
öğretilmezse doğrulama kırılır — ya derse girer ya yeni bir gerekçeyle daha
ileriye taşınır.

**C1 ve C2 nereden geliyor.** CEFR-J'nin gramer seviyeleri B2'de biter, ama aynı
dosyanın EGP sütunu English Grammar Profile seviyelerini C2'ye kadar taşır. Bir
satır şu iki koşulu birden sağlıyorsa C1/C2 envanterine giriyor: CEFR-J seviyesi
boş (yani yapı A1-B2 derslerinde zaten yok) ve EGP aralığının en üstü C1/C2,
en altı B2 veya yukarısı. İkinci koşul "A1, C2" gibi satırları dışarıda tutar;
bunlar A1'de öğretilen bir yapının ileri bir kullanımını gösterir, yapının
kendisi C2 konusu değildir — böyle bir satırı C2 dersine koymak öğrenciye
A1'de öğrendiğini yeniden anlatmak olurdu.
