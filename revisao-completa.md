# Revisão intensiva do TCC — 2ª rodada (09/11/2026)

**O que foi revisado:** a versão do artigo e da bibliografia que você enviou
hoje, gravada **sem alteração** no commit `f1f1949`. As correções desta
revisão estão no commit seguinte. `git diff f1f1949` mostra exatamente o que mudou.

**Referência normativa:** `Regulamento_TCC_CC.pdf`.
**Prazo:** 4º PC, entrega à banca **já revisada pelo orientador, até
23/11/2026**. Bancas de 02 a 10/12.

**Como esta revisão foi feita**

- O PDF foi compilado com uma réplica do layout SBC (A4, margens 3,5/2,5/3 cm,
  Times 12 pt), porque `sbc-template.sty` e `sbc.bst` não estão no repositório.
  A contagem de páginas pode variar um pouco no Overleaf.
- **As afirmações sobre a literatura foram conferidas no texto das fontes**
  (Seção 3 deste documento). Duas estavam erradas e foram corrigidas.
- **O código do TCC não está em nenhum repositório da sua conta do GitHub**: a
  única entrada é este `DiegoMarchioni/TCC`, que só tem o artigo. Por isso nada
  sobre o código pôde ser conferido, e isso é também um problema de
  conformidade (C2).
- **Não toquei nos trechos marcados `VOZ`** (resumo, *abstract* e 1º parágrafo da
  Introdução). O orientador pediu que você os reescreva com as suas palavras, e
  um texto meu ali agravaria o "I.A.?" que ele anotou. Os problemas de conteúdo
  desses trechos estão listados aqui, para você corrigir ao reescrever.

Números de linha referem-se ao `artigo.tex` **depois** das correções.

---

## Atualização (09/11/2026): o código foi implementado

O código completo está em [`codigo/`](codigo/README.md), compilado e testado
(`make testar-completo`: semântica 28/28, oráculos 61/61 e 61/61, mutantes 8/8,
quarto efeito 73/73 e 73/73). Itens desta revisão que o código **resolve**:

| Item | Como |
|---|---|
| C1 (QP1–QP3 sem resposta) | `make metricas` dá QP1; `make quarto-efeito` dá QP2; QP3 depende só da dupla contagem (planilhas geradas) |
| C2 (repositório inexistente) | `codigo/` neste repositório público; falta citar a URL no texto |
| C4 (leitura da alocação) | o resumo da campanha traz alocação **absoluta** por expressão, em bytes nas duas linguagens |
| G3 (tempos absolutos) | o resumo da campanha traz ns por expressão de base e mecanismo |
| G5 (aninhamento sem definição) | `docs/protocolo-metricas.md`, seção 2, aplicado por AST |
| G8 (assimetria de QP3) | continua: a emissão por referência não é o idioma mtl; declarar como limitação |
| G10 (conformidade só de Arith) | o teste confere os *hashes* das 12 cargas, com três réplicas (Python, OCaml, Haskell) |
| G11 (flags e ambiente) | `-O3` em todas as bibliotecas OCaml; `scripts/registrar-ambiente.sh` grava CPU, SO, *governor*, *turbo*, afinidade e versões |
| Seção 5.3 ("cada caso trava uma decisão") | comprovado por testes de mutação (8/8) |

**Achado novo, relevante para o texto:** no OCaml 5.2, abandonar a
continuação do efeito de exceção **vaza o segmento de pilha** (~1,2 GB contra
~6 MB em 2 milhões de erros; `make experimento`). O código usa `discontinue`.
Se a campanha antiga abandonava a continuação, a razão de Exn pode ter
incluído o vazamento.

**Ao adotar o código, todos os números de desempenho do artigo precisam vir de
uma nova campanha** (`make campanha`). A lista do que muda no texto está em
`codigo/README.md`, seção "Impacto no artigo". Os guias de defesa foram
reescritos para a versão atual, e há um guia 04 que explica o código.

---

## 1. Resumo executivo

**A versão nova avançou bastante.** Coube em 16 páginas (com Times), tem a
estrutura exigida para a banca (Resultados; Conclusões e Trabalhos Futuros),
traz síntese dos resultados na Introdução e um único ambiente de medição. Ela
também resolveu vários pontos da 1ª revisão: `georges:07`, o critério de H4, a
instalação por expressão e a frase sobre a ambiente global.

