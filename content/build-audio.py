#!/usr/bin/env python3
"""Dinleme diyaloglarının ve kelime telaffuzlarının sesini üretir.

    python3 build-audio.py                    # ne üretileceğini ve maliyeti yazar
    GOOGLE_TTS_KEY=... python3 build-audio.py --run
    GOOGLE_TTS_KEY=... python3 build-audio.py --run --kind listening --level c1

Neden bir betik:

İçerik sabit. 150 diyalog ve 9.461 kelime bir kez seslendirilir, dosyalar
uygulamaya girer, bir daha hiç API çağrısı yapılmaz. Yani bu abonelik değil,
tek seferlik bir iş — ve tek seferlik işler elle değil betikle yapılır ki
yarın bir replik düzeltildiğinde yalnız o replik yeniden üretilsin.

Betik yeniden çalıştırılabilir: var olan dosyayı atlar. Bağlantı koparsa
üretimin içinde geri çekilerek yeniden dener; öldürücü bir hatada durur ve
sonraki çalıştırma kaldığı yerden sürer.

API yüzeyi ezberden yazılmadı; Google'ın kendi discovery belgesinden
doğrulandı (texttospeech.googleapis.com/$discovery/rest?version=v1).
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from http.client import HTTPException
from pathlib import Path

ROOT = Path(__file__).parent
TEXTS = ROOT / "texts"
CARDS = ROOT.parent / "mobile" / "assets" / "content"
OUT = ROOT.parent / "mobile" / "assets" / "audio"
LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]

# Ağ kopması sayılan hatalar: sunucudan gelen bir cevap değil, yolun kopması.
# OSError bilerek dışarıda: diske yazamamak ağ sorunu değildir ve onu
# "bağlantı kurulamadı" diye raporlamak hatayı gizler.
TRANSIENT = (urllib.error.URLError, HTTPException, TimeoutError, ConnectionError)

SYNTHESIZE = "https://texttospeech.googleapis.com/v1/text:synthesize"
VOICES = "https://texttospeech.googleapis.com/v1/voices"

# Fiyatlar 1 milyon karakter başına, ABD doları; Google'ın fiyat sayfasından.
# Ücretsiz kota aylık ve ses ailesine göre değişiyor.
TIERS = {
    "chirp3": {"label": "Chirp 3: HD", "free": 1_000_000, "usd": 30},
    "neural2": {"label": "Neural2", "free": 1_000_000, "usd": 16},
    "wavenet": {"label": "WaveNet", "free": 4_000_000, "usd": 4},
    "standard": {"label": "Standard", "free": 4_000_000, "usd": 4},
}

# Diyalogdaki iki konuşmacı ayrı seslerle okunmalı, yoksa diyalog diyalog
# olmaz. Sıra tercih sırası: elde varsa ilk ikisi seçilir.
VOICE_ORDER = ["Chirp3-HD", "Neural2", "Wavenet", "Standard"]

# Seviyeye göre okuma hızı; uygulamadaki cihaz TTS'iyle aynı mantık
# (mobile/src/audio/speech.ts). Gerçek konuşma hızı 1.0.
RATE = {"A1": 0.82, "A2": 0.88, "B1": 0.94, "B2": 1.0, "C1": 1.0, "C2": 1.0}


def slug(text: str) -> str:
    """Dosya adı için güvenli bir ad üretir."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


# --------------------------------------------------------------------------
# Ne seslendirilecek
# --------------------------------------------------------------------------


class Clip:
    """Üretilecek tek bir ses dosyası."""

    __slots__ = ("path", "text", "level", "speaker")

    def __init__(self, path: Path, text: str, level: str, speaker: int):
        self.path = path
        self.text = text
        self.level = level
        self.speaker = speaker


