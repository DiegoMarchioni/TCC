#!/usr/bin/env python3
"""Métricas de código (QP1, QP2, QP3), a partir das ferramentas de AST.

As definições operacionais estão em docs/protocolo-metricas.md. Este script
não conta nada por expressão regular: ele executa as ferramentas de AST
(ocaml/tools/metricas_ocaml.ml e metricas-hs/MetricasHs.hs) e organiza os
resultados.

Comandos (rodar a partir de codigo/, com o ambiente do opam ativo):

  python3 scripts/metricas.py tabela [--raiz DIR]
      LOC de eval, operações de efeito (total e por construtor),
      profundidade de aninhamento e LOC fora de eval das quatro
      implementações. Grava resultados/metricas-codigo.{json,csv,md} e
      prepara resultados/boilerplate/<impl>.csv para a dupla contagem
      (não sobrescreve classificações já preenchidas).

  python3 scripts/metricas.py pontos BASE NOVO
      Pontos de modificação e adições puras entre duas árvores do código
      (a de três efeitos e a do quarto efeito). Grava
      resultados/pontos-modificacao.{json,md}.

  python3 scripts/metricas.py concordancia
      Lê as classificações de resultados/boilerplate/*.csv, conta o
      boilerplate por avaliador e calcula a concordância (percentual e kappa
      de Cohen). Grava resultados/boilerplate.{json,md}.

  python3 scripts/metricas.py latex
      Gera resultados/tabela-metricas.tex com as linhas da Tabela 1 do
      artigo, com o que já estiver disponível (o resto fica com ---).
"""

import csv
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RESULTADOS = RAIZ / "resultados"

IMPLEMENTACOES = [
    # (chave, rótulo na Tabela 1, linguagem, papel, caminho relativo)
    ("handlers", "\\textit{Handlers} (OCaml)", "ocaml", "mecanismo", "ocaml/effects/interp_effects.ml"),
    ("imperativa", "Imperativa (OCaml)", "ocaml", "base", "ocaml/imperative/interp_imp.ml"),
    ("monadas", "Mônadas (Haskell)", "haskell", "mecanismo", "haskell/src/Interp/Monadic.hs"),
    ("ioref", "\\texttt{IORef} (Haskell)", "haskell", "base", "haskell/src/Interp/IORefBase.hs"),
]
CONSTRUTORES = ["Num", "Var", "Add", "Mul", "Div", "Let", "Seq", "Print"]

# ---- Ferramentas de AST ------------------------------------------------------

_ferramentas = {}


def _rodar(cmd, cwd):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise SystemExit(f"falhou: {' '.join(map(str, cmd))} (em {cwd})")
    return r.stdout


def ferramenta(linguagem):
    if linguagem in _ferramentas:
        return _ferramentas[linguagem]
    if linguagem == "ocaml":
        if not shutil.which("dune"):
            raise SystemExit("dune não encontrado: ative o switch com eval $(opam env)")
        _rodar(["dune", "build", "./tools/metricas_ocaml.exe"], RAIZ / "ocaml")
        caminho = RAIZ / "ocaml/_build/default/tools/metricas_ocaml.exe"
    else:
        _rodar(["cabal", "build", "-v0", "metricas-hs"], RAIZ / "metricas-hs")
        caminho = Path(_rodar(["cabal", "list-bin", "-v0", "metricas-hs"], RAIZ / "metricas-hs").strip().splitlines()[-1])
    _ferramentas[linguagem] = caminho
    return caminho


def analisar(linguagem, arquivo):
    saida = _rodar([str(ferramenta(linguagem)), str(arquivo)], RAIZ)
    return json.loads(saida)


# ---- QP1 e preparação de QP3 ---------------------------------------------------