**O que ainda impede a entrega, em ordem de urgência:**

1. **QP1, QP2 e QP3 estão sem resposta, e o texto não diz isso.** A Tabela 1
   está toda em "---" e o quarto efeito está no futuro ("será inserido"). Ainda
   assim, as Conclusões falam em "a legibilidade medida" (l. 890), e a
   Introdução sintetiza os resultados sem mencionar que três das quatro
   questões estão abertas (C1).
2. **O "repositório público" para onde o texto manda o leitor não existe**, e é
   lá que estariam a semântica formal, as listagens e o gerador. O Art. 5º §3
   exige que o produto possa ser reproduzido por outros pesquisadores (C2).
3. **A contribuição metodológica precisa ser reenquadrada.** Conferidos na
   fonte, Kammar et al. (2013) e Xie & Leijen (2020) **já comparam *handlers* e
   mônadas na mesma linguagem contra uma versão pura de controle**. A
   normalização por base intralinguagem, portanto, não é inédita; o que é
   próprio deste trabalho é confrontar as duas razões entre linguagens e sobre
   um caso integrado (C3).
4. **O principal achado da Discussão (alocação 10–20× "uma ordem de grandeza")
   não se sustenta como está escrito.** A coluna de alocação não contém os
   segmentos de pilha; a base do OCaml aloca quase nada, o que infla a razão; e
   o próprio texto recusa, para o tempo, a comparação entre linguagens que faz
   para a alocação (C4).
5. **Formato e declaração.** O *abstract* (~12 linhas) e o Resumo (~14 linhas,
   transbordando para a pág. 2) excedem o limite SBC de 10 linhas na 1ª página.
   O "[PREENCHER]" da declaração de IA sai impresso, e a finalidade declarada
   provavelmente subdeclara o uso (C5, C6).

---

## 2. Conformidade com o regulamento

| Dispositivo | Exigência | Situação | Ação |
|---|---|---|---|
| Art. 3º | LaTeX, padrão SBC | ⚠️ `lmodern` voltou e trocava a Times por Latin Modern | ✅ removido |
| Modelo SBC | *Abstract* e Resumo com até 10 linhas, ambos na 1ª página | ❌ ~12 e ~14 linhas; o Resumo cai na pág. 2 | **Você**, ao reescrever os trechos `VOZ` (~120 palavras cada) |
| Art. 4º | 10 a 16 páginas | ✅ 16 com Times (17 com Latin Modern) | Cuidado ao acrescentar texto (Seção 6) |
| Art. 4º §1 I | Introdução completa | ✅ | — |
| Tab. 2, 4º PC | Introdução com síntese do que foi feito e principais resultados | ⚠️ não diz que QP1–QP3 estão abertas | C1 |
| Art. 4º §1 III | Metodologia **com diagramas, fluxogramas, figuras** | ⚠️ o artigo não tem **nenhuma** figura (a Figura 1 saiu) | Considerar um diagrama compacto do *pipeline* (G12) |
| Art. 4º §1 IV e Art. 5º §3 | Resultados comentados e analisados | ❌ só desempenho; a Tabela 1 está vazia | C1 |
| Art. 4º §1 V e Art. 5º §3 | Conclusões com contribuições, resultados frente à literatura e trabalhos futuros | ✅ estrutura; ⚠️ contribuição metodológica sobredeclarada (C3) | C3 |
| Art. 4º §1 VI | ≥ 10 referências | ✅ 31 citadas | — |
| Art. 5º §3 | Produto reprodutível | ❌ repositório inexistente | C2 |
| Arts. 7º e 8º | Ferramenta, finalidade, seções, **versão** | ❌ "[PREENCHER]" impresso; ⚠️ finalidade | C6 |
| Arts. 9º e 10 | Veracidade; sem fabricação | ⚠️ "legibilidade medida" sem medição (C1); hipóteses omitidas (G4) | C1, G4 |

---

## 3. Afirmações conferidas nas fontes

