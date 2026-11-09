# Revisão completa do TCC — 09/11/2026

**O que foi revisado:** `artigo.tex` e `sbc-template.bib` na versão do commit
`7327bb3` (16/09/2026), mais os três guias de defesa.
**Referência normativa:** `Regulamento_TCC_CC.pdf`, Regulamento Geral de TCC de
01/08/2026, agora incluído no repositório.
**O prazo que importa:** 4º PC do TCC II, a **entrega do artigo à banca, já
revisado pelo orientador, até 23/11/2026** (14 dias a partir de hoje). As bancas
são de 02 a 10/12/2026.

**Limites desta revisão**

- O código (`ocaml/`, `haskell/`, `shared/`) **não está neste repositório**. Por
  isso, nada do que o texto afirma sobre as implementações, os testes ou as
  medições pôde ser conferido contra o código ou contra os dados brutos. O texto
  foi conferido contra ele mesmo, contra a literatura citada e contra o
  regulamento.
- `sbc-template.sty` e `sbc.bst` também não estão no repositório. Para medir o
  número de páginas, compilei com uma réplica do layout SBC (A4, margens
  3,5/2,5/3 cm, Times 12 pt, 6 pt entre parágrafos), usando `apalike` no lugar
  do `sbc.bst`. No Overleaf, a contagem pode variar em uma ou duas páginas. A
  conclusão não muda.
- Se existe no Overleaf uma versão mais recente que a deste repositório (por
  exemplo, a do 3º PC, de 21/10), sincronize antes de aplicar o que segue.

Os números de linha citados referem-se ao `artigo.tex` **depois** das correções
deste commit.

---

## 1. Resumo executivo

Cinco problemas impedem a entrega no estado atual, em ordem de urgência:

1. **O artigo tem ~37 páginas; o máximo é 16 (Art. 4º).** O regulamento diz que
   artigos fora desse formato "não serão aceitos". É preciso cortar cerca de 57%
   do texto (plano na Seção 5).
2. **A estrutura é de relatório intermediário, e não de entrega à banca.** O 4º
   PC exige as seções *Resultados* e *Conclusões e Trabalhos Futuros*, e uma
   Introdução com "síntese do que foi feito e principais resultados obtidos". O
   artigo ainda tem "Resultados Preliminares", "Atividades Desenvolvidas e
   Cronograma" e "Considerações Parciais".
3. **O ambiente de medição descrito no protocolo não é o que foi usado.** O
   protocolo descreve i5-12500H, Windows 11, GHC 9.6.4 e 30 amostras. A campanha
   relata i5-1345U, Ubuntu 22.04, GHC 9.4.8 e `limit:5000`. Uma banca percebe
   isso na primeira leitura.
4. **O confronto de H4 não usa o critério que o próprio texto fixou a priori**
   (IC de 95% da razão), e esse critério, como está escrito, é logicamente
   incompleto.
5. **A declaração de IA está incompleta** (falta a versão do modelo, exigida pelo
   Art. 8º), e **não há repositório público citado**, embora o Art. 5º §3 exija
   que o produto possa ser reproduzido por outros pesquisadores.

**Pontos fortes, que convém preservar no corte.** A fundamentação teórica é
sólida e bem citada. A normalização por linha de base intralinguagem é uma
contribuição metodológica real e bem defendida. Um oráculo derivado de uma
semântica formal, com casos que travam decisões de projeto, é raro em TCC. E a
refutação de H4, relatada com honestidade, é um resultado mais interessante do
que uma confirmação seria.

---

## 2. Conformidade com o regulamento