def cmd_tabela(raiz):
    RESULTADOS.mkdir(exist_ok=True)
    (RESULTADOS / "boilerplate").mkdir(exist_ok=True)
    dados = {}
    for chave, _, ling, papel, rel in IMPLEMENTACOES:
        d = analisar(ling, raiz / rel)
        dados[chave] = {"linguagem": ling, "papel": papel, "arquivo": rel, **d}
        preparar_boilerplate(chave, d)
    (RESULTADOS / "metricas-codigo.json").write_text(
        json.dumps(dados, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    campos = ["implementacao", "linguagem", "papel", "loc_eval", "operacoes", "profundidade",
              "loc_fora_de_eval", "loc_arquivo"] + [f"oper_{c}" for c in CONSTRUTORES] + \
             [f"loc_{c}" for c in CONSTRUTORES] + [f"prof_{c}" for c in CONSTRUTORES]
    with open(RESULTADOS / "metricas-codigo.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(campos)
        for chave, d in dados.items():
            pc = d["eval"]["por_construtor"]
            w.writerow([chave, d["linguagem"], d["papel"], d["eval"]["loc"], d["eval"]["operacoes"],
                        d["eval"]["profundidade"], d["loc_fora_de_eval"], d["loc_arquivo"]]
                       + [pc.get(c, {}).get("operacoes", "") for c in CONSTRUTORES]
                       + [pc.get(c, {}).get("loc", "") for c in CONSTRUTORES]
                       + [pc.get(c, {}).get("profundidade", "") for c in CONSTRUTORES])

    linhas = ["# Métricas de código (gerado por scripts/metricas.py tabela)", "",
              "Comparação vertical: dentro de cada linguagem.", "",
              "| Implementação | LOC eval | Operações | Aninhamento | LOC fora de eval | LOC arquivo |",
              "|---|---:|---:|---:|---:|---:|"]
    for chave, d in dados.items():
        e = d["eval"]
        linhas.append(f"| {chave} | {e['loc']} | {e['operacoes']} | {e['profundidade']} | "
                      f"{d['loc_fora_de_eval']} | {d['loc_arquivo']} |")
    linhas += ["", "## Operações de efeito por construtor", "",
               "| Implementação | " + " | ".join(CONSTRUTORES) + " |",
               "|---|" + "---:|" * len(CONSTRUTORES)]
    for chave, d in dados.items():
        pc = d["eval"]["por_construtor"]
        linhas.append(f"| {chave} | " + " | ".join(str(pc.get(c, {}).get("operacoes", "-")) for c in CONSTRUTORES) + " |")
    linhas += ["", "LOC fora de eval é o universo de linhas a classificar como boilerplate "
               "(resultados/boilerplate/*.csv); não é, por si, o boilerplate."]
    (RESULTADOS / "metricas-codigo.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))


def preparar_boilerplate(chave, d):
    destino = RESULTADOS / "boilerplate" / f"{chave}.csv"
    if destino.exists():
        with open(destino, encoding="utf-8") as f:
            ja = [r for r in csv.DictReader(f) if (r.get("autor") or r.get("segundo"))]
        if ja:
            print(f"(mantido {destino.relative_to(RAIZ)}: já tem classificações)")
            return
    with open(destino, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["linha", "texto", "autor", "segundo", "consenso"])
        for item in d["linhas_fora_de_eval"]:
            w.writerow([item["linha"], item["texto"], "", "", ""])


# ---- QP2: pontos de modificação -------------------------------------------------

def _chaves_unicas(declaracoes):
    vistos = {}
    saida = {}
    for d in declaracoes:
        nome = d["nome"]
        if re.search(r"@\d+$", nome):            # nomes dependentes de linha
            tipo = nome.split("@")[0]
            nome = f"{tipo} {' '.join(d['texto'].split()[:6])}"
        n = vistos.get(nome, 0) + 1
        vistos[nome] = n
        saida[nome if n == 1 else f"{nome}#{n}"] = d
    return saida


def _eh_importacao(nome):
    return nome.startswith("import ") or nome.startswith("open ")


def _cabecalho(texto, bracos):
    """Texto de eval antes do primeiro braço: assinatura e cabeçalho.

    Os separadores entre braços (o "|" do OCaml) não fazem parte do texto de
    cada braço; comparar o cabeçalho, e não "o texto menos os braços", evita
    que um braço novo apareça como mudança de cabeçalho."""
    posicoes = [texto.find(t) for t in bracos.values() if t and texto.find(t) >= 0]
    return " ".join(texto[: min(posicoes)].split()) if posicoes else texto


def comparar(base, novo):
    db = _chaves_unicas(base["declaracoes"])
    dn = _chaves_unicas(novo["declaracoes"])
    pontos, adicoes, removidas = [], [], []
    imp_base = {d["texto"] for n, d in db.items() if _eh_importacao(n)}
    imp_novo = {d["texto"] for n, d in dn.items() if _eh_importacao(n)}
    for nome, d in db.items():
        if _eh_importacao(nome):
            continue
        if nome not in dn:
            removidas.append(nome)
            continue
        if nome == "eval":
            bb = base["eval"].get("bracos", {})
            bn = novo["eval"].get("bracos", {})
            mudou_braco = [c for c in bb if bn.get(c) != bb[c]]
            mudou_resto = _cabecalho(d["texto"], bb) != _cabecalho(dn[nome]["texto"], bn)
            if mudou_braco or mudou_resto:
                pontos.append({"declaracao": "eval",
                               "detalhe": ("braços alterados: " + ", ".join(mudou_braco) if mudou_braco else "")
                               + ("; " if mudou_braco and mudou_resto else "")
                               + ("cabeçalho/assinatura alterados" if mudou_resto else "")})
        elif d["texto"] != dn[nome]["texto"]:
            pontos.append({"declaracao": nome, "detalhe": ""})
    for nome in dn:
        if nome not in db and not _eh_importacao(nome):
            adicoes.append(nome)
    bracos_novos = sorted(set(novo["eval"].get("bracos", {})) - set(base["eval"].get("bracos", {})))
    return {
        "pontos_de_modificacao": len(pontos) + len(removidas),
        "pontos": pontos,
        "removidas": removidas,
        "adicoes_puras": len(adicoes),
        "adicoes": adicoes,
        "bracos_novos_em_eval_excluidos": bracos_novos,
        "importacoes_alteradas_ou_removidas": sorted(imp_base - imp_novo),
        "importacoes_acrescentadas": sorted(imp_novo - imp_base),
    }


def cmd_pontos(base_dir, novo_dir):
    RESULTADOS.mkdir(exist_ok=True)
    out = {}
    for chave, _, ling, papel, rel in IMPLEMENTACOES:
        out[chave] = {"linguagem": ling, "papel": papel,
                      **comparar(analisar(ling, base_dir / rel), analisar(ling, novo_dir / rel))}
    (RESULTADOS / "pontos-modificacao.json").write_text(
        json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    linhas = ["# Pontos de modificação para o quarto efeito (scripts/metricas.py pontos)", "",
              "Ponto de modificação: declaração ou definição preexistente cujo texto mudou "
              "(excluídos o novo construtor de sintaxe e o novo braço de eval, idênticos nas quatro "
              "versões). Adições puras: declarações novas. Importações contadas à parte.", "",
              "| Implementação | Pontos | Quais | Adições puras | Quais | Importações alteradas | Importações novas |",
              "|---|---:|---|---:|---|---:|---:|"]
    for chave, r in out.items():
        quais = ", ".join(p["declaracao"] + (f" ({p['detalhe']})" if p["detalhe"] else "") for p in r["pontos"])
        quais += (", removidas: " + ", ".join(r["removidas"])) if r["removidas"] else ""
        linhas.append(f"| {chave} | {r['pontos_de_modificacao']} | {quais or '-'} | {r['adicoes_puras']} | "
                      f"{', '.join(r['adicoes']) or '-'} | {len(r['importacoes_alteradas_ou_removidas'])} | "
                      f"{len(r['importacoes_acrescentadas'])} |")
    (RESULTADOS / "pontos-modificacao.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))


# ---- QP3: dupla contagem de boilerplate ------------------------------------------

def _rotulo(v):
    v = (v or "").strip().upper()
    return v if v in ("B", "N") else None


def cmd_concordancia():
    pasta = RESULTADOS / "boilerplate"
    out = {}
    for chave, *_ in IMPLEMENTACOES:
        arq = pasta / f"{chave}.csv"
        if not arq.exists():
            continue
        with open(arq, encoding="utf-8") as f:
            linhas = list(csv.DictReader(f))
        a = [_rotulo(r["autor"]) for r in linhas]
        s = [_rotulo(r["segundo"]) for r in linhas]
        c = [_rotulo(r.get("consenso")) for r in linhas]
        completo = all(x is not None for x in a + s)
        r = {"linhas": len(linhas), "completo": completo,
             "boilerplate_autor": a.count("B"), "boilerplate_segundo": s.count("B")}
        if completo and linhas:
            n = len(linhas)
            po = sum(x == y for x, y in zip(a, s)) / n
            pb = (a.count("B") / n) * (s.count("B") / n)
            pn = (a.count("N") / n) * (s.count("N") / n)
            pe = pb + pn
            r["concordancia"] = round(po, 4)
            r["kappa"] = round((po - pe) / (1 - pe), 4) if pe < 1 else 1.0
            divergentes = [i for i, (x, y) in enumerate(zip(a, s)) if x != y]
            resolvidas = all(c[i] is not None for i in divergentes)
            r["divergencias"] = len(divergentes)
            if resolvidas:
                final = [c[i] if i in divergentes else a[i] for i in range(n)]
                r["boilerplate_consenso"] = final.count("B")
        out[chave] = r
    (RESULTADOS / "boilerplate.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")
    linhas = ["# Boilerplate por dupla contagem (scripts/metricas.py concordancia)", "",
              "| Implementação | Linhas | Autor | Segundo | Concordância | Kappa | Divergências | Consenso |",
              "|---|---:|---:|---:|---:|---:|---:|---:|"]
    for chave, r in out.items():
        linhas.append(f"| {chave} | {r['linhas']} | {r['boilerplate_autor']} | {r['boilerplate_segundo']} | "
                      f"{r.get('concordancia', '-')} | {r.get('kappa', '-')} | {r.get('divergencias', '-')} | "
                      f"{r.get('boilerplate_consenso', '-')} |")
    if not all(r["completo"] for r in out.values()):
        linhas += ["", "Classificação incompleta: preencha as colunas autor e segundo com B "
                   "(boilerplate) ou N (não) em todas as linhas."]
    (RESULTADOS / "boilerplate.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))


# ---- Tabela 1 do artigo -------------------------------------------------------------

def cmd_latex():
    def ler(nome):
        p = RESULTADOS / nome
        return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    m, b, p = ler("metricas-codigo.json"), ler("boilerplate.json"), ler("pontos-modificacao.json")
    linhas = ["% Gerado por scripts/metricas.py latex -- linhas da Tabela 1 (tab:metricas)"]
    for chave, rotulo, *_ in IMPLEMENTACOES:
        e = m.get(chave, {}).get("eval", {})
        cel = [e.get("loc"), e.get("operacoes"), e.get("profundidade"),
               b.get(chave, {}).get("boilerplate_consenso"),
               p.get(chave, {}).get("pontos_de_modificacao"), p.get(chave, {}).get("adicoes_puras")]
        cel = ["---" if x is None else str(x) for x in cel]
        linhas.append(f"    {rotulo:<27} & " + " & ".join(cel) + " \\\\")
    (RESULTADOS / "tabela-metricas.tex").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))


def main(argv):
    if len(argv) >= 2 and argv[1] == "tabela":
        raiz = Path(argv[argv.index("--raiz") + 1]).resolve() if "--raiz" in argv else RAIZ
        cmd_tabela(raiz)
    elif len(argv) == 4 and argv[1] == "pontos":
        cmd_pontos(Path(argv[2]).resolve(), Path(argv[3]).resolve())
    elif len(argv) == 2 and argv[1] == "concordancia":
        cmd_concordancia()
    elif len(argv) == 2 and argv[1] == "latex":
        cmd_latex()
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