| Afirmação do artigo | Fonte | Resultado |
|---|---|---|
| ~1% de sobrecusto em programas **sem** *handlers* (l. 859) | Sivaramakrishnan et al. 2021, resumo: "mean 1% overhead on a comprehensive macro benchmark suite that does not use effect handlers" | ✅ |
| Desacelerações de 6,7 a 12,3× em recursão não-*tail* com *handler* (l. 862) | Idem, Tab. 2 ("Micro benchmarks with handlers but no perform"): 12,25 · 12,05 · 11,44 · 6,74 · 8,9 | ✅ Detalhe útil: é **exatamente o regime de Arith** (*handler* instalado, nenhum `perform`). Vale dizer isso no texto (M5). |
| 23 ns para alocar e trocar de *fiber*, 5 ns para realizar e tratar (l. 868) | Idem, §6.3: "a-b […] allocating a new fiber and switching to it […] 23 ns, 5 ns […] dominated by the memory allocation" | ✅ |
| Segmentos de pilha e a coluna de alocação (l. 492–496) | Idem, §5.2: "Fibers are allocated on the C heap using malloc", com cache de pilhas; confirmado em `runtime/fiber.c` do OCaml 5.2 (`caml_stat_alloc_noexc`/`mmap`) | ❌ o texto dizia que a triplicação dos segmentos "deve ser levada em conta ao ler a coluna de alocação". A coluna (palavras do *heap* do coletor) **não vê** os segmentos. **Corrigido.** |
| `kammar:13` "não compara os dois mecanismos" (Seção 3.2) | Kammar et al. 2013, §5: "comparing handler code against monadic code that makes use of existing libraries"; Tab. 1: pure 51 ms, *state monad* 51 ms, *handlers* (continuações) 77 ms; "As a control, we also tested a pure version" | ❌ **Corrigido.** |
| `xie:20`: "lá o confronto é entre bibliotecas de efeitos" (Conclusões) | Xie & Leijen 2020, §6: EV contra EE, FE e **MTL**, com Pure e RunST. Counter: Pure 9 ms = MTL 9 ms; Counter5: Pure 247, MTL 327 (1,32×); Error: Pure 57,2, MTL 62,2 (1,09×) | ❌ incompleto: MTL é medido contra uma base pura, e o seu 1,08 em State cai na faixa 1,0–1,3. **Corrigido**, o que dá ao artigo um confronto com a literatura que ele não tinha. |
| `joriatti:25`: tradução dirigida pela sintaxe; cobre operações e não *handlers*; validada por exemplos; sem medição de custo | Joriatti et al. 2025 (SBLP), Conclusão: "limita-se à tradução das funções e efeitos, não podendo gerar os códigos equivalentes aos handlers"; Resultados por testes; nenhuma medição | ✅ as quatro afirmações. O alvo é a biblioteca *extensible-effects*, que é `kiselyov:15`, presente no `.bib` e não citada (M6). |
| `gaissert:25`: prenome e paginação | dblp e ACM DL bloquearam o acesso | ⚠️ **não confirmado.** A versão anterior do `.bib` tinha "Marcial", artigo 307, DOI 10.1145/3763085; a sua tem "Marius" e pp. 978–1006 (29 p.). Anotei no `.bib`. |
| `munozbaron:20`: paginação | idem | ⚠️ não confirmado |

---

## 4. O que corrigi neste commit

Só erros objetivos, fora dos trechos `VOZ`. Os novos trechos de texto estão
listados abaixo; **reescreva-os com a sua voz se preferir**.

