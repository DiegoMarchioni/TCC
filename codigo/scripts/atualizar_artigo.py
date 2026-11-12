#!/usr/bin/env python3
"""Atualiza o artigo a partir dos resultados: números, tabelas e ambiente.

Uso (a partir de codigo/):
    python3 scripts/atualizar_artigo.py [--campanha DIR] [--artigo ../artigo.tex]
    python3 scripts/atualizar_artigo.py --verificar      # só confere as afirmações

Nenhum número dos resultados é digitado à mão no artigo. Este script:

1. lê resultados/metricas-codigo.json e resultados/pontos-modificacao.json
   (métricas de código) e a campanha mais recente em resultados/campanha-*/
   (ou a indicada em --campanha): resumo.csv, ambiente.md e, se houver, a
   corrida de sensibilidade (sensibilidade/resumo.csv);
2. substitui, no artigo.tex, o conteúdo entre os marcadores
       %%%% <<GERADO:nome>>   e   %%%% <</GERADO:nome>>
   para os blocos: numeros (definições \\newcommand usadas no texto),
   tabela-metricas, tabela-desempenho e ambiente;
3. confere cada afirmação qualitativa marcada no texto com
       %% AFIRMACAO:id
   contra os resultados e lista as que deixaram de valer, para que a frase
   correspondente seja revista. Sai com código 1 se alguma falhar.
"""

import csv
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RESULTADOS = RAIZ / "resultados"

LINGS = {"ocaml": "Ocaml", "haskell": "Haskell"}
CENS = {"arith": "Arith", "state": "State", "exn": "Exn", "output": "Output"}
IMPLS = {"handlers": "Handlers", "imperativa": "Imperativa", "monadas": "Monadas", "ioref": "Ioref"}
ROTULO_IMPL = {"handlers": r"\textit{Handlers} (OCaml)", "imperativa": "Imperativa (OCaml)",
               "monadas": "Mônadas (Haskell)", "ioref": r"\texttt{IORef} (Haskell)"}
ROTULO_CEN = {"arith": r"\textsc{Arith}", "state": r"\textsc{State}",
              "exn": r"\textsc{Exn}", "output": r"\textsc{Output}"}
CONSTRUTORES = ["Num", "Var", "Add", "Mul", "Div", "Let", "Seq", "Print"]


# ---- formatação ------------------------------------------------------------------

def pt(x, casas):
    """Número no formato do artigo: vírgula decimal, ponto de milhar."""
    s = f"{x:,.{casas}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def en(x, casas):
    return f"{x:.{casas}f}"


def ptsig(x, casas):
    """Como pt(), com sinal de menos tipográfico para valores negativos."""
    s = pt(abs(x), casas)
    return s if round(x, casas) >= 0 or set(s) <= set("0,.") else f"$-${s}"


# ---- leitura dos resultados ----------------------------------------------------------

def ler_json(nome):
    p = RESULTADOS / nome
    if not p.exists():
        raise SystemExit(f"falta {p.relative_to(RAIZ)}: rode make metricas e make quarto-efeito")
    return json.loads(p.read_text(encoding="utf-8"))


def ultima_campanha():
    dirs = sorted(d for d in RESULTADOS.glob("campanha-*") if (d / "resumo.csv").exists())
    if not dirs:
        raise SystemExit("nenhuma campanha com resumo.csv em resultados/: rode make campanha")
    return dirs[-1]


def ler_resumo(pasta):
    with open(pasta / "resumo.csv", encoding="utf-8") as f:
        linhas = list(csv.DictReader(f))
    r = {}
    for l in linhas:
        r[(l["linguagem"], l["cenario"])] = {k: (float(v) if k not in ("linguagem", "cenario") else v)
                                             for k, v in l.items()}
    return r


