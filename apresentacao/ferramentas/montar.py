"""Junta os slides do deck num HTML que abre sozinho no navegador."""
import html
import json
import sys

proj, saida = sys.argv[1], sys.argv[2]
deck = json.load(open(f"{proj}/deck.json", encoding="utf-8"))
fontes = "".join(f'<link rel="stylesheet" href="{f["href"]}">' for f in deck["faces"].values())
secoes = "\n".join(open(f"{proj}/slides/{s}.html", encoding="utf-8").read() for s in deck["order"])

CSS = """
@page { size: 1920px 1080px; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #2b2f36; }
section { position: relative; width: 1920px; height: 1080px; overflow: hidden; margin: 0 auto 24px; break-after: page; }
section > aside { display: none; }
table { border-collapse: collapse; }
th, td { padding: 14px 20px; border-bottom: 1px solid #DDD8CC; vertical-align: top; }
ul, ol { padding-left: 1.2em; }
pre, code { font-family: 'JetBrains Mono', monospace; }
@media print { html, body { background: none; } section { margin: 0; } }
"""

doc = (
    '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    f"<title>{html.escape(deck['title'])}</title>\n{fontes}\n<style>{CSS}</style></head><body>\n"
    f"{secoes}\n</body></html>\n"
)
open(saida, "w", encoding="utf-8").write(doc)
print("ok", len(deck["order"]), "slides")