| # | Onde | Mudança |
|---|---|---|
| 1 | Preâmbulo | Removido `\usepackage{lmodern}`: o texto volta a sair em Times, como exige o padrão SBC. Na medição, isso também reduziu o artigo de 17 para 16 páginas. |
| 2 | Título | Só a quebra de linha: o `\\` deixava "Composabilidade," sozinho numa linha. Agora são três linhas, sem mudar nenhuma palavra. |
| 3 | Comentário junto ao *abstract* | Aviso: a sugestão de dizer que "o custo está na criação de segmentos de pilha" não pode se apoiar na coluna de alocação (C4). |
| 4 | l. 190 e 523 | "a versão monádica executa sobre o GHC, e **as demais**, sobre o OCaml": a base `IORef` também roda no GHC. Agora: "e a versão com *handlers*, sobre o OCaml". |
| 5 | l. 253 | "a extensão de Kleisli **é** o `>>=`" → "corresponde ao `>>=`, com os argumentos trocados". |
| 6 | Seção 3.2 (l. 364–372) | `kammar:13` saiu da lista dos que "não comparam os dois mecanismos" e foi para o grupo mais próximo, ao lado de `xie:20` ("incluem uma versão pura como controle […] assentam sobre *microbenchmarks*"). A lista dos de desempenho passou a dizer "não comparam *handlers* com transformadores monádicos", o que é preciso: Sivaramakrishnan et al. comparam com uma mônada de concorrência (M10). |
| 7 | Seção 4.3 (l. 492–496) | A triplicação dos segmentos de pilha aparece no **tempo**, e não na coluna de alocação, que registra fechamentos e registros. Com citação. |
| 8 | Seção 5 (l. 575) | "congruencial linear de semente **fixa**" → "**explícita**": a campanha usa três sementes. |
| 9 | Seção 5.1 | "Em ambas, a emissão…" → "Nas três versões sem *handlers*…": a versão monádica também usa a referência. |
| 10 | Conclusões (l. 873–877) | A frase sobre `xie:20` foi reescrita com o que as fontes medem (MTL e mônada de estado contra versão pura: 1,0–1,3) e situa o 1,08 em State nessa faixa. |
| 11 | Agradecimentos | Finalidade acrescida de "correção de afirmações factuais no texto e nas referências" (esta revisão). O comentário lembra que "[PREENCHER]" sai impresso e alerta para a possível subdeclaração (C6). |
| 12 | `.bib` | Os três "CONFERIR" que saíam impressos foram para um campo `xconferir`, que o BibTeX ignora: o lembrete fica no fonte e some do PDF. Também: "{I}nvited" em `pretnar:15` e a discrepância de `gaissert:25` anotada. |
| 13 | Guias de defesa | Aviso no topo de cada guia. Eles descrevem a versão antiga, e **o guia 02 defende o oposto do artigo atual** sobre o ambiente global (Seção 7). |

Validado: compila sem erros, sem *overfull*, sem referências indefinidas, **16
páginas** e fonte Times.

---

## 5. Problemas encontrados, por gravidade

### 5.1 Críticos

**C1. QP1–QP3 sem resposta, sem que o texto o admita.**
A Tabela 1 está vazia (l. 714), o quarto efeito está no futuro (l. 660) e a
Discussão diz que as respostas "dependem das contagens [...] em curso". Isso é
honesto *ali*, mas:
- as Conclusões dizem "a legibilidade medida é a estrutural, não a percebida"
  (l. 890), e nenhuma legibilidade foi medida;
- a síntese da Introdução (l. 210–222) e as Conclusões não dizem que três das
  quatro questões estão abertas.

**O que fazer:** o caminho mais barato é **medir**. Normalizar com `ormolu` e
`ocamlformat` e contar LOC, operações de efeito e aninhamento é mecânico e cabe
em uma tarde. A dupla contagem de *boilerplate* exige outra pessoa (orientador).
O `Input` (QP2) é a parte cara; se não couber até 23/11, **diga isso** na
síntese e nas Conclusões e mova a QP2 para trabalhos futuros. Relatar como
medido o que não foi medido é o que o Art. 10 veda. *Se você adicionar o
repositório do código a esta sessão, posso rodar os formatadores e as contagens
mecânicas, com o script versionado. A dupla contagem e a interpretação ficam com
você e com o orientador.*

**C2. O repositório público não existe.**
"acompanha o repositório público, ao qual se remete o leitor" (l. 564); "O
domínio e as regras acompanham o repositório" (l. 413–414). Nenhum repositório
de código do TCC aparece na sua conta. Depois que a Figura 1 e as listagens
saíram, a semântica formal, que é uma das contribuições declaradas, **só existe
nesse repositório**. Publique o código (pode ser neste mesmo repositório, numa
pasta `codigo/`) e cite a URL no texto. Inclua também `medir.sh` e `main16.tex`,
citados nos comentários e ausentes daqui.

**C3. Reenquadrar a contribuição metodológica (l. 215 e 852–854).**
"A metodológica é a normalização intralinguagem, que separa o que cabe ao
mecanismo do que cabe ao *runtime*." Kammar et al. (2013, Tab. 1) e Xie &
Leijen (2020, Fig. 2) já medem *handlers* e mônadas contra uma versão pura na
mesma linguagem. Uma redação defensável seria:

