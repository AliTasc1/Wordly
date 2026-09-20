#!/usr/bin/env python3
"""Sitede geçen sayıları içeriğin kendisinden sayar.

Ana sayfada "9.461 kelime" gibi sayılar vardı ve elle yazılmıştı. İçerik
büyüdükçe ya da küçüldükçe o sayılar yerinde kalıyordu; yani sitenin en
somut iddiaları, doğrulanması en zor olanlardı.

Burada her sayı dosyalardan geliyor. İçerik değişirse site de değişiyor,
kimsenin bir şey hatırlaması gerekmiyor.
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICERIK = ROOT / "mobile" / "assets" / "content"
SES = ROOT / "mobile" / "assets" / "audio"
SEVIYELER = ["a1", "a2", "b1", "b2", "c1", "c2"]


def _liste(ad: str) -> list:
    yol = ICERIK / ad
    if not yol.exists():
        return []
    veri = json.loads(yol.read_text(encoding="utf-8"))
    if isinstance(veri, list):
        return veri
    # Sözlük biçiminde tutulan dosyalarda listeler değerlerde duruyor.
    out: list = []
    for v in veri.values():
        if isinstance(v, list):
            out += v
    return out


def _tum(onek: str) -> list:
    out: list = []
    for lv in SEVIYELER:
        out += _liste(f"{onek}{lv}.json")
    return out


def _alt_sayim(kayitlar: list, anahtarlar: tuple[str, ...]) -> int:
    """Kayıtların içindeki alıştırma/cümle listelerini toplar."""
    n = 0
    for k in kayitlar:
        if not isinstance(k, dict):
            continue
        for a in anahtarlar:
            if isinstance(k.get(a), list):
                n += len(k[a])
    return n


def sayilar() -> dict[str, int]:
    kelime = _tum("")
    gramer = _tum("grammar-")
    okuma = _tum("reading-")
    dinleme = _tum("listening-")
    konusma = _tum("speaking-")
    yazma = _tum("writing-")

    return {
        "kelime": len(kelime),
        "gramerDers": len(gramer),
        "gramerAlistirma": _alt_sayim(gramer, ("exercises", "items", "questions", "drills")),
        "okuma": len(okuma),
        "okumaSoru": _alt_sayim(okuma, ("questions",)),
        "dinleme": len(dinleme),
        "dinlemeSatir": _alt_sayim(dinleme, ("lines",)),
        "konusma": len(konusma),
        "yazma": len(yazma),
        "yazmaGorev": _alt_sayim(yazma, ("tasks", "items", "sentences")),
        "sesKaydi": sum(1 for _ in SES.rglob("*.mp3")) if SES.exists() else 0,
        "seviye": len(SEVIYELER),
    }


def tr(n: int) -> str:
    """Binlik ayırıcı nokta — Türkçe yazım."""
    return f"{n:,}".replace(",", ".")


if __name__ == "__main__":
    for k, v in sayilar().items():
        print(f"{k:18} {tr(v)}")
