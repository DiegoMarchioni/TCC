#!/usr/bin/env python3
"""Repete as medições com R² abaixo do limiar, como manda o protocolo (Seção 4.3).

Uso (a partir de codigo/, chamado por rodar-campanha.sh antes do resumo):
    python3 scripts/repetir_r2.py resultados/campanha-AAAAMMDD-HHMMSS

Para cada (linguagem, semente, cenário) em que a medição de tempo de qualquer
das duas versões teve R² < 0,95, mede de novo o PAR (mecanismo e base, na
mesma ordem da campanha, que é fixa por cenário), com os mesmos parâmetros da
campanha (variáveis TCC_* do ambiente) e a mesma afinidade (TCC_TASKSET), até
três tentativas. As linhas novas substituem as antigas em brutos/; as
descartadas vão para descartados/, e cada repetição é registrada em
ambiente.md, na seção "Repetições por R²". Nada é descartado sem registro.

Sai com código 1 se alguma medição continuar abaixo do limiar depois das
tentativas (ela fica nos brutos, e o resumo a acusa).
"""

import csv
import io
import os
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LIMIAR = 0.95
TENTATIVAS = 3


_compilado = set()


def binario(ling):
    """Caminho do executável de benchmark, compilado como na campanha.

    A compilação é refeita (sem efeito, se já estiver em dia) para garantir o
    perfil release do dune: no perfil dev, o dune passa -opaque e desliga a
    otimização entre módulos, e a medição deixaria de ser a do protocolo.
    """
    if ling == "ocaml":
        if ling not in _compilado:
            subprocess.run(["dune", "build", "--profile", "release"], cwd=RAIZ / "ocaml", check=True)
            _compilado.add(ling)
        return [str(RAIZ / "ocaml/_build/default/bench/bench_main.exe")]
    if ling not in _compilado:
        subprocess.run(["cabal", "build", "-v0", "all", "bench:desempenho"], cwd=RAIZ / "haskell", check=True)
        _compilado.add(ling)
    saida = subprocess.run(["cabal", "list-bin", "-v0", "bench:desempenho"], cwd=RAIZ / "haskell",
                           capture_output=True, text=True, check=True)
    return [saida.stdout.strip().splitlines()[-1]]


def ler(arq):
    with open(arq, encoding="utf-8") as f:
        texto = f.read()
    leitor = csv.DictReader(io.StringIO(texto))
    return leitor.fieldnames, list(leitor)


def gravar(arq, campos, linhas):
    with open(arq, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos, lineterminator="\n")
        w.writeheader()
        w.writerows(linhas)


def baixos(linhas):
    """Cenários com alguma medição de tempo abaixo do limiar."""
    return sorted({l["cenario"] for l in linhas if float(l["tempo_r2"]) < LIMIAR})


def medir(ling, semente, cenario, destino):
    env = dict(os.environ, TCC_SEED=str(semente), TCC_CENARIOS=cenario, TCC_SAIDA=str(destino))
    prefixo = shlex.split(os.environ.get("TCC_TASKSET", ""))
    subprocess.run(prefixo + binario(ling), env=env, cwd=RAIZ, check=True)
    return ler(destino)[1]


def commit():
    r = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=RAIZ, capture_output=True, text=True)
    sujo = subprocess.run(["git", "status", "--porcelain"], cwd=RAIZ, capture_output=True, text=True)
    return (r.stdout.strip() or "?") + (" (com alterações não commitadas)" if sujo.stdout.strip() else "")


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    pasta = Path(argv[1]).resolve()
    descartados = pasta / "descartados"
    registro = []
    restantes = []
    for arq in sorted((pasta / "brutos").glob("*.csv")):
        campos, linhas = ler(arq)
        for cenario in baixos(linhas):
            ling, semente = linhas[0]["linguagem"], int(linhas[0]["semente"])
            for tentativa in range(1, TENTATIVAS + 1):
                antigas = [l for l in linhas if l["cenario"] == cenario]
                r2 = ", ".join(f"{l['implementacao']} {float(l['tempo_r2']):.3f}" for l in antigas)
                descartados.mkdir(exist_ok=True)
                gravar(descartados / f"{arq.stem}-{cenario}-descarte{tentativa}.csv", campos, antigas)
                print(f"== repetindo {ling}/{cenario}/{semente} (R²: {r2}), tentativa {tentativa}",
                      file=sys.stderr)
                novas = medir(ling, semente, cenario, descartados / f"_{arq.stem}-{cenario}.tmp.csv")
                (descartados / f"_{arq.stem}-{cenario}.tmp.csv").unlink()
                linhas = [l for l in linhas if l["cenario"] != cenario] + novas
                gravar(arq, campos, linhas)
                quando = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
                r2n = ", ".join(f"{l['implementacao']} {float(l['tempo_r2']):.3f}" for l in novas)
                registro.append(f"- {quando}, commit {commit()}: {ling}/{cenario}/semente {semente} "
                                f"remedido (R² antes: {r2}; depois: {r2n}); linhas antigas em "
                                f"descartados/{arq.stem}-{cenario}-descarte{tentativa}.csv")
                if cenario not in baixos(linhas):
                    break
            else:
                restantes.append(f"{ling}/{cenario}/{semente}")
    if registro:
        with open(pasta / "ambiente.md", "a", encoding="utf-8") as f:
            f.write("\n## Repetições por R²\n")
            f.write(f"Medições com R² do tempo < {LIMIAR} remedidas em par (mecanismo e base), "
                    "na ordem da campanha, com os mesmos parâmetros e afinidade.\n")
            f.write("\n".join(registro) + "\n")
        print("\n".join(registro))
    else:
        print("nenhuma medição com R² abaixo de 0,95")
    if restantes:
        print(f"continuam abaixo do limiar após {TENTATIVAS} tentativas: {', '.join(restantes)}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
