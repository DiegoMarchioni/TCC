#!/usr/bin/env bash
# Mede o artigo contra o limite de páginas do Regulamento (Art. 4º: 10 a 16),
# chamando ../medir.sh, se os arquivos do modelo SBC (sbc-template.sty e
# sbc.bst, do modelo oficial no Overleaf) estiverem na raiz do repositório.
# Sem eles, só avisa: compilar no Overleaf também serve.
set -uo pipefail
cd "$(dirname "$0")/../.."
if [ -f sbc-template.sty ] && [ -f sbc.bst ]; then
  ./medir.sh artigo.tex || { echo "ATENÇÃO: o artigo saiu do limite de páginas"; exit 1; }
else
  echo "(páginas não medidas: ponha sbc-template.sty e sbc.bst na raiz e rode ./medir.sh,"
  echo " ou compile no Overleaf e confira: no máximo 16 páginas, resumos na 1ª)"
fi
