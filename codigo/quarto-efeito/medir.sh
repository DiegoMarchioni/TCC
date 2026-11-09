#!/usr/bin/env bash
# Mede a composabilidade (QP2) de ponta a ponta, sem tocar no repositório:
#   1. copia o código e aplica o quarto efeito numa pasta temporária;
#   2. roda as duas suítes de oráculo sobre a cópia (pré-condição: 73/73);
#   3. conta pontos de modificação e adições puras contra a versão atual.
# Requer o ambiente do opam ativo (eval $(opam env)) e cabal.
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
CODIGO="$(cd "$AQUI/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

"$AQUI/aplicar.sh" copia "$TMP/novo"
echo "== suíte OCaml sobre a versão com quatro efeitos"
(cd "$TMP/novo/ocaml" && dune build 2>&1 && dune test 2>&1 | tail -1)
echo "== suíte Haskell sobre a versão com quatro efeitos"
(cd "$TMP/novo/haskell" && cabal test -v0 oraculo --test-show-details=direct 2>&1 | tail -1)
echo "== pontos de modificação"
python3 "$CODIGO/scripts/metricas.py" pontos "$CODIGO" "$TMP/novo"