def ler_ambiente(pasta):
    texto = (pasta / "ambiente.md").read_text(encoding="utf-8")

    def busca(padrao, padrao_default="?"):
        m = re.search(padrao, texto, re.MULTILINE)
        return m.group(1).strip() if m else padrao_default

    return {
        "cpu": busca(r"^Model name:\s*(.+)$"),
        "ncpu": busca(r"^CPU\(s\):\s*(\d+)"),
        "so": busca(r'^PRETTY_NAME="?([^"\n]+)"?'),
        "ocaml": busca(r"^version:\s*(\S+)"),
        "flambda": busca(r"^flambda:\s*(\S+)"),
        "ghc": busca(r"Compilation System, version\s*(\S+)"),
        "bechamel": busca(r"^bechamel\s+(\S+)"),
        "criterion": busca(r"^criterion-(\S+)"),
        "virtual": busca(r"^virtualização:\s*(\S+)", "?"),
        "executor": busca(r"^executor:\s*(.+)$", "autor"),
        "taskset": busca(r"^TCC_TASKSET='([^']*)'", ""),
        "governor": busca(r"^governor:\s*(.*)$", ""),
        "sementes": busca(r"^SEMENTES=([\d ]+?)\s+TCC_QUOTA"),
        "quota": busca(r"TCC_QUOTA=(\S+)"),
        "limite": busca(r"TCC_LIMIT=(\S+)"),
        "reamostras": busca(r"TCC_RESAMPLES=(\S+)"),
        "repeticoes": len(re.findall(r"^- .* remedido ", texto, re.MULTILINE)),
    }


# ---- macros --------------------------------------------------------------------------

def macros(metricas, pontos, resumo, amb, sens, vies):
    m = {}
    # código
    for chave, nome in IMPLS.items():
        d = metricas[chave]
        e = d["eval"]
        m[f"LocEval{nome}"] = str(e["loc"])
        m[f"Oper{nome}"] = str(e["operacoes"])
        m[f"Anin{nome}"] = str(e["profundidade"])
        m[f"ForaEval{nome}"] = str(d["loc_fora_de_eval"])
        m[f"Boiler{nome}"] = str(d["boilerplate_regra"]["B"])
        m[f"Reuso{nome}"] = str(d["reutilizacao"]["instancias"])
        m[f"LocArq{nome}"] = str(d["loc_arquivo"])
        m[f"Pontos{nome}"] = str(pontos[chave]["pontos_de_modificacao"])
        m[f"Adicoes{nome}"] = str(pontos[chave]["adicoes_puras"])
        m[f"ImportsAlt{nome}"] = str(len(pontos[chave]["importacoes_alteradas_ou_removidas"]))
    oraculo = {"run_acc", "run_output_acc"}
    m["BoilerHandlersOraculo"] = str(sum(1 for l in metricas["handlers"]["boilerplate_regra"]["linhas"]
                                         if l["rotulo"] == "B" and l["declaracao"] in oraculo))
    # desempenho
    for ling, L in LINGS.items():
        for cen, C in CENS.items():
            r = resumo[(ling, cen)]
            m[f"RT{L}{C}"] = pt(r["razao_tempo"], 2)
            m[f"RA{L}{C}"] = pt(r["razao_alocacao"], 1)
            m[f"ICT{L}{C}"] = f"[{pt(r['tempo_ic_inf'], 2)}; {pt(r['tempo_ic_sup'], 2)}]"
            m[f"BaseNs{L}{C}"] = pt(r["base_ns_por_expr"], 0)
            m[f"MecNs{L}{C}"] = pt(r["mec_ns_por_expr"], 0)
            m[f"DeltaNs{L}{C}"] = ptsig(r["mec_ns_por_expr"] - r["base_ns_por_expr"], 0)
            m[f"BaseBy{L}{C}"] = pt(r["base_bytes_por_expr"], 0)
            m[f"MecBy{L}{C}"] = pt(r["mec_bytes_por_expr"], 0)
            m[f"DeltaBy{L}{C}"] = ptsig(r["mec_bytes_por_expr"] - r["base_bytes_por_expr"], 0)
        rts = [resumo[(ling, c)]["razao_tempo"] for c in CENS]
        ras = [resumo[(ling, c)]["razao_alocacao"] for c in CENS]
        m[f"FaixaRT{L}"] = f"{pt(min(rts), 2)} e {pt(max(rts), 2)}"
        m[f"FaixaRTen{L}"] = f"{en(min(rts), 2)} and {en(max(rts), 2)}"
        m[f"FaixaRA{L}"] = f"{pt(min(ras), 1)} e {pt(max(ras), 1)}"
        m[f"FaixaRAen{L}"] = f"{en(min(ras), 1)} and {en(max(ras), 1)}"
        m[f"RdoisMin{L}"] = pt(min(resumo[(ling, c)]["r2_tempo_min"] for c in CENS), 3)
    m["DispTempoMax"] = pt(max(r["dispersao_tempo_pct"] for r in resumo.values()), 1)
    disp_aloc = max(r["dispersao_alocacao_pct"] for r in resumo.values())
    m["DispAlocMax"] = pt(disp_aloc, 1)
    m["DispAlocFrase"] = ("inferior a 0,1\\%" if disp_aloc < 0.05 else f"de até {pt(disp_aloc, 1)}\\%")
    m["ViesAlocMax"] = pt(vies, 1)
    sementes = amb["sementes"].split()
    m["Sementes"] = ", ".join(sementes[:-1]) + " e " + sementes[-1] if len(sementes) > 1 else amb["sementes"]
    m["CotaS"] = amb["quota"]
    m["LimiteAmostras"] = pt(float(amb["limite"]), 0)
    m["Reamostras"] = pt(float(amb["reamostras"]), 0)
    if sens:
        m.update(sens)
    n = amb["repeticoes"]
    m["FraseRepeticoes"] = ("" if n == 0 else
                            "Um par de medições com $R^2$ abaixo de 0,95 foi refeito, como manda o protocolo."
                            if n == 1 else
                            f"{n} pares de medições com $R^2$ abaixo de 0,95 foram refeitos, como manda o protocolo.")
    virtual = amb["virtual"].lower().startswith("sim")
    m["UmaMaquina"] = "uma única máquina virtual" if virtual else "uma única máquina"
    # Declaração de uso de IA (Agradecimentos): quem executou a campanha.
    if amb["executor"] == "autor":
        m["DeclaracaoExecucao"] = " e executado pelo autor"
    else:
        m["DeclaracaoExecucao"] = (" pelo autor; e na execução, em máquina virtual de nuvem, "
                                   "da campanha de medição e da apuração das métricas de código "
                                   "reportadas na Seção~\\ref{sec:resultados}")
    return m


