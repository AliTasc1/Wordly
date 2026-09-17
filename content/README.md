# İçerik üretim hattı

```
sources/     dış kaynaklar (CEFR listeleri, IPA, frekans)  → LICENSES.md
lexicon/     build-lexicon.py çıktısı: CEFR omurgası (kelime, seviye, IPA, sıra)
authored/    bizim yazdığımız içerik (Türkçe, tanım, örnek) — parti parti
```

İki adım:

```bash
python3 build-lexicon.py     # kaynaklardan omurgayı kurar → lexicon/
python3 merge-authored.py    # omurga + yazılan içerik → mobile/assets/content/
```

`merge-authored.py` aynı zamanda denetleyicidir; şunları yakalar:
- eksik alan (Türkçe, tanım, örnek, çeviri)
- seviyeye göre fazla uzun örnek cümle (A1'de 8 kelime, C2'de 30)
- öğretilen kelimenin örnek cümlede geçmemesi
- aynı kelimenin iki partide yazılması

Sorun bulursa çıkış kodu 1 döner, böylece CI'da kırmızı yanar.

Sadece içeriği yazılmış kelimeler uygulamaya girer; bir seviye yarım kalmışken
uygulama boş kart göstermez.
