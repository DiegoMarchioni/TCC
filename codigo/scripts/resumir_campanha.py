#!/usr/bin/env python3
"""Resume uma campanha de medição (saída de rodar-campanha.sh).

Uso: python3 scripts/resumir_campanha.py resultados/campanha-AAAAMMDD-HHMMSS

Lê brutos/*.csv (uma linha por linguagem, cenário, versão e semente) e grava:

  resumo.csv / resumo.md     razões mecanismo/base por cenário e linguagem
  tabela-desempenho.tex      linhas da Tabela 2 do artigo (razões)
  tabela-absolutos.tex       linhas de uma tabela de valores absolutos

Para cada semente: razão = M/B; IC conservador da razão = [M_inf/B_sup,
M_sup/B_inf], a partir dos IC de 95% de cada medição. Entre sementes: a
mediana das razões e a dispersão (máx - mín)/mediana. O IC reportado é o
envelope dos IC das três sementes. Valores absolutos por expressão: tempo da
base em ns e alocação em bytes (palavras do OCaml x 8, máquina de 64 bits).

Avisos: R² abaixo de 0,95 em qualquer medição de tempo (o protocolo manda
descartar e repetir) e sementes faltando.
"""

import csv
import statistics
import sys
from collections import defaultdict
from pathlib import Path

CENARIOS = ["arith", "state", "exn", "output"]
ROTULOS = {"arith": r"\textsc{Arith}", "state": r"\textsc{State}",
           "exn": r"\textsc{Exn}", "output": r"\textsc{Output}"}
BYTES_POR_PALAVRA = 8


