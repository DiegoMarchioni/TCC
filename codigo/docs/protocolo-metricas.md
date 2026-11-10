# Protocolo de contagem das métricas de código

Este documento fixa as definições operacionais das métricas de código da
Seção 4.2 do artigo. As ferramentas de AST (`ocaml/tools/metricas_ocaml.ml`,
`metricas-hs/MetricasHs.hs`) e `scripts/metricas.py` aplicam todas elas
mecanicamente.

Histórico: as seções 1 a 3 foram fixadas em 09/11/2026, antes da primeira
contagem. A regra mecânica de *boilerplate* (seção 4.1) foi fixada em
10/11/2026, junto com a sua implementação, e substitui a dupla contagem
humana prevista antes; a dupla contagem permanece como validação opcional
(seção 4.2).

## 0. Condições de validade

1. **Normalização.** Antes de contar, o código é normalizado com
   `scripts/normalizar.sh`: ocamlformat **0.26.2**, perfil `conventional`
   (`ocaml/.ocamlformat`), e ormolu **0.5.3.0**. A contagem só vale se
   `scripts/normalizar.sh verificar` passar.
2. **Equivalência.** A contagem só vale sobre código cuja suíte de oráculo
   passa (61/61 em cada linguagem).
3. **Comparação vertical.** Todas as métricas comparam pares da mesma
   linguagem: *handlers* × imperativa (OCaml) e mônadas × `IORef` (Haskell).

## 1. Unidades disjuntas

- **`eval`**: em OCaml, a ligação `let rec eval`; em Haskell, a assinatura de
  tipo de `eval` mais todas as suas equações. QP1 é contada só aqui.
- **Fora de `eval`**: todas as demais linhas efetivas do arquivo do avaliador
  (`interp_effects.ml`, `interp_imp.ml`, `Monadic.hs`, `IORefBase.hs`). É o
  universo das linhas classificadas na seção 4. Nenhuma linha é contada nas
  duas dimensões.
- O núcleo comum (`expr.ml`, `Expr.hs`) é compartilhado pelas duas versões de
  cada linguagem e fica fora das duas unidades.

## 2. Legibilidade (QP1)

- **LOC efetiva**: número de linhas que contêm ao menos um *token* do léxico do
  próprio compilador. Comentários, linhas em branco e *tokens* virtuais de
  *layout* não contam.
- **Operações de efeito**, contadas sobre a AST e reportadas também por
  construtor (braço/equação de `eval`):
  - *OCaml*: cada aplicação de `perform`/`Effect.perform`; de qualquer função
    `Hashtbl.*`; de `raise`/`raise_notrace`; e cada desreferência da emissão
    (`!emit`).
  - *Haskell*: cada vinculação monádica (cada comando de um bloco `do`, exceto
    o último, e cada aplicação de `>>=`, `>>` ou `=<<`) e cada ocorrência de
    `get`, `put`, `gets`, `modify`, `modify'`, `state`, `throwError`,
    `catchError`, `readIORef`, `writeIORef`, `modifyIORef`, `modifyIORef'`,
    `atomicModifyIORef'`, `throwIO`, `throw`, `emit`, `liftIO`, `lift`.
  - As duas listas diferem porque o sequenciamento é explícito em Haskell e
    implícito em OCaml; por isso a comparação é só vertical.
- **Profundidade máxima de aninhamento**, sobre a AST, alinhada à *Cognitive
  Complexity* (Campbell, 2018): o despacho por construtor de `eval` é o nível 1;
  incrementam o nível `match`/`case`, `if`, `try`, multi-way if, `\case`,
  `function` e funções anônimas. **Não** incrementam: `let … in`, blocos `do`,
  sequência (`;`, `>>`) e chamadas de função (inclusive `maybe` e `when`).
  O escrutínio de `match`/`case` e a condição de `if` ficam no nível de fora.

## 3. Composabilidade (QP2)

Medida sobre duas árvores do código: a de três efeitos e a do quarto efeito
(`quarto-efeito/`), com a suíte de oráculo passando nas duas.

- **Ponto de modificação**: declaração ou definição de topo preexistente cujo
  texto normalizado (sequência de *tokens*) mudou, ou que foi removida. Em
  Haskell, a assinatura e as equações de um mesmo nome formam uma declaração.