def listening_clips(levels: list[str]) -> list[Clip]:
    """Her diyaloğun her repliği ayrı dosya.

    Replik replik üretiliyor çünkü uygulama diyaloğu satır satır oynatıyor:
    öğrenci tek bir repliği tekrar dinleyebilsin, okunan satır vurgulanabilsin.
    Tek parça ses bunların hiçbirine izin vermez.
    """
    clips = []
    for level in levels:
        folder = TEXTS / "listening" / level
        for batch in sorted(folder.glob("*.json")):
            for item in json.loads(batch.read_text(encoding="utf-8"))["items"]:
                speakers = item.get("speakers") or []
                for i, line in enumerate(item["lines"]):
                    who = line["who"]
                    speaker = speakers.index(who) if who in speakers else 0
                    clips.append(
                        Clip(
                            OUT / "listening" / item["id"] / f"{i:02d}.mp3",
                            line["en"],
                            item["level"],
                            speaker,
                        )
                    )
    return clips


def vocab_clips(levels: list[str]) -> list[Clip]:
    """Kelimelerin telaffuzu.

    Öntanımlı üretime dahil DEĞİL (--kind vocab ile açılır). 9.461 kelime
    9.461 ayrı varlık demek; uygulamada bugün 34 statik varlık çağrısı var ve
    bunu üç yüz katına çıkarmanın paket boyutuna ve açılış süresine etkisini
    ölçmeden göze almak doğru değil. Kelime telaffuzu tek bir sözcük; cihazın
    kendi TTS'i orada yeterli ve IPA zaten kartın üzerinde yazıyor.
    """
    clips = []
    for level in levels:
        path = CARDS / f"{level}.json"
        if not path.exists():
            continue
        for card in json.loads(path.read_text(encoding="utf-8")):
            clips.append(
                Clip(
                    OUT / "vocab" / level / f"{slug(card['id'])}.mp3",
                    card["word"],
                    card["cefr"],
                    0,
                )
            )
    return clips


# --------------------------------------------------------------------------
# Google Cloud Text-to-Speech
# --------------------------------------------------------------------------