| Dispositivo | Exigência | Situação | Ação |
|---|---|---|---|
| Art. 3º | LaTeX no padrão SBC | ⚠️ `lmodern`, carregado depois do `sbc-template`, trocava a Times por Latin Modern | ✅ corrigido neste commit |
| Modelo SBC | *Abstract* e Resumo com até 10 linhas, ambos na 1ª página | ❌ *Abstract* com ~17 linhas; o Resumo cai na pág. 2; o título ocupa 7 linhas | Encurtar título e resumos (Seção 6) |
| Art. 4º | De 10 a 16 páginas | ❌ ~37 páginas | Plano de corte (Seção 5) |
| Art. 4º §1 I | Introdução com contextualização, justificativa, problema, objetivos e descrição das seções | ✅ | Condensar |
| Tab. 2, 4º PC | Introdução com **síntese do que foi feito e dos principais resultados** | ❌ o parágrafo "Estado do trabalho" (l. 307) fala em resultados preliminares, sem números | Reescrever (rascunho na Seção 6) |
| Art. 4º §1 II | Referencial teórico e revisão de literatura | ✅ | Condensar |
| Art. 4º §1 III | Metodologia **com diagramas, fluxogramas, figuras**, e ferramentas citadas | ⚠️ só há a figura da semântica; nenhuma figura do fluxo experimental | Acrescentar um diagrama do *pipeline* (oráculo → *benchmarks* → razões) |
| Art. 4º §1 IV e Art. 5º §3 | Resultados comentados e analisados, expostos em gráficos, figuras ou tabelas | ⚠️ só há desempenho; as métricas de código estão vazias; há duas tabelas de desempenho redundantes | Seções 4.1 e 6 |
| Art. 4º §1 V e Art. 5º §3 | Última seção: **Conclusões e Trabalhos Futuros**, com contribuições, resultados frente à literatura e caminhos de continuação | ❌ "Considerações Parciais", sem os resultados de desempenho e sem confronto com a literatura | Reescrever |
| Art. 4º §1 VI | Pelo menos 10 referências | ✅ 37, todas citadas | Corrigir as notas "AJUSTAR" (C5) |
| Art. 5º §3 | Produto descrito de modo **reprodutível por outros pesquisadores** | ❌ nenhuma URL nem DOI do código | Publicar e citar o repositório (atividade A2) |
| Tab. 2, 4º PC | Resumo em português | ✅ | Encurtar |
| Art. 7º | Declaração de IA com ferramenta, finalidade e seções | ⚠️ a lista de seções estava desatualizada | ✅ atualizada neste commit; confira |
| Art. 8º | Nome, **versão** e fornecedor da ferramenta | ❌ falta a versão | **Você** precisa inserir (há um lembrete no `.tex`) |
| Art. 9º e 10 | Veracidade; vedada a fabricação de resultados | — | Nenhum dado foi criado nesta revisão; as lacunas de dados estão listadas na Seção 7 |

---

## 3. O que já corrigi neste commit

Correções objetivas, que não dependem de decisão sua:

| # | Onde | O que mudou |
|---|---|---|
| 1 | Preâmbulo | Removido o `\usepackage{lmodern}`, que sobrescrevia a Times do modelo SBC. Conferi no PDF: o texto agora sai em Times (NimbusRomNo9L). |
| 2 | Tabela 1 (`tab:lacuna`) | Estourava a margem direita em 147 pt e cortava a coluna "Caso integrado". Agora a primeira coluna quebra linha, a fonte é `\footnotesize` e o cabeçalho foi abreviado para "Integr.", com a legenda explicando. Acrescentado `\usepackage{array}`. |
| 3 | Figura 1 (l. 824) | **Faltava a regra (Mul).** Sem ela, `Mul n₁ n₂` fica travado e a propriedade de Progresso afirmada na l. 868 é falsa. |
| 4 | Listagem 3 (Haskell) | `emit` estava definido **entre** as equações de `eval`, o que em Haskell é erro de compilação ("Multiple declarations of 'eval'"). Movido para antes de `eval`; acrescentado o comentário `-- Mul analogo a Add`, como na listagem OCaml. |
| 5 | Seção 2.3 (l. 516) | A remissão sobre efeitos escopados apontava para `sec:custo` (3.3, custo de execução). Eles são discutidos em `sec:expressividade` (3.2, `wu:14`). |
| 6 | Seção 2.3 (l. 501) | "As equações do estado são precisamente o que a suíte verifica" era exagerado: os casos de `Let` verificam duas das quatro (ler após escrever; a última escrita prevalece). Texto ajustado. |
| 7 | l. 1099 e 1436 | "estrictness" não existe em português nem em inglês; trocado por *strictness*. |
| 8 | Abertura da Seção 6 | Dizia "Nenhum valor de desempenho é reportado neste ponto de controle", duas páginas antes da Tabela 7. Reescrita para refletir o estado atual. |
| 9 | Seção 6.1 | "A coluna pós-normalização **fornece** a evidência direta": a coluna está vazia. Agora diz "quando preenchida, fornecerá". |
| 10 | Seção 6.4 (l. 1817) | "Quatro previsões [...], uma por dimensão", seguidas de apenas três. Agora "Três previsões". |
| 11 | Seção 6.4 (l. 1840) | "Dispersão inferior a 2%" contradizia a legenda da Tabela 7 ("inferior a 2,7%"). Alinhado em 2,7%. |
| 12 | Atividade A6 | "à luz de H1--H5 a H5 e P1" → "à luz de H1 a H5 e P1". |
| 13 | Comentários TODO | Apontavam para A3 e A4 onde o certo é A4 (normalização) e A5 (*benchmarks*). |
| 14 | Agradecimentos | A lista de seções e a finalidade foram atualizadas para incluir esta revisão. O comentário agora lembra que o **Art. 8º exige a versão do modelo**. |
| 15 | `.bib` | O estilo rebaixava nomes próprios nos títulos ("onto ocaml", "in haskell", "java", "curso i"). Protegidos com chaves. |
| 16 | Guias de defesa | O guia 01 ainda dizia "medições empíricas ainda não realizadas" e "oráculo com 25 casos" (são 28). O guia 02 repetia a remissão errada a `sec:custo`. Corrigidos. |

