# Protocolo de contagem das métricas de código

Este documento fixa, antes da coleta, as definições operacionais das métricas
de código da Seção 4.2 do artigo. As ferramentas de AST
(`ocaml/tools/metricas_ocaml.ml`, `metricas-hs/MetricasHs.hs`) aplicam
mecanicamente as definições das seções 1 a 3; a seção 4 é aplicada por pessoas,
em dupla contagem independente.

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

## 4. Poder de abstração (QP3): classificação de *boilerplate*

`python3 scripts/metricas.py tabela` gera `resultados/boilerplate/<impl>.csv`
com todas as linhas efetivas fora de `eval`. Duas pessoas (o autor e o
orientador) preenchem **de forma independente** as colunas `autor` e `segundo`,
com `B` (*boilerplate*) ou `N` (não *boilerplate*), sem ver a classificação
uma da outra.

**Critério.** Uma linha é *boilerplate* (`B`) se existe apenas para fazer o
mecanismo funcionar, e não para dar significado a um efeito da linguagem
interpretada. Em caso de dúvida, pergunte: "se o mecanismo fizesse isso
sozinho, esta linha desapareceria sem que a semântica de algum efeito
deixasse de estar escrita em algum lugar?" Se sim, `B`.

| Tipicamente `B` | Tipicamente `N` |
|---|---|
| `open`/`import` | o que um efeito *faz*: ler/gravar a tabela ou o `Map`, devolver o erro, emitir/acumular o valor |
| registros e campos de `match_with` (`retc`, `exnc`, `effc`), `Some (fun k -> …)`, `continue k`, `discontinue k`, `| _ -> None` | a decisão de retomar ou não a continuação, quando ela expressa a semântica do efeito |
| anotações de tipo locais exigidas pelo mecanismo (`(type a)`, `(k : (a, _) continuation)`) | a declaração das operações de efeito (`Get`, `Set`, `Fail`, `Output`), que é a interface do efeito |
| sinônimos de tipo da pilha, `liftIO`, `lift`, `runStateT`/`runExceptT` e outros executores | mensagens e políticas de erro |
| composição de *handlers*/camadas (`run`, `run_acc`) | |
| declaração de exceção e instâncias exigidas só pelo mecanismo de erro da linha de base | |

**Divergências.** Depois das duas classificações, as linhas divergentes são
discutidas e o resultado vai para a coluna `consenso`. O script
`python3 scripts/metricas.py concordancia` reporta, por implementação, o total
de cada avaliador, a concordância percentual, o **kappa de Cohen** e o total
consensual, que é o número que entra na Tabela 1 do artigo.

**Instâncias de reutilização.** Conta-se o número de pontos de instalação, ou
de execução, em que um mesmo *handler* ou camada é usado sem reescrita. No
código atual: `run_state`, `run_exn` e `run_output_*` aparecem em `run` e em
`run_acc` (dois pontos cada); a pilha monádica é executada num único ponto
(`run`). Por discriminar pouco com um único caso de uso, a resposta a QP3
apoia-se sobretudo na análise qualitativa (Seção 5.3 do artigo).