def bloco_macros(m):
    linhas = ["%% Gerado por codigo/scripts/atualizar_artigo.py a partir de codigo/resultados/.",
              "%% Não edite à mão: rode `make artigo` (ou `make tudo`) para regenerar."]
    for k in sorted(m):
        linhas.append(f"\\newcommand{{\\{k}}}{{{m[k]}}}")
    return "\n".join(linhas)


# ---- tabelas e ambiente -------------------------------------------------------------------

def bloco_tabela_metricas():
    linhas = []
    for chave, nome in IMPLS.items():
        cel = [f"\\LocEval{nome}", f"\\Oper{nome}", f"\\Anin{nome}", f"\\Boiler{nome}",
               f"\\Pontos{nome}", f"\\Adicoes{nome}"]
        linhas.append(f"    {ROTULO_IMPL[chave]:<27} & " + " & ".join(cel) + r" \\")
    return "\n".join(linhas)


def bloco_tabela_desempenho():
    """Por linguagem: tempo (base, Δ, razão) e alocação (base, Δ, razão), por expressão."""
    linhas = []
    for cen, C in CENS.items():
        cel = []
        for L in LINGS.values():
            cel += [f"\\BaseNs{L}{C}", f"\\DeltaNs{L}{C}", f"\\RT{L}{C}",
                    f"\\BaseBy{L}{C}", f"\\DeltaBy{L}{C}", f"\\RA{L}{C}"]
        linhas.append(f"    {ROTULO_CEN[cen]:<16} & " + " & ".join(cel) + r" \\")
    return "\n".join(linhas)


def bloco_ambiente(amb):
    virtual = amb["virtual"].lower().startswith("sim")
    cpu = re.sub(r"\((R|TM)\)|\bCPU\b|\bProcessor\b", "", amb["cpu"])
    cpu = re.sub(r"\s+", " ", cpu).strip()
    cpu = re.sub(r"(\d+)\.(\d+)\s*GHz", r"\1,\2~GHz", cpu)
    onde = f"um {cpu}" + (" em máquina virtual de nuvem" if virtual else "")
    afinidade = (" e afinidade fixada em um núcleo" if amb["taskset"] else "")
    texto = (
        f"A campanha correu em {onde}, com {amb['ncpu']} processadores lógicos, sob "
        f"{amb['so']}, com OCaml~{amb['ocaml']}+\\textit{{flambda}}, GHC~{amb['ghc']}, "
        f"Bechamel~{amb['bechamel']} e Criterion~{amb['criterion']}, sementes \\Sementes{{}}, "
        f"corridas estritamente sequenciais{afinidade}; no Bechamel, "
        f"\\texttt{{limit:{amb['limite']}}} e cota de \\CotaS{{}}~segundos, e no Criterion, "
        f"\\Reamostras{{}} reamostragens e a regressão \\texttt{{allocated:iters}}."
    )
    if virtual:
        texto += (" Em máquina virtual compartilhada, o ruído de outros hóspedes soma-se ao da "
                  "medição; as razões, tomadas na mesma sessão e em ordem alternada, o atenuam, e "
                  "a replicação em máquina dedicada fica indicada.")
    return texto