---

## 4. Problemas encontrados, por gravidade

### 4.1 Críticos (impedem a entrega ou são contradições que a banca vê de imediato)

**C1. Dois ambientes de medição incompatíveis no mesmo texto.**
- Seção 4.5, l. 1071 e 1142–1150: GHC 9.6.4; Intel i5-12500H (4P+8E), Windows 11,
  `powercfg`, *turbo* desligado, afinidade aos núcleos P.
- Seção 4.5, l. 1183–1195: as ameaças à validade discutem Windows, notebook e
  "as medições são feitas em Windows, ao passo que a literatura mede em Linux".
- Seção 5.1, l. 1274–1278, e atividade 4, l. 1895: GHC 9.6.4; a versão do OCaml
  foi escolhida "em razão da maturidade do suporte a Windows".
- Seção 6.3, l. 1752–1753: **i5-1345U, Ubuntu 22.04.4, kernel 6.8, GHC 9.4.8.**
- A Tabela 9 (riscos) previa "migrar a medição para Linux" se o *flambda*
  falhasse, mas a Seção 5.8 diz que o *flambda* funcionou.

**O que fazer:** descreva em 4.5 o ambiente **efetivamente usado** e registre a
mudança como desvio do plano, dizendo por quê. Para o Linux, informe o
*governor* de frequência, o *turbo* e a afinidade (`taskset`). O i5-1345U também
é híbrido (2 núcleos P e 8 E), então a ameaça do escalonador híbrido continua
valendo. Unifique a versão do GHC em todo o texto. Se a parte de Windows não se
aplica mais, ela sai, o que também ajuda no corte de páginas.

**C2. H4 confrontada sem o critério declarado, e com um critério incompleto.**
- H4 (l. 950) diz: "corroborada se o intervalo de confiança de 95% da razão
  **não contiver o limiar**". Lido literalmente, a metade OCaml seria
  *corroborada*: um IC em torno de 1,96 também não contém 1,5. O texto de
  resultados (l. 1840–1842) conclui o contrário, o que só está certo na leitura
  direcional.
- Nenhum IC de razão foi calculado. O texto usa a dispersão entre sementes, que
  mede a variação da **carga**, e não a incerteza da **medição**.

**O que fazer (sem reescrever a hipótese registrada):** acrescente nos resultados
algo como:

> "O critério de H4 (Seção 4.3) é aplicado no sentido direcional: cada metade é
> corroborada se o IC de 95% da razão estiver inteiramente do lado previsto do
> limiar (abaixo de 1,5× em OCaml; acima de 2,0× em Haskell), refutada se estiver
> inteiramente do lado oposto, e inconclusiva se o contiver."

Calcule o IC da razão. Com os ICs que o Criterion e o Bechamel já fornecem para
cada medição, um intervalo **conservador** é
`[M_inf / B_sup ; M_sup / B_inf]`, em que *M* é o mecanismo e *B* a linha de base.
Se tiver as amostras brutas, um *bootstrap* da razão é melhor. Coloque os ICs na
tabela de desempenho. Com os valores atuais (1,96 contra 1,5 e 1,08 contra 2,0),
a conclusão quase certamente se mantém, mas precisa ser demonstrada pelo critério
anunciado.

**C3. Trechos que contradizem o estado atual.** Além dos que já corrigi:
- Seção 5.8 (l. 1585–1609), inteira: é uma lista de pendências de setembro, com
  detalhes de API do Bechamel. **Remover.**
- Seção 6.2 (l. 1696–1747): a Tabela 6 (desempenho, "valores a coletar") duplica
  a Tabela 7, que já tem os valores. **Fundir em uma tabela só, com ICs.**
- Seção 7 (l. 1868–1990): A1 consta como próxima atividade, mas foi concluída;
  A5 está parcialmente feita; a Tabela 9 trata como riscos coisas já resolvidas
  (*flambda*, atraso em A1). A primeira campanha de medição **nem aparece** entre
  as atividades desenvolvidas. Para o 4º PC, a seção inteira sai (ver Seção 6).
- Seção 8 (l. 1994–2037): diz "primeiro ponto de controle do TCC II"; lista três
  avanços **sem mencionar os resultados de desempenho**, que são a principal
  novidade do artigo; termina com "as medições [...] constituem a etapa seguinte,
  e a validação [...] é o pré-requisito imediato", e ambas já foram feitas.

