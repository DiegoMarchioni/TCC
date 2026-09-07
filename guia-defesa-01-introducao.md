# Guia de defesa — Parte 1: Introdução

Guia de estudo para a apresentação. Cobre do título ao fim da Introdução do `artigo.tex`.
Primeiro de uma série por seção.

**Como usar:** cada bloco traz o que o texto afirma, o que cada citação sustenta,
os termos que você precisa definir de cabeça e as perguntas prováveis com resposta.
A seção final lista os pontos frágeis conhecidos — leia essa antes de apresentar.

---

## Mapa da Introdução

A introdução tem nove blocos, nesta ordem. Os rótulos em negrito no PDF não são
decoração: eles mapeiam item a item o que o Art. 4º §1 I do regulamento exige.

| Bloco | Função | Exigido pelo regulamento? |
|---|---|---|
| 1. Abertura | Contextualização: transparência referencial vs. efeitos | Sim (contextualização) |
| 2. Dois mecanismos | Apresenta mônadas e efeitos algébricos | Sim (motivação) |
| 3. Problema de pesquisa | Delimita a lacuna | Sim |
| 4. Justificativa | Por que o trabalho importa | Sim |
| 5. Objetivo geral | O que se pretende fazer + desenho por razões | Sim |
| 6. Objetivos específicos (OE1–OE5) | Decomposição operacional | Sim |
| 7. Questões de pesquisa (QP1–QP4) | O que será respondido | Não, mas esperado |
| 8. Contribuições | O que fica para a comunidade | Não |
| 9. Estado do trabalho + organização | Situação e roteiro | Sim (descrição das seções) |

**Se perguntarem "por que essa estrutura?":** ela segue o Art. 4º §1 I. Todo item
exigido tem um bloco rotulado correspondente, o que torna a conferência trivial.

---

## Bloco 1 — Abertura: transparência referencial e efeitos

### O que o texto afirma

O paradigma funcional tem como premissa a **transparência referencial**:
expressões com o mesmo valor são intersubstituíveis em qualquer contexto sem
alterar a denotação do programa. Isso facilita raciocínio equacional e
verificação formal, e convive com os mecanismos de composição que sustentam a
modularidade. Mas entra em tensão com operações que programas reais precisam
fazer: ler arquivos, lançar exceções, manipular estado mutável. Essas operações
são os **efeitos computacionais**.

### Citações e o que cada uma sustenta

- **`strachey:67`** — a definição de transparência referencial. Atenção: no
  `.bib` o ano é **2000**, porque a versão citável é a republicação em
  *Higher-Order and Symbolic Computation*; as notas de curso são de 1967. Se
  perguntarem sobre a data, é isso. Strachey atribui o termo a Quine.
- **`hughes:89`** — *Why Functional Programming Matters*. Sustenta a
  **modularidade via mecanismos de composição**, não a transparência
  referencial. Essa distinção é deliberada e importa (veja a pergunta abaixo).

### Termos para definir de cabeça

**Transparência referencial.** Substituir uma expressão pelo seu valor não muda
o significado do programa. Consequência: você pode raciocinar sobre o código
como sobre equações algébricas.

**Efeito computacional.** No sentido adotado aqui: um conjunto de operações cuja
interpretação fica em aberto no ponto de uso e é fixada em outro lugar do
programa. Essa é a definição de trabalho da Seção 2.

**Por que evitar "efeito colateral".** "Colateral" sugere acidente, algo não
intencional. Na tradição algébrica o efeito é uma operação declarada
deliberadamente, com semântica definida. O termo é rejeitado por razão
conceitual, não por estilo.

### Perguntas prováveis

**"Hughes não diz que modularidade vem de funções de alta ordem e avaliação
preguiçosa, e não da ausência de efeitos?"**
Diz — e é exatamente por isso que o texto separa as duas afirmações. Hughes abre
criticando quem caracteriza programação funcional pelo que ela *não* tem (sem
efeitos, sem atribuição), e argumenta que o poder está na cola: funções de alta
ordem e avaliação preguiçosa. O texto cita Hughes para os **mecanismos de
composição**, não para derivar modularidade da transparência referencial.
*(Esta frase foi corrigida durante a revisão precisamente para não incorrer nesse
erro.)*

