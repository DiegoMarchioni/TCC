#!/usr/bin/env bash
# Mede o artigo contra os limites do Regulamento (Art. 4º: 10 a 16 páginas) e
# do modelo SBC (Abstract e Resumo na 1ª página).
#
#   ./medir.sh [artigo.tex]
#
# Precisa de pdflatex, bibtex, pdfinfo e pdftotext, e dos arquivos do modelo
# SBC (sbc-template.sty e sbc.bst) nesta pasta; eles vêm do modelo oficial no
# Overleaf (link no Art. 3º do Regulamento). Compila numa pasta temporária,
# sem deixar arquivos auxiliares aqui.
set -euo pipefail
cd "$(dirname "$0")"
fonte="${1:-artigo.tex}"
base="$(basename "$fonte" .tex)"

for f in sbc-template.sty sbc.bst; do
  [ -f "$f" ] || { echo "falta $f nesta pasta (baixe do modelo SBC no Overleaf)"; exit 1; }
done

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
cp "$fonte" sbc-template.sty sbc.bst sbc-template.bib "$tmp/"
(
  cd "$tmp"
  pdflatex -interaction=nonstopmode "$base.tex" >/dev/null 2>&1 || true
  bibtex "$base" >/dev/null 2>&1 || true
  pdflatex -interaction=nonstopmode "$base.tex" >/dev/null 2>&1 || true
  pdflatex -interaction=nonstopmode "$base.tex" >/dev/null 2>&1 || true
)
pdf="$tmp/$base.pdf"
[ -f "$pdf" ] || { echo "a compilação falhou; veja o log com pdflatex $fonte"; exit 1; }

paginas="$(pdfinfo "$pdf" | awk '/^Pages:/ {print $2}')"
ultima="$(pdftotext -f "$paginas" -l "$paginas" "$pdf" - | grep -vc '^\s*$' || true)"
pag1="$(pdftotext -f 1 -l 1 "$pdf" -)"

echo "páginas: $paginas (limite do Art. 4º: 10 a 16)"
echo "linhas de texto na última página: $ultima"
if grep -q "Palavras-chave" <<<"$pag1"; then
  echo "Resumo e palavras-chave na 1ª página: sim"
else
  echo "Resumo e palavras-chave na 1ª página: NÃO (o modelo SBC exige)"
fi
erros="$(grep -c '^!' "$tmp/$base.log" || true)"
avisos="$(grep -c -E 'undefined|Overfull' "$tmp/$base.log" || true)"
echo "erros de LaTeX: $erros; referências indefinidas ou linhas estourando: $avisos"
pendencias="$(pdftotext "$pdf" - | grep -c -E 'PREENCHER|CONFERIR|AJUSTAR|TODO' || true)"
echo "marcadores de pendência impressos no PDF: $pendencias"
[ "$paginas" -le 16 ] && [ "$paginas" -ge 10 ]
