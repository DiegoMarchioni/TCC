# Guia de defesa — Parte 4: Metodologia, Implementações, Resultados e Conclusões

*Escrito em 09/11/2026.* Cobre as Seções 4 a 7 do `artigo.tex` e o código em
`codigo/`. **O código deste repositório foi gerado com assistência de IA.** Na
banca, você precisa conseguir explicar cada decisão dele. Este guia existe para
isso, e a declaração de uso de IA do artigo precisa dizê-lo (Arts. 7º e 8º).

---

## 0. Antes de tudo: rode e veja passar

```bash
cd codigo
eval $(opam env)            # OCaml 5.2.1 + flambda
make testar                 # semântica 28/28, gerador, formato, 61/61 + 61/61
make testar-completo        # + mutantes (8/8) e quarto efeito (73/73 + 73/73)
make experimento            # continuação abandonada vs discontinue
```

Se algum passo falhar na sua máquina, resolva antes de medir: a medição só vale
com a equivalência verificada (pré-condição da Seção 4.3).

---

## 1. Seção 4.1: caso de uso e semântica

**A linguagem:** `Num`, `Var`, `Add`, `Mul`, `Div` (truncada, erro se o divisor é
0), `Let`, `Seq`, `Print`. Três efeitos: estado (ambiente), exceção (erros) e
saída (traço).

**Decisões e como defendê-las:**

- **Ambiente global** (`Let` revincula, e o vínculo persiste após o corpo):
  simplificação da linguagem, **não** imposição da teoria. O escopo léxico seria
  exprimível com as mesmas operações. É limitação declarada.
- **Abortamento total**: sem condicional e sem `try`, um erro encerra a
  expressão. O caso de uso exercita retomar uma vez e não retomar; não exercita
  retomada múltipla.
- **Semântica formal**: em `codigo/docs/semantica.md` (contextos de avaliação,
  regras, propriedades) e **executável** em `codigo/referencia/semantica.py`,
  regra por regra. Os 28 resultados esperados do oráculo foram escritos à mão e
  conferidos contra essa semântica (28/28).
- **Determinismo**: a decomposição em contexto e redex é única, porque os
  contextos fixam a ordem à esquerda. **Progresso**: toda configuração não
  terminal tem passo. **Terminação**: cada passo reduz o número de nós que não
  são literais.
- **𝓔₆₄**: pares (e, σ₀) cuja redução fica no inteiro de 63 bits do OCaml. O par
  inclui σ₀ porque `Var` lê valores dele (o texto do artigo define só sobre e;
  se perguntarem, a definição precisa é a do `semantica.md`).
- **Equivalência funcional**: (i) mesmo inteiro, (ii) mesmo estado final, (iii)
  mesmo traço, na ordem, (iv) mesma mensagem de erro. A suíte **testa** isso; não
  **demonstra**.

---

## 2. Seção 4.2: métricas

Definições exatas em `codigo/docs/protocolo-metricas.md`; ferramentas de AST em
`ocaml/tools/metricas_ocaml.ml` e `metricas-hs/MetricasHs.hs`.

| Métrica | Como é contada |
|---|---|
| LOC de `eval` | linhas com ao menos um *token* do léxico do compilador |
| Operações de efeito (OCaml) | `perform`, `Hashtbl.*`, `raise`, `!emit` |
| Operações de efeito (Haskell) | cada vinculação monádica (comandos de `do` menos o último; `>>=`, `>>`) + `get`, `modify'`, `throwError`, `readIORef`, `modifyIORef'`, `throwIO`, `emit`… |
| Aninhamento | despacho por construtor = 1; `match`/`case`/`if`/`try`/funções incrementam; `let` e `do` não (alinhado à *Cognitive Complexity*) |
| *Boilerplate* | linhas fora de `eval`, classificadas `B`/`N` por **dupla contagem independente** (você e o orientador), com kappa de Cohen |
| Pontos de modificação | declarações de topo preexistentes cujo texto mudou ao inserir `Input` |

