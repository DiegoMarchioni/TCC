#!/usr/bin/env bash
# Normalização de estilo por formatadores, condição de validade das contagens
# de código (Seção 6.1 do artigo).
#
#   scripts/normalizar.sh            aplica ocamlformat e ormolu (in place)
#   scripts/normalizar.sh verificar  só verifica; sai com erro se algo mudaria
#
# Versões fixadas: ocamlformat 0.26.2 (ocaml/.ocamlformat, perfil
# conventional) e ormolu 0.5.3.0. Outras versões podem formatar diferente e
# mudar as contagens: o script recusa versões diferentes.
set -euo pipefail
cd "$(dirname "$0")/.."

OCAMLFORMAT_VERSAO="0.26.2"
ORMOLU_VERSAO="0.5.3.0"
modo="${1:-aplicar}"

command -v ocamlformat >/dev/null || { echo "ocamlformat ausente (eval \$(opam env))"; exit 1; }
command -v ormolu >/dev/null || { echo "ormolu ausente"; exit 1; }
v_of="$(ocamlformat --version)"
v_or="$(ormolu --version | head -1 | awk '{print $2}')"
[ "$v_of" = "$OCAMLFORMAT_VERSAO" ] || { echo "ocamlformat $v_of; exigido $OCAMLFORMAT_VERSAO"; exit 1; }
[ "$v_or" = "$ORMOLU_VERSAO" ] || { echo "ormolu $v_or; exigido $ORMOLU_VERSAO"; exit 1; }

hs_arquivos=$(find haskell/src haskell/test haskell/bench haskell/app metricas-hs -name '*.hs' -not -path '*/dist-newstyle/*')

if [ "$modo" = "verificar" ]; then
  (cd ocaml && dune build @fmt) && echo "ocaml: formatado (ocamlformat $v_of)"
  # shellcheck disable=SC2086
  ormolu --mode check $hs_arquivos && echo "haskell: formatado (ormolu $v_or)"
else
  (cd ocaml && dune fmt) || true
  # shellcheck disable=SC2086
  ormolu --mode inplace $hs_arquivos
  echo "normalizado com ocamlformat $v_of e ormolu $v_or"
fi