**"Exceção e estado mutável são interação com o mundo externo?"**
Não, e o texto não diz isso. Fala em "operações que um programa real precisa
realizar", que é categoria mais ampla e inclui efeitos internos.

---

## Bloco 2 — Os dois mecanismos

### O que o texto afirma

**Mônadas**: introduzidas como estrutura semântica para uniformizar noções de
computação; consolidadas como técnica de programação que encapsula efeitos em
tipos. Em Haskell, compostas por **monad transformers** em pilhas como
`StateT s (ExceptT e IO)`. A ordenação estática no tipo é apontada como fonte de
rigidez estrutural.

**Efeitos algébricos**: declaram efeitos como conjuntos de operações, cuja
semântica é fixada por **handlers** escopados. Permitem acrescentar ou substituir
efeitos sem reestruturar código existente.

**Ponto de nuance importante**: embora a teoria seja algébrica, a implementação
prática se apoia em alguma forma de **controle delimitado** — tradução para
continuações delimitadas em Koka, segmentos de pilha alocados dinamicamente no
OCaml 5.

### Citações e o que cada uma sustenta

| Citação | Sustenta exatamente |
|---|---|
| `moggi:91` | Mônadas como estrutura semântica para noções de computação |
| `wadler:92` | Mônadas como técnica de programação (*The Essence of Functional Programming*) |
| `liang:95` | Monad transformers (*Monad Transformers and Modular Interpreters*) |
| `kiselyov:13` | (a) rigidez da ordenação estática; (b) efeitos extensíveis sobre mônadas livres |
| `plotkin:03` | Efeitos como conjuntos de **operações** — **não** tem handlers |
| `plotkin:09` | **Handlers** de efeitos algébricos |
| `pretnar:15` | Modularidade: acrescentar/substituir efeitos sem reestruturar |
| `leijen:17` | Koka: compilação dirigida por tipos, continuações delimitadas |
| `sivaramakrishnan:21` | OCaml 5: *fibers*, segmentos de pilha alocados dinamicamente |

**Cuidado**: `plotkin:03` (Plotkin & Power, *Algebraic Operations and Generic
Effects*) **não trata de handlers**. Handlers são de `plotkin:09` (Plotkin &
Pretnar, *Handlers of Algebraic Effects*, ESOP 2009). O texto separa as duas
citações de propósito.

### Termos para definir de cabeça

**Mônada (formal).** Numa categoria $\mathcal{C}$, uma tripla $(T, \eta, \mu)$ com
$T$ endofuntor, $\eta: \mathrm{Id} \Rightarrow T$ e $\mu: T^2 \Rightarrow T$
transformações naturais, sujeitas a
$\mu \circ T\mu = \mu \circ \mu T$ e $\mu \circ T\eta = \mu \circ \eta T = \mathrm{id}_T$.

**Tripla de Kleisli.** Apresentação equivalente $(T, \eta, (-)^*)$, que é a que o
programador usa: $\eta$ é o `return`, e $f^*$ é o `>>=` com argumentos trocados.
A extensão é $f^* = \mu_B \circ Tf$.

**A ideia central de Moggi.** Separar **valores** (tipo $A$) de **computações**
(tipo $T A$). O efeito acrescentado por $T$ passa a ser tratável uniformemente
no sistema de tipos.

**Monad transformer.** Constrói uma mônada nova a partir de outra, empilhando
capacidades. `StateT s m a` acrescenta estado à mônada `m`.

**Handler.** Interpreta as operações de um efeito dentro de um escopo. Recebe a
**continuação** e decide o que fazer com ela: retomá-la (estado) ou descartá-la
(exceção).

**Controle delimitado.** Capacidade de capturar e manipular "o resto da
computação" até um limite definido, em vez de até o fim do programa.

### A distinção que mais rende pergunta