**Por que só comparação vertical:** as listas de operações diferem entre as
linguagens (o sequenciamento é explícito só em Haskell), e o idioma de cada
linguagem pesa na LOC. Dentro de uma linguagem, as duas versões usam as
**mesmas construções** em cada braço (`maybe`, `when`, `$!`; `match`, `let`), e
a diferença fica na operação de efeito.

**Resultados mecânicos deste código** (`make metricas`):

| | LOC eval | Operações | Aninhamento |
|---|---:|---:|---:|
| *Handlers* (OCaml) | 29 | 5 | 2 |
| Imperativa (OCaml) | 29 | 5 | 2 |
| Mônadas (Haskell) | 27 | 18 | 1 |
| `IORef` (Haskell) | 27 | 18 | 1 |

**Leia com honestidade:** dentro de cada linguagem, os números são **idênticos
por construtor**. Isso é consequência do desenho: cada versão com mecanismo foi
escrita como espelho da sua base, trocando só a operação de efeito. Logo, em
QP1, os mecanismos **não acrescentam carga dentro de `eval`**. O custo
estrutural aparece **fora** de `eval`: no *boilerplate* (QP3) e nos pontos de
composição (QP2). Diga isso no texto, como ressalva de validade de construto: a
divisão de unidades põe a semântica dos efeitos fora de `eval` nos *handlers*
e dentro dela na base.

---

## 3. Seção 4.3: protocolo

| Decisão | Por quê |
|---|---|
| Carga gerada uma vez, fora da região medida | não medir o gerador |
| Três *handlers* instalados **por expressão** | o de exceção precisa ser (senão o 1º erro encerra a carga); os outros dois vão juntos. **Três *fibers* por expressão** |
| Arith como controle | **em OCaml**: nenhum `perform`; mede o custo de *estar* sob o mecanismo. **Em Haskell não é controle**: cada `<-` é um *bind* da pilha, e a própria métrica conta isso como operação |
| Ambiente OCaml limpo uma vez antes da bateria | State é idempotente (o prefixo revincula as 500 variáveis); os demais não leem variáveis |
| Ambiente Haskell recriado por execução (`perRunEnv`, nas duas versões) | o `Map` é imutável e o `IORef` precisa nascer vazio; fora da região medida |
| `Sys.opaque_identity`; `$!`, `modify'`, `Map.Strict` | o otimizador não elimina trabalho de um lado só; mesma disciplina de *strictness* nos dois lados |
| Ordem alternada entre cenários | a deriva térmica não favorece sistematicamente um lado |
| Pré-condição dentro do *harness* | mecanismo e base precisam dar a mesma soma, os mesmos erros e o mesmo traço sobre a carga, ou a medição aborta |
| `-O3` em **todas** as bibliotecas OCaml; `-O2` no Haskell | flags idênticas dentro de cada linguagem |
| Ambiente registrado em `ambiente.md` | CPU, SO, *governor*, *turbo*, afinidade e versões: a campanha documenta onde rodou |

**O viés 1 + Δ/T_base:** se o sobrecusto é aditivo por operação, uma base mais
cara **deflaciona** a razão. A base Haskell (`Map`, logarítmico) é mais cara que
a OCaml (`Hashtbl`) em State. Por isso o confronto entre linguagens é
exploratório.

**Sementes:** as três geram **cargas** diferentes; a dispersão entre elas mede
insensibilidade à carga, não ruído de medição. O ruído é tratado pelas
reamostragens de cada ferramenta.

**IC das razões:** o Bechamel 0.5.0 calcula o IC por *bootstrap*, mas **não o
expõe na API**. O *harness* OCaml refaz o *bootstrap* sobre as medições brutas
(conferindo que a estimativa central é a mesma do Bechamel). O IC da razão é
conservador: [M_inf/B_sup ; M_sup/B_inf].

---

## 4. Seção 5: o código, arquivo por arquivo

### Núcleo comum (`ocaml/lib/expr.ml`, `haskell/src/Expr.hs`)

- Sintaxe, mensagens canônicas, `emit` (referência a função), gerador e
  serialização com *hash* FNV-1a.
- **Gerador replicado três vezes** (Python de referência, OCaml, Haskell); os
  *hashes* das **12 cargas** (4 cenários × 3 sementes) coincidem bit a bit, e o
  teste de conformidade confere todas, não só uma amostra.