- **Excluídos** por serem idênticos nas quatro versões: o novo construtor de
  sintaxe (`Read`, no núcleo comum) e o novo braço/equação de `eval` para ele.
  Uma mudança em qualquer braço **preexistente** de `eval`, ou no seu
  cabeçalho/assinatura, conta como ponto em `eval`.
- **Adição pura**: declaração de topo nova.
- **Importações** (`import`, `open`): contadas à parte, não somam pontos.
- **Regra de implementação mínima**: o quarto efeito é inserido com a menor
  alteração idiomática em cada versão. Quando a linguagem permite declarar algo
  novo em vez de editar algo existente, declara-se algo novo.

Ferramenta: `python3 scripts/metricas.py pontos BASE NOVO`.

## 4. Poder de abstração (QP3): *boilerplate* e reutilização

### 4.1 Classificação mecânica de *boilerplate*

Universo: as linhas efetivas fora de `eval` no arquivo do avaliador. Cada linha
é classificada **mecanicamente**, pelos *tokens* do léxico do compilador
(emitidos pelas ferramentas de AST), e não pelo texto bruto:

- **N** (expressa a semântica de um efeito) se contém ao menos um marcador
  semântico:

  | OCaml | Haskell |
  |---|---|
  | operação sobre a tabela de estado: `Hashtbl . f`, com `f ≠ t` (o tipo `Hashtbl.t` não conta) | operação sobre o ambiente: qualquer `Map.f` |
  | uso da referência de emissão ou de entrada: `! emit`, `! input` | uso de `emitRef` ou `inputRef` |
  | atualização de acumulador ou de fluxo: `:=` | leitura do fluxo de entrada: `state` |
  | resultado do efeito de exceção: `Ok`, `Error` | resultado do efeito de exceção: `Left`, `Right` |
  | decisão de não retomar a continuação: `discontinue` | definição do domínio do estado: a declaração `type Env` |
  | declaração de uma operação de efeito: linha `| Op : …` de uma extensão `type _ Effect.t +=` | |

- **B** (*boilerplate*: infraestrutura do mecanismo) em todos os outros casos:
  cabeçalho de módulo e lista de exportação, `open`/`import`, registros e campos
  de `match_with`, `Some (fun k -> …)`, `continue k`, `| _ -> None`, anotações
  de tipo, sinônimos de tipo da pilha, `liftIO`, executores
  (`runStateT`/`runExceptT`), composições de *handlers* (`run`, `run_acc`),
  declarações de exceção e instâncias exigidas pelo mecanismo de erro.

O volume de *boilerplate* é o número de linhas B. A classificação de cada linha,
com o marcador (ou a ausência dele) que a decidiu, é gravada em
`resultados/boilerplate-regra/<impl>.csv`, para auditoria.

**Por que mecânica.** A classificação por regra fixada é reprodutível por
terceiros e independe de quem a aplica. A regra materializa o critério "uma
linha é *boilerplate* se existe apenas para fazer o mecanismo funcionar, e não
para dar significado a um efeito da linguagem interpretada".

### 4.2 Validação humana (opcional)

`python3 scripts/metricas.py tabela` também gera
`resultados/boilerplate/<impl>.csv`, com as mesmas linhas e **sem** a
classificação da regra, para que duas pessoas (o autor e o orientador) as
classifiquem de forma independente com `B` ou `N`, sem ver a classificação uma
da outra nem a da regra. As linhas divergentes são discutidas e o resultado vai
para a coluna `consenso`. `python3 scripts/metricas.py concordancia` reporta o
kappa de Cohen entre os avaliadores e entre a regra e o consenso. Um kappa alto
entre regra e consenso valida a regra; um kappa baixo indica que ela deve ser
revista **antes** de se interpretar o resultado.

### 4.3 Instâncias de reutilização

Conta-se mecanicamente, para cada *handler* (OCaml: declaração de topo que chama
`match_with`) ou camada (Haskell: executor de transformador, como `runStateT`),
o número de pontos de instalação, isto é, declarações de topo que o usam
(importações não contam). As instâncias de reutilização são a soma de
(pontos − 1) sobre os que são instalados em mais de um ponto. No código atual,
`run_state` e `run_exn` aparecem em `run` e em `run_acc`, o que dá 2 instâncias
na versão com *handlers*; as demais versões têm 0. Com um único caso de uso, essa
contagem discrimina pouco, e a leitura de QP3 apoia-se também na análise
qualitativa (Seção 5.3 do artigo).