**Por que a ordem da pilha monádica importa.**
`ExceptT String (StateT Env IO)` — o estado **sobrevive** ao erro.
`StateT Env (ExceptT String IO)` — o estado é **descartado** no erro.
O trabalho usa a primeira, porque é ela que corresponde ao comportamento da
versão com handlers, cujo estado vive numa `Hashtbl` externa ao handler. Isso é
decisão **semântica**, não estilística, e está travada por caso de teste no
oráculo.

Esse é um dos erros que o próprio trabalho encontrou e corrigiu entre o TCC I e o
TCC II. Vale mencionar espontaneamente: mostra que a suíte de oráculo funciona.

### Perguntas prováveis

**"Efeitos algébricos não são só açúcar para mônadas?"**
Há correspondência formal entre efeitos algébricos modulares e transformadores
monádicos (`schrijvers:19`, `forster:17`), e o trabalho se apoia nisso — é o que
torna a comparação *justa*, porque garante equivalência expressiva. Mas
equivalência expressiva não implica equivalência prática: as consequências em
legibilidade, composabilidade, abstração e desempenho é que estão em aberto, e é
isso que o trabalho mede.

**"Se a teoria é algébrica, por que falar de continuações?"**
Porque a implementação real não é algébrica. Todo sistema prático de handlers
precisa de alguma forma de controle delimitado, e a escolha dessa forma tem
consequência de desempenho — que é justamente o objeto de QP4. A Seção
`sec:custo` retoma a distinção.

---

## Bloco 3 — Problema de pesquisa

### O que o texto afirma

A relação **teórica** entre os mecanismos está bem estabelecida. As consequências
**práticas** não. Um projetista que precise escolher não encontra evidência que
trate simultaneamente, e sobre um mesmo caso de uso, as quatro dimensões. Os
estudos existentes se concentram em fundamentos semânticos, em expressividade e
composição, ou em custo de execução — mas nenhum reúne as quatro.

### A classificação, e por que ela é essa

| Categoria | Trabalhos |
|---|---|
| Fundamentos semânticos | `plotkin:03`, `plotkin:09` |
| Expressividade e composição | `kiselyov:13`, `pretnar:15`, `lindley:17` |
| Custo de execução | `sivaramakrishnan:21`, `xie:20` |

Essa classificação corresponde exatamente ao que a `tab:lacuna` marca para cada
trabalho. **Se a banca abrir a tabela e comparar com a introdução, bate.**
*(Não batia antes da revisão: `pretnar:15` estava classificado como formalização
quando a tabela lhe dá a cobertura qualitativa mais ampla, e `xie:20` estava
como expressividade quando a tabela o marca em desempenho.)*

### A hedge

O texto diz "até onde alcançou a revisão realizada". Isso é deliberado e você
deve mantê-lo na fala. Afirmar que **nada** existe é indefensável; afirmar que a
revisão feita não encontrou é honesto e suficiente.

### Perguntas prováveis

**"E o `xie:20`? Ele não já compara handlers e transformers na mesma linguagem?"**
Compara, em **desempenho**, dentro de Haskell — e isso é reconhecido
explicitamente em `sec:lacuna` como um dos três trabalhos mais próximos. Ele
elimina o confundimento com o runtime, que é a mesma preocupação metodológica
deste trabalho. A diferença: ele não trata legibilidade, composabilidade nem
poder de abstração, e não usa um caso de uso integrado.

**"E o `liang:95`? É um interpretador modular com transformadores — não é o
mesmo caso de uso?"**
É o antecedente direto, e `sec:lacuna` diz isso com todas as letras: é o único
trabalho da literatura revisada que, como este, articula múltiplos efeitos sobre
um caso de uso integrado. É dele que este trabalho herda a escolha do
interpretador. O que ele não faz: não mede desempenho, não avalia legibilidade, e
não podia contrastar transformadores com efeitos algébricos, que só seriam
formulados como mecanismo de linguagem quase uma década depois.

> **Esta é a pergunta mais provável da arguição.** A tabela `tab:lacuna` dá a
> `liang:95` a marca cheia em "caso integrado", a mesma que este trabalho reivindica.
> Tenha a resposta pronta.

---