- **Armadilha que o teste pega:** em OCaml, `land` tem a precedência de `*`;
  `a + 12345 land m` é `a + (12345 land m)`. Por isso os parênteses no LCG.
- **Ordem dos sorteios:** OCaml não especifica a ordem de avaliação dos
  argumentos, então os sorteios são feitos em `let` explícitos (esquerda antes
  da direita); em Haskell, a notação `do` sequencia.

### *Handlers* (`ocaml/effects/interp_effects.ml`)

- `Get` devolve `int option`: a política de erro fica no avaliador, e o
  *handler* de estado não sabe nada de erros.
- `let x = eval a in let y = eval b in`: fixa a ordem (a suíte tem um caso que
  falha se for invertida).
- **Exceção com `discontinue`, não abandonando a continuação.** No OCaml 5.2,
  abandonar a continuação **vaza o segmento de pilha**: `make experimento`
  mostra ~1,2 GB contra ~6 MB em 2 milhões de erros. `discontinue k (Abortar
  msg)` levanta a exceção dentro da computação interrompida, que se desenrola
  até o `exnc` do *handler* e libera a *fiber*. Algebricamente, a continuação
  **não é retomada**: a computação não prossegue.
  > Isso também é um achado para o artigo: se o código usado na campanha
  > antiga abandonava a continuação (a listagem da versão anterior do artigo
  > fazia isso), a razão de Exn pode ter incluído esse vazamento.
- Estado e exceção **comutam aqui** porque o estado vive numa `Hashtbl`
  externa: abortar não o perde.
- Dois *handlers* de saída: `run_output_emit` (execução e campanha) e
  `run_output_acc` (oráculo). Trocar a interpretação do efeito exigiu outro
  *handler*, sem tocar no avaliador.

### Base imperativa OCaml (`ocaml/imperative/interp_imp.ml`)

`Hashtbl` como parâmetro (mesmo padrão de acesso), `raise Runtime_error`,
`!emit`. Mesma estrutura do avaliador com efeitos.

### Mônadas (`haskell/src/Interp/Monadic.hs`)

- `ExceptT String (StateT Env IO)`: **exceção por fora**, para o estado
  sobreviver ao erro. O teste de mutação inverte a pilha e o caso "estado e
  saida sobrevivem ao erro" falha.
- `quot`, não `div` (trunca em direção a zero, como o `/` do OCaml).
- `Control.Monad.State.Strict`, `Data.Map.Strict`, `modify'`, `return $!`.

### Base `IORef` (`haskell/src/Interp/IORefBase.hs`)

O **mesmo** `Map String Int` dentro de um `IORef` (e não uma tabela de
espalhamento), para a razão isolar o mecanismo e não a estrutura de dados;
`throwIO`; as mesmas construções da versão monádica.

### Oráculo (`ocaml/test/test_oracle.ml`, `haskell/test/Spec.hs`, `shared/conformance.json`)

- 28 casos × 2 implementações + 5 conferências = **61 por linguagem**.
- Os quatro grupos que travam decisões: divisão truncada com sinais opostos;
  ordem de avaliação com `Print` nos dois operandos; persistência e
  revinculação de `Let`; estado e saída sobrevivendo ao erro.
- **Testes de mutação** (`scripts/mutantes.py`): cada decisão é revertida numa
  cópia e o caso que a trava falha. **8/8 detectados.** Esse é o argumento
  empírico da frase "cada um transforma uma decisão sutil em verificação
  automática".

### Quarto efeito (`codigo/quarto-efeito/`)

| Versão | Como | Pontos | Adições |
|---|---|---:|---:|
| *Handlers* | efeito `Input` (extensão nova), *handler* `run_input` | 2 (`run`, `run_acc`) | 2 |
| Imperativa | `ler` lê a referência global | 0 | 1 |
| Mônadas | **nova camada `StateT [Int]`** | 2 (`type Interp`, `run`) + 2 importações | 1 |
| `IORef` | `ler` lê a referência global | 0 | 1 |

