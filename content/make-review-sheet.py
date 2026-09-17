#!/usr/bin/env python3
"""
Yazılan bir içerik partisini gözden geçirilebilir bir HTML sayfasına döker.

    python3 make-review-sheet.py a1-001

Amaç: 9 bin kelimeyi yazmadan önce ve yazarken üslubun onaydan geçmesi.
Kelime kartında görüneceği sırayla, uygulamanın renkleriyle listeler.
"""

import json
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent
LEXICON = ROOT / "lexicon"
AUTHORED = ROOT / "authored"

CSS = """
:root{--bg:#070A14;--surface:#0E1426;--raised:#121A31;--line:rgba(255,255,255,.08);
--text:#fff;--dim:#94A0BC;--faint:#8E9BBA;--cyan:#22D3EE;--violet:#C4B5FF;--blue:#6E9BFF}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
font:400 15px/1.6 'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;padding:28px 20px 80px}
.wrap{max-width:860px;margin:0 auto}
h1{font:800 26px/1.2 Manrope,system-ui,sans-serif;letter-spacing:-.02em;margin:0 0 6px}
.sub{color:var(--dim);font-size:13.5px;margin:0 0 26px}
.grid{display:grid;gap:10px}
.card{background:linear-gradient(180deg,var(--raised),var(--surface));
border:1px solid var(--line);border-radius:16px;padding:14px 16px;
display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start}
.lhs{border-right:1px solid var(--line);padding-right:16px}
.word{font:800 21px Manrope,system-ui,sans-serif;letter-spacing:-.01em}
.ipa{font:600 12.5px ui-monospace,Menlo,monospace;color:var(--cyan);margin-top:2px}
.pos{display:inline-block;margin-top:7px;padding:3px 8px;border-radius:7px;
background:rgba(124,92,255,.16);border:1px solid rgba(124,92,255,.3);
font:700 9.5px ui-monospace,Menlo,monospace;color:var(--violet);letter-spacing:.08em}
.tr{font:700 15px Manrope,system-ui,sans-serif;color:#fff;margin-bottom:9px}
.def{color:#D3DCF0;font-size:13.5px;margin-bottom:11px}
.ex{font-size:14.5px;font-weight:600}
.exTr{color:var(--dim);font-size:13px;margin-top:3px}
.n{color:#4E5A78;font:600 10px ui-monospace,Menlo,monospace;float:right}
.note{background:rgba(46,107,255,.1);border:1px solid rgba(46,107,255,.3);
border-radius:14px;padding:14px 16px;margin-bottom:24px;font-size:13.5px;color:#C7D2EC}
.note b{color:#fff}
@media(max-width:620px){.card{grid-template-columns:1fr}
.lhs{border-right:none;border-bottom:1px solid var(--line);padding:0 0 10px}}
"""


def build(batch: str) -> Path:
    data = json.loads((AUTHORED / f"{batch}.json").read_text(encoding="utf-8"))
    meta = data.get("_meta", {})
    level = meta.get("level", "A1")

    spine = {
        e["id"]: e
        for e in json.loads((LEXICON / f"{level.lower()}.json").read_text(encoding="utf-8"))
    }

    rows = []
    for i, (key, c) in enumerate((k, v) for k, v in data.items() if not k.startswith("_")):
        s = spine.get(key, {})
        rows.append(
            f"""<div class="card">
<div class="lhs"><span class="n">{i + 1}</span>
<div class="word">{escape(s.get('word', key))}</div>
<div class="ipa">{escape(s.get('ipa', ''))}</div>
<div class="pos">{escape(s.get('posLabel', ''))}</div></div>
<div><div class="tr">{escape(c['tr'])}</div>
<div class="def">{escape(c['def'])}</div>
<div class="ex">“{escape(c['ex'])}”</div>
<div class="exTr">{escape(c['exTr'])}</div></div></div>"""
        )

    html = f"""<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WORDLY · {escape(batch)} onay sayfası</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap">
<style>{CSS}</style></head><body><div class="wrap">
<h1>{escape(level)} · {escape(batch)}</h1>
<p class="sub">{len(rows)} kelime · {escape(meta.get('range', ''))} · öğretim sırasına göre</p>
<div class="note"><b>Neye bakmalısın:</b> Türkçe karşılık doğru ve tek başına anlaşılır mı?
Örnek cümle {escape(level)} seviyesinde bir öğrencinin okuyabileceği kadar basit mi?
Türkçe çeviri doğal Türkçe mi, yoksa kelime kelime çeviri gibi mi duruyor?
Üslup senli mi resmi mi — tutarlı mı?</div>
<div class="grid">{''.join(rows)}</div></div></body></html>"""

    out = ROOT / "review" / f"{batch}.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"{len(rows)} kelime → {out}")
    return out


if __name__ == "__main__":
    build(sys.argv[1] if len(sys.argv) > 1 else "a1-001")