## Bloco 4 — Justificativa

### O argumento, em uma frase

A escolha entre os dois mecanismos **deixou de ser hipotética**.

### O desenvolvimento

Até recentemente, handlers algébricos viviam em linguagens de pesquisa, e a
decisão prática se reduzia a qual arranjo monádico adotar. Com a incorporação de
handlers nativos ao OCaml 5, a alternativa passou a existir numa linguagem de uso
industrial, com compilador otimizador e biblioteca madura.

Duas audiências enfrentam a decisão sem evidência:
1. **O projetista de linguagens** — o que se ganha e perde ao oferecer um dos
   mecanismos como construção primitiva.
2. **O engenheiro com base monádica existente** — se a migração compensa. E a
   resposta depende **conjuntamente** de custo de execução e de impacto no
   código, que é precisamente o que a literatura trata em separado.

### Por que a segunda audiência é o argumento mais forte

Porque ela transforma a lacuna de curiosidade acadêmica em decisão de engenharia
com consequência. E porque a justificativa da *integração* das dimensões vem
dela: o engenheiro não pode decidir com desempenho isolado nem com
expressividade isolada — precisa dos dois juntos.

---

## Bloco 5 — Objetivo geral e o desenho por razões

### O objetivo

Comparar mônadas e efeitos algébricos em legibilidade, composabilidade, poder de
abstração e desempenho, sobre um caso de uso único que combine estado mutável,
exceções e saída.

### O problema metodológico e a solução

**O problema:** o mecanismo de efeitos não pode ser isolado do runtime nem da
sintaxe da linguagem que o hospeda. Se você medir Haskell-monádico contra
OCaml-handlers diretamente, não sabe se a diferença vem do mecanismo ou do
compilador, do coletor de lixo, da avaliação preguiçosa, da sintaxe.

**A solução — normalização intralinguagem:** cada mecanismo é medido contra uma
**linha de base imperativa na sua própria linguagem**, e as duas *razões*
resultantes é que são confrontadas.

```
razão_OCaml   = versão com handlers   / base imperativa OCaml
razão_Haskell = versão monádica       / base imperativa Haskell
compara-se razão_OCaml  vs  razão_Haskell
```

**Linha de base imperativa** = o mesmo interpretador realizando os três efeitos
pelos meios diretos da linguagem: estado por célula mutável, erro por exceção
nativa, saída por escrita direta. **Todas as demais escolhas idênticas**,
inclusive a estrutura de dados do ambiente — para que a razão isole o custo do
mecanismo, e não o da representação.

> Detalhe que demonstra cuidado: a base Haskell usa `IORef` contendo o **mesmo**
> `Map String Int` da versão monádica, e não uma tabela de espalhamento. Se
> usasse `Hashtbl`, a razão capturaria a diferença de estrutura de dados em vez
> do custo do mecanismo.

**Ressalva registrada:** o cotejo direto entre as duas linguagens permanece
**exploratório**, por razões de validade interna discutidas em `sec:protocolo`.
Diga isso espontaneamente — antecipar a limitação é mais forte do que ser pego nela.

### Pergunta provável

**"Por que razões e não diferenças absolutas?"**
Porque a razão é adimensional e cancela o fator de escala da linguagem. Uma
diferença absoluta em milissegundos entre Haskell e OCaml não é comparável; a
razão "quantas vezes mais lento que a própria base" é.

---

## Bloco 6 — Objetivos específicos (OE1–OE5)

| | Objetivo | Papel |
|---|---|---|
| **OE1** | Sistematizar diferenças conceituais + argumento de equivalência expressiva | Instrumental |
| **OE2** | Especificar formalmente a semântica e o critério de equivalência funcional | Instrumental |
| **OE3** | Implementar as quatro versões | Instrumental |
| **OE4** | Definir e aplicar métricas de legibilidade, composabilidade, abstração | **Gera QP1–QP3** |
| **OE5** | Medir sobrecusto de desempenho contra a base da própria linguagem | **Gera QP4** |