> "A metodológica é levar a normalização por uma base de controle, já usada em
> comparações intralinguagem [kammar:13, xie:20], ao confronto entre
> linguagens e a um caso de uso integrado, separando o que cabe ao mecanismo do
> que cabe ao *runtime*."

Na banca, esta é a pergunta de quem conhece a área: "isso já não estava em
Kammar 2013?". Com a redação acima, a resposta está no texto.

**C4. A leitura da alocação na Discussão (l. 804–812).**
- **A coluna não contém os segmentos de pilha** (Seção 3). Ela mede fechamentos
  e registros por instalação de *handler*.
- **A base do OCaml aloca quase nada:** aritmética de inteiros não aloca, e a
  razão 19,4 divide por um número muito pequeno. É o mesmo argumento
  1+Δ/T_base que o texto usa para o tempo, aplicado à alocação. **Reporte a
  alocação absoluta por expressão.** Palavras do OCaml × 8 = bytes, o que torna
  os números das duas linguagens comparáveis em valor absoluto. Os dados já
  existem.
- "É uma ordem de grandeza contra um fator pequeno" compara razões **entre
  linguagens**, a leitura que o parágrafo seguinte recusa para o tempo. O
  raciocínio fica inconsistente.
- "É a alocação, não o tempo, que pesaria em uma decisão de projeto" não tem
  sustentação. Alocar no *minor heap* do OCaml custa pouco, e o tempo é o custo
  que o usuário sente. Sugiro retirar ou restringir a afirmação.

**C5. Resumos (padrão SBC) e trechos `VOZ`.**
O *abstract* tem 145 palavras (~12 linhas) e o Resumo 170 (~14 linhas, com
transbordo para a pág. 2). Para caber em 10 linhas, cada um precisa de ~120
palavras. Ao reescrever, corrija também o que o comentário do outro revisor já
apontava: a LOC **não** é sensível ao "sequenciamento explícito exigido pelo
OCaml" (a Seção 6.1 diz que ambas usam três linhas por operador), e a restrição
intralinguagem não é o remédio para o estilo (quem cuida disso é a
normalização).

**C6. Declaração de IA (Arts. 7º, 8º e 11).**
- "[PREENCHER]" sai **impresso** em negrito.
- Pelos comentários deste fonte ("O texto foi corrigido para não afirmar -O3",
  "a Figura 1 saiu", "o texto aqui […] foi alinhado ao SEGUNDO ambiente"), a
  ferramenta também **condensou, reestruturou e reescreveu** trechos e conferiu
  o texto contra o código. Se foi assim, "sugestões de redação e de concisão"
  subdeclara o uso, e o Art. 11 prevê sanção por omissão. O Art. 6º **permite**
  geração de conteúdo, desde que declarada; declarar a mais é seguro, declarar a
  menos é o risco.
