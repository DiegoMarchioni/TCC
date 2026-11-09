#!/usr/bin/env python3
"""Semântica operacional small-step da linguagem do caso de uso, executável.

Implementa, regra por regra, a semântica especificada em docs/semantica.md:
contextos de avaliação com ordem fixada à esquerda, regras de redução (Var,
Var-err, Add, Mul, Div, Div-zero, Let, Seq, Print), congruência (Cong) e
propagação de erro (Err-prop). Não é otimizada: existe para ser lida contra a
especificação e servir de referência independente das quatro implementações.

Uso:
    python3 semantica.py verificar [caminho/conformance.json]
        Reduz cada caso do oráculo até a forma normal e confere o resultado
        com o esperado registrado no arquivo. Sai com código 1 se divergir.

    python3 semantica.py avaliar '["Add", ["Num", 1], ["Print", ["Num", 2]]]'
        Reduz uma expressão (em JSON) a partir do estado vazio e mostra o
        resultado, o estado final, o traço e o número de passos.

Representação: expressões são listas JSON, ["Num", n], ["Var", "x"],
["Add", e1, e2], ["Mul", e1, e2], ["Div", e1, e2], ["Let", "x", e, b],
["Seq", e1, e2], ["Print", e].
"""

import json
import sys
from pathlib import Path

# Faixa comum às duas linguagens: o inteiro de 63 bits do OCaml (Seção 4.1).
MIN_INT63 = -(2 ** 62)
MAX_INT63 = 2 ** 62 - 1

# Mensagens canônicas: lidas do arquivo de conformidade em verificar().
MENSAGENS = {
    "variavel_nao_vinculada": "variavel nao vinculada: {x}",
    "divisao_por_zero": "divisao por zero",
}


class ForaDeE64(Exception):
    """A redução produziu valor fora da faixa comum às duas linguagens."""


def eh_valor(e):
    return e[0] == "Num"


def num(n):
    if not (MIN_INT63 <= n <= MAX_INT63):
        raise ForaDeE64(f"valor {n} fora de E64")
    return ["Num", n]


def div_trunc(a, b):
    """Divisão inteira com truncamento em direção a zero (operador ÷)."""
    q = abs(a) // abs(b)
    return -q if (a < 0) != (b < 0) else q


def msg_nao_vinculada(x):
    return MENSAGENS["variavel_nao_vinculada"].replace("{x}", x)


def passo(e, sigma, omega):
    """Um passo de ⇒ a partir de ⟨e, σ, ω⟩.

    Devolve ("ok", e', σ', ω') ou ("erro", m, σ', ω'). Pressupõe que e não é
    valor (configurações de valor e de erro são terminais).
    """
    tag = e[0]

    # --- Regras de redução (o redex está na raiz) e contextos -------------
    if tag == "Var":
        x = e[1]
        if x in sigma:                                   # (Var)
            return ("ok", num(sigma[x]), sigma, omega)
        return ("erro", msg_nao_vinculada(x), sigma, omega)  # (Var-err)

    if tag in ("Add", "Mul", "Div"):
        e1, e2 = e[1], e[2]
        if not eh_valor(e1):                             # contexto Op E e
            return congruencia(passo(e1, sigma, omega), lambda h: [tag, h, e2])
        if not eh_valor(e2):                             # contexto Op v E
            return congruencia(passo(e2, sigma, omega), lambda h: [tag, e1, h])
        n1, n2 = e1[1], e2[1]
        if tag == "Add":                                 # (Add)
            return ("ok", num(n1 + n2), sigma, omega)
        if tag == "Mul":                                 # (Mul)
            return ("ok", num(n1 * n2), sigma, omega)
        if n2 == 0:                                      # (Div-zero)
            return ("erro", MENSAGENS["divisao_por_zero"], sigma, omega)
        return ("ok", num(div_trunc(n1, n2)), sigma, omega)  # (Div)

    if tag == "Let":
        x, ex, b = e[1], e[2], e[3]
        if not eh_valor(ex):                             # contexto Let x E b
            return congruencia(passo(ex, sigma, omega), lambda h: ["Let", x, h, b])
        novo = dict(sigma)                               # (Let)
        novo[x] = ex[1]
        return ("ok", b, novo, omega)

    if tag == "Seq":
        e1, e2 = e[1], e[2]
        if not eh_valor(e1):                             # contexto Seq E e
            return congruencia(passo(e1, sigma, omega), lambda h: ["Seq", h, e2])
        return ("ok", e2, sigma, omega)                  # (Seq)

    if tag == "Print":
        ex = e[1]
        if not eh_valor(ex):                             # contexto Print E
            return congruencia(passo(ex, sigma, omega), lambda h: ["Print", h])
        return ("ok", ex, sigma, omega + [ex[1]])        # (Print)

    raise ValueError(f"construtor desconhecido: {tag}")


def congruencia(resultado, contexto):
    """(Cong) reconstrói E[e']; (Err-prop) propaga a configuração de erro."""
    if resultado[0] == "erro":
        return resultado
    _, e_novo, sigma, omega = resultado
    return ("ok", contexto(e_novo), sigma, omega)


def reduzir(e, sigma=None):
    """⇒* até configuração terminal. Devolve (resultado, σ', ω, passos)."""
    sigma = dict(sigma or {})
    omega = []
    passos = 0
    while not eh_valor(e):
        r = passo(e, sigma, omega)
        passos += 1
        if r[0] == "erro":
            return ({"erro": r[1]}, r[2], r[3], passos)
        _, e, sigma, omega = r
    return ({"ok": e[1]}, sigma, omega, passos)


def ambiente_ordenado(sigma):
    return [[k, sigma[k]] for k in sorted(sigma)]


def localizar_conformidade():
    aqui = Path(__file__).resolve().parent
    return aqui.parent / "shared" / "conformance.json"


def verificar(caminho):
    dados = json.loads(Path(caminho).read_text(encoding="utf-8"))
    MENSAGENS.update(dados["mensagens"])
    falhas = 0
    for caso in dados["casos"]:
        sigma0 = {k: v for k, v in caso["env_inicial"]}
        res, sigma, omega, passos = reduzir(caso["expr"], sigma0)
        obtido = {"resultado": res, "env": ambiente_ordenado(sigma), "saida": omega}
        esperado = caso["esperado"]
        if obtido != esperado:
            falhas += 1
            print(f"DIVERGE  {caso['nome']}\n  esperado: {esperado}\n  obtido:   {obtido}")
        else:
            print(f"ok       {caso['nome']}  ({passos} passos)")
    total = len(dados["casos"])
    print(f"\n{total - falhas}/{total} casos conferem com a semântica small-step.")
    return falhas == 0


def main(argv):
    if len(argv) >= 2 and argv[1] == "verificar":
        caminho = argv[2] if len(argv) > 2 else localizar_conformidade()
        return 0 if verificar(caminho) else 1
    if len(argv) == 3 and argv[1] == "avaliar":
        res, sigma, omega, passos = reduzir(json.loads(argv[2]))
        print(json.dumps({"resultado": res, "env": ambiente_ordenado(sigma),
                          "saida": omega, "passos": passos}, ensure_ascii=False))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