# ---- afirmações qualitativas do texto ------------------------------------------------------

def afirmacoes(metricas, pontos, resumo, sens_dados, vies):
    """id -> (vale?, o que a frase marcada afirma). Só entram ids usados no artigo."""
    R = lambda l, c, k: resumo[(l, c)][k]          # noqa: E731
    dns = lambda l, c: R(l, c, "mec_ns_por_expr") - R(l, c, "base_ns_por_expr")  # noqa: E731
    dby = lambda l, c: R(l, c, "mec_bytes_por_expr") - R(l, c, "base_bytes_por_expr")  # noqa: E731
    cens = list(CENS)
    sens = sens_dados or {}

    def identicas_por_construtor(a, b):
        pa, pb = metricas[a]["eval"]["por_construtor"], metricas[b]["eval"]["por_construtor"]
        return all(pa[c] == pb[c] for c in CONSTRUTORES)

    B = lambda k: metricas[k]["boilerplate_regra"]["B"]            # noqa: E731
    reuso = lambda k: metricas[k]["reutilizacao"]["instancias"]    # noqa: E731
    pts = lambda k: pontos[k]["pontos_de_modificacao"]             # noqa: E731
    return {
        "metricas-identicas": (
            identicas_por_construtor("handlers", "imperativa") and identicas_por_construtor("monadas", "ioref"),
            "eval tem as mesmas métricas no mecanismo e na base, construtor a construtor"),
        "boiler-ocaml-maior": (B("handlers") > B("imperativa"),
                               "os handlers têm mais boilerplate que a base imperativa"),
        "boiler-haskell-menor": (B("monadas") < B("ioref"),
                                 "as mônadas têm menos boilerplate que a base IORef"),
        "reuso-so-handlers": (
            reuso("handlers") > 0 and all(reuso(k) == 0 for k in ("imperativa", "monadas", "ioref")),
            "só a versão com handlers registra reutilização"),
        "pontos-mecanismos-bases": (
            pts("handlers") > 0 and pts("monadas") > 0 and pts("imperativa") == 0 and pts("ioref") == 0,
            "só os mecanismos exigiram pontos de modificação para o quarto efeito"),
        "ocaml-acima-de-1": (all(R("ocaml", c, "tempo_ic_inf") > 1 for c in cens),
                             "nenhum IC de 95% da razão de tempo do OCaml inclui 1"),
        "haskell-ic-so-arith-exclui-1": (
            R("haskell", "arith", "tempo_ic_inf") > 1
            and all(R("haskell", c, "tempo_ic_inf") <= 1 <= R("haskell", c, "tempo_ic_sup")
                    for c in ("state", "exn", "output")),
            "no Haskell, só o IC de Arith exclui 1 (os outros três incluem)"),
        "haskell-perto-de-1": (all(0.7 <= R("haskell", c, "razao_tempo") <= 1.3 for c in cens),
                               "as razões de tempo do Haskell ficam perto de 1 (entre 0,7 e 1,3)"),
        "haskell-base-state-cara": (
            R("haskell", "state", "base_ns_por_expr") > 2 * R("ocaml", "state", "base_ns_por_expr"),
            "em State, a base do Haskell custa mais que o dobro da do OCaml"),
        "ocaml-delta-arith-menor": (min(cens, key=lambda c: dns("ocaml", c)) == "arith",
                                    "no OCaml, o menor excedente de tempo é o de Arith"),
        "haskell-maior-delta-arith": (max(cens, key=lambda c: dns("haskell", c)) == "arith",
                                      "no Haskell, o maior excedente de tempo é o de Arith"),
        "delta-bytes-proximos": (
            abs(dby("ocaml", "arith") - dby("haskell", "arith")) < 0.5 * max(dby("ocaml", "arith"), 1),
            "em Arith, os excedentes de alocação das duas linguagens são próximos"),
        "base-ocaml-aloca-pouco": (R("ocaml", "arith", "base_bytes_por_expr") < 24,
                                   "em Arith, a base do OCaml aloca só o resultado (menos de 3 palavras)"),
        # TCC I: sobrecusto < 1,5x nos handlers e > 2x nas mônadas
        "h4-ocaml-refutada": (min(R("ocaml", c, "razao_tempo") for c in cens) > 1.5,
                              "toda razão de tempo do OCaml fica acima de 1,5"),
        "h4-haskell-refutada": (max(R("haskell", c, "razao_tempo") for c in cens) < 2.0,
                                "toda razão de tempo do Haskell fica abaixo de 2"),
        "ocaml-abaixo-literatura": (max(R("ocaml", c, "razao_tempo") for c in cens) < 6.7,
                                    "as razões do OCaml ficam abaixo de 6,7 (Sivaramakrishnan et al.)"),
        "ocaml-instalacao-mesma-ordem-fonte": (
            23 <= dns("ocaml", "arith") <= 207,
            "o excedente de Arith no OCaml é da ordem dos 23 ns por fiber da fonte (três handlers)"),
        "haskell-limite-inferior-literatura": (
            max(R("haskell", c, "razao_tempo") for c in cens) < 1.15,
            "as razões do Haskell ficam no limite inferior da faixa 1,0 a 1,3 ou abaixo"),
        "sensibilidade-r2-ok": (sens.get("abaixo", 1) == 0,
                                "na corrida subdimensionada, nenhum R² ficou abaixo de 0,95"),
        "sensibilidade-desloca": (sens.get("dif_pct", 0) >= 10,
                                  "a corrida subdimensionada deslocou alguma razão em 10% ou mais"),
        "vies-regressao-alocacao": (vies >= 1.0,
                                    "a regressão do Bechamel subestima a alocação da base em 1% ou mais"),
    }


