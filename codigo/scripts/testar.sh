#!/usr/bin/env bash
# Verificação completa do código (rodar antes de qualquer medição).
#
#   scripts/testar.sh            semântica de referência, gerador, formato e as
#                                duas suítes de oráculo (61/61 em cada)
#   scripts/testar.sh completo   + testes de mutação (8 mutantes) e o quarto
#                                efeito de ponta a ponta (73/73 em cada)
#
# Requer o ambiente do opam ativo (eval $(opam env)), cabal, ormolu e python3.
set -euo pipefail
cd "$(dirname "$0")/.."

passo() { printf '\n== %s\n' "$1"; }

passo "semântica small-step contra os 28 casos"
python3 referencia/semantica.py verificar | tail -1

passo "gerador de referência contra o arquivo de conformidade"
python3 referencia/atualizar_geracao.py --verificar

passo "formato (ocamlformat 0.26.2, ormolu 0.5.3.0)"
scripts/normalizar.sh verificar

passo "OCaml: compilação e suíte de oráculo"
(cd ocaml && dune build 2>&1 && dune test --force 2>&1 | tail -1)

passo "Haskell: compilação e suíte de oráculo"
(cd haskell && cabal build -v0 all && cabal test -v0 oraculo --test-show-details=direct 2>&1 | tail -1)

if [ "${1:-}" = "completo" ]; then
  passo "testes de mutação das decisões travadas"
  python3 scripts/mutantes.py | tail -1
  passo "quarto efeito de ponta a ponta"
  quarto-efeito/medir.sh | tail -8
fi

printf '\nTudo verificado.\n'
