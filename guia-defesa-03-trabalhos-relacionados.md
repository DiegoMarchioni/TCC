# Guia de defesa — Parte 3: Trabalhos Relacionados

Cobre a Seção 3 do `artigo.tex` (`sec:relacionados`), incluindo as quatro
subseções e a `tab:lacuna`.

**Diferença em relação às Partes 1 e 2.** A Fundamentação era verificável:
matemática fecha ou não fecha. Esta seção é o oposto — seu núcleo é a
`tab:lacuna`, uma matriz de **julgamentos seus** sobre doze trabalhos. Ninguém
pode conferir aquelas marcas sem ler os doze artigos, e é justamente por isso que
elas são o alvo mais provável de arguição. Metade deste guia é dedicada a
defender a tabela linha por linha.

---

## Mapa da seção

| Subseção | Eixo | Trabalhos |
|---|---|---|
| 3.1 Abordagens Alternativas de Composição | O que mais existe além de transformadores | `swierstra:08`, `kiselyov:13`, `kiselyov:15` |
| 3.2 Implementação e Expressividade | O que já se sabe sobre handlers na prática | `kammar:13`, `xie:20`, `wu:14`, `lindley:17`, `pretnar:15` |
| 3.3 O Custo de Execução (`sec:custo`) | Por que desempenho de handler é discutível | `karachalias:21`, `gaissert:25`, `sivaramakrishnan:21` |
| 3.4 Perspectiva Comparativa e Lacuna (`sec:lacuna`) | Onde o seu trabalho entra | `tab:lacuna` |

---

## 3.1 — Abordagens Alternativas de Composição

### O conteúdo

**`swierstra:08` — *Data types à la carte*.** Pontos fixos de somas abertas
(coprodutos) de funtores, permitindo compor tipos de dados modularmente, com
aplicação direta a DSLs e interpretadores.

**A ponte conceitual que você traça:** *data types à la carte* é a precursora
direta dos efeitos extensíveis em Haskell — estas **substituem o coproduto de
funtores de sintaxe por um coproduto de assinaturas de efeito**.

> Essa frase é **sua**, não está em nenhum dos dois artigos, e está correta. É o
> tipo de síntese que separa revisão de literatura de lista de resumos. Se a
> conversa der abertura, diga que a conexão é sua leitura.

**`kiselyov:13` / `kiselyov:15` — *extensible effects*.** Uniões abertas de
funtores, evitando a rigidez da pilha ordenada e permitindo interpretar efeitos
em qualquer ordem; depois refinado sobre mônadas ***freer***.

### A objeção que você mesmo levanta — e por que isso é uma força

O texto reconhece que existem arcabouços de efeitos **em Haskell** (`polysemy`,
`fused-effects`, `effectful`) e formula a pergunta óbvia: **por que comparar
efeitos no OCaml com mônadas em Haskell, e não as duas abordagens na mesma
linguagem?**

**A resposta:** comparar cada mecanismo *como ele é efetivamente utilizado e
suportado em produção*. Handlers nativos com runtime dedicado no OCaml 5;
transformadores com `mtl` em Haskell. Bibliotecas de efeitos em Haskell são
emulação sobre um runtime que não foi desenhado para elas.

> **Verifiquei que `sec:protocolo` cumpre essa promessa** — a justificativa está
> mesmo lá, não é remissão vazia.
>
> Levantar a objeção antes que perguntem é das jogadas mais fortes da seção.
> Mas atenção: isso também **convida** a pergunta. Tenha a resposta na ponta da
> língua, porque você praticamente pediu por ela.

---

## 3.2 — Implementação e Expressividade

| Trabalho | O que estabelece | Papel no seu argumento |
|---|---|---|
| `kammar:13` | Handlers em Haskell sobre mônadas livres e continuações delimitadas; viabilidade sem suporte nativo, desempenho competitivo | Mostra que o mecanismo funciona fora de linguagem nativa |
| `xie:20` | Handlers *vs.* transformers **na mesma linguagem**, com benchmarks | **Base empírica mais próxima das suas hipóteses de desempenho** |
| `wu:14` | Efeitos **escopados** como problema estrutural dos handlers | Justifica seu ambiente global |
| `lindley:17` | Frank: dispensa construto separado de handler, introduz **multihandlers** | Expressividade e composição |
| `pretnar:15` | Introdução pragmática; discute legibilidade e composabilidade | Cobertura qualitativa mais ampla da tabela |

