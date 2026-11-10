#!/usr/bin/env bash
# Campanha completa de medição de desempenho (QP4).
#
#   scripts/rodar-campanha.sh
#
# Passos: registra o ambiente; compila as duas linguagens; roda as duas suítes
# de oráculo (pré-condição: a campanha aborta se qualquer verificação falhar);
# mede os quatro cenários com as três sementes, em corridas estritamente
# sequenciais; remede em par o que tiver R² < 0,95 (scripts/repetir_r2.py,
# com registro em ambiente.md); e resume tudo com scripts/resumir_campanha.py.
#
# Variáveis de ambiente (padrões = protocolo do artigo):
#   SEMENTES       "42 43 44"
#   TCC_QUOTA      20      cota por teste, em segundos (Bechamel e Criterion)
#   TCC_LIMIT      5000    limite de amostras do Bechamel
#   TCC_RESAMPLES  1000    reamostragens do bootstrap do Criterion
#   TCC_BOOTSTRAP  1000    reamostragens do bootstrap do IC no OCaml
#   TCC_CENARIOS   todos   ex.: "arith,state"
#   TCC_TASKSET    vazio   prefixo de afinidade, ex.: "taskset -c 2" (Linux);
#                          use um núcleo de desempenho em CPUs híbridas
#
# Duração aproximada com os padrões: 4 cenários x 2 versões x 2 linguagens x
# 3 sementes x ~20 s = ~16 min de medição, mais compilação.
set -euo pipefail
cd "$(dirname "$0")/.."

SEMENTES="${SEMENTES:-42 43 44}"
export TCC_QUOTA="${TCC_QUOTA:-20}" TCC_LIMIT="${TCC_LIMIT:-5000}"
export TCC_RESAMPLES="${TCC_RESAMPLES:-1000}" TCC_BOOTSTRAP="${TCC_BOOTSTRAP:-1000}"
export TCC_CENARIOS="${TCC_CENARIOS:-}"
TASKSET="${TCC_TASKSET:-}"

destino="resultados/campanha-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$destino/brutos"
echo "== campanha em $destino"

scripts/registrar-ambiente.sh > "$destino/ambiente.md"
{
  echo; echo "## Parâmetros da campanha"
  echo "SEMENTES=$SEMENTES TCC_QUOTA=$TCC_QUOTA TCC_LIMIT=$TCC_LIMIT TCC_RESAMPLES=$TCC_RESAMPLES"
  echo "TCC_BOOTSTRAP=$TCC_BOOTSTRAP TCC_CENARIOS=${TCC_CENARIOS:-todos} TCC_TASKSET=${TASKSET:-nenhum}"
  echo "compilação: dune --profile release (sem -opaque), ocamlopt -O3; ghc -O2"
} >> "$destino/ambiente.md"

echo "== compilação"
(cd ocaml && dune build --profile release 2>&1)
# O alvo do benchmark é pedido pelo nome: `cabal build all` sozinho não o
# compila quando benchmarks não estão habilitados no plano.
(cd haskell && cabal build -v0 all bench:desempenho)
BENCH_OCAML="ocaml/_build/default/bench/bench_main.exe"
BENCH_HASKELL="$(cd haskell && cabal list-bin -v0 bench:desempenho | tail -1)"
for b in "$BENCH_OCAML" "$BENCH_HASKELL"; do
  [ -x "$b" ] || { echo "executável de benchmark ausente: $b"; exit 1; }
done

echo "== pré-condição: suítes de oráculo"
(cd ocaml && dune test --profile release --force 2>&1 | tail -1) | tee "$destino/oraculo-ocaml.txt"
(cd haskell && cabal test -v0 oraculo --test-show-details=direct 2>&1 | tail -1) | tee "$destino/oraculo-haskell.txt"
grep -q "61/61" "$destino/oraculo-ocaml.txt" || { echo "oráculo OCaml não passou"; exit 1; }
grep -q "61/61" "$destino/oraculo-haskell.txt" || { echo "oráculo Haskell não passou"; exit 1; }

echo "== medições"
for s in $SEMENTES; do
  # shellcheck disable=SC2086
  TCC_SEED="$s" TCC_SAIDA="$destino/brutos/ocaml-$s.csv" $TASKSET "$BENCH_OCAML"
  # shellcheck disable=SC2086
  TCC_SEED="$s" TCC_SAIDA="$destino/brutos/haskell-$s.csv" $TASKSET "$BENCH_HASKELL"
done

echo "== repetições (protocolo: R² do tempo >= 0,95; até 3 tentativas por par)"
python3 scripts/repetir_r2.py "$destino" || echo "atenção: há medição abaixo do limiar; veja o resumo"

echo "== resumo"
python3 scripts/resumir_campanha.py "$destino"
echo "== pronto: $destino/resumo.md"
