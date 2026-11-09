#!/usr/bin/env python3
"""Gerador de cargas de referência (terceira réplica, neutra).

Especificação que OCaml e Haskell reproduzem exatamente:

  LCG     x_{n+1} = (1103515245 * x_n + 12345) mod 2^30,  x_0 = semente
  pick(n) = (proximo() >> 15) mod n     -- bits altos (Seção 5 do artigo)
  lit()   = pick(101)                   -- literal em [0, 100]
  divisor = 1 + pick(9)                 -- divisor em [1, 9]

  arith(0) = Num lit()
  arith(d) = seja op = pick(3) em
             0 -> Add(arith(d-1), arith(d-1))   (esquerda gerada antes)
             1 -> Mul(arith(d-1), arith(d-1))
             2 -> Div(arith(d-1), Num divisor)

  ARITH   10.000 x arith(3)
  STATE   prefixo Let v0 n0 (Let v1 n1 (... (Let v499 n499 (Num 0)))),
          com n_i = lit() na ordem i = 0..499; depois 10.000 expressões
          op(Var v_a, Var v_b), op = [Add, Mul][pick(2)], a = pick(500),
          b = pick(500), sorteados nessa ordem. Carga = prefixo + 10.000.
  EXN     para i = 0..9999: se i mod 5 = 4, Div(arith(2), Num 0);
          senão arith(3). Exatamente 20% terminam em divisão por zero.
  OUTPUT  10.000 x op(Print(Num a), Print(Num b)),
          op = [Add, Mul][pick(2)], a = lit(), b = lit(), nessa ordem.

Serialização canônica (para o hash): "(Num 5)", "(Num -5)", "(Var v3)",
"(Add A B)", "(Mul A B)", "(Div A B)", "(Let x E B)", "(Seq A B)",
"(Print E)"; uma expressão por linha, cada linha terminada por "\\n".
Hash: FNV-1a de 64 bits sobre os bytes UTF-8, em hexadecimal minúsculo.

Uso:
    python3 gerador.py conformidade   # imprime a seção "geracao" em JSON
    python3 gerador.py hash arith 42  # imprime o hash de uma carga
"""

import json
import sys

MASCARA_30 = (1 << 30) - 1
SEMENTES = [42, 43, 44]
CENARIOS = ["arith", "state", "exn", "output"]
N_EXPR = 10_000
N_VARS = 500

FNV_OFFSET = 0xCBF29CE484222325
FNV_PRIMO = 0x100000001B3
MASCARA_64 = (1 << 64) - 1


class Lcg:
    def __init__(self, semente):
        self.x = semente

    def proximo(self):
        self.x = (1103515245 * self.x + 12345) & MASCARA_30
        return self.x

    def pick(self, n):
        return (self.proximo() >> 15) % n

    def lit(self):
        return self.pick(101)

    def divisor(self):
        return 1 + self.pick(9)


def arith(g, d):
    if d == 0:
        return ["Num", g.lit()]
    op = g.pick(3)
    if op == 2:
        esquerda = arith(g, d - 1)
        return ["Div", esquerda, ["Num", g.divisor()]]
    esquerda = arith(g, d - 1)
    direita = arith(g, d - 1)
    return ["Add" if op == 0 else "Mul", esquerda, direita]


def carga(cenario, semente):
    g = Lcg(semente)
    if cenario == "arith":
        return [arith(g, 3) for _ in range(N_EXPR)]
    if cenario == "state":
        valores = [g.lit() for _ in range(N_VARS)]
        prefixo = ["Num", 0]
        for i in reversed(range(N_VARS)):
            prefixo = ["Let", f"v{i}", ["Num", valores[i]], prefixo]
        exprs = []
        for _ in range(N_EXPR):
            op = "Add" if g.pick(2) == 0 else "Mul"
            a = g.pick(N_VARS)
            b = g.pick(N_VARS)
            exprs.append([op, ["Var", f"v{a}"], ["Var", f"v{b}"]])
        return [prefixo] + exprs
    if cenario == "exn":
        out = []
        for i in range(N_EXPR):
            if i % 5 == 4:
                out.append(["Div", arith(g, 2), ["Num", 0]])
            else:
                out.append(arith(g, 3))
        return out
    if cenario == "output":
        out = []
        for _ in range(N_EXPR):
            op = "Add" if g.pick(2) == 0 else "Mul"
            a = g.lit()
            b = g.lit()
            out.append([op, ["Print", ["Num", a]], ["Print", ["Num", b]]])
        return out
    raise ValueError(cenario)


def sexp(e):
    tag = e[0]
    if tag == "Num":
        return f"(Num {e[1]})"
    if tag == "Var":
        return f"(Var {e[1]})"
    if tag == "Let":
        return f"(Let {e[1]} {sexp(e[2])} {sexp(e[3])})"
    if tag == "Print":
        return f"(Print {sexp(e[1])})"
    return f"({tag} {sexp(e[1])} {sexp(e[2])})"


def fnv1a64(dados: bytes):
    h = FNV_OFFSET
    for byte in dados:
        h ^= byte
        h = (h * FNV_PRIMO) & MASCARA_64
    return f"{h:016x}"


def hash_carga(cenario, semente):
    texto = "".join(sexp(e) + "\n" for e in carga(cenario, semente))
    return fnv1a64(texto.encode("utf-8"))


def secao_conformidade():
    g = Lcg(42)
    amostra_lcg = [g.proximo() for _ in range(20)]
    primeiras = [sexp(e) for e in carga("arith", 42)[:5]]
    hashes = {c: {str(s): hash_carga(c, s) for s in SEMENTES} for c in CENARIOS}
    return {
        "lcg": {"semente": 42, "primeiros_valores": amostra_lcg},
        "arith_primeiras_expressoes": {"semente": 42, "expressoes": primeiras},
        "hashes_cargas": hashes,
    }


def main(argv):
    if len(argv) == 2 and argv[1] == "conformidade":
        print(json.dumps(secao_conformidade(), indent=2, ensure_ascii=False))
        return 0
    if len(argv) == 4 and argv[1] == "hash":
        print(hash_carga(argv[2], int(argv[3])))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