- Os comentários dirigidos a você no fonte ("que você me mandou", "Divida como
  quiser") devem sair antes da versão final.

### 5.2 Graves

**G1. `hughes:89` citado para o oposto do que Hughes argumenta (l. 161, trecho
`VOZ`).** "Ela facilita o raciocínio equacional e a verificação formal
\cite{hughes:89}": Hughes abre o artigo criticando justamente quem defende a
programação funcional por essas propriedades, e argumenta pela modularidade
(funções de alta ordem e avaliação preguiçosa). A 1ª versão do artigo tinha
corrigido isso, e o guia 01 prevê a pergunta. Ao reescrever, cite Hughes para a
modularidade ou retire a citação desse ponto.

**G2. Em Haskell, Arith não é condição de controle (l. 497, 783, 804).**
Pela sua própria métrica (l. 440), cada vinculação monádica é uma operação de
efeito em Haskell, e Arith faz várias por expressão através da pilha
`ExceptT`/`StateT`/`IO`. O 1,90× é o custo do *bind* da pilha, e não "estar sob
o mecanismo" no sentido do OCaml. O rótulo "(controle)" e a frase "não realiza
operação de efeito alguma" valem para o OCaml. Diga isso, e descreva também a
estrutura por expressão do *harness* Haskell (`runExceptT`/`runStateT` por
expressão?), simétrica à do OCaml.

**G3. Os tempos absolutos das bases já existem.** Uma razão M/B só pode ser
calculada com B. Reportá-los (duas colunas na Tabela 2, ou na legenda) elimina
uma das duas "limitações principais" da síntese (l. 221) e a "primeira leitura
recusada" (l. 814–822), e dispensa a "segunda campanha" (l. 825).

**G4. As hipóteses saíram junto com o resultado que as refutava.** O TCC I e as
versões anteriores fixavam a priori sobrecusto < 1,5× no OCaml e > 2,0× no
Haskell; os dados contradizem as duas metades. O orientador, que está na banca,
conhece essas hipóteses. Uma ou duas frases ("a expectativa do TCC I […] não se
confirmou: […]") custam pouco espaço, protegem contra a pergunta "e a hipótese
H4?" e mostram o resultado mais interessante do trabalho. Cite `marchioni:tcc1`
(hoje não citado; M8).

**G5. A métrica de aninhamento ficou sem definição operacional (l. 442).** A
versão atual não diz o que incrementa a profundidade. A anterior contava cada
`let…in` e cada `<-`, o que diverge da *Cognitive Complexity* (que conta
estruturas de controle, não vinculações sequenciais). Defina antes de contar e
alinhe a definição a Campbell, ou deixe de citá-la como base. A ressalva de
Muñoz Barón et al. (resultados mistos quanto à correção das tarefas) também
saiu; sem ela, l. 446 superestima a validação.

**G6. Só QP3 é dita exploratória entre linguagens (l. 430).** QP1 inclui a LOC,
que é igualmente sensível ao idioma. Classifique QP1 também.

**G7. A Seção 6.1 superestima a restrição intralinguagem (l. 688).** "[o
idioma] deixa de interferir apenas quando a comparação fica dentro de uma mesma
linguagem": dentro do Haskell, a base `IORef` usa vinculações `do` e
forçamento explícito que a versão monádica não usa. O idioma é atenuado, não
eliminado. A 1ª versão dizia isso corretamente.

**G8. A assimetria de QP3 (l. 647) favorece os *handlers* por construção.** No
estilo *mtl* que o texto declara adotar, reinterpretar a saída se faz com uma
classe (`class Monad m => MonadEmit m where emit :: Int -> m ()`) com duas
instâncias, sem alterar `eval`. A referência a função num `IORef` não é o idioma
*mtl*. Declare isso como limitação ou implemente a variante.

**G9. A divisão das unidades favorece os *handlers* em QP1 e os penaliza em
QP3.** A semântica dos efeitos fica fora de `eval` na versão com *handlers*, e
dentro dela na imperativa. Declare na validade de construto.

**G10. O teste de conformidade só cobre Arith (l. 569–571).** Os geradores de
State, Exn e Output e as sementes 43 e 44 não são conferidos entre linguagens.
Dentro de cada linguagem não há problema, mas o cotejo entre linguagens pode
comparar cargas diferentes. Uma correção barata: um *hash* de cada carga por
cenário e semente, comparado entre as linguagens.

**G11. Reprodutibilidade do protocolo.**
- As *flags* de otimização não aparecem (l. 485): diga `-O2` no GHC, se for o
  caso, e as *flags* efetivas das bibliotecas OCaml (o comentário da l. 749
  explica que o `-O3` não chega a elas).
- O i5-1345U é híbrido (2 núcleos P e 8 E). Afinidade, *governor* e *turbo* não
  são descritos.
- "Corridas estritamente sequenciais" (l. 761): mecanismo e base foram medidos
  em janelas diferentes? A deriva térmica entra direto na razão.

**G12. Nenhuma figura.** O Art. 4º §1 III fala em metodologia "com diagramas,
fluxogramas, figuras". Um diagrama compacto do fluxo (oráculo → *benchmarks* →
razões) reduziria o risco de uma leitura estrita.

### 5.3 Moderados

- **M1.** 𝓔₆₄ (l. 416) depende também de σ₀, porque `Var` lê valores dele;
  defina sobre pares (e, σ₀). E 𝒟 é total sobre 𝓔×Σ de qualquer forma: o
  domínio 𝓔₆₄ importa para a equivalência das implementações, não para a
  totalidade.
- **M2.** Efeitos escopados são definidos duas vezes, de formas diferentes: na
  Seção 2.3, como operações que recebem uma subcomputação (correto), e na l.
  336–338, como "semântica depende do contexto de chamada". Apagar a segunda
  economiza uma linha e meia.
