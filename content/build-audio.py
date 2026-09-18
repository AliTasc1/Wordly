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

Betik yeniden çalıştırılabilir: var olan dosyayı atlar. Bin replikte ağ
koparsa kaldığı yerden devam eder.

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
from pathlib import Path

ROOT = Path(__file__).parent
TEXTS = ROOT / "texts"
CARDS = ROOT.parent / "mobile" / "assets" / "content"
OUT = ROOT.parent / "mobile" / "assets" / "audio"
LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"]

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
    """Kullanılabilir en iyi iki İngilizce sesi seçer.

    Ses adları zamanla değişiyor ve emekliye ayrılıyor; bu yüzden listeyi
    çalışma anında API'den alıp tercih sırasına göre eşleştiriyoruz. Sabit
    ses adı yazmak, betiği bir yıl sonra sessizce bozar.
    """
    with urllib.request.urlopen(f"{VOICES}?languageCode=en-US&key={key}", timeout=30) as r:
        voices = json.loads(r.read()).get("voices", [])
    names = [v["name"] for v in voices]
    chosen: list[str] = []
    for family in VOICE_ORDER:
        matches = sorted(n for n in names if family.lower() in n.lower())
        for name in matches:
            if name not in chosen:
                chosen.append(name)
            if len(chosen) == 2:
                return chosen
    if not chosen:
        raise SystemExit("en-US sesi bulunamadı; anahtarın Text-to-Speech API'sine erişimi var mı?")
    # Tek ses varsa iki konuşmacı da onu kullanır; diyalog daha az ayırt
    # edilir ama üretim durmaz.
    return [chosen[0], chosen[0]]


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
    args = parser.parse_args()

    levels = LEVELS if args.level == "all" else [args.level]
    clips: list[Clip] = []
    if args.kind in ("listening", "all"):
        clips += listening_clips(levels)
    if args.kind in ("vocab", "all"):
        clips += vocab_clips(levels)

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
        for attempt in range(4):
            try:
                synthesize(clip, key, voices)
                break
            except urllib.error.HTTPError as error:
                # 429 ve 5xx geçici; gerisinde durmak doğrusu, çünkü yanlış
                # anahtarla bin kez denemek kotayı da zamanı da yakar.
                if error.code not in (429, 500, 502, 503) or attempt == 3:
                    print(f"\n{clip.path.name}: {error.code} {error.reason}", file=sys.stderr)
                    print(error.read().decode("utf-8", "replace")[:400], file=sys.stderr)
                    return 1
                time.sleep(2 ** attempt)
        if i % 25 == 0 or i == len(todo):
            print(f"  {i}/{len(todo)}")

    manifest = sorted(str(p.relative_to(OUT)) for p in OUT.rglob("*.mp3"))
    (OUT / "audio-manifest.json").write_text(
        json.dumps({"files": manifest}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )
    print(f"\n{len(manifest)} dosya hazır → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