### O ponto do `wu:14` que você precisa saber usar

Efeitos escopados são aqueles em que **a semântica de um efeito depende do
contexto de chamada**. Estado local restaurado ao fim de um bloco é um exemplo.

**Por que isso importa para você:** escopo léxico com restauração de vínculos
seria um efeito escopado, e efeitos escopados são o **caso limítrofe** da
correspondência formal que você invoca na Seção 2.3. Por isso seu caso de uso
adota ambiente global.

> Isso conecta 3.2 com 2.3. Se perguntarem "por que ambiente global?", a resposta
> completa passa pelos dois lugares: não é conveniência, é ficar dentro da classe
> onde a equivalência expressiva vale.

### O que você diz sobre `pretnar:15`

Que ele discute legibilidade e composabilidade — os dois eixos —, **mas não
conduz benchmarks nem compara com métricas objetivas sobre um caso de uso
concreto.** Essa delimitação é o que sustenta o ● duplo dele na tabela sem que
ele ocupe o seu lugar.

---

## 3.3 — O Custo de Execução dos Handlers

### Os trabalhos

**`karachalias:21`** — compilador otimizador de Eff para OCaml, dirigido por
informação de tipos e efeitos; boa parte do sobrecusto eliminada por
transformações fonte-a-fonte, aproximando-se de código escrito à mão.

**`gaissert:25`** — compilação *just-in-time* por rastreamento aplicada a efeitos
e handlers. O argumento: o fluxo de controle dinâmico que handlers introduzem é
**precisamente** o que compiladores de rastreamento otimizam bem.

### As duas consequências metodológicas — decore estas

**1. O sobrecusto de handlers é propriedade da *implementação*, não do
mecanismo.** Medições obtidas num runtime não se transferem para outro.

**2. O OCaml 5 ocupa posição particular nesse espectro**, por implementar
handlers nativamente sobre segmentos de pilha alocados dinamicamente (*fibers*),
em vez de por tradução para continuações.

**E a ligação entre elas, que é o melhor insight da seção:** é *porque* as
continuações são **one-shot** que o segmento de pilha não precisa ser copiado. A
restrição registrada na Seção 2.2 é **o preço e também a razão** do baixo
sobrecusto.

> Este é o parágrafo que justifica a normalização inteira do trabalho. Se o
> sobrecusto é propriedade da implementação, medir tempo absoluto entre linguagens
> não significa nada — só a razão contra a própria linha de base significa. Saiba
> fazer essa cadeia: implementação → não transferível → razões, não absolutos.

---

## 3.4 — A `tab:lacuna`, linha por linha

Colunas: **Legib. | Compos. | Abstr. | Desemp. | Caso integrado**
(● = tratamento explícito; ○ = parcial ou incidental)

| Trabalho | L | C | A | D | CI | Como defender essa linha |
|---|:-:|:-:|:-:|:-:|:-:|---|
| `plotkin:03,09` | | ○ | | | | Fundamentos semânticos; composabilidade só implícita na teoria |
| `liang:95` | ○ | ● | ○ | | **●** | Interpretadores modulares — **o antecedente direto** |
| `swierstra:08` | | ● | ● | | | Composição e abstração de tipos, sem efeitos de execução |
| `kiselyov:13,15` | ○ | ● | ○ | ○ | | Composição é o foco; desempenho é incidental |
| `kammar:13` | | ○ | | ● | | Benchmarks presentes; composição não é o objeto |
| `pretnar:15` | ● | ● | ○ | | ○ | **A cobertura qualitativa mais ampla** — mas sem medição |
| `lindley:17` | ○ | ● | ● | | | Frank: expressividade e abstração |
| `sivaramakrishnan:21` | | | | ● | | Só desempenho; não compara com mônadas |
| `xie:20` | | ○ | | ● | | Desempenho intralinguagem |
| `karachalias:21,gaissert:25` | | | | ● | | Otimização de sobrecusto |
| **Este trabalho** | ● | ● | ● | ● | ● | A única linha cheia |