- **M3.** "a alocação mostrou-se praticamente invariante entre sementes, o que
  corrobora o tratamento dela como grandeza determinística" (l. 791–793):
  invariância entre **cargas** não é determinismo entre **execuções**.
- **M4.** "seis das oito medições" e "valores até 2,9× maiores" (l. 795–797):
  diga que são as do Bechamel, e se 2,9× é tempo absoluto ou razão.
- **M5.** A Tab. 2 de Sivaramakrishnan et al. ("handlers but no perform") é o
  análogo direto de Arith. Dizer isso fortalece o confronto com a literatura.
- **M6.** `joriatti:25` traduz para a biblioteca *extensible-effects*: cite
  `kiselyov:15` ali ("esse mesmo arcabouço", l. 329).
- **M7.** "nenhum deles reúne" (l. 177) é absoluto; a Seção 3.2 diz, com razão,
  "nenhum dos trabalhos revisados".
- **M8.** `marchioni:tcc1` não é citado, mas o texto se refere ao TCC I ("uma
  contagem preliminar […] sobre excertos", l. 680; "uma formulação anterior",
  l. 607).
- **M9.** Tensão entre a Seção 3.2 (a comparação intralinguagem "elimina o
  confundimento") e o fim da 4.3 (ela "confundiria a maturidade de uma
  biblioteca"): assuma o *trade-off* numa frase.
- **M10.** Sivaramakrishnan et al. comparam *handlers* com uma mônada de
  concorrência (Tab. 2: 33–349× contra 6,7–12,3×). Não é transformador, mas é um
  dado de "*handlers* versus mônada" no próprio OCaml que pode entrar na
  discussão.

### 5.4 Menores

- "Abortagem" (l. 396, 886) não é forma corrente; prefira "abortamento".
- "Registre-se" aparece 3 vezes em pouco espaço.
- `gaissert:25` e `munozbaron:20`: conferir na fonte (Seção 3).
- Ano de `marchioni:tcc1` (2025?) e e-mail e nome do orientador: os CONFERIR
  continuam.
- O cabeçalho do `.bib` tem uma nota obsoleta ("o .bib atual grafa
  Brachtauser").

---

## 6. Espaço

Na réplica, com Times, o artigo fecha em 16 páginas e a última tem cerca de 26
linhas de referências: sobra algo como um terço de página. A nota "1.600
caracteres" do fonte foi medida com Latin Modern; com a Times a folga deve ser
maior. **Confirme com o seu `medir.sh` no Overleaf.**

O que ainda precisa entrar: os dois parágrafos de QP1–QP3, uma ou duas frases
sobre as hipóteses (G4) e o estado de QP1–QP3 na síntese (C1). Os tempos
absolutos (G3) cabem como colunas da Tabela 2, sem prosa nova. Cortes
disponíveis: M2 (1,5 linha) e os "Registre-se".

---

## 7. Guias de defesa

Os três guias descrevem a versão anterior. Pus um aviso no topo de cada um. Os
pontos perigosos:

- **Guia 02:** defende que o ambiente global foi adotado "não por conveniência",
  por causa da teoria. **O artigo atual diz o contrário** (l. 390–394:
  "simplificação da linguagem interpretada, e não imposição da teoria").
- **Guia 01:** diz que Hughes é citado só para modularidade; o artigo atual
  voltou a citá-lo para raciocínio equacional (G1).
- **Guia 03:** a Tabela de lacuna não existe mais, e `kammar:13` e `xie:20`
  agora são os trabalhos mais próximos (C3).

Vale regerar os guias depois que o texto final estiver fechado.

---

## 8. Cronograma sugerido até 23/11

| Datas | O quê |
|---|---|
| 10–12/11 | Publicar o código (C2); normalizar e contar (QP1/QP3); decidir se o `Input` cabe no prazo |
| 12–14/11 | Preencher a Tabela 1 e escrever os dois parágrafos; tempos absolutos e alocação por expressão (G3, C4) |
| 14–16/11 | Reescrever os trechos `VOZ` (resumos com até 10 linhas, Hughes); C3, G4; completar a declaração |
| 17–21/11 | Revisão do orientador (o 4º PC exige o artigo já revisado por ele) |
| até 23/11 | Entrega à banca |