**A frase que evita a pergunta:** o texto diz explicitamente que OE1–OE3 são
instrumentais — estabelecem base conceitual, referência formal e artefatos sobre
os quais OE4 e OE5 operam. Se não estivesse ali, alguém perguntaria por que há
cinco objetivos e só quatro questões.

**Por que OE1 importa mais do que parece:** o "argumento de equivalência
expressiva" é o que torna a comparação *justa*. Sem ele, comparar os dois
mecanismos seria comparar coisas que fazem trabalhos diferentes.

---

## Bloco 7 — Questões de pesquisa (QP1–QP4)

| | Pergunta | Dimensão |
|---|---|---|
| **QP1** | Qual acrescenta menos carga estrutural de leitura sobre a base da própria linguagem? | Legibilidade |
| **QP2** | Qual exige menos pontos de modificação para compor e estender efeitos? | Composabilidade |
| **QP3** | Qual acrescenta menos boilerplate e obtém maior reuso? | Poder de abstração |
| **QP4** | Qual o custo em tempo de execução contra a base da mesma linguagem? | Desempenho |

**As quatro carregam a cláusula de normalização intralinguagem.** Isso é
proposital e consistente com o título. *(QP2 e QP3 não a tinham antes da revisão.)*

### As três métricas de QP1

Definidas em `sec:metricas`, contadas **apenas sobre a função `eval`**:
1. LOC efetivas de `eval` (sem linhas em branco nem comentários)
2. Número de **operações de efeito** — em OCaml, cada `perform` na versão com
   handlers e cada acesso a `Hashtbl`/`raise`/emissão na base; em Haskell, cada
   `>>=`, `<-` em bloco `do`, `throwError`, `get`, `modify'`, operação sobre `IORef`
3. Profundidade máxima de aninhamento léxico

**Unidades disjuntas:** QP1 conta sobre `eval`; QP3 conta sobre *o arquivo menos
`eval`*. Nenhuma linha é contada nas duas dimensões. Se perguntarem sobre dupla
contagem, é essa a resposta.

**Fundamentação do aninhamento:** segue a *Cognitive Complexity* (`campbell:18`),
que atribui incremento a cada nível de aninhamento **precisamente porque** a
complexidade ciclomática (`mccabe:76`) é insensível a ele. Saiba explicar isso:
a métrica de McCabe conta caminhos linearmente independentes ($E - N + 2P$), ou
seja, pontos de decisão; código profundamente aninhado e código com desvios
sequenciais planos podem ter o **mesmo** valor ciclomático. Campbell corrige essa
cegueira.

**E há validação empírica** (`munozbaron:20`): sobre 427 trechos de código e
cerca de 24.000 avaliações humanas, a Cognitive Complexity correlaciona
positivamente com **tempo de compreensão** e com **avaliação subjetiva de
inteligibilidade** — com resultados **mistos** quanto à correção das tarefas de
compreensão.

> Se perguntarem "essa métrica mede compreensão mesmo?", esta é a resposta forte:
> não é só intenção de projeto, é métrica com validação empírica publicada. E cite
> a ressalva dos resultados mistos você mesmo — a ressalva está no seu texto, e
> apresentá-la espontaneamente vale mais do que ser corrigido.

### Salvaguardas contra viés — mencione se pressionado

- **Divergência entre indicadores:** se os três indicadores de QP1 divergirem, a
  resposta é relatada **por indicador, sem agregação**. Não há índice composto
  inventado para forçar um vencedor.
- **Normalização de estilo:** o código é formatado por `ormolu` e `ocamlformat`
  (perfil `conventional`) antes da contagem, com configurações e versões
  publicadas — porque perfis distintos produzem contagens distintas.
- **Rubrica a priori:** a análise qualitativa usa rubrica fixada **antes** de
  conhecidas as contagens, para não ser racionalização dos números.
- **"Ponto de modificação" (QP2)** é definido a priori de forma neutra, para não
  favorecer uma abordagem por construção.

### O que está fora do escopo

**Legibilidade percebida.** Exigiria estudo com participantes humanos. As
métricas são *proxies* estruturais, não medidas diretas de percepção. Registrado
como trabalho futuro em `sec:metricas`.

