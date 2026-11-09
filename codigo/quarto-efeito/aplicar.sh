#!/usr/bin/env bash
# Aplica o quarto efeito (Input) sobre o código de três efeitos.
#
#   quarto-efeito/aplicar.sh copia DESTINO   copia codigo/ para DESTINO e aplica
#                                            o patch lá (não toca no repositório)
#   quarto-efeito/aplicar.sh ramo [NOME]     cria o ramo git NOME (padrão:
#                                            quarto-efeito) a partir do HEAD,
#                                            aplica o patch e faz um commit
#
# O patch é relativo a codigo/ (patch -p1). Os benchmarks continuam a rodar
# sobre a versão de três efeitos; o ramo serve à QP2 (pontos de modificação).
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
CODIGO="$(cd "$AQUI/.." && pwd)"
PATCH="$AQUI/input.patch"

case "${1:-}" in
  copia)
    destino="${2:?uso: aplicar.sh copia DESTINO}"
    mkdir -p "$destino"
    (cd "$CODIGO" && tar --exclude=_build --exclude=dist-newstyle --exclude=__pycache__ \
        --exclude=resultados -cf - .) | (cd "$destino" && tar -xf -)
    (cd "$destino" && patch -p1 --quiet < "$PATCH")
    echo "quarto efeito aplicado em $destino"
    ;;
  ramo)
    nome="${2:-quarto-efeito}"
    raiz="$(git -C "$CODIGO" rev-parse --show-toplevel)"
    if [ -n "$(git -C "$raiz" status --porcelain)" ]; then
      echo "há alterações não commitadas; faça commit ou stash antes"; exit 1
    fi
    git -C "$raiz" checkout -b "$nome"
    (cd "$CODIGO" && patch -p1 --quiet < "$PATCH")
    git -C "$raiz" add -A codigo
    git -C "$raiz" commit -q -m "Quarto efeito (Input) nas quatro implementações"
    echo "ramo '$nome' criado com o quarto efeito; para publicar: git push -u origin $nome"
    ;;
  *)
    sed -n '2,12p' "$0"; exit 2 ;;
esac
