# Quarto efeito: `Input` (QP2)

O artigo especifica o quarto efeito antes da implementação: leitura de um fluxo
de entrada cujo esgotamento produz erro, escolhido por **interagir** com o
efeito de exceção (Seção 4.2). Ele é inserido nas quatro implementações em ramo
separado; os *benchmarks* continuam a rodar sobre a versão de três efeitos.

Este diretório guarda a inserção como um *patch* sobre `codigo/`, porque o diff
**é** a medida: os pontos de modificação são as declarações preexistentes que
ele altera.

| Arquivo | Para quê |
|---|---|
| `input.patch` | a inserção completa (12 arquivos), relativa a `codigo/` (`patch -p1`) |
| `aplicar.sh copia DESTINO` | aplica numa cópia, sem tocar no repositório |
| `aplicar.sh ramo [NOME]` | cria o ramo git `quarto-efeito` com o *patch* commitado |
| `medir.sh` | cópia + suítes de oráculo (73/73 em cada linguagem) + contagem |

## O que muda em cada versão

| Versão | Como o efeito é realizado | Mudanças |
|---|---|---|
| *Handlers* (OCaml) | nova operação `Input : int option Effect.t`, declarada em extensão **nova**; novo *handler* `run_input`; braço `Read` em `eval` | `run` e `run_acc` passam a instalar `run_input` |
| Imperativa (OCaml) | leitura direta da referência `Expr.input` por uma função `ler`; braço `Read` | nenhuma declaração preexistente |
| Mônadas (Haskell) | **nova camada** `StateT [Int]` na pilha; leitura `ler` por `lift (lift (state …))`; equação `Read` | `type Interp` e `run`; importações de `lift`, `state`, `writeIORef` |
| `IORef` (Haskell) | leitura direta de `inputRef` por `ler`; equação `Read` | nenhuma declaração preexistente; importação de `writeIORef` |

Comum às duas versões de cada linguagem (núcleo `expr.ml`/`Expr.hs`, fora da
contagem por avaliador): o construtor `Read` (excluído por regra), a mensagem
`entrada esgotada`, a referência do fluxo de entrada e o caso `Read` da
serialização. A suíte ganha 6 casos (34 no total, 73 verificações), e a
semântica de referência ganha as regras (Read) e (Read-err). Os *hashes* das
cargas não mudam, porque o gerador não produz `Read`.

## Decisões que valem para a análise

- **Mesma fonte de entrada para as quatro versões.** A entrada vem da
  referência global, como a emissão. Assim nenhuma assinatura de `run` muda e
  os pontos refletem o mecanismo, não uma mudança de API.
- **A versão monádica usa o próprio mecanismo.** Ler a entrada por `liftIO`
  sobre uma referência evitaria mudar a pilha, mas trocaria o mecanismo
  monádico pelo da linha de base. Pela mesma razão, a versão com *handlers*
  usa um efeito e um *handler*.
- **A versão com *handlers* tem dois pontos de composição** (`run`, para a
  execução, e `run_acc`, para a suíte de oráculo). Os dois instalam a pilha de
  *handlers* e ambos mudam: é uma consequência legítima do mecanismo, e deve
  ser lida assim no texto.
