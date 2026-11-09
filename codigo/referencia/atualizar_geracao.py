#!/usr/bin/env python3
"""Regrava a seção "geracao" de shared/conformance.json a partir de gerador.py.

As seções "mensagens" e "casos" não são tocadas. Rode depois de qualquer
mudança deliberada na especificação do gerador; as suítes de OCaml e de
Haskell passam a conferir as suas réplicas contra os valores regravados.

    python3 atualizar_geracao.py              regrava
    python3 atualizar_geracao.py --verificar  só confere (código 1 se diverge)
"""

import json
import sys
from pathlib import Path

import gerador

CAMINHO = Path(__file__).resolve().parent.parent / "shared" / "conformance.json"


def main():
    doc = json.loads(CAMINHO.read_text(encoding="utf-8"))
    if "--verificar" in sys.argv:
        ok = doc.get("geracao") == gerador.secao_conformidade()
        print("seção 'geracao' confere com gerador.py" if ok
              else "DIVERGE: seção 'geracao' desatualizada em relação a gerador.py")
        return 0 if ok else 1
    doc["geracao"] = gerador.secao_conformidade()
    CAMINHO.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n",
                       encoding="utf-8")
    print(f"seção 'geracao' regravada em {CAMINHO}")
    for cenario, por_semente in doc["geracao"]["hashes_cargas"].items():
        print(f"  {cenario:7s} {por_semente}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