**Assuma isso de frente.** Se perguntarem "você está medindo legibilidade
mesmo?", a resposta honesta é: não a percebida; três proxies estruturais
complementares, com a limitação declarada no texto.

---

## Bloco 8 — Contribuições

1. **Análise conceitual** das diferenças nas quatro dimensões, com o argumento de
   equivalência expressiva (`sec:fundamentacao`, esp. `sec:relacao`)
2. **Especificação semântica** independente de implementação, com critério de
   equivalência funcional verificável (`sec:semantica`)
3. **Quatro implementações** + suíte de oráculo derivada da semântica + gerador
   determinístico de cargas replicado nas duas linguagens (`sec:impl`)
4. **Desenho experimental** que trata explicitamente o confundimento entre
   mecanismo e runtime (`sec:protocolo`)

**A contribuição 4 é a mais defensável como originalidade metodológica** — é a
normalização intralinguagem, que está no título.

**A contribuição 3 é a mais tangível** — código, testes e gerador existem e são
verificáveis.

---

## Bloco 9 — Estado do trabalho e organização

Contribuições 1, 2 e 4 consolidadas. Contribuição 3 existe como código, com
validação no ambiente definitivo em curso. **Medições empíricas ainda não
realizadas.**

Não esconda isso. O trabalho é honesto sobre o próprio estágio, e essa honestidade
joga a favor na arguição. O que você tem para mostrar: quatro implementações,
semântica formalizada, oráculo com 25 casos por implementação, gerador
determinístico, dois harnesses.

---

## As perguntas mais prováveis, em ordem

1. **`liang:95` já não fazia isso em 1995?** → Bloco 3
2. **`xie:20` já não compara na mesma linguagem?** → Bloco 3
3. **Você está mesmo medindo legibilidade?** → Bloco 7
4. **Por que razões em vez de comparação direta?** → Bloco 5
5. **Efeitos algébricos não são equivalentes a mônadas?** → Bloco 2
6. **Por que a ordem da pilha monádica é assim?** → Bloco 2
7. **Um interpretador de expressões é caso de uso representativo?** → veja abaixo

**Sobre a 7**, que ainda não tem resposta pronta no texto: o caso combina os três
efeitos canônicos (estado, exceção, saída) num programa pequeno o bastante para
ter semântica formalizada e equivalência verificável. A limitação — conclusões
restritas a um único caso de uso — está declarada nas considerações. Vale preparar
essa fala.

---

## Pontos frágeis conhecidos

Leia antes de apresentar. É melhor você levantar do que a banca.

1. **Nenhum resultado empírico ainda.** O 2º PC pede resultados preliminares.
2. **`liang:95`** tem, pela sua própria tabela, a mesma marca em "caso integrado".
3. **"Cerimônia sintática"** é constructo seu; sobrevive na rubrica qualitativa,
   sem âncora externa na literatura.
4. **Um único caso de uso**, versões específicas de compilador e hardware.
5. **Regime de abortagem total** para o efeito de exceção — outros regimes não são
   cobertos.
6. **Segurança estática de efeitos ficou fora** das quatro dimensões, e é onde as
   abordagens mais diferem. Declarado nas considerações.
7. **Comparação entre linguagens é exploratória**, não conclusiva.

---

## Pendências de verificação (não são conteúdo, são conferência)

- [x] ~~Paginação de `campbell:18`~~ — verificado contra a fonte: TechDebt 2018,
      pp. 57–58, DOI 10.1145/3194164.3194186
- [x] ~~Paginação e veículo de `xie:20`~~ — veículo corrigido para o nome oficial
      (*Haskell 2020: Proceedings of the 13th ACM SIGPLAN International Symposium
      on Haskell*), DOI 10.1145/3406088.3409022 acrescentado
- [ ] Ano de `marchioni:tcc1` (está 2025; o próprio `.bib` pede ajuste)
- [ ] E-mail e nome completo do orientador
- [ ] Lista de seções na declaração de uso de IA (Agradecimentos)
- [ ] **Limite de 16 páginas do Art. 4º** — o artigo está acima
