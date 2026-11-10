#!/usr/bin/env python3
"""Figuras da apresentação, geradas dos resultados (sem dependências externas).

Uso (a partir de codigo/):
    python3 scripts/figuras.py [--campanha resultados/campanha-...]

Lê a campanha mais recente (resumo.csv, brutos/, sensibilidade/) e as métricas
de código (metricas-codigo.json), e grava em resultados/figuras/:

    excedente-tempo.svg   Δ de tempo por expressão, por cenário e linguagem (QP4)
    alocacao-arith.svg    alocação em ARITH decomposta em base + Δ (QP4)
    boilerplate.svg       linhas de boilerplate fora de eval, por versão (QP3)
    sensibilidade.svg     razões da campanha x corrida subdimensionada (6.2)
    dados.md              os números de cada figura, em tabela

SVG puro, 16:9, para slides: PowerPoint e Keynote importam SVG; para Google
Slides ou Beamer, converta para PNG/PDF (por exemplo, abrindo no navegador ou
com rsvg-convert). Cores: paleta categórica validada para daltonismo (OCaml =
azul, Haskell = laranja); a base aparece sempre em cinza.
"""

import csv
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RESULTADOS = RAIZ / "resultados"
SAIDA = RESULTADOS / "figuras"

# Paleta (tema claro): slots categóricos 1 e 2, tinta e cromo da referência.
AZUL, LARANJA = "#2a78d6", "#eb6834"
AZUL_CLARO = "#86b6ef"          # passo 250 da rampa azul (2.º tom do haltere)
SUPERFICIE = "#fcfcfb"
TINTA, TINTA2, MUDA = "#0b0b0b", "#52514e", "#898781"
GRADE, EIXO, CINZA = "#e1e0d9", "#c3c2b7", "#c3c2b7"
FONTE = "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
LING_COR = {"ocaml": AZUL, "haskell": LARANJA}
LING_NOME = {"ocaml": "OCaml: handlers sobre imperativa", "haskell": "Haskell: mônadas sobre IORef"}
CENARIOS = ["arith", "state", "exn", "output"]
CEN_NOME = {"arith": "Arith", "state": "State", "exn": "Exn", "output": "Output"}


def pt(x, casas=0):
    s = f"{abs(x):,.{casas}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return ("−" if round(x, casas) < 0 and set(s) - set("0,.") else "") + s


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---- primitivas SVG --------------------------------------------------------------

class Svg:
    def __init__(self, w, h, titulo, descricao):
        self.w, self.h = w, h
        self.partes = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-labelledby="t d" font-family="{FONTE}">',
            f"<title id=\"t\">{esc(titulo)}</title><desc id=\"d\">{esc(descricao)}</desc>",
            f'<rect width="{w}" height="{h}" fill="{SUPERFICIE}"/>',
        ]

    def texto(self, x, y, t, tam=22, cor=TINTA, peso=400, ancora="start", base="middle"):
        self.partes.append(
            f'<text x="{x:.1f}" y="{y:.1f}" font-size="{tam}" fill="{cor}" font-weight="{peso}" '
            f'text-anchor="{ancora}" dominant-baseline="{base}">{esc(t)}</text>')

    def linha(self, x1, y1, x2, y2, cor=GRADE, larg=1):
        self.partes.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                           f'stroke="{cor}" stroke-width="{larg}" shape-rendering="crispEdges"/>')

    def barra(self, x0, x1, y, h, cor, r=4):
        """Barra horizontal da linha de base x0 até x1: ponta de dados com cantos de
        4 px, extremidade da linha de base reta (especificação das marcas)."""
        if abs(x1 - x0) < 0.5:
            return
        r = min(r, abs(x1 - x0), h / 2)
        if x1 > x0:
            d = (f"M{x0:.1f},{y:.1f} H{x1 - r:.1f} Q{x1:.1f},{y:.1f} {x1:.1f},{y + r:.1f} "
                 f"V{y + h - r:.1f} Q{x1:.1f},{y + h:.1f} {x1 - r:.1f},{y + h:.1f} H{x0:.1f} Z")
        else:
            d = (f"M{x0:.1f},{y:.1f} H{x1 + r:.1f} Q{x1:.1f},{y:.1f} {x1:.1f},{y + r:.1f} "
                 f"V{y + h - r:.1f} Q{x1:.1f},{y + h:.1f} {x1 + r:.1f},{y + h:.1f} H{x0:.1f} Z")
        self.partes.append(f'<path d="{d}" fill="{cor}"/>')

    def ret(self, x0, x1, y, h, cor):
        self.partes.append(f'<rect x="{min(x0, x1):.1f}" y="{y:.1f}" width="{abs(x1 - x0):.1f}" '
                           f'height="{h:.1f}" fill="{cor}"/>')

    def ponto(self, x, y, cor, r=7):
        # anel de 2 px na cor da superfície, para legibilidade sobre a linha
        self.partes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r + 2}" fill="{SUPERFICIE}"/>')
        self.partes.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{cor}"/>')

    def legenda(self, x, y, itens, tam=20):
        for cor, nome in itens:
            self.partes.append(f'<rect x="{x:.1f}" y="{y - 8:.1f}" width="16" height="16" rx="3" fill="{cor}"/>')
            self.texto(x + 24, y, nome, tam, TINTA2)
            x += 24 + len(nome) * tam * 0.52 + 36

    def gravar(self, caminho):
        caminho.write_text("\n".join(self.partes + ["</svg>"]) + "\n", encoding="utf-8")