**Como ler:** os dois mecanismos exigem 2 modificações, ambas nos **pontos de
composição**; as bases, nenhuma. Nos *handlers*, porque o novo *handler*
precisa ser instalado em cada composição (há duas: execução e oráculo). Nas
mônadas, porque o tipo da pilha e o executor mudam, mais as importações. **Não
torça esse resultado para nenhum lado.** A pergunta "por que a versão com
*handlers* tem duas composições?" tem resposta: uma para executar, outra para o
oráculo observar o traço sem mudar o avaliador. Esse segundo ponto é o preço da
propriedade de reinterpretar o efeito.

---

## 5. Seção 6: resultados

### Desempenho

Os números do artigo atual vieram do **código antigo**. Com este código, rode
`make campanha` e **substitua todos**. Um teste de fumaça nesta sessão (máquina
de nuvem, cota de 0,5 s, **não é resultado**) sugeriu que as razões do Haskell
podem ficar bem mais perto de 1 do que 1,08–1,90, e Output no OCaml bem acima de
2,35. Não presuma nada: meça e escreva o que sair.

**Como ler a coluna de alocação:**

- OCaml: palavras do *minor heap* (`Gc.minor_words`), convertidas para bytes no
  resumo. **Os segmentos de pilha das *fibers* não aparecem**: são alocados com
  `malloc`, fora do *heap* (Sivaramakrishnan et al. 2021, §5.2; `runtime/fiber.c`
  do 5.2). A coluna mostra fechamentos, registros de *handler* e resultados.
- A base OCaml aloca quase nada em Arith (aritmética de inteiros não aloca):
  **razões de alocação sobre denominador quase nulo inflam.** Use os valores
  absolutos por expressão (`tabela-absolutos.tex`), que o resumo já gera.
- Haskell: bytes alocados pelo RTS (`allocated:iters`).

**Tempos absolutos:** o resumo já traz ns por expressão para base e mecanismo.
Com eles, dá para comparar cenários entre si, o que o texto atual diz não poder
fazer. Atualize esse trecho.

### Código

Tabela 1: `make metricas` + `make quarto-efeito` + a dupla contagem
(`resultados/boilerplate/*.csv`, depois `python3 scripts/metricas.py
concordancia` e `latex`).

---

## 6. Seção 7: conclusões frente à literatura (conferido)

- 1% (Sivaramakrishnan) = programas **sem** *handlers*.
- 6,7–12,3× = recursão não-*tail* com *handler* e **sem `perform`**: o regime de
  Arith.
- 23 ns (alocar a *fiber* e trocar) contra 5 ns (realizar e tratar).
- Haskell: mônada de estado/MTL contra versão pura = 1,0–1,3 em contadores
  (Kammar 2013; Xie & Leijen 2020).

---

## 7. Perguntas prováveis sobre o código

1. **"Quem escreveu o código?"** → foi gerado com assistência de IA, como
   declarado; você revisou, rodou e entende cada decisão (este guia). Não
   minimize: a declaração é exigência do regulamento.
2. **"Por que `discontinue`?"** → o experimento do vazamento.
3. **"Por que três *handlers* por expressão?"** → o de exceção precisa; os outros
   poderiam ser por carga. Isso triplica as *fibers*, e o texto declara.
4. **"Arith é controle no Haskell?"** → não; só no OCaml.
5. **"Por que `Map` na base Haskell?"** → para a razão medir o mecanismo, não a
   estrutura de dados.
6. **"A emissão por referência a função é idiomática em mtl?"** → não. O idioma
   mtl seria uma classe (`MonadEmit`) com duas instâncias. É limitação de QP3
   e deve estar no texto como tal.
7. **"Como sei que as cargas são as mesmas nas duas linguagens?"** → os *hashes*
   das 12 cargas batem nas três réplicas, e o teste de conformidade confere.
8. **"O oráculo pega erros de verdade?"** → testes de mutação, 8/8.

---

## 8. O que atualizar no artigo ao adotar este código

Lista completa em `codigo/README.md`, seção "Impacto no artigo". O essencial:
números da Tabela 2 (nova campanha), Tabela 1 (métricas), descrição da
conformidade (agora todas as cargas), o `discontinue`, a URL do repositório e a
declaração de IA (geração de código).