### As duas linhas que você será questionado

**`liang:95`** — é o único, além de você, com ● em Caso Integrado. Resposta
completa no [guia da introdução](guia-defesa-01-introducao.md), Bloco 3: não mede
desempenho, não avalia legibilidade, e não podia contrastar com efeitos
algébricos, que só seriam formulados quase uma década depois.

**`pretnar:15`** — tem ● em Legibilidade e ● em Composabilidade, mais que
qualquer outro na parte qualitativa. Por que ele não fecha a lacuna? Porque é
**introdução pragmática por exemplos**: discute as implicações, não as **mede**.
Sem benchmarks, sem métricas objetivas, sem caso de uso único com equivalência
verificável. Ele diz *que* há diferenças; você diz *quanto*.

### Como defender a metodologia da tabela

Se perguntarem **"como você atribuiu essas marcas?"** — e essa pergunta é
provável, porque a tabela é o coração do argumento — a resposta honesta é que são
julgamentos seus de leitura, com o critério declarado na legenda (● explícito,
○ parcial ou incidental).

> **Não finja que é medição.** É classificação qualitativa, e classificação
> qualitativa se defende pelo critério declarado e pela consistência com a prosa,
> não por objetividade. Cada marca da tabela tem uma frase correspondente no texto
> — foi assim que a coerência foi conferida.

---

## Fragilidade conhecida da tabela

**`wu:14` é discutido na prosa da 3.2 e não aparece na `tab:lacuna`.** Como a
prosa da 3.4 diz que a tabela "sintetiza a cobertura dos trabalhos discutidos",
há aí uma inconsistência estreita: um trabalho discutido não está na síntese.

Duas saídas, escolha uma e saiba justificar:
1. **Acrescentar `wu:14`** à tabela (efeitos escopados — provavelmente ○ em
   Composabilidade)
2. **Reformular a legenda/prosa** para "trabalhos comparáveis nas quatro
   dimensões", excluindo explicitamente os que entram por outra razão

O mesmo vale, em menor grau, para `leijen:17`, que aparece na introdução e na
Fundamentação mas não nesta seção nem na tabela.

---

## Perguntas mais prováveis

1. **"Por que não comparar as duas abordagens na mesma linguagem?"** → 3.1; você
   mesmo levanta, então tenha pronta
2. **"O `liang:95` não fez isso em 1995?"** → 3.4
3. **"O `pretnar:15` já não cobre legibilidade e composabilidade?"** → 3.4: ele
   discute, você mede
4. **"Como você atribuiu os ● e ○?"** → julgamento declarado, critério na legenda
5. **"Se o sobrecusto depende da implementação, o que seu número significa?"** →
   3.3: por isso são razões contra linha de base, não absolutos
6. **"Em que literatura você se baseou para desenhar a comparação assim?"** →
   veja abaixo, é a pergunta sem resposta pronta

---

## O ponto realmente descoberto

**Não há nenhum trabalho relacionado sobre *como comparar mecanismos de linguagem
empiricamente*.** Seu desenho de normalização por linha de base — que é a
Contribuição 4 e está no título — não tem antecedente metodológico citado. O
`georges:07` aparece só na metodologia, para rigor estatístico de medição.

É a mesma lacuna de "cerimônia sintática" na introdução: **sua contribuição
metodológica é a parte menos ancorada em literatura de todo o artigo.**

Isso não é erro — desenho original não precisa de precedente. Mas se um arguidor
metodologicamente inclinado perguntar "em que você se baseou para desenhar
assim?", a resposta hoje é "no raciocínio sobre o confundimento", não "em X".
Prepare essa fala, ou considere citar literatura de benchmarking comparativo.

---

## Correções aplicadas nesta seção (histórico)

- `gaissert:25` estava com `pages = {978--1006}`; é PACMPL, que usa número de
  artigo → **artigo 307, 49 páginas**
- Nome de autor: `Bracht{\"a}user` renderizava "Brachtäuser" → corrigido para
  **Brachthäuser**
- `karachalias:21` ganhou o número do artigo (102); paginação já estava certa
- As subseções 3.1 e 3.2 não tinham `\label` → rotuladas