def passos(vmin, vmax, n=5):
    """Marcas redondas do eixo cobrindo [vmin, vmax]."""
    bruto = (vmax - vmin) / n
    mag = 10 ** len(str(int(bruto))) / 10 if bruto >= 1 else 0.1
    for m in (1, 2, 2.5, 5, 10):
        if bruto <= m * mag:
            passo = m * mag
            break
    ini = (vmin // passo) * passo
    marcas, v = [], ini
    while v <= vmax + 1e-9:
        marcas.append(round(v, 6))
        v += passo
    if marcas[-1] < vmax:
        marcas.append(round(marcas[-1] + passo, 6))
    return marcas


# ---- leitura -------------------------------------------------------------------------

def ultima_campanha():
    dirs = sorted(d for d in RESULTADOS.glob("campanha-*") if (d / "resumo.csv").exists())
    if not dirs:
        raise SystemExit("nenhuma campanha com resumo.csv em resultados/: rode make campanha")
    return dirs[-1]


def ler_resumo(pasta):
    with open(pasta / "resumo.csv", encoding="utf-8") as f:
        return {(l["linguagem"], l["cenario"]): {k: (float(v) if k not in ("linguagem", "cenario") else v)
                                                  for k, v in l.items()} for l in csv.DictReader(f)}


def ler_brutos(pasta):
    linhas = []
    for arq in sorted((pasta / "brutos").glob("*.csv")):
        with open(arq, encoding="utf-8") as f:
            linhas += list(csv.DictReader(f))
    return linhas


def razoes(linhas):
    por = {}
    for l in linhas:
        por.setdefault((l["linguagem"], l["cenario"], l["semente"]), {})[l["papel"]] = l
    out = {}
    for k, v in por.items():
        if {"mecanismo", "base"} <= set(v):
            out[k] = (float(v["mecanismo"]["tempo_ns"]) / float(v["base"]["tempo_ns"]),
                      min(float(v["mecanismo"]["tempo_r2"]), float(v["base"]["tempo_r2"])))
    return out


# ---- figuras ---------------------------------------------------------------------------

def fig_excedente(resumo, dados):
    W, H = 1600, 900
    s = Svg(W, H, "Excedente de tempo do mecanismo sobre a base",
            "Barras horizontais agrupadas: nanossegundos a mais por expressão avaliada, por cenário, "
            "OCaml (handlers sobre imperativa) e Haskell (mônadas sobre IORef).")
    s.texto(80, 70, "Quanto o mecanismo custa a mais, por expressão avaliada", 40, TINTA, 600, base="auto")
    s.texto(80, 116, "Excedente Δ de tempo sobre a base da mesma linguagem, em ns (mediana das sementes)",
            24, TINTA2, base="auto")
    s.legenda(80, 170, [(AZUL, LING_NOME["ocaml"]), (LARANJA, LING_NOME["haskell"])])
    delta = {(l, c): resumo[(l, c)]["mec_ns_por_expr"] - resumo[(l, c)]["base_ns_por_expr"]
             for l in LING_COR for c in CENARIOS}
    vmin, vmax = min(0, min(delta.values())), max(delta.values())
    marcas = passos(0, vmax)                      # marcas só do zero para cima
    dom0 = vmin - 0.12 * marcas[-1] if vmin < 0 else 0   # folga para o rótulo negativo
    x0p, x1p = 300, W - 170
    esc_x = lambda v: x0p + (v - dom0) / (marcas[-1] - dom0) * (x1p - x0p)  # noqa: E731
    topo, banda, hb = 230, 150, 24
    for m in marcas:
        s.linha(esc_x(m), topo - 10, esc_x(m), topo + banda * 4 - 20, EIXO if m == 0 else GRADE)
        s.texto(esc_x(m), topo + banda * 4 + 6, pt(m), 20, MUDA, ancora="middle")
    for i, c in enumerate(CENARIOS):
        yc = topo + i * banda + banda / 2 - 30
        s.texto(x0p - 30, yc, CEN_NOME[c], 28, TINTA, 600, ancora="end")
        for j, l in enumerate(("ocaml", "haskell")):
            y = yc - hb - 1 + j * (hb + 2)            # vão de 2 px entre as barras do grupo
            v = delta[(l, c)]
            s.barra(esc_x(0), esc_x(v), y, hb, LING_COR[l])
            ancora = "start" if v >= 0 else "end"
            s.texto(esc_x(v) + (10 if v >= 0 else -10), y + hb / 2, f"{pt(v)} ns", 22, TINTA2, ancora=ancora)
            dados.append(("excedente-tempo", f"{l}/{c}", f"{v:.1f} ns"))
    yc = topo + banda / 2 - 30                    # rótulo de ARITH: só instalação no OCaml
    s.texto(x0p - 30, yc + 34, "sem operação de efeito:", 18, MUDA, ancora="end")
    s.texto(x0p - 30, yc + 56, "no OCaml, só instalação", 18, MUDA, ancora="end")
    s.gravar(SAIDA / "excedente-tempo.svg")


def fig_alocacao(resumo, dados):
    W, H = 1600, 900
    s = Svg(W, H, "Alocação em Arith: base e excedente",
            "Barras empilhadas horizontais: bytes alocados por expressão em Arith, base em cinza e "
            "excedente do mecanismo na cor da linguagem, com a razão ao lado.")
    s.texto(80, 70, "A razão de alocação mede sobretudo a base", 40, TINTA, 600, base="auto")
    s.texto(80, 116, "Bytes alocados por expressão em Arith: base + excedente Δ do mecanismo",
            24, TINTA2, base="auto")
    s.legenda(80, 170, [(CINZA, "base (imperativa / IORef)"), (AZUL, "Δ handlers (OCaml)"),
                        (LARANJA, "Δ mônadas (Haskell)")])
    vals = {l: (resumo[(l, "arith")]["base_bytes_por_expr"],
                resumo[(l, "arith")]["mec_bytes_por_expr"] - resumo[(l, "arith")]["base_bytes_por_expr"],
                resumo[(l, "arith")]["razao_alocacao"]) for l in LING_COR}
    vmax = max(b + d for b, d, _ in vals.values())
    marcas = passos(0, vmax)
    x0p, x1p = 300, W - 330
    esc_x = lambda v: x0p + v / marcas[-1] * (x1p - x0p)  # noqa: E731
    topo = 300
    for m in marcas:
        s.linha(esc_x(m), topo - 30, esc_x(m), topo + 380, EIXO if m == 0 else GRADE)
        s.texto(esc_x(m), topo + 410, pt(m), 20, MUDA, ancora="middle")
    s.texto((x0p + x1p) / 2, topo + 450, "bytes por expressão", 20, MUDA, ancora="middle")
    for i, l in enumerate(("ocaml", "haskell")):
        b, d, r = vals[l]
        y, hb = topo + i * 190 + 40, 24
        s.texto(x0p - 30, y + hb / 2, "OCaml" if l == "ocaml" else "Haskell", 28, TINTA, 600, ancora="end")
        # base: reta nas duas pontas (segmento interno); Δ: ponta de dados arredondada
        s.ret(esc_x(0), esc_x(b), y, hb, CINZA)
        s.barra(esc_x(b) + 2, esc_x(b + d), y, hb, LING_COR[l])     # vão de 2 px entre segmentos
        s.texto(esc_x(b + d) + 14, y + hb / 2, f"razão {pt(r, 1)}×", 26, TINTA, 600)
        s.texto(esc_x(0), y + hb + 30, f"base {pt(b)} B", 20, TINTA2)
        s.texto(esc_x(b + d), y + hb + 30, f"Δ {pt(d)} B", 20, TINTA2, ancora="end")
        dados.append(("alocacao-arith", l, f"base {b:.1f} B, Δ {d:.1f} B, razão {r:.2f}"))
    s.gravar(SAIDA / "alocacao-arith.svg")


def fig_boilerplate(metricas, pontos, dados):
    W, H = 1600, 900
    s = Svg(W, H, "Boilerplate fora de eval, por versão",
            "Barras horizontais: linhas de boilerplate fora de eval em cada versão; mecanismo na cor da "
            "linguagem, base em cinza.")
    s.texto(80, 70, "O custo de escrita está fora do avaliador", 40, TINTA, 600, base="auto")
    s.texto(80, 116, "Linhas de boilerplate fora de eval (regra mecânica); eval é idêntico dentro de "
            "cada linguagem", 24, TINTA2, base="auto")
    s.legenda(80, 170, [(AZUL, "handlers (OCaml)"), (LARANJA, "mônadas (Haskell)"), (CINZA, "base")])
    linhas = [("handlers", "Handlers", AZUL), ("imperativa", "Imperativa", CINZA),
              ("monadas", "Mônadas", LARANJA), ("ioref", "IORef", CINZA)]
    vmax = max(metricas[k]["boilerplate_regra"]["B"] for k, _, _ in linhas)
    marcas = passos(0, vmax)
    x0p, x1p = 330, W - 200
    esc_x = lambda v: x0p + v / marcas[-1] * (x1p - x0p)  # noqa: E731
    topo = 250
    ys = [topo + 40, topo + 110, topo + 260, topo + 330]
    for m in marcas:
        s.linha(esc_x(m), topo, esc_x(m), topo + 400, EIXO if m == 0 else GRADE)
        s.texto(esc_x(m), topo + 430, pt(m), 20, MUDA, ancora="middle")
    s.texto(x0p - 30, topo + 10, "OCaml", 22, MUDA, 600, ancora="end")
    s.texto(x0p - 30, topo + 230, "Haskell", 22, MUDA, 600, ancora="end")
    for (k, nome, cor), y in zip(linhas, ys):
        v = metricas[k]["boilerplate_regra"]["B"]
        s.texto(x0p - 30, y + 12, nome, 26, TINTA, 600, ancora="end")
        s.barra(esc_x(0), esc_x(v), y, 24, cor)
        s.texto(esc_x(v) + 12, y + 12, f"{v} linhas", 22, TINTA2)
        dados.append(("boilerplate", k, f"{v} linhas B de {metricas[k]['loc_fora_de_eval']} fora de eval"))
    if pontos:
        txt = " · ".join(f"{nome} {pontos[k]['pontos_de_modificacao']}" for k, nome, _ in linhas)
        s.texto(80, H - 110, "Pontos de modificação para inserir o quarto efeito (QP2):", 24, TINTA, 600)
        s.texto(80, H - 70, txt, 24, TINTA2)
    s.gravar(SAIDA / "boilerplate.svg")


def fig_sensibilidade(campanha, dados):
    pasta = campanha / "sensibilidade"
    if not (pasta / "brutos").exists():
        print("  (sem corrida de sensibilidade; sensibilidade.svg não gerada: rode make sensibilidade)")
        return
    r_sens, r_princ = razoes(ler_brutos(pasta)), razoes(ler_brutos(campanha))
    pares = [(k, r_princ[k][0], r_sens[k][0], r_sens[k][1]) for k in sorted(r_sens) if k in r_princ]
    ordem = {("ocaml", c): i for i, c in enumerate(CENARIOS)}
    ordem.update({("haskell", c): 4 + i for i, c in enumerate(CENARIOS)})
    pares.sort(key=lambda p: ordem[(p[0][0], p[0][1])])
    W, H = 1600, 900
    s = Svg(W, H, "Sensibilidade à configuração de amostragem",
            "Haltere por cenário: razão de tempo na campanha e na corrida subdimensionada, mesma semente.")
    s.texto(80, 70, "R² aceitável não garante a estimativa", 40, TINTA, 600, base="auto")
    s.texto(80, 116, "Razão de tempo, mesma semente: campanha completa × corrida subdimensionada "
            "(todos os R² ≥ 0,95)", 24, TINTA2, base="auto")
    s.legenda(80, 170, [(AZUL, "campanha (cota 20 s)"), (AZUL_CLARO, "subdimensionada (cota 5 s)")])
    vmax = max(max(p[1], p[2]) for p in pares)
    marcas = passos(0.5, vmax)
    x0p, x1p = 330, W - 220
    esc_x = lambda v: x0p + (v - marcas[0]) / (marcas[-1] - marcas[0]) * (x1p - x0p)  # noqa: E731
    topo, passo_y = 240, 66
    for m in marcas:
        s.linha(esc_x(m), topo - 20, esc_x(m), topo + passo_y * len(pares), GRADE)
        s.texto(esc_x(m), topo + passo_y * len(pares) + 26, pt(m, 1), 20, MUDA, ancora="middle")
    if marcas[0] <= 1 <= marcas[-1]:
        s.linha(esc_x(1), topo - 20, esc_x(1), topo + passo_y * len(pares), EIXO, 2)
    for i, ((ling, cen, sem), rp, rs, r2) in enumerate(pares):
        y = topo + i * passo_y + passo_y / 2 - 10
        s.texto(x0p - 30, y, f"{'OCaml' if ling == 'ocaml' else 'Haskell'} · {CEN_NOME[cen]}", 22,
                TINTA, 600, ancora="end")
        s.linha(esc_x(rp), y, esc_x(rs), y, EIXO, 2)
        s.ponto(esc_x(rp), y, AZUL)
        s.ponto(esc_x(rs), y, AZUL_CLARO)
        dif = (rs / rp - 1) * 100
        s.texto(x1p + 40, y, f"{'+' if dif >= 0 else '−'}{pt(abs(dif))}%", 22, TINTA2)
        dados.append(("sensibilidade", f"{ling}/{cen}/{sem}",
                      f"campanha {rp:.3f}, subdimensionada {rs:.3f} ({dif:+.1f}%), R² mín {r2:.3f}"))
    s.texto(x1p + 40, topo - 34, "desvio", 18, MUDA)
    s.gravar(SAIDA / "sensibilidade.svg")


def main(argv):
    campanha = Path(argv[argv.index("--campanha") + 1]).resolve() if "--campanha" in argv else ultima_campanha()
    SAIDA.mkdir(parents=True, exist_ok=True)
    resumo = ler_resumo(campanha)
    metricas = json.loads((RESULTADOS / "metricas-codigo.json").read_text(encoding="utf-8"))
    dados = []
    fig_excedente(resumo, dados)
    fig_alocacao(resumo, dados)
    arq_pontos = RESULTADOS / "pontos-modificacao.json"
    pontos = json.loads(arq_pontos.read_text(encoding="utf-8")) if arq_pontos.exists() else None
    fig_boilerplate(metricas, pontos, dados)
    fig_sensibilidade(campanha, dados)
    md = [f"# Dados das figuras ({campanha.name})", "",
          "Visão em tabela de cada figura (acessibilidade e conferência).", "",
          "| Figura | Série | Valor |", "|---|---|---|"]
    md += [f"| {f} | {k} | {v} |" for f, k, v in dados]
    (SAIDA / "dados.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"figuras gravadas em {SAIDA.relative_to(RAIZ)} (campanha {campanha.name})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