def conferir(texto, valores):
    """Confere cada marcador %% AFIRMACAO:id do texto; devolve as mensagens de problema."""
    marcadores = [(texto.count("\n", 0, mo.start()) + 1, mo.group(1))
                  for mo in re.finditer(r"%% AFIRMACAO:([\w-]+)", texto)]
    problemas = []
    for linha, i in marcadores:
        if i not in valores:
            problemas.append(f"  ? {i} (linha {linha}): marcada no texto, mas sem verificação definida")
        elif not valores[i][0]:
            problemas.append(f"  ✗ {i} (linha {linha}): a frase afirma que {valores[i][1]}, e isso "
                             "deixou de valer com estes resultados; reescreva a frase")
    for i in sorted({i for _, i in marcadores}):
        if i in valores and valores[i][0]:
            print(f"  ✓ {i}")
    return problemas


def vies_alocacao(campanha):
    """Maior subestimativa (%) da alocação do OCaml pela regressão do Bechamel,
    em relação à contagem direta; 0 se a campanha não tem alocacao-direta/."""
    direta = {}
    for arq in sorted((campanha / "alocacao-direta").glob("*.csv")):
        with open(arq, encoding="utf-8") as f:
            for l in csv.DictReader(f):
                direta[(l["cenario"], l["implementacao"], l["semente"])] = float(l["palavras_por_execucao"])
    maior = 0.0
    for arq in sorted((campanha / "brutos").glob("ocaml-*.csv")):
        with open(arq, encoding="utf-8") as f:
            for l in csv.DictReader(f):
                d = direta.get((l["cenario"], l["implementacao"], l["semente"]))
                if d:
                    maior = max(maior, (1 - float(l["alocacao"]) / d) * 100)
    return maior


# ---- sensibilidade (corrida subdimensionada) ------------------------------------------------

