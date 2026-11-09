#!/usr/bin/env python3
"""Testes de mutação das decisões travadas pela suíte de oráculo.

O artigo afirma (Seção 5.3) que quatro grupos de casos "travam decisões de
projeto": cada um falha se a decisão for revertida. Este script verifica a
afirmação: para cada decisão, aplica a reversão (o "mutante") numa cópia do
código, roda a suíte da linguagem e confere que o caso que a trava falhou.

Uso (a partir de codigo/, com o ambiente do opam ativo):
    python3 scripts/mutantes.py

Sai com código 0 se todos os mutantes forem detectados.
"""

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

MUTANTES = [
    # (linguagem, arquivo, trecho original, trecho mutante, caso que deve falhar, decisão)
    ("ocaml", "ocaml/effects/interp_effects.ml",
     "if y = 0 then perform (Fail msg_div_zero) else x / y",
     "if y = 0 then perform (Fail msg_div_zero)\n      else if (x < 0) <> (y < 0) && x mod y <> 0 then (x / y) - 1\n      else x / y",
     "[efeitos] divisao truncada, numerador negativo",
     "divisão truncada em direção a zero (quot), e não arredondada para baixo (div)"),
    ("ocaml", "ocaml/effects/interp_effects.ml",
     "      let x = eval a in\n      let y = eval b in\n      x + y",
     "      let y = eval b in\n      let x = eval a in\n      x + y",
     "[efeitos] ordem de avaliacao",
     "ordem de avaliação fixada à esquerda"),
    ("ocaml", "ocaml/effects/interp_effects.ml",
     "      perform (Set (x, v));\n      eval b",
     "      let antigo = perform (Get x) in\n      perform (Set (x, v));\n      let r = eval b in\n"
     "      (match antigo with Some a -> perform (Set (x, a)) | None -> ());\n      r",
     "[efeitos] let revincula",
     "ambiente global, sem restauração de escopo (restaura o vínculo anterior)"),
    ("ocaml", "ocaml/imperative/interp_imp.ml",
     "      Hashtbl.replace env x v;\n      eval env b",
     "      let antigo = Hashtbl.find_opt env x in\n      Hashtbl.replace env x v;\n"
     "      let r = eval env b in\n"
     "      (match antigo with\n       | Some a -> Hashtbl.replace env x a\n       | None -> Hashtbl.remove env x);\n      r",
     "[imperativa] let persiste apos o corpo",
     "ambiente global, sem restauração de escopo (remove o vínculo novo)"),
    ("ocaml", "ocaml/imperative/interp_imp.ml",
     "      let x = eval env a in\n      let y = eval env b in\n      x + y",
     "      let y = eval env b in\n      let x = eval env a in\n      x + y",
     "[imperativa] ordem de avaliacao",
     "ordem de avaliação fixada à esquerda (linha de base)"),
    ("haskell", "haskell/src/Interp/Monadic.hs",
     "return $! x `quot` y",
     "return $! x `div` y",
     "[monadica] divisao truncada, numerador negativo",
     "quot, e não div"),
    ("haskell", "haskell/src/Interp/Monadic.hs",
     "type Interp a = ExceptT String (StateT Env IO) a",
     "type Interp a = StateT Env (ExceptT String IO) a",
     "[monadica] estado e saida sobrevivem ao erro",
     "ordem das camadas: ExceptT externo, para o estado sobreviver ao erro"),
    ("haskell", "haskell/src/Interp/Monadic.hs",
     "  v <- eval e\n  modify' (Map.insert x v)\n  eval b",
     "  v <- eval e\n  antigo <- get\n  modify' (Map.insert x v)\n  r <- eval b\n  modify' (const antigo)\n  return r",
     "[monadica] let persiste apos o corpo",
     "ambiente global, sem restauração de escopo"),
]

# A pilha invertida exige adaptar o executor para compilar (o estado do erro é
# perdido, que é justamente o que o caso deve detectar).
EXECUTOR_INVERTIDO = (
    "run env e = runStateT (runExceptT (eval e)) env",
    "run env e = do\n  r <- runExceptT (runStateT (eval e) env)\n"
    "  return (case r of\n    Left m -> (Left m, env)\n    Right (v, env') -> (Right v, env'))",
)


def copiar():
    destino = Path(tempfile.mkdtemp(prefix="mutante-"))
    shutil.copytree(RAIZ, destino / "c", ignore=shutil.ignore_patterns(
        "_build", "dist-newstyle", "resultados", "__pycache__", ".git"))
    return destino / "c"


def rodar_suite(linguagem, raiz):
    if linguagem == "ocaml":
        cmd, cwd = ["dune", "test", "--force"], raiz / "ocaml"
    else:
        cmd, cwd = ["cabal", "test", "-v0", "oraculo", "--test-show-details=direct"], raiz / "haskell"
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def main():
    detectados = 0
    for ling, arq, orig, mut, caso, decisao in MUTANTES:
        raiz = copiar()
        try:
            caminho = raiz / arq
            texto = caminho.read_text(encoding="utf-8")
            if orig not in texto:
                print(f"ERRO  trecho original não encontrado em {arq}: {orig[:50]!r}")
                return 1
            texto = texto.replace(orig, mut, 1)
            if "StateT Env (ExceptT" in mut:
                texto = texto.replace(*EXECUTOR_INVERTIDO)
            caminho.write_text(texto, encoding="utf-8")
            codigo, saida = rodar_suite(ling, raiz)
            falhou = f"FALHA  {caso}" in saida
            if codigo != 0 and falhou:
                detectados += 1
                print(f"detectado  {decisao}\n           -> falhou: {caso}")
            else:
                print(f"SOBREVIVEU {decisao}\n           (código {codigo}; caso {caso!r} "
                      f"{'falhou' if falhou else 'não falhou'})")
                if "rror" in saida and not falhou:
                    print(saida[-1500:])
        finally:
            shutil.rmtree(raiz.parent, ignore_errors=True)
    print(f"\n{detectados}/{len(MUTANTES)} mutantes detectados pela suíte de oráculo.")
    return 0 if detectados == len(MUTANTES) else 1


if __name__ == "__main__":
    sys.exit(main())