def ler_brutos(pasta):
    linhas = []
    for arq in sorted((pasta / "brutos").glob("*.csv")):
        with open(arq, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                for k in ("semente", "n_expressoes", "amostras"):
                    r[k] = int(r[k])
                for k in ("tempo_ns", "tempo_ic_inf", "tempo_ic_sup", "tempo_r2",
                          "alocacao", "alocacao_ic_inf", "alocacao_ic_sup", "alocacao_r2"):
                    r[k] = float(r[k])
                linhas.append(r)
    return linhas


def razao(m, b, prefixo):
    """Razão M/B e IC conservador [M_inf/B_sup, M_sup/B_inf]."""
    ponto = "tempo_ns" if prefixo == "tempo" else prefixo
    return (m[ponto] / b[ponto],
            m[f"{prefixo}_ic_inf"] / b[f"{prefixo}_ic_sup"],
            m[f"{prefixo}_ic_sup"] / b[f"{prefixo}_ic_inf"])


def virgula(x, casas=2):
    return f"{x:.{casas}f}".replace(".", ",")


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    pasta = Path(argv[1])
    linhas = ler_brutos(pasta)
    if not linhas:
        print(f"nenhum CSV em {pasta / 'brutos'}")
        return 1

    grupos = defaultdict(dict)        # (ling, cenario, semente) -> papel -> linha
    for r in linhas:
        grupos[(r["linguagem"], r["cenario"], r["semente"])][r["papel"]] = r

    avisos = []
    por_cenario = defaultdict(list)   # (ling, cenario) -> [dados por semente]
    for (ling, cen, sem), papeis in sorted(grupos.items()):
        if set(papeis) != {"mecanismo", "base"}:
            avisos.append(f"{ling}/{cen}/{sem}: faltam medições ({sorted(papeis)})")
            continue
        m, b = papeis["mecanismo"], papeis["base"]
        for r in (m, b):
            if r["tempo_r2"] < 0.95:
                avisos.append(f"{ling}/{cen}/{sem}/{r['implementacao']}: R² do tempo = "
                              f"{r['tempo_r2']:.3f} < 0,95 (o protocolo manda repetir)")
        n = b["n_expressoes"]
        fator = BYTES_POR_PALAVRA if b["unidade_alocacao"] == "palavras" else 1
        por_cenario[(ling, cen)].append({
            "semente": sem,
            "tempo": razao(m, b, "tempo"),
            "alocacao": razao(m, b, "alocacao"),
            "base_ns_por_expr": b["tempo_ns"] / n,
            "mec_ns_por_expr": m["tempo_ns"] / n,
            "base_bytes_por_expr": b["alocacao"] * fator / n,
            "mec_bytes_por_expr": m["alocacao"] * fator / n,
            "r2_min": min(m["tempo_r2"], b["tempo_r2"]),
        })

    resumo = []
    for (ling, cen), ds in sorted(por_cenario.items(),
                                  key=lambda kv: (kv[0][0], CENARIOS.index(kv[0][1]))):
        def agrega(chave):
            pontos = [d[chave][0] for d in ds]
            med = statistics.median(pontos)
            disp = (max(pontos) - min(pontos)) / med * 100 if med else 0.0
            return med, min(d[chave][1] for d in ds), max(d[chave][2] for d in ds), disp
        t, a = agrega("tempo"), agrega("alocacao")
        resumo.append({
            "linguagem": ling, "cenario": cen, "sementes": len(ds),
            "razao_tempo": t[0], "tempo_ic_inf": t[1], "tempo_ic_sup": t[2], "dispersao_tempo_pct": t[3],
            "razao_alocacao": a[0], "alocacao_ic_inf": a[1], "alocacao_ic_sup": a[2], "dispersao_alocacao_pct": a[3],
            "base_ns_por_expr": statistics.median(d["base_ns_por_expr"] for d in ds),
            "mec_ns_por_expr": statistics.median(d["mec_ns_por_expr"] for d in ds),
            "base_bytes_por_expr": statistics.median(d["base_bytes_por_expr"] for d in ds),
            "mec_bytes_por_expr": statistics.median(d["mec_bytes_por_expr"] for d in ds),
            "r2_tempo_min": min(d["r2_min"] for d in ds),
        })
        if len(ds) < 3:
            avisos.append(f"{ling}/{cen}: {len(ds)} semente(s); o protocolo usa três")

    with open(pasta / "resumo.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(resumo[0]))
        w.writeheader()
        for r in resumo:
            w.writerow({k: (round(v, 6) if isinstance(v, float) else v) for k, v in r.items()})

    md = [f"# Resumo da campanha ({pasta.name})", "",
          "Razão = mecanismo / linha de base da mesma linguagem; mediana das sementes. "
          "IC = envelope dos IC conservadores de 95% das sementes. Dispersão = (máx − mín)/mediana.", "",
          "| Linguagem | Cenário | Tempo | IC 95% | Disp. | Alocação | IC 95% | Disp. | R² mín |",
          "|---|---|---:|---|---:|---:|---|---:|---:|"]
    for r in resumo:
        md.append(f"| {r['linguagem']} | {r['cenario']} | {r['razao_tempo']:.2f} | "
                  f"[{r['tempo_ic_inf']:.2f}; {r['tempo_ic_sup']:.2f}] | {r['dispersao_tempo_pct']:.1f}% | "
                  f"{r['razao_alocacao']:.2f} | [{r['alocacao_ic_inf']:.2f}; {r['alocacao_ic_sup']:.2f}] | "
                  f"{r['dispersao_alocacao_pct']:.1f}% | {r['r2_tempo_min']:.3f} |")
    md += ["", "## Valores absolutos por expressão (medianas das sementes)", "",
           "| Linguagem | Cenário | Base (ns) | Mecanismo (ns) | Base (bytes) | Mecanismo (bytes) |",
           "|---|---|---:|---:|---:|---:|"]
    for r in resumo:
        md.append(f"| {r['linguagem']} | {r['cenario']} | {r['base_ns_por_expr']:.1f} | "
                  f"{r['mec_ns_por_expr']:.1f} | {r['base_bytes_por_expr']:.1f} | {r['mec_bytes_por_expr']:.1f} |")
    md += ["", "Alocação: OCaml conta palavras do *minor heap* (Gc.minor_words, convertidas para bytes); "
           "os segmentos de pilha das *fibers* são alocados fora do heap e não aparecem aqui. "
           "Haskell conta bytes alocados pelo RTS (regressão allocated:iters)."]
    if avisos:
        md += ["", "## Avisos", ""] + [f"- {a}" for a in avisos]
    (pasta / "resumo.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    def linha_tex(cen, chave, casas):
        def val(ling):
            r = next((x for x in resumo if x["linguagem"] == ling and x["cenario"] == cen), None)
            return "---" if r is None else virgula(r[chave], casas)
        return val
    tex = ["% Gerado por scripts/resumir_campanha.py -- linhas da Tabela 2 (tab:perf-prelim)"]
    for cen in CENARIOS:
        rot = ROTULOS[cen] + (" (controle)" if cen == "arith" else "")
        tex.append(f"    {rot:<26} & {linha_tex(cen, 'razao_tempo', 2)('ocaml')} & "
                   f"{linha_tex(cen, 'razao_alocacao', 1)('ocaml')} & "
                   f"{linha_tex(cen, 'razao_tempo', 2)('haskell')} & "
                   f"{linha_tex(cen, 'razao_alocacao', 1)('haskell')} \\\\")
    (pasta / "tabela-desempenho.tex").write_text("\n".join(tex) + "\n", encoding="utf-8")

    tex = ["% Gerado por scripts/resumir_campanha.py -- valores absolutos por expressão",
           "% colunas: base ns, mecanismo ns, base bytes, mecanismo bytes (OCaml) | idem (Haskell)"]
    for cen in CENARIOS:
        cel = []
        for ling in ("ocaml", "haskell"):
            r = next((x for x in resumo if x["linguagem"] == ling and x["cenario"] == cen), None)
            cel += ["---"] * 4 if r is None else [virgula(r[k], 1) for k in
                    ("base_ns_por_expr", "mec_ns_por_expr", "base_bytes_por_expr", "mec_bytes_por_expr")]
        tex.append(f"    {ROTULOS[cen]:<16} & " + " & ".join(cel) + " \\\\")
    (pasta / "tabela-absolutos.tex").write_text("\n".join(tex) + "\n", encoding="utf-8")

    print("\n".join(md))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
