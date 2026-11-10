#!/usr/bin/env bash
# Corrida de sensibilidade à configuração de amostragem (Seção 6.2 do artigo).
#
#   scripts/rodar-sensibilidade.sh [resultados/campanha-AAAAMMDD-HHMMSS]
#
# Repete a medição com uma configuração subdimensionada (padrão: cota de 5 s e
# 2.000 amostras, uma semente) e grava em <campanha>/sensibilidade/. Sem
# argumento, usa a campanha mais recente. O atualizar_artigo.py compara o R² e
# as razões com os da mesma semente na campanha principal. Usa os executáveis
# já compilados por rodar-campanha.sh e a mesma afinidade (TCC_TASKSET).
set -euo pipefail
cd "$(dirname "$0")/.."
ultima="$(find resultados -maxdepth 1 -type d -name 'campanha-*' | sort | tail -1)"
campanha="${1:-$ultima}"
[ -n "$campanha" ] && [ -d "$campanha/brutos" ] || { echo "nenhuma campanha em resultados/: rode make campanha"; exit 1; }
destino="$campanha/sensibilidade"
mkdir -p "$destino/brutos"

export TCC_QUOTA="${SENS_QUOTA:-5}" TCC_LIMIT="${SENS_LIMIT:-2000}"
export TCC_RESAMPLES="${TCC_RESAMPLES:-1000}" TCC_BOOTSTRAP="${TCC_BOOTSTRAP:-1000}"
SEMENTE="${SENS_SEMENTE:-42}"
TASKSET="${TCC_TASKSET:-}"

scripts/registrar-ambiente.sh > "$destino/ambiente.md"
{
  echo; echo "## Parâmetros da campanha"
  echo "SEMENTES=$SEMENTE TCC_QUOTA=$TCC_QUOTA TCC_LIMIT=$TCC_LIMIT TCC_RESAMPLES=$TCC_RESAMPLES"
} >> "$destino/ambiente.md"

BENCH_OCAML="ocaml/_build/default/bench/bench_main.exe"
BENCH_HASKELL="$(cd haskell && cabal list-bin -v0 bench:desempenho | tail -1)"
# shellcheck disable=SC2086
TCC_SEED="$SEMENTE" TCC_SAIDA="$destino/brutos/ocaml-$SEMENTE.csv" $TASKSET "$BENCH_OCAML"
# shellcheck disable=SC2086
TCC_SEED="$SEMENTE" TCC_SAIDA="$destino/brutos/haskell-$SEMENTE.csv" $TASKSET "$BENCH_HASKELL"
python3 scripts/resumir_campanha.py "$destino" > /dev/null
echo "sensibilidade gravada em $destino"