def ler_sensibilidade(campanha, resumo_final):
    pasta = campanha / "sensibilidade"
    if not (pasta / "brutos").exists():
        return None, None
    linhas = []
    for arq in sorted((pasta / "brutos").glob("*.csv")):
        with open(arq, encoding="utf-8") as f:
            linhas += list(csv.DictReader(f))
    if not linhas:
        return None, None
    abaixo = sum(1 for l in linhas if float(l["tempo_r2"]) < 0.95)
    amb = ler_ambiente(pasta) if (pasta / "ambiente.md").exists() else {}
    # Compara cada razão com a da MESMA semente na campanha principal, para
    # não confundir o efeito da configuração com a variação entre cargas.
    def razoes(lins):
        por = {}
        for l in lins:
            por.setdefault((l["linguagem"], l["cenario"], l["semente"]), {})[l["papel"]] = float(l["tempo_ns"])
        return {k: v["mecanismo"] / v["base"] for k, v in por.items() if {"mecanismo", "base"} <= set(v)}
    principais = []
    for arq in sorted((campanha / "brutos").glob("*.csv")):
        with open(arq, encoding="utf-8") as f:
            principais += list(csv.DictReader(f))
    r_sens, r_princ = razoes(linhas), razoes(principais)
    difs = [abs(r_sens[k] / r_princ[k] - 1) * 100 for k in r_sens if k in r_princ]
    dif = max(difs) if difs else 0.0
    dados = {"abaixo": abaixo, "total": len(linhas), "dif_pct": dif}
    m = {"SensRdoisAbaixo": str(abaixo), "SensMedicoes": str(len(linhas)),
         "SensCotaS": amb.get("quota", "?"),
         "SensLimite": pt(float(amb.get("limite", "0") or 0), 0),
         "SensDifRazaoMax": pt(dif, 0)}
    return m, dados


# ---- programa ---------------------------------------------------------------------------------

def substituir(texto, nome, conteudo):
    padrao = re.compile(rf"(%%%% <<GERADO:{re.escape(nome)}>>\n)(.*?)(\n?%%%% <</GERADO:{re.escape(nome)}>>)", re.S)
    if not padrao.search(texto):
        raise SystemExit(f"marcadores do bloco '{nome}' não encontrados no artigo")
    return padrao.sub(lambda mo: mo.group(1) + conteudo + "\n" + mo.group(3).lstrip("\n"), texto)


def main(argv):
    artigo = RAIZ.parent / "artigo.tex"
    campanha = None
    if "--artigo" in argv:
        artigo = Path(argv[argv.index("--artigo") + 1]).resolve()
    if "--campanha" in argv:
        campanha = Path(argv[argv.index("--campanha") + 1]).resolve()
    campanha = campanha or ultima_campanha()
    metricas = ler_json("metricas-codigo.json")
    pontos = ler_json("pontos-modificacao.json")
    resumo = ler_resumo(campanha)
    amb = ler_ambiente(campanha)
    faltam = [k for k in ("cpu", "ncpu", "so", "ocaml", "ghc", "bechamel", "criterion",
                          "sementes", "quota", "limite", "reamostras") if amb[k] in ("?", "")]
    if faltam:
        raise SystemExit(f"{(campanha / 'ambiente.md').relative_to(RAIZ)} não informa: {', '.join(faltam)}. "
                         "O parágrafo do ambiente sairia com lacunas; complete o arquivo (as chaves "
                         "esperadas estão em scripts/registrar-ambiente.sh) e rode de novo.")
    sens_macros, sens_dados = ler_sensibilidade(campanha, resumo)
    vies = vies_alocacao(campanha)
    m = macros(metricas, pontos, resumo, amb, sens_macros, vies)
    texto = artigo.read_text(encoding="utf-8")

    if "--verificar" not in argv:
        texto = substituir(texto, "numeros", bloco_macros(m))
        texto = substituir(texto, "tabela-metricas", bloco_tabela_metricas())
        texto = substituir(texto, "tabela-desempenho", bloco_tabela_desempenho())
        texto = substituir(texto, "ambiente", bloco_ambiente(amb))
        artigo.write_text(texto, encoding="utf-8")
        print(f"artigo atualizado com a campanha {campanha.name} ({len(m)} números)")
        if amb["executor"] != "autor":
            print(f"  atenção: campanha executada por '{amb['executor']}'; a declaração de IA "
                  "do artigo precisa dizê-lo")

    print("Afirmações qualitativas do texto:")
    problemas = conferir(texto, afirmacoes(metricas, pontos, resumo, sens_dados, vies))
    for p in problemas:
        print(p)
    if problemas:
        print("Os números do artigo foram atualizados, mas as frases acima não valem mais: "
              "reescreva-as em ../artigo.tex e rode `make artigo` de novo.")
    return 1 if problemas else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