**C4. H3 lida ao contrário.**
H3 (l. 938) prevê que, em cada linguagem, "o mecanismo de efeitos apresentará
volume de *boilerplate* **superior** ao da sua linha de base". Pela Tabela 3
menos a Tabela 4, o *boilerplate* (arquivo menos `eval`, antes da normalização)
é:

| | Mecanismo | Linha de base |
|---|---|---|
| OCaml | 123 − 30 = **93** | 50 − 29 = **21** |
| Haskell | 54 − 21 = **33** | 63 − 30 = **33** |

O lado OCaml **confirma** H3. Mesmo assim, a l. 1832 diz que isso "aponta
**contra** H3", e a l. 2034 lista o mesmo dado como tensão com as hipóteses. O
dado que realmente tensiona H3 é o de Haskell (33 = 33), e esse o texto não
menciona. Além disso, a l. 392 fala em "vantagem esperada dos *handlers* em
volume de *boilerplate* (H3)", algo que H3, como está escrita, não afirma. H3
também não é comparativa e, portanto, não responde à QP3 ("qual abordagem
acrescenta **menos**").

**O que fazer:** decida o que H3 afirma. Se for comparativa ("o acréscimo dos
*handlers* sobre a base OCaml será menor que o da pilha sobre a base Haskell"),
declare que foi reformulada depois das contagens de LOC. Depois disso, corrija
as l. 392, 1832 e 2034.

**C5. Notas "AJUSTAR" saem impressas nas Referências.** Conferi no PDF:
`marchioni:tcc1` ("AJUSTAR ano, número e repositório institucional"),
`ormolu:tool` e `ocamlformat:tool` ("AJUSTAR versão utilizada"). O ano do TCC I
está como 2025, mas o repositório começa em março de 2026; **confira se não é
2026**.

### 4.2 Graves (a banca provavelmente aponta)

**G1. Protocolo declarado e protocolo executado diferem.**
- "Cada configuração é medida em 30 amostras" (l. 1121; repetido em A5,
  l. 1937). A campanha usou `limit:5000` e cota de 20 s no Bechamel e mil
  reamostragens no Criterion.
- O critério de qualidade do Bechamel seria o "erro padrão relativo [...] acima
  de 5%" (l. 1128), mas a campanha reporta R² (0,983).
- O protocolo diz que "a ordem de execução é alternada entre tratamento e linha
  de base" (l. 1191); a campanha diz "corridas estritamente sequenciais". As duas
  coisas podem ser compatíveis, mas o texto precisa dizer se houve alternância.
- O TODO das l. 1136–1138 continua aberto: confirmar que os *harnesses* usam
  `perRunEnv` e o "estágio de preparação de `Staged`". Até onde conheço o
  Bechamel, `Staged.stage` apenas impede que o compilador otimize o fechamento;
  recursos por execução são criados com `Test.make_with_resource ~allocate
  ~free`. **Confira a API e o código**, porque hoje o texto afirma algo que o
  próprio TODO diz não ter sido verificado.

**G2. Em Haskell, o cenário Arith não é condição de controle.** As l. 1078–1080
dizem que em Arith "o avaliador não realiza operação de efeito alguma". Isso vale
em OCaml. Em Haskell, cada `<-` de `Add`, `Mul` e `Div` é um *bind* da pilha
`ExceptT String (StateT Env IO)`, e a própria definição da Seção 4.4 conta cada
`<-` como operação de efeito. O 1,90× de Arith em Haskell é, portanto, o custo
do *bind* da pilha, ou seja, do próprio mecanismo estudado. A expectativa de H5
de razão "próxima de 1 nas duas linguagens" (l. 961) tinha pouco fundamento para
Haskell. Discuta isso nos resultados, sem reescrever H5.

**G3. A alocação de OCaml em Arith (19,4×) está sendo superinterpretada.**
- Em OCaml, avaliar aritmética inteira não aloca nada. A alocação da linha de base
  é quase nula, e uma razão sobre denominador quase nulo infla. **Reporte também
  a alocação absoluta por expressão** (palavras/expressão).
- Até onde conheço o *runtime* do OCaml 5, os segmentos de pilha das *fibers* são
  alocados **fora** do *heap* gerenciado (`malloc` mais um cache por domínio, em
  `runtime/fiber.c`). Se for assim, `Gc.quick_stat` e `minor_allocated` não os
  contam, e os 19,4× refletem fechamentos, registros de *handler*, resultados
  `Ok` e objetos de continuação, não o segmento de pilha. Nesse caso, a frase
  final da l. 1863–1865 ("o custo de alocação dos segmentos de pilha [...] é
  verificável na própria tabela") não se sustenta. **Verifique antes de defender
  essa frase na banca.**
- "O custo de estar sob o mecanismo é sobretudo de memória" (l. 1799) compara
  uma razão de tempo com uma de alocação, que não são comensuráveis; alocar no
  *minor heap* do OCaml custa pouco. Uma redação segura: "o mecanismo multiplica
  a alocação muito mais do que o tempo".

**G4. Quantos *handlers* são instalados por expressão?** A Listagem 2 (l. 1407)
compõe três `match_with` em `run`. Se o *harness* chama `run` por expressão,
**cada expressão cria três *fibers***. O texto só justifica instalar o de exceção
por expressão (l. 1116). Esclareça. Se forem três, é uma decisão que afeta todas
as razões do OCaml, inclusive Arith, e precisa ser declarada e justificada. Uma
variante com estado e saída instalados uma vez por carga seria um bom controle.

**G5. QP3 (reuso e reinterpretação de efeito) favorece os *handlers* por
construção.** A l. 1571 diz que, "nas três versões sem *handlers*, foi preciso
inserir um ponto de indireção antecipando a necessidade". Mas, no estilo *mtl*
que o próprio trabalho declara adotar ("o transformador como ele é
idiomaticamente usado", l. 392), a forma de reinterpretar a saída é uma classe
(`class Monad m => MonadEmit m where emit :: Int -> m ()`) ou `MonadWriter`, com
duas instâncias. Esse é o análogo monádico de trocar o *handler*, e também não
exige alterar `eval`. Usar um `IORef` contendo uma função na versão monádica
contradiz a escolha declarada. Implemente a variante com classe ou declare isso
como limitação de QP3.

**G6. A métrica de aninhamento não é a da *Cognitive Complexity* citada.** A
Seção 4.4 conta cada `let … in` e cada `<-` como nível de aninhamento. A
*Cognitive Complexity* (`campbell:18`) incrementa o aninhamento por **estruturas
de controle** (condicionais, *match*, laços, *catch*, funções aninhadas), e não
por vinculações sequenciais. Do jeito que está definida, a profundidade cresce
com o número de vinculações em sequência, o que penaliza justamente o
sequenciamento explícito do OCaml que o artigo identifica como confundimento.
Alinhe a definição com a de Campbell ou deixe de citá-la como base.

**G7. A rubrica não pode mais ser aplicada "antes de conhecidas as contagens"**
(l. 1033), porque as contagens de LOC já estão publicadas nas Tabelas 3 e 4.
Reformule ("antes das contagens de operações de efeito e de aninhamento") ou
peça ao orientador que aplique a rubrica às cegas.

**G8. H1, em OCaml, é confirmada por construção.** A versão com efeitos foi
escrita como espelho da base imperativa; a l. 1482 diz que "a estrutura do
avaliador é a mesma". Que as contagens "coincidam construtor a construtor" fica
garantido pelo modo como o código foi escrito, e não testado. Declare isso na
validade de construto.

**G9. H2 tem duas fragilidades.**
- "Próximo ao da linha de base" não tem critério numérico, embora a l. 914 afirme
  que os critérios de decisão foram declarados antes da coleta. Defina um (por
  exemplo, diferença de no máximo um ponto).
- O parágrafo "Ortogonalidade dos efeitos" (l. 883) justifica a expectativa de
  H2 pela ortogonalidade, mas o quarto efeito foi escolhido justamente por **não**
  ser ortogonal (l. 1044). Reconcilie os dois trechos.

**G10. QP1 ficou sem classificação.** Na l. 986, QP2 é dita "informativa" e QP3
"exploratória"; QP1 também compara duas diferenças e não recebe classificação.

**G11. A divisão das unidades de contagem favorece os *handlers* em QP1 e os
penaliza em QP3.** QP1 conta só `eval`; QP3 conta o arquivo menos `eval`. Na
versão com efeitos, a semântica dos efeitos vive nos *handlers*, fora de `eval`;
na imperativa, vive dentro. Isso é uma escolha legítima, mas deve ser dita
explicitamente na validade de construto.

**G12. A listagem do oráculo contradiz o texto.** A l. 1528 diz que os casos
estão no JSON de conformidade, lido pelas duas linguagens; a Listagem 5
(l. 1537) mostra casos como literais OCaml. Ajuste a legenda ("representação em
OCaml dos casos do arquivo de conformidade") ou o texto.

**G13. Confira se `xie:20` sustenta a direção de H4 em Haskell.** H4 cita Xie e
Leijen (2020) para prever sobrecusto acima de 2,0× da pilha de transformadores
sobre uma base com `IORef`. Pela minha lembrança, nos *benchmarks* desse artigo o
*mtl* aparece entre as variantes **mais rápidas**, e não sei se há uma base com
`IORef`. Se for assim, a citação não sustenta a previsão. Releia a seção de
avaliação deles antes da banca.

**G14. `georges:07` não sustenta o *bootstrap*.** Georges et al. (2007) defendem
intervalos de confiança (t de Student), múltiplas invocações e ANOVA, e não
*bootstrap*; tampouco falam das ferramentas usadas aqui. Use a citação para
"avaliação estatisticamente rigorosa" em geral (l. 1121–1123).

**G15. Afirmação sem evidência na Seção 6.1.** A l. 1692–1694 diz que a LOC
"pode inverter de sinal [...] **mesmo quando a comparação é feita dentro de uma
única linguagem**". A inversão documentada é entre os excertos do TCC I e o
código real, entre linguagens. Dentro do OCaml, 30 contra 29 não inverte nada, e
não há contagem do TCC I por par intralinguagem. Remova a oração final ou
apresente a evidência.

**G16. Integridade do "a priori".** Pelo histórico do repositório, os limiares de
H4 e o critério do IC já estavam na primeira versão (07/09), antes dos
resultados, então isso está em ordem. Já **H5** e a reformulação de **H1**
entraram em 16/09, mesmo dia em que os resultados foram registrados. Se H5 foi
escrita depois da corrida-piloto (cota de 5 s) ou de qualquer medição, diga
"formulada após a corrida-piloto". A banca não vê o `git`, mas os Arts. 9º e 10
tratam justamente da veracidade.

**G17. Estado com várias posições tem sete equações, não quatro.** `Get x` e
`Set (x, v)` implementam estado global com uma posição por variável. Para esse
caso, a apresentação de Plotkin e Power tem sete equações (as quatro por posição
mais três de comutação entre posições distintas; *Notions of Computation
Determine Monads*, FoSSaCS 2002). As quatro equações citadas valem para uma única
célula de estado. Há ainda a parcialidade (`Get` devolve `int option`). Ajuste o
item "Estado" da Seção 2.3 ou restrinja a afirmação.

### 4.3 Moderados

- **M1. Argumento de terminação (l. 872):** "o tamanho da expressão decresce ou
  um redex é consumido" é vago; `Var x → n` não diminui o tamanho. Use uma
  medida que decresce estritamente, por exemplo o número de nós que não são
  literais.
- **M2. Definição de 𝓔₆₄ (l. 896):** depende também do estado inicial σ₀, porque
  `Var` lê valores dele. Defina sobre pares (e, σ₀).
- **M3. Sementes:** a l. 1301–1302 fala em "semente fixada no código", mas a campanha
  usa três (42, 43 e 44). Diga que o teste de conformidade cobre as três.
- **M4. "Seis das oito medições" (l. 1809):** esclareça que são as oito do
  Bechamel (quatro cenários × duas versões em OCaml).
- **M5. Output "não exercitado em nenhum trabalho anterior desta comparação"
  (l. 969):** afirmação forte e ambígua. Simplifique ou retire.
- **M6. `liang:95` "quase uma década" (Seção 3.4):** a formulação algébrica é de
  2003 (8 anos depois); os *handlers*, o mecanismo de linguagem, de 2009
  (14 anos). Precise qual dos dois.
- **M7. Tabela 1 incompleta frente à prosa:** `wu:14`, `leijen:14`, `leijen:17`
  e `bauer:15` são discutidos e não aparecem. O guia 03 já registrava isso para
  `wu:14`. Acrescente as linhas ou diga na legenda que a tabela cobre apenas os
  trabalhos comparáveis nas quatro dimensões.
- **M8. Contagem de operações de efeito (Seção 4.4):** a lista para Haskell não
  inclui `>>` (usado em `Seq`) e não diz como contar `emit` e `liftIO`.
- **M9. Explicação de Output > Exn em OCaml:** em `run`, `run_exn` é o *handler*
  mais interno. `Get` e `Set` atravessam `run_exn` e `run_output` antes de chegar
  a `run_state`; `Output` atravessa `run_exn`. Quando `effc` devolve `None`, o
  efeito é repassado ao *handler* externo, e isso tem custo por salto. Esse
  repasse pode explicar parte das razões de State e Output. Um experimento
  barato e informativo: trocar a ordem dos *handlers* e medir de novo. Ele
  dialoga com a discussão de que "*handlers* não comutam" (Seção 2.2).
- **M10. Tensão entre 3.4 e 4.5:** a l. 622 elogia `xie:20` por comparar na mesma
  linguagem, "eliminando o confundimento com o *runtime*"; a l. 1219 rejeita a
  comparação intralinguagem porque "confundiria a maturidade das bibliotecas".
  Os dois argumentos podem coexistir, mas o texto precisa assumir o
  *trade-off* explicitamente.
- **M11. Continuações descartadas:** no cenário Exn, 20% das expressões
  descartam a continuação sem `discontinue`. Confira no manual do OCaml 5 a
  recomendação sobre continuações não retomadas e se isso afeta memória ou GC no
  seu *harness*.
- **M12. Resumos:** "The results contradict the initial hypothesis, which
  predicted lower overhead for native effects" (l. 114 e 144) mistura H4
  (limiares) com P1 (comparação entre linguagens), e P1 se confirma em Arith.
  Sugestão: "contradict both halves of the performance hypothesis (H4)".

### 4.4 Menores (redação, LaTeX, bibliografia)

- **Tiques de redação:** "Registre-se" aparece 8 vezes, "deliberad-" 8,
  "precisamente" 6 e "portanto" 10. Na reescrita, varie ou corte.
- **"Abortagem"** (l. 711, 1209, 2028) não é forma corrente; prefira
  "abortamento" ou "interrupção total".
- **Terminologia instável:** "linha de base imperativa", "referência imperativa",
  "base em `IORef`", "referência quase imperativa". Escolha um termo.
- **Repetições estruturais**, que também custam páginas: a justificativa da
  normalização intralinguagem aparece no resumo, na Introdução, em 3.3, 4.4, 4.5,
  6.1 e 8; a história das correções do TCC I (`div`/`quot`, ordem da pilha, ordem
  de avaliação em OCaml) aparece em 4, 5.3, 5.4, 7 e 8.
- **Notação:** 𝒟(e, σ) = (v, σ′, ω) usa tupla onde as configurações usam ⟨·⟩.
- **`munozbaron:20`** está sem páginas ou número de artigo.
- **Chave `criterion:08`** com ano 2009 (invisível no PDF, mas confunde).
- **Comentário obsoleto no `.bib`:** "Entradas a ACRESCENTAR ao arquivo
  sbc-template.bib".
- **Autor e orientador:** os comentários CONFERIR das l. 84–85 (domínio do e-mail
  e nome completo do orientador) continuam pendentes.
- **Reprodutibilidade da compilação:** `sbc-template.sty` e `sbc.bst` não estão no
  repositório. Inclua-os, para que o PDF possa ser gerado fora do Overleaf.

---

## 5. Plano para caber em 16 páginas

Medido no layout SBC aproximado (com Times): **37 páginas**. É preciso manter
cerca de 43% do texto atual.

| Seção | Hoje (págs.) | Meta | Como |
|---|---:|---:|---|
| Título, *Abstract*, Resumo | 1,3 | 1 | Título em 2 linhas; resumos com no máximo 10 linhas cada |
| 1 Introdução | 3 | 1,5 | Fundir problema e justificativa; OEs e QPs em listas curtas; cortar "Contribuições" (repete os objetivos); **acrescentar a síntese dos resultados** |
| 2 Fundamentação | 4 | 1,5 | Manter a definição de efeito, os isomorfismos das pilhas, os *handlers* do OCaml 5 em um parágrafo e o argumento de equivalência em um parágrafo |
| 3 Trabalhos Relacionados | 3 | 1,5 | 3.1 e 3.2 com um parágrafo cada; 3.3 curta; manter a Tabela 1 |
| 4 Metodologia + 5 Implementações | 9 + 7 | 4 | **Fundir as duas.** Semântica: figura e um parágrafo. Hipóteses e métricas em tabelas. Protocolo em um parágrafo; validade em lista curta. Uma única listagem lado a lado (*handlers* × mônadas). **Novo:** diagrama do *pipeline* |
| Resultados | 4 | 3 | Validação; tabela de desempenho **com ICs**; tabela de métricas de código; tabela "hipótese × veredito"; discussão frente à literatura |
| Conclusões e Trabalhos Futuros | 1 | 1 | Reescrita (Seção 6) |
| Atividades e Cronograma | 2 | 0 | **Remover**: é exigência do TCC I, não do 4º PC do TCC II |
| Agradecimentos + Referências | 3,5 | 2,5 | Retirar referências citadas só em trechos cortados |
| **Total** | **~37** | **~16** | |

**O que sai inteiro:** a Seção 5.8 (estado e pendências); a 6.2 (tabelas vazias,
substituídas por tabelas com dados); a Seção 7 inteira (atividades, cronograma,
riscos); as Listagens 4 (imperativa) e 5 (oráculo), que podem ir para o
repositório; o parágrafo "Ortogonalidade dos efeitos", que vira uma frase; e a
narrativa das correções do TCC I, já que no artigo final bastam a decisão e o
caso de teste que a trava.

**Apêndice:** o Art. 4º §2 permite apêndices, se o orientador indicar. Pergunte a
ele se o apêndice conta nas 16 páginas. Se não contar, a semântica formal
completa e as listagens podem ir para lá.

---

## 6. Estrutura sugerida para a entrega à banca (4º PC)

1. **Introdução:** contexto, problema, justificativa, objetivos geral e
   específicos, QPs, **síntese do que foi feito e principais resultados**, e
   organização do texto.
2. **Referencial Teórico e Trabalhos Relacionados:** podem ser fundidos; o Art. 4º
   §1 II os trata como um único item.
3. **Metodologia:** caso de uso e semântica, implementações, oráculo, hipóteses,
   métricas, protocolo, ameaças à validade, e o **diagrama do *pipeline***.
4. **Resultados:** validação; desempenho; métricas de código; quarto efeito;
   confronto com as hipóteses; discussão frente a `sivaramakrishnan:21` e
   `xie:20`.
5. **Conclusões e Trabalhos Futuros:** contribuições; principais resultados
   frente à literatura; limitações; trabalhos futuros (legibilidade percebida com
   participantes humanos, comparação intralinguagem em Haskell com bibliotecas de
   efeitos, efeitos escopados, segurança estática de efeitos, outras
   plataformas).
6. **Agradecimentos** (declaração de IA completa) e **Referências**.

**Rascunho do parágrafo de síntese para a Introdução**, usando apenas dados que
já estão no artigo:

> **Síntese do que foi feito e principais resultados.** Foram desenvolvidas
> quatro implementações funcionalmente equivalentes do interpretador, verificadas
> por uma suíte de oráculo de 28 casos derivada da semântica formal, que passa
> integralmente nas quatro. Na campanha de desempenho, o sobrecusto dos
> *handlers* do OCaml 5 sobre a linha de base da própria linguagem ficou entre
> 1,45× e 2,35×, e o da pilha de transformadores em Haskell entre 1,08× e 1,90×,
> o que refuta H4 nas duas metades. *[Completar com os resultados de QP1 a QP3
> quando coletados.]*

**Sugestões de título em duas linhas:**
- *Mônadas e Efeitos Algébricos: Uma Comparação Normalizada por Linha de Base
  Intralinguagem*
- *Mônadas em Haskell e Efeitos Algébricos em OCaml 5: Legibilidade,
  Composabilidade, Abstração e Desempenho*

---

## 7. O que depende de você

Nada disso pode ser preenchido por mim sem inventar dados, o que o Art. 10
proíbe.

1. **Ambiente real das medições** (máquina, SO, GHC, *governor*, *turbo*,
   afinidade) e o motivo da mudança de plano (C1).
2. **ICs das razões**, a partir dos relatórios do Criterion e do Bechamel (C2).
3. **Métricas de código normalizadas** (atividade A4). Sem elas, QP1 e QP3 ficam
   sem resposta. A dupla contagem prevista exige tempo do orientador; combine já.
4. **Quarto efeito `Input`** (atividade A3). Sem ele, QP2 fica sem resposta. Se
   não couber até 23/11, **diga isso no texto** e mova a QP2 para trabalhos
   futuros. Não é possível relatar o que não foi medido.
5. **Decidir o que H3 afirma** (C4) e o critério numérico de H2 (G9).
6. **Quantos *handlers* por expressão** o *harness* instala (G4), e conferir a
   alocação das *fibers* (G3) e a API do Bechamel (G1).
7. **URL do repositório público** com o código, os dados brutos e as
   configurações (Art. 5º §3).
8. **Versão do modelo** na declaração de IA (Art. 8º).
9. **Ano do TCC I** (provavelmente 2026), versões do `ormolu` e do
   `ocamlformat`, e e-mail e nome completo do orientador.
10. **Perguntar ao orientador** se o apêndice conta nas 16 páginas.

---

## 8. Cronograma sugerido até 23/11

O 4º PC exige o artigo **já revisado pelo orientador**, então a sua versão
precisa chegar a ele alguns dias antes.

| Datas | O quê |
|---|---|
| 10–11/11 | Decisões C1, C4 e G4; ICs das razões; publicar o repositório |
| 11–15/11 | Métricas de código (A4), com a contagem do orientador; decidir se o `Input` (A3) cabe no prazo |
| 13–18/11 | Corte e reestruturação para 16 páginas (Seções 5 e 6 deste documento) |
| 18–21/11 | Revisão do orientador e incorporação das correções |
| até 23/11 | Entrega à banca |