def post(url: str, key: str, body: dict) -> dict:
    request = urllib.request.Request(
        f"{url}?key={key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read())


def pick_voices(key: str) -> list[str]:
    """Diyalog için bir kadın ve bir erkek ses seçer.

    İki konuşmacıyı ayırmanın en güçlü yolu cinsiyet farkı: aynı aileden iki
    kadın sesi, dikkatli dinlemeyen öğrenci için tek ses gibi duyulur. Bu
    yüzden seçim tesadüfe bırakılmıyor, açıkça FEMALE + MALE isteniyor.

    Ses adları zamanla emekliye ayrıldığı için liste çalışma anında API'den
    alınıyor; sabit ad yazmak betiği bir yıl sonra sessizce bozar. Aileler
    tercih sırasıyla taranıyor, ilk ikisini birden karşılayan aile kazanıyor.
    """
    voices: list[dict] = []
    for attempt in range(5):
        try:
            with urllib.request.urlopen(f"{VOICES}?languageCode=en-US&key={key}", timeout=30) as r:
                voices = json.loads(r.read()).get("voices", [])
            break
        except TRANSIENT:
            if attempt == 4:
                raise
            time.sleep(2 ** attempt)

    for family in VOICE_ORDER:
        same = [v for v in voices if family.lower() in v["name"].lower()]
        women = sorted(v["name"] for v in same if v.get("ssmlGender") == "FEMALE")
        men = sorted(v["name"] for v in same if v.get("ssmlGender") == "MALE")
        if women and men:
            return [women[0], men[0]]
        # Tek cinsiyet varsa bu ailede iki farklı ses yine de denenebilir.
        names = sorted(v["name"] for v in same)
        if len(names) >= 2:
            return names[:2]

    raise SystemExit("en-US sesi bulunamadı; anahtarın Text-to-Speech API'sine erişimi var mı?")


def synthesize(clip: Clip, key: str, voices: list[str]) -> None:
    body = {
        "input": {"text": clip.text},
        "voice": {"languageCode": "en-US", "name": voices[clip.speaker % len(voices)]},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": RATE.get(clip.level, 1.0)},
    }
    data = post(SYNTHESIZE, key, body)
    clip.path.parent.mkdir(parents=True, exist_ok=True)
    clip.path.write_bytes(base64.b64decode(data["audioContent"]))


# --------------------------------------------------------------------------


INDEX = ROOT.parent / "mobile" / "src" / "audio" / "clips.ts"


def write_index(with_words: bool = False) -> int:
    """Uygulamanın okuyacağı require() tablosunu üretir.

    Metro varlıkları derleme anında çözer, yani her dosya için kaynakta
    gerçek bir require() durmalı — değişkenle kurulan yol çalışmaz. Bu yüzden
    tablo elle değil burada, üretilen dosyalara bakarak yazılıyor: elle
    yazılmış 1.953 satırlık bir tablo ilk düzeltmede bozulurdu.

    Eksik diyalog sorun değil: uygulama dosyası olmayan diyalogda cihazın
    kendi seslendirmesine düşüyor.
    """
    folder = OUT / "listening"
    dialogues: dict[str, list[str]] = {}
    if folder.is_dir():
        for item in sorted(folder.iterdir()):
            if not item.is_dir():
                continue
            files = sorted(item.glob("*.mp3"))
            if files:
                dialogues[item.name] = [f.name for f in files]

    lines = [
        "/**",
        " * Üretilmiş dinleme sesleri — bu dosya elle yazılmaz.",
        " *",
        " * content/build-audio.py tarafından üretiliyor. Metro varlıkları derleme",
        " * anında çözdüğü için her dosyanın kaynakta gerçek bir require() olarak",
        " * durması gerekiyor; değişkenle kurulan yol çalışmaz.",
        " *",
        " * Sesi olmayan diyalog listede yer almaz ve uygulama orada cihazın kendi",
        " * seslendirmesine düşer.",
        " */",
        "",
        "export const CLIPS: Record<string, number[]> = {",
    ]
    for name, files in dialogues.items():
        refs = ", ".join(
            f"require('../../assets/audio/listening/{name}/{f}')" for f in files
        )
        lines.append(f"  '{name}': [{refs}],")
    # Kelime telaffuzları — ÖNTANIMLI OLARAK KAPALI.
    #
    # Ölçüldü ve bağlanmadı. 9.461 ayrı varlık çağrısının bedeli:
    #
    #   JS paketi     8,28 MB → 11,13 MB   (+%34)
    #   Varlıklar     33 MB   → 95 MB      (+62 MB)
    #   Varlık sayısı 1.998   → 11.379
    #
    # Karşılığında alınan şey tek kelimelik telaffuz; cihazın kendi TTS'i onu
    # zaten çevrimdışı ve bedava yapıyor, IPA da kartın üzerinde yazılı.
    # +62 MB indirme ve her açılışta %34 daha büyük paket, bu kazanç için
    # ağır. Dosyalar depoda duruyor: ileride uygulamaya gömmek yerine
    # sunucudan indirilip cihazda önbelleğe alınabilir.
    #
    # `--with-words` ile açılıyor; ölçümü tekrarlamak isteyen için.
    words: dict[str, str] = {}
    word_root = OUT / "vocab"
    if with_words and word_root.is_dir():
        for level_dir in sorted(word_root.iterdir()):
            if not level_dir.is_dir():
                continue
            for mp3 in sorted(level_dir.glob("*.mp3")):
                words[f"{level_dir.name}/{mp3.stem}"] = f"{level_dir.name}/{mp3.name}"

    lines += [
        "};",
        "",
        "/** Kelime telaffuzları — anahtar `seviye/slug`. */",
        "export const WORDS: Record<string, number> = {",
    ]
    for key, rel in words.items():
        lines.append(f"  '{key}': require('../../assets/audio/vocab/{rel}'),")
    lines += [
        "};",
        "",
        "/** Bir diyaloğun replik sesleri; üretilmemişse null. */",
        "export function clipsFor(id: string): number[] | null {",
        "  return CLIPS[id] ?? null;",
        "}",
        "",
        "/** Bir kelimenin telaffuzu; üretilmemişse null. */",
        "export function wordClip(level: string, slug: string): number | null {",
        "  return WORDS[`${level.toLowerCase()}/${slug}`] ?? null;",
        "}",
        "",
    ]
    INDEX.parent.mkdir(parents=True, exist_ok=True)
    INDEX.write_text("\n".join(lines), encoding="utf-8")
    return sum(len(f) for f in dialogues.values())


def report(clips: list[Clip], pending: list[Clip]) -> None:
    chars = sum(len(c.text) for c in clips)
    left = sum(len(c.text) for c in pending)
    words = sum(len(c.text.split()) for c in clips)

    print(f"{len(clips):6d} ses parçası  {chars:9,d} karakter  ~{words / 150:.0f} dakika")
    print(f"{len(pending):6d} tanesi henüz üretilmemiş ({left:,d} karakter)")
    print()
    print("Ses ailesi        Aylık ücretsiz   Bu iş için ödenecek")
    print("-" * 56)
    for tier in TIERS.values():
        billable = max(left - tier["free"], 0)
        cost = billable / 1_000_000 * tier["usd"]
        note = "ücretsiz kotaya sığıyor" if billable == 0 else f"${cost:,.2f}"
        print(f"{tier['label']:<17} {tier['free'] // 1_000_000:>10} M   {note:>22}")
    print()
    print("Ücretsiz kota aylıktır ve içerik sabittir: bir kez üretilir, bir daha ödenmez.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", action="store_true", help="gerçekten üret (anahtar ister)")
    parser.add_argument("--kind", choices=["listening", "vocab", "all"], default="listening")
    parser.add_argument("--level", choices=LEVELS + ["all"], default="all")
    parser.add_argument("--limit", type=int, default=0, help="en fazla kaç parça üretilsin")
    parser.add_argument("--index-only", action="store_true", help="yalnızca clips.ts üret")
    parser.add_argument(
        "--with-words",
        action="store_true",
        help="kelime seslerini de dizine ekle (paket +62 MB; yukarıdaki nota bak)",
    )
    args = parser.parse_args()

    levels = LEVELS if args.level == "all" else [args.level]
    clips: list[Clip] = []
    if args.kind in ("listening", "all"):
        clips += listening_clips(levels)
    if args.kind in ("vocab", "all"):
        clips += vocab_clips(levels)

    if args.index_only:
        print(f"{write_index(args.with_words)} dosya dizine yazıldı → {INDEX}")
        return 0

    pending = [c for c in clips if not c.path.exists()]
    report(clips, pending)

    if not args.run:
        print("\nÜretmek için: GOOGLE_TTS_KEY=... python3 build-audio.py --run")
        return 0

    key = os.environ.get("GOOGLE_TTS_KEY", "").strip()
    if not key:
        print("\nGOOGLE_TTS_KEY tanımlı değil.", file=sys.stderr)
        return 1
    if not pending:
        print("\nÜretilecek yeni parça yok.")
        return 0

    voices = pick_voices(key)
    print(f"\nSesler: {voices[0]} / {voices[1]}\n")

    todo = pending[: args.limit] if args.limit else pending
    for i, clip in enumerate(todo, 1):
        for attempt in range(6):
            try:
                synthesize(clip, key, voices)
                break
            except urllib.error.HTTPError as error:
                # 429 ve 5xx geçici; gerisinde durmak doğrusu, çünkü yanlış
                # anahtarla bin kez denemek kotayı da zamanı da yakar.
                if error.code not in (429, 500, 502, 503) or attempt == 5:
                    print(f"\n{clip.path.name}: {error.code} {error.reason}", file=sys.stderr)
                    print(error.read().decode("utf-8", "replace")[:400], file=sys.stderr)
                    return 1
                time.sleep(2 ** attempt)
            except TRANSIENT as error:
                # Kopan bağlantı, zaman aşımı, DNS hatası. İlk sürümde yalnızca
                # HTTP durum kodları yakalanıyordu ve bin repliğin ortasında
                # düşen tek bir bağlantı bütün üretimi öldürüyordu — nitekim
                # öldürdü. Bunlar sunucunun verdiği bir cevap değil, yolun
                # kopması; her zaman yeniden denenir.
                if attempt == 5:
                    print(f"\n{clip.path.name}: bağlantı kurulamadı — {error}", file=sys.stderr)
                    return 1
                time.sleep(2 ** attempt)
        if i % 25 == 0 or i == len(todo):
            print(f"  {i}/{len(todo)}")

    count = write_index(args.with_words)
    print(f"\n{count} dosya hazır → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
