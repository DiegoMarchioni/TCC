# Parecer independente: "Mônadas e Efeitos Algébricos em Linguagens Funcionais: Uma Análise Comparativa em Legibilidade, Composabilidade, Poder de Abstração e Desempenho"

Parecer escrito como membro externo da banca, sem contato prévio com o trabalho. Base da leitura: o PDF compilado de 16 páginas, a fonte `artigo.tex` (sem os comentários internos), o Regulamento do TCC e o código, os dados brutos e os scripts em `codigo/`.

> Gerado em 19/11/2026 por um agente de IA separado, que começou sem o contexto da sessão em que o trabalho foi produzido. Ele não leu os pareceres e guias anteriores e revisou o artigo do commit `c231ce0`. É o mesmo modelo de IA, então a independência é de contexto, e não de avaliador humano.

## 1. Dados do artigo

| Campo | Valor |
|---|---|
| Título | Mônadas e Efeitos Algébricos em Linguagens Funcionais: Uma Análise Comparativa em Legibilidade, Composabilidade, Poder de Abstração e Desempenho |
| Autores | Diego Marchioni (aluno) e Marco Rodrigo (presumivelmente o orientador), PUC Minas |
| Veículo | TCC II, Bacharelado em Ciência da Computação, PUC Minas, formato artigo SBC |
| Ano | 2026 |
| Área | Linguagens de programação, efeitos computacionais, avaliação experimental |
| Tipo | Empírico (estudo de caso comparativo com métricas de código e campanha de desempenho) |

## 2. Resumo executivo

O trabalho compara mônadas (pilha `ExceptT String (StateT Env IO)` com mtl, em Haskell) e efeitos algébricos com handlers nativos (OCaml 5.2.1) em quatro dimensões: legibilidade estrutural (QP1), pontos de modificação para um quarto efeito (QP2), boilerplate e reuso (QP3) e custo de execução em tempo e alocação (QP4). O caso de uso é um interpretador de expressões com estado, exceção e saída. Como mecanismo e runtime não se separam, cada mecanismo é medido contra uma linha de base na própria linguagem (OCaml imperativo com `Hashtbl` e exceções nativas, Haskell com `IORef` sobre `Map`). A equivalência funcional é garantida por uma semântica small-step executável, uma suíte de oráculo com 28 casos e um gerador de cargas replicado em três linguagens com conferência por hash. Os resultados: o `eval` de cada mecanismo empata com o da base nas três métricas de QP1, só os mecanismos exigiram pontos de modificação (2 e 2), os handlers somam 67 linhas de boilerplate contra 3 da base, e as razões de tempo ficam entre 1,59 e 4,26 em OCaml e entre 0,97 e 1,08 em Haskell.

A engenharia experimental é o ponto alto. A rastreabilidade é rara em TCC: todo número do texto é gerado por script a partir de `codigo/resultados/`, e consegui reproduzir a Tabela 1, a suíte de oráculo do OCaml (61/61), a semântica de referência (28/28) e o experimento de vazamento da continuação (1,2 GB contra 6 MB). Conferi 85 números do texto contra os dados brutos. Todos batem, com duas ressalvas: a legenda da Tabela 2 não reproduz a razão em duas linhas, e o valor de 4,7% diverge do registro da campanha (4,5%). O texto também é honesto sobre limitações, coisa pouco comum.

As fraquezas estão no desenho e na interpretação. As questões de pesquisa perguntam "qual abordagem", mas o desenho só permite respostas dentro de cada linguagem, e várias respostas saem empatadas por construção. O empate em QP1 vem de bases escritas com a forma do mecanismo. Em QP2 os dois mecanismos dão 2 contra 2. A contagem de boilerplate de QP3 depende muito de escolhas que não são do mecanismo: a API do OCaml 5.2, que antecede a sintaxe `effect` do OCaml 5.3, handlers escritos à mão contra executores que vêm prontos na biblioteca mtl, e uma regra de classificação sem validação humana. Em QP4, os intervalos de confiança calculados não aparecem no artigo e subestimam a variação entre execuções que os próprios dados mostram. Há ainda escolhas que inflam o custo do OCaml, como os três handlers instalados por expressão. A declaração de uso de IA sai impressa com "[PREENCHER]" no lugar da versão, o que descumpre o Art. 8º. Ela também informa que a IA gerou todo o código e executou a campanha, e a banca vai querer saber o que o aluno fez pessoalmente. Recomendo aprovação com correções obrigatórias.

## 3. Contribuições alegadas

1. Um argumento de equivalência expressiva (Seção 2.3): para estado, exceção e saída, os dois mecanismos têm o mesmo alcance, e a diferença restante é de ergonomia e custo.
2. Um critério verificável de equivalência funcional, com semântica small-step e suíte de oráculo de 28 casos que travam decisões sutis, como `quot` contra `div`, ordem de avaliação e ordem da pilha (Seções 4.1 e 5.3).
3. Um gerador de cargas replicado em OCaml, Haskell e Python, com hash FNV-1a por carga (Seção 5).
4. A normalização intralinguagem por razões sobre uma base na mesma linguagem (Seção 4.3).
5. Resultados empíricos para QP1 a QP4 (Tabelas 1 e 2) e dois achados "não previstos": o vazamento ao abandonar a continuação e a insuficiência do R² como validação da amostragem.

### Extração das afirmações principais

| Afirmação | Evidência no artigo | Força |
|---|---|---|
| A1. Nenhum trabalho reúne as quatro dimensões sobre um mesmo caso de uso (1, 3.2) | Revisão de cerca de 15 trabalhos, e minha busca não achou estudo assim | Moderada. A lacuna é verdadeira, mas é estreita por construção e omite trabalhos próximos (ver W6) |
| A2. As quatro versões são funcionalmente equivalentes (Resumo, 4.1, 5.3) | 28 casos, 8 mutantes acusados, conferência de soma, erros e traço nos harnesses | Moderada. Testada, não demonstrada (o próprio texto admite em 5.3, mas o Resumo afirma sem ressalva) |
| A3. Em cada linguagem, o `eval` do mecanismo empata com o da base (6.1) | Tabela 1, que reproduzi | Forte como medida, fraca como achado, porque o empate vem do desenho (W2) |
| A4. Só os mecanismos exigem pontos de modificação (6.1) | Tabela 1 e o patch `quarto-efeito/input.patch` | Moderada. n = 1 efeito, e 2 contra 2 não discrimina entre os mecanismos |
| A5. Handlers têm muito mais boilerplate que a base (6.1) | 67 contra 3 linhas | Fraca como propriedade do mecanismo (W3) |
| A6. Razões de tempo de 1,59 a 4,26 (OCaml) e 0,97 a 1,08 (Haskell) (Resumo, 6.2) | Tabela 2 e `resumo.md` | Moderada. Os números batem, mas a incerteza está subestimada (W4) e a instalação por expressão domina o OCaml (W5) |
| A7. "O R² não basta para validar a configuração de amostragem" (6.2, 7) | Corrida de sensibilidade com cota de 5 s | Fraca. A corrida de sensibilidade difere em muitas coisas além da cota (W4) |
| A8. A forma do custo é fixa por instalação no OCaml e proporcional às vinculações no Haskell (6.3) | Comparação entre quatro cenários | Fraca. Não há variação controlada do número de instalações nem de vinculações |
| A9. Nas mônadas o custo de escrita "cresce com" a pilha (6.3) | Um único efeito adicionado | Fraca. Extrapolação de um ponto |

## 4. Pontos fortes

### S1. Rastreabilidade e reprodutibilidade acima do padrão
Onde: Seção 5, `codigo/README.md`, `scripts/atualizar_artigo.py`.
Os números do texto são macros geradas a partir de `codigo/resultados/`, e as frases interpretativas são conferidas automaticamente. Rodei `atualizar_artigo.py --verificar` numa cópia e as 19 afirmações marcadas passaram. Reproduzi a Tabela 1 inteira com `scripts/metricas.py tabela`, a suíte de oráculo do OCaml (61/61), a semântica de referência (28/28) e o experimento de `discontinue` (RSS de 1.224.656 kB contra 5.988 kB). Os dados brutos, as medições descartadas e o ambiente estão versionados. Isso dá à banca uma base sólida para conferir qualquer número.

### S2. Cuidado com a equivalência funcional antes de medir
Onde: Seções 4.1, 5.1 e 5.3, Figura 1.
A semântica é fixada de forma independente das implementações, e a suíte trava as decisões que costumam passar despercebidas: `quot` contra `div`, ordem de avaliação observável por `Print`, persistência de `Let` e ordem das camadas da pilha (`ExceptT` por fora). O teste dos oito mutantes mostra que os casos de fato discriminam. O gerador próprio, com hash conferido entre três réplicas, elimina a hipótese de que OCaml e Haskell avaliaram cargas diferentes. É um desenho de pré-condição bem pensado.

### S3. Honestidade sobre limitações e sobre hipóteses refutadas
Onde: Seções 1, 4.3, 6.3 e 7.
O texto diz que o confronto entre linguagens é exploratório, que o empate de QP1 decorre em parte do desenho, que n = 1, que a máquina era virtual e que a hipótese do TCC I não se confirmou "em nenhuma das duas metades". A Seção 6.3 recusa explicitamente a leitura ingênua das razões ("A leitura que não se sustenta...") e mostra, com valores absolutos, que a razão de alocação do OCaml é grande porque a base quase não aloca. Reportar o valor absoluto da base e o excedente Δ junto da razão (Tabela 2) é uma boa prática que muitos artigos publicados não seguem.

### S4. Fundamentação teórica correta e enxuta
Onde: Seções 2.1 a 2.3.
Os isomorfismos de `StateT s (Except e)` e `ExceptT e (State s)` explicam bem por que a ordem da pilha é semântica, e isso é verificado no código (`Monadic.hs`) e na suíte. O argumento de equivalência expressiva usa Forster et al. (2017) e Schrijvers et al. (2019) de forma adequada, e delimita o que fica fora (efeitos escopados, não determinismo, que exige continuações multi-shot).

### S5. Diagnóstico técnico de medição com valor próprio
Onde: Seção 4.3 (alocação por contagem direta) e Seção 5.2 (`discontinue`).
A percepção de que o contador lido pelo Bechamel só avança a cada coleta menor no OCaml 5, e a substituição por contagem direta entre duas coletas forçadas, é um cuidado fino. O vazamento ao abandonar a continuação foi reproduzido por mim.

## 5. Pontos fracos

### W1. A declaração de IA está incompleta e a autoria do trabalho prático vai ser questionada
Onde: Agradecimentos (página 14).
O texto impresso diz "Claude (Anthropic, versão [PREENCHER])". O Art. 8º exige nome, versão e fornecedor. Além disso, a declaração informa que a IA gerou todo o código publicado (implementações, suítes, harnesses e scripts), executou a campanha de medição e a apuração das métricas e redigiu a versão preliminar das Seções 5.3, 6 e 7 e da síntese da Introdução. O `ambiente.md` da campanha confirma "executor: assistente de IA (Claude Code)". O Regulamento permite esse uso desde que declarado (Arts. 6º e 7º), mas o Art. 2º, § 2º, diz que "o aluno deve realizar um trabalho prático", e o Art. 9º o torna responsável por tudo. A banca vai perguntar o que o aluno fez pessoalmente.
Como corrigir: preencher a versão do modelo. Reexecutar a campanha pelo próprio aluno (o `README` diz que a declaração se ajusta sozinha), de preferência na máquina física descrita no protocolo. Preparar-se para explicar em detalhe o harness, o bootstrap, a regressão pela origem, o `discontinue` e a regra de boilerplate.

### W2. As questões de pesquisa são comparativas, mas o desenho só produz respostas dentro de cada linguagem, e algumas por construção
Onde: Seção 1 (QP1 a QP4), Seção 5.1, Seção 6.1 (primeiro parágrafo) e Seção 6.3 (último parágrafo).
As QPs perguntam "qual abordagem acrescenta menos...". O artigo nunca responde de forma direta, QP por QP, qual abordagem. Os motivos:
- QP1: as bases foram escritas com a estrutura do mecanismo (Seção 5.1, "a estrutura do avaliador é a mesma"). O empate de LOC, operações e aninhamento é então uma consequência do desenho, não uma medida. O texto admite isso em parte ("o que não implica que bases independentes a teriam"), mas o Resumo e a Introdução apresentam o empate como resultado.
- No Haskell, a "base" em `IORef` também é código monádico (mônada `IO`, notação `do`, as mesmas 18 operações). O par Haskell não compara mônadas contra algo não monádico. Compara transformadores do mtl contra `IO` direto. Isso precisa estar dito, porque o título contrapõe "mônadas" a "efeitos algébricos".
- QP2: 2 pontos nos handlers contra 2 nas mônadas. Com um único efeito acrescentado, não há diferença entre os mecanismos. Mesmo assim a Seção 6.3 conclui que nos handlers o custo "é localizado e pago uma vez" e que nas mônadas "cresce com" a pilha. Um ponto de dados não sustenta "cresce".
- QP4: a comparação entre linguagens é declarada exploratória, e a resposta acaba sendo "a forma do custo" (ver W5).
Há também uma tensão interna. A Introdução diz que a contribuição principal é "o desenho que torna a comparação legítima", e o mesmo texto diz que a comparação entre as abordagens não é legítima.
Como corrigir: acrescentar à Seção 7 um parágrafo que responda cada QP de forma explícita ("QP1: sem diferença detectável, por construção...", e assim por diante). Reescrever a frase de contribuição para "torna legítima a comparação de cada mecanismo com a sua base". Retirar "cresce com ela" ou apoiá-la com um quinto efeito. Dizer na Seção 5.1 que a base do Haskell é monádica em `IO`.

### W3. A métrica de boilerplate (QP3) mede sobretudo a API do OCaml 5.2 e a biblioteca mtl, não o mecanismo
Onde: Seção 4.2 (QP3), Tabela 1, Seção 6.1, `docs/protocolo-metricas.md` (seção 4.1), `resultados/boilerplate-regra/handlers.csv`.
- Versão: o OCaml 5.3.0 (janeiro de 2025) introduziu sintaxe própria para handlers profundos (`match f () with | v -> v | effect (Get x), k -> continue k ...`). A campanha é de novembro de 2026 e usa o 5.2.1, sem justificar a escolha. Pela classificação gravada, cada handler `match_with` gasta cerca de 13 a 15 linhas B: registro, `retc`, `exnc`, `effc`, `fun (type a) (eff : a Effect.t)`, `Some (fun (k : (a, _) continuation) -> ...)`, `| _ -> None`. Quase tudo isso some com a nova sintaxe. Pela minha estimativa, o valor de 67 cairia para algo entre 20 e 30 linhas. É uma estimativa grosseira, que precisa ser medida.
- Assimetria de biblioteca: no Haskell, `runStateT` e `runExceptT` vêm prontos do mtl e não contam como linhas. No OCaml, os handlers de estado, exceção e saída foram escritos à mão no próprio arquivo e contam. A Seção 2.1 diz que adotar o mtl "reduz de antemão a vantagem que se atribuiria aos handlers em boilerplate". O efeito real vai no sentido contrário: o mtl esconde a infraestrutura das mônadas na biblioteca.
- Regra: `continue k` é classificado como B e `discontinue` como N, embora retomar seja a decisão semântica do handler de estado. A linha `| Get x ->` dentro do handler também é B. O protocolo registra que a regra mecânica foi fixada em 10/11/2026 e substituiu a dupla contagem humana prevista. As planilhas de validação (`resultados/boilerplate/*.csv`) estão vazias, então não há kappa.
- Teste: 18 das 67 linhas e todas as 2 instâncias de "reuso" vêm de `run_output_acc` e `run_acc`, que existem só para a suíte de oráculo. O reuso medido é um artefato do teste.
Como corrigir: medir de novo com OCaml 5.3 ou mais recente, usando a sintaxe `effect`, ou justificar o 5.2.1 e reportar as duas contagens. Reportar o boilerplate sem o código exclusivo da suíte. Discutir a assimetria de biblioteca na Seção 4.2. Fazer a validação humana já prevista (autor e orientador) e reportar o kappa. Se não der tempo, rebaixar QP3 a análise qualitativa.

### W4. O tratamento estatístico de QP4 subestima a incerteza, e o "achado" sobre o R² não está sustentado
Onde: Seção 4.3, Seção 6.2, Tabela 2, Seção 7, `campanha-20261110-005710/`.
- Os intervalos de 95% são calculados (macros `\ICT...` geradas, valores em `resumo.md`), mas não aparecem no artigo. O leitor só vê "Nenhum inclui 1 no OCaml. No Haskell, só o de Arith o exclui". A Tabela 2 deveria trazê-los.
- Os intervalos vêm do bootstrap dentro de uma única execução e não capturam a variação entre execuções, que os próprios dados mostram ser maior. Na semente 43, a base `IORef` de Output mediu 477 µs por carga, contra 409 e 395 µs nas outras sementes (+19%). O intervalo dela (448 a 498) não se sobrepõe aos das outras. As cargas de Output são estruturalmente iguais entre sementes (dois `Print` de literais), então isso é ruído, não carga. A remedição de OCaml/State/semente 43 mudou a base em 9% (890 para 810 µs) com a mesma configuração, e a razão reportada de State passou de 1,91 para 1,98 por causa dela. Georges et al. (2007), citado no texto, recomenda várias invocações do processo por configuração. Aqui há uma invocação por semente, e a dispersão entre sementes mistura carga e ruído. A Seção 4.3 diz que essa dispersão "mede insensibilidade à carga sorteada", mas ela mede sobretudo ruído.
- A corrida de sensibilidade (Seção 6.2) difere da campanha em muito mais que a cota de 5 s: só uma semente, código com 8 alterações não commitadas (`sensibilidade/ambiente.md`), carga média do sistema de 0,61 a 0,75 contra 0,04 na campanha, e alocação OCaml pela regressão. O deslocamento de até 28% (confirmei: 2,44 contra 1,91 em OCaml/State/semente 42) não pode ser atribuído à configuração de amostragem. A conclusão "o R² não basta" pode até ser verdadeira, mas este experimento não a demonstra, e o texto a lista como achado na Seção 7.
- A legenda da Tabela 2 define a razão como 1 + Δ/T_base, mas a coluna mostra a mediana das razões por semente, enquanto base e Δ são medianas tomadas de sementes diferentes. Em duas linhas o leitor que recalcular obtém outro número: Haskell Arith dá 1 + 10/96 = 1,10 (tabela: 1,08) e Haskell Output dá 1 − 2/41 = 0,95 (tabela: 0,97).
- A remedição foi feita com o harness alterado e não commitado (ordem fixa por cenário), como registra o `ambiente.md`. O artigo diz só que "um par... foi refeito, como manda o protocolo".
Como corrigir: pôr os intervalos na Tabela 2. Corrigir a legenda ("razão: mediana das razões por semente") ou calcular a razão a partir das medianas. Fazer pelo menos 5 invocações independentes por semente e cenário, com a ordem contrabalançada, e reportar a variação entre invocações. Refazer a corrida de sensibilidade com tudo igual exceto cota e amostras, ou rebaixar a afirmação a "observação não controlada". Registrar no texto que a remedição usou harness modificado.

### W5. Escolhas de desenho que inflam o custo do OCaml e assimetrias entre as bases
Onde: Seção 4.3, Seção 5.1, Tabela 2, Seção 6.3, Resumo.
- Os três handlers são instalados por expressão. O texto admite que estado e saída "poderiam ser instalados uma vez por carga" e que isso "triplica a criação de segmentos de pilha". Com expressões de 2 a 15 nós, a instalação domina: em Arith, sem operação de efeito alguma, o excedente já é de 45 ns sobre 77 ns de base. Os números do Resumo (1,59 a 4,26) são então em boa parte o custo de instalar três fibers por expressão pequena, e o Resumo não diz isso.
- A base OCaml trata erro com `match ... with exception`, que é barato. A base Haskell usa `try` e `throwIO` por expressão, que instala um quadro de captura no runtime, enquanto a versão monádica usa `Either` puro. Isso encarece a base do Haskell e ajuda a explicar os Δ negativos (−4 e −2 ns), que o texto não comenta.
- As alocações não medem a mesma coisa: no OCaml, só o heap menor, sem os segmentos de pilha das fibers, alocados com `malloc`. No Haskell, toda a alocação do runtime. Mesmo assim a Seção 6.3 compara os excedentes de Arith entre as linguagens ("próximos, de 168 e 150 bytes"), contra a regra que o próprio texto fixou. Também fica sem medida a memória que o mecanismo realmente usa no OCaml, que o experimento de vazamento mostra ser relevante.
- A afirmação de que o custo no Haskell "é proporcional às vinculações e diluído pelo compilador" não tem evidência direta. Não houve inspeção do Core do GHC nem variação controlada do número de vinculações.
Como corrigir: acrescentar um cenário com estado e saída instalados uma vez por carga, que custa pouco e separa instalação de uso. Melhor ainda, um cenário paramétrico que varie a profundidade da expressão e o número de operações, e estimar por regressão o custo por instalação e por operação. Dizer no Resumo que a razão do OCaml reflete instalação por expressão. Explicar os Δ negativos. Retirar a comparação de excedentes entre linguagens ou qualificá-la. Medir RSS ou bytes de fiber para completar a alocação do OCaml. Se for afirmar algo sobre o compilador, mostrar trechos de `-ddump-simpl`.

### W6. O posicionamento na literatura omite comparações diretas entre handlers e código monádico
Onde: Seção 3, sobretudo a 3.2.
A lacuna afirmada ("nenhum reúne as quatro dimensões sobre um mesmo caso de uso") sobrevive à minha busca, mas é estreita por construção, porque é a conjunção de quatro condições. Faltam trabalhos que chegam bem perto:
- Sivaramakrishnan et al. (2021), já citado, compara no mesmo OCaml handlers contra uma mônada de concorrência e contra Lwt (monádico) nos mesmos programas (geradores, chameneos, servidor web), com razões de 1,67 e 4,29 vezes a favor dos handlers em chameneos. A Seção 3.2 o descreve como trabalho que "não compara handlers com transformadores", o que é verdade em sentido estrito, mas esconde que ele compara handlers com mônadas.
- Dolan et al. (2017), "Concurrent system programming with effect handlers" (TFP), compara handlers e Lwt em desempenho e em estilo de código sobre um mesmo servidor web.
- Kiselyov et al. (2013) e Kiselyov e Ishii (2015), citados só de passagem, discutem expressividade e medem desempenho contra o mtl.
- Para QP1, falta literatura que questiona métricas estruturais como proxy de compreensão (por exemplo, Scalabrino et al., 2017, "Automatically assessing code understandability: how far are we?").
Como corrigir: incluir esses trabalhos na Seção 3, reformular a 3.2 como "nenhum trabalho compara transformadores e handlers nativos sobre um mesmo programa integrado em escrita e execução" e, se couber, uma tabela de trabalhos contra dimensões.

## 6. Avaliação da metodologia

| Critério | Nota (1 a 5) | Justificativa |
|---|:---:|---|
| Correção (soundness) | 3 | Pré-condição de equivalência sólida e normalização intralinguagem bem argumentada. Mas QP1 é circular, as bases são assimétricas (W5) e há inferências entre linguagens na Seção 6.3 que o próprio desenho proíbe. |
| Novidade | 3 | A combinação de quatro dimensões, handlers nativos do OCaml 5 e mtl sobre um mesmo programa é nova até onde verifiquei. Cada peça isolada é conhecida. Para um TCC, é uma contribuição adequada. |
| Reprodutibilidade | 4 | Excelente: reproduzi Tabela 1, oráculo OCaml, semântica e experimento de vazamento. Perde um ponto pela remedição e pela corrida de sensibilidade feitas com código não commitado, pela campanha executada por IA em VM sem controle de frequência e pela ausência de commit ou DOI citado no texto. |
| Desenho experimental | 3 | Cuidados reais (opaque_identity, cargas fora da região medida, ordem alternada). Mas a ordem fica fixa por cenário em todas as sementes, há instalação por expressão, n = 1 efeito em QP2 e nenhum cenário que separe instalação de uso. |
| Rigor estatístico | 2 | Bootstrap e R² estão presentes, mas os intervalos não aparecem no artigo, subestimam a variação entre execuções e há uma invocação por semente. A conclusão sobre o R² vem de uma comparação não controlada. |
| Escalabilidade e generalização | 2 | Um caso de uso com expressões de 2 a 15 nós, uma VM, versões fixas de compilador. O texto reconhece isso, mas nenhuma dimensão foi variada para mostrar como os resultados escalam. |

Nível de contribuição: moderado para um TCC. Como artigo de evento, ficaria entre marginal e moderado.

## 7. Perguntas que a banca faria

1. A base `IORef` do Haskell também é código monádico em `IO`, com as mesmas 18 operações. Em que sentido a razão do Haskell mede "mônadas"? O que mudaria com uma base pura ou com `ST`?
2. Por que OCaml 5.2.1 em novembro de 2026, se o 5.3 trouxe sintaxe `effect` para handlers? Quanto do boilerplate de 67 linhas sobreviveria?
3. Por que instalar os três handlers por expressão? Qual seria a razão de tempo com estado e saída instalados uma vez por carga?
4. Na semente 43, a base de Output no Haskell foi 19% mais lenta que nas outras, com intervalo que não se sobrepõe ao delas. Como saber que 20 s de cota bastam? Por que não várias invocações por semente?
5. A corrida de sensibilidade tinha 8 alterações não commitadas e carga média de 0,7. Como separar o efeito da cota do efeito dessas diferenças?
6. Como foi fixada a regra de boilerplate, e antes ou depois de ver as contagens? Por que `continue k` é boilerplate e `discontinue` não?
7. No quarto efeito, por que uma nova camada `StateT [Int]` em vez de um campo no `Env` ou de um `ReaderT` com `IORef`? A contagem de pontos mudaria?
8. O Haskell teve Δ negativo em State e Output (o mecanismo mais rápido que a base). Qual a explicação? O `try` por expressão na base pesa?
9. As QPs perguntam "qual abordagem". Qual é a sua resposta, uma frase por QP?
10. O que você fez pessoalmente, dado que a declaração atribui à IA o código, a campanha e a redação preliminar dos resultados? Explique como o harness do OCaml calcula o intervalo da razão.
11. Como os seus resultados se relacionam com as comparações entre handlers e Lwt em Dolan et al. (2017) e Sivaramakrishnan et al. (2021)?

## 8. Problemas separados por gravidade

### 8.1 Graves (corrigir antes da versão final)

| # | Problema | Onde | Como corrigir |
|---|---|---|---|
| G1 | Versão do modelo impressa como "[PREENCHER]", o que descumpre o Art. 8º. Uso de IA amplo em código, execução e redação, com risco ligado aos Arts. 2º, § 2º, e 9º | Agradecimentos | Preencher a versão. Reexecutar a campanha pelo aluno. Ter clareza sobre a própria participação |
| G2 | As QPs não recebem resposta explícita. QP1 empata por construção. "Cresce com ela" e "pago uma vez" extrapolam um ponto de dados | Seções 1, 6.1, 6.3 e 7 | Responder QP por QP na Seção 7. Retirar as extrapolações. Dizer que a base do Haskell é monádica |
| G3 | Boilerplate dominado pela API do OCaml 5.2, pela assimetria entre handlers escritos à mão e executores do mtl e pelo código só de teste. Regra sem validação | Seção 4.2, Tabela 1, Seção 6.1 | Medir com sintaxe do OCaml 5.3 ou mais recente, separar o código da suíte, fazer o kappa ou rebaixar QP3 a análise qualitativa |
| G4 | Intervalos omitidos e subestimados. Legenda da Tabela 2 inconsistente em duas linhas. Achado sobre o R² não controlado | Seção 6.2, Tabela 2, Seção 7 | Pôr os intervalos na tabela, corrigir a legenda, fazer várias invocações por semente, refazer ou rebaixar a sensibilidade |
| G5 | Instalação por expressão domina a razão do OCaml e não aparece no Resumo. Bases assimétricas no tratamento de erro. Comparação de alocação entre linguagens com grandezas diferentes | Resumo, Seções 4.3 e 6.3 | Cenário com instalação única por carga, qualificar o Resumo, retirar ou qualificar a comparação de excedentes, medir a memória das fibers |

### 8.2 Moderados (importantes, mas não bloqueiam)

- Literatura (W6): incluir Dolan et al. (2017), destacar as comparações com Lwt em Sivaramakrishnan et al. (2021), dar mais espaço a Kiselyov et al. (2013) e Kiselyov e Ishii (2015), citar trabalho crítico sobre métricas de compreensão.
- A semântica formal, apontada como contribuição, não está no artigo ("O domínio e as regras acompanham o repositório"). Determinismo, progresso e terminação são afirmados sem que o leitor veja as regras. Incluir ao menos a tabela de regras (são cerca de 12) ou um apêndice, se o orientador permitir (Art. 4º, § 2º).
- O artigo sobre legibilidade não mostra nenhuma linha de código. O estilo `listings` está definido no preâmbulo e não é usado. Uma listagem lado a lado do braço `Var` e de `run_state` contra `type Interp` ajudaria muito o leitor e a banca.
- O vazamento ao abandonar a continuação é comportamento documentado. Sivaramakrishnan et al. (2021, Seção 6.3.3) explicam que o OCaml não anexa finalizador às continuações por padrão, e o manual pede que toda continuação seja retomada ou encerrada. Chamar isso de "achado não previsto" (Seção 7) superestima a novidade. Melhor apresentar como confirmação quantitativa de um comportamento documentado, com a citação.
- A hipótese do TCC I (handlers abaixo de 1,5 e mônadas acima de 2) só aparece na Discussão. Deveria estar declarada a priori na Seção 4.
- A ordem entre base e mecanismo é fixa por cenário em todas as sementes (código `bench_main.ml`, função `posicao`), o que confunde ordem com cenário. Contrabalançar entre sementes ou invocações.
- O Resumo não traz nenhum resultado de QP1 a QP3 nem uma conclusão, só a faixa de razões de tempo. Ele afirma ainda "functionally equivalent" sem a ressalva de que a equivalência é testada.
- O uso do mtl é com pilha concreta (`type Interp a = ExceptT ...`), não com restrições polimórficas (`MonadState Env m =>`). As duas formas são idiomáticas e diferem bastante em desempenho sem especialização. Dizer qual foi usada e por quê.
- A Seção 4.2 justifica a comparação intralinguagem "pela razão empírica da Seção 6.1", ou seja, o método se apoia num resultado. Mover a contagem preliminar para a metodologia como estudo piloto.

### 8.3 Menores

- 4,7% (Seção 4.3 e README) contra 4,5% (`ambiente.md` e `resumo.md`). O 4,7% é o máximo entre sementes (Exn, semente 43) e o 4,5% é a mediana. Dizer qual é qual ou uniformizar.
- Seção 7: depois de dizer que os regimes da literatura são diferentes, o texto compara mesmo assim ("as obtidas aqui ficam abaixo daquelas desacelerações"). Retirar ou qualificar.
- "23 ns ... da mesma ordem dos 45 ns": os 45 ns valem para três instalações, ou seja, cerca de 15 ns cada, menos que os 23 + 7 ns de criar e liberar uma fiber na fonte. A comparação vale, mas convém explicitar a conta e lembrar que o hardware é outro.
- Citar no texto o commit da campanha (760e800) e arquivar o repositório com DOI (Zenodo, por exemplo), já que o link do GitHub pode mudar. Não verifiquei se o repositório público está acessível.
- Referências: em Gaißert et al. (2025), acrescentar o número do artigo (307) e o DOI 10.1145/3763085. Em Muñoz Barón et al. (2020), falta paginação ou número do artigo. A chave `criterion:08` tem ano 2009 (não aparece no PDF, mas convém alinhar).
- Os objetivos específicos estão em prosa. Uma lista numerada facilita a conferência pela banca.
- A Figura 1 é um fluxo linear simples. O Art. 4º, § 1º, III, pede diagramas e figuras de detalhamento. Uma figura que mostre as quatro versões, os pares de comparação e onde entram oráculo, gerador e harness seria mais informativa.
- Texto muito denso, com períodos longos e frases que começam com "E" ("E essa decisão...", "E o antecedente..."). Algumas passagens exigem releitura, como "É o viés de 1 + ∆/T_base no caso extremo". Um glossário curto ajudaria (harness, boilerplate, base, excedente).
- A abreviação "Boilerpl." e a legenda longa da Tabela 1 poderiam ser simplificadas.
- Seção 4.3: "Exn inclui 20% de divisões por zero". No gerador, são exatamente as posições i mod 5 = 4, não um sorteio. Vale dizer.
- Seção 2.2: o texto chama de "decisão semântica" descartar a continuação, mas a regra de boilerplate trata retomar como infraestrutura. Alinhar o discurso.

## 9. Conferência dos números contra os dados

Conferi 85 números do artigo contra `codigo/resultados/` e contra execuções minhas numa cópia do repositório. O repositório original não foi alterado: `git status` ficou limpo.

| Grupo | Quantos | Fonte | Resultado |
|---|:---:|---|---|
| Tabela 1 (24 células) | 24 | `metricas-codigo.md`, `pontos-modificacao.md` e nova execução de `scripts/metricas.py tabela` | Todas batem. As 18 células de QP1 e QP3 foram reproduzidas por mim |
| Tabela 2 (48 células: base, Δ e razão em tempo e alocação) | 48 | `campanha-20261110-005710/resumo.md` e `brutos/*.csv` | Todos os valores batem com o resumo. A legenda (razão = 1 + Δ/base) não reproduz Haskell Arith (1,10 contra 1,08) nem Haskell Output (0,95 contra 0,97) |
| R² mínimo (0,954 e 0,973), dispersão de 18,3% e de menos de 0,1%, um par refeito | 5 | `resumo.md`, `ambiente.md` | Batem |
| Afirmações sobre os intervalos (nenhum inclui 1 no OCaml, só Arith exclui 1 no Haskell) | 2 | `resumo.md` | Batem |
| Deslocamento de até 28% na sensibilidade | 1 | `sensibilidade/brutos` contra `brutos/ocaml-42.csv` | Bate (2,44 contra 1,91), mas a corrida não é controlada (W4) |
| Viés de 4,7% da regressão de alocação | 1 | `resumo.md` e `ambiente.md` | Diverge: o registro diz 4,5% (mediana). 4,7% é o máximo entre sementes |
| 28 casos, 61 verificações, 18 linhas só da suíte, 2 instâncias de reuso | 4 | `conformance.json`, `boilerplate-regra/handlers.csv` e nova execução do oráculo OCaml (61/61) e da semântica (28/28) | Batem |
| 1,2 GB contra 6 MB | 2 | Nova execução de `experimento/continuacao.exe` | Bate (1.224.656 kB contra 5.988 kB) |
| Números citados da literatura (1%, 6,7 a 12,3 vezes, 23 ns, razões de 1,0 a 1,3) | 4 | Texto de Sivaramakrishnan et al. (2021) e Figura 2 de Xie e Leijen (2020) | Compatíveis. Em Xie e Leijen, MTL contra Pure dá 1,00 (Counter), 1,09 (Error) e 1,32 (Counter5) |

Afirmações sobre o código conferidas nos fontes: pilha `ExceptT String (StateT Env IO)` com `quot` (confere), `Get` devolvendo `int option` (confere), `discontinue` no handler de exceção (confere), três handlers instalados por expressão em `run` (confere), base Haskell com o mesmo `Map String Int` em `IORef` e `throwIO` (confere), dois `lift` no quarto efeito (confere, `lift (lift (state proxima))`), State com 500 variáveis e prefixo de `Let` (confere), profundidades 3, 3 e 2 em Arith, Exn e Output (confere). Também rodei `atualizar_artigo.py --verificar` e as 19 afirmações marcadas passaram.

Não executei a campanha de tempo, a suíte Haskell, os mutantes nem a medição do quarto efeito.

## 10. Conformidade com o Regulamento

| Item | Exigência | Situação | Observação |
|---|---|:---:|---|
| Art. 3º | Artigo em LaTeX no padrão SBC | Conforme | `sbc-template.sty` e estilo `sbc` |
| Art. 4º | De 10 a 16 páginas | Conforme, no limite | 16 páginas exatas. Corpo até a página 14 e referências nas páginas 14 a 16. Qualquer acréscimo exige cortes |
| Art. 4º, § 1º, I | Introdução com contexto, justificativa, problema, objetivos geral e específicos e organização do texto | Conforme | Objetivos específicos em prosa |
| Art. 4º, § 1º, II | Referencial teórico e revisão de literatura | Conforme | Seções 2 e 3. Lacunas de literatura em W6 |
| Art. 4º, § 1º, III | Metodologia com diagramas e figuras, etapas e ferramentas | Conforme, com ressalva | Figura 1 simples. Ferramentas citadas (Criterion, Bechamel, ormolu, ocamlformat) |
| Art. 4º, § 1º, IV | Resultados comentados e analisados | Conforme | Seções 6.1 a 6.3 |
| Art. 4º, § 1º, V | Conclusões e trabalhos futuros | Conforme | Seção 7 |
| Art. 4º, § 1º, VI | No mínimo 10 referências | Conforme | 33 referências, das quais cerca de 27 científicas e 6 de ferramentas, manual ou TCC I |
| Art. 5º, § 3º | Produto descrito de modo reproduzível | Conforme | Ponto forte do trabalho (S1) |
| Art. 5º, § 3º | Resultados em gráficos, figuras ou tabelas | Conforme | Tabelas 1 e 2. Não há gráficos no artigo |
| Art. 5º, § 3º | Conclusões com contribuições, resultados frente à literatura e caminhos futuros | Conforme | Seção 7 tem os três |
| 4º PC do TCC II | Resumo em português e Introdução com síntese do que foi feito e principais resultados | Conforme, com ressalva | O Resumo não traz resultados de QP1 a QP3 nem conclusão |
| Art. 6º | Uso de IA permitido se declarado | Conforme | Declaração presente |
| Art. 7º, I | Ferramenta utilizada | Conforme | Claude, Anthropic |
| Art. 7º, II | Finalidade do uso | Conforme | Revisão, edição, redação preliminar, geração de código, execução da campanha |
| Art. 7º, III | Seções em que a IA contribuiu | Conforme | Síntese da Seção 1 e Seções 5.3, 6 e 7, além de todas as seções na revisão |
| Art. 8º | Nome, versão e fornecedor | Não conforme | "versão [PREENCHER]" aparece impresso no PDF |
| Art. 9º | Responsabilidade integral do aluno | Conforme no texto | A frase final assume a responsabilidade. Na prática, ver W1 |
| Art. 10 | Vedação de fabricação de dados | Sem indício de problema | Os números rastreiam até os dados brutos |
| Art. 2º, § 2º | O aluno deve realizar o trabalho prático | Risco | A declaração atribui à IA o código e a execução da campanha. Recomendo reexecução pelo aluno e preparo para a arguição |

## 11. Posição na literatura

O trabalho se situa entre três linhas: fundamentos (Moggi, Plotkin e Power, Plotkin e Pretnar), relação formal (Forster et al. 2017, Schrijvers et al. 2019) e custo de implementação (Kammar et al. 2013, Xie e Leijen 2020, Sivaramakrishnan et al. 2021, Karachalias et al. 2021, Gaißert et al. 2025). As citações que conferi são usadas corretamente. Os números atribuídos a Sivaramakrishnan et al. (1% de sobrecusto sem efeitos, 23 ns para criar e trocar de fiber) e a faixa de 1,0 a 1,3 entre MTL e versão pura em Xie e Leijen (Figura 2: 1,00, 1,09 e 1,32) estão corretos.

Sobre a lacuna da Seção 3.2: a minha busca não encontrou trabalho que compare handlers e transformadores de mônadas sobre um mesmo programa integrado, em escrita e em execução ao mesmo tempo. A literatura de desempenho usa microbenchmarks (Counter, Counter5, Error, Pythagorean triples, de Kiselyov e Ishii, 2015), e a de expressividade é formal (traduzibilidade), não de produtividade. Achei também comparações informais, como repositórios de seminário que implementam um interpretador em Haskell, Idris e Koka e julgam a ergonomia sem medir. A afirmação de lacuna, portanto, se sustenta no sentido estreito. Dois cuidados:

1. Há comparações diretas entre handlers e código monádico no mesmo programa e na mesma linguagem, com desempenho e discussão de estilo, que o texto não reconhece como tais: Dolan et al. (2017) e Sivaramakrishnan et al. (2021), ambos com OCaml e Lwt. Elas tratam de concorrência e não de transformadores, mas são o antecedente mais próximo do "mesmo programa, duas formas" no próprio OCaml.
2. O próprio trabalho também não compara handlers e transformadores sobre o mesmo programa de forma direta. Compara cada um com a sua base e confronta as razões só de forma exploratória. A lacuna é então só parcialmente preenchida, e o texto deveria dizer isso na Seção 7.

Trabalhos que a banca pode sentir falta: Dolan et al. (2017), Kiselyov e Sivaramakrishnan ("Eff directly in OCaml", 2016/2018), Wu e Schrijvers ("Fusion for free", 2015) para a família fused-effects, o repositório de benchmarks poliglotas `effect-handlers-bench` (Tübingen) e, para QP1, Scalabrino et al. (2017) sobre os limites das métricas estruturais. As entradas `bauer:15` (Bauer e Pretnar, 2015) e `hughes:89` estão no `.bib` mas não são citadas. Bauer e Pretnar caberia bem na Seção 2.2.

Fontes consultadas na busca:
- [Retrofitting Effect Handlers onto OCaml (arXiv)](https://arxiv.org/pdf/2104.00250)
- [Effect Handlers in Haskell, Evidently (PDF, Microsoft Research)](https://microsoft.com/en-us/research/uploads/prod/2020/07/effev.pdf)
- [On the Expressive Power of User-Defined Effects (arXiv)](https://arxiv.org/pdf/1610.09161)
- [Release of OCaml 5.3.0 (ocaml.org)](https://ocaml.org/changelog/2025-01-08-ocaml-530)
- [OCaml 5.3.0 released (discuss.ocaml.org)](https://discuss.ocaml.org/t/ocaml-5-3-0-released/15916)
- [Concurrent System Programming with Effect Handlers (Springer, TFP 2017)](https://rd.springer.com/chapter/10.1007/978-3-319-89719-6_6)
- [Concurrent system programming with effect handlers (repositório de Cambridge)](https://www.repository.cam.ac.uk/handle/1810/283239?show=full)
- [effect-handlers-bench (GitHub)](https://github.com/se-tuebingen/effect-handlers-bench)
- [effect-bench (GitHub, daanx)](https://github.com/daanx/effect-bench)
- [Handlers in Action (Kammar, Lindley, Oury)](https://www.cs.ox.ac.uk/people/ohad.kammar/publications/kammar-lindley-oury-handlers-in-action.pdf)
- [AlgEff: interpretador em Haskell, Idris e Koka (GitHub)](https://github.com/wkolowski/AlgEff)
- [Tracing Just-in-time Compilation for Effects and Handlers (Tübingen)](https://pl.cs.uni-tuebingen.de/publications/gaissert2025tracing/)
- [Interpretando Efeitos Algébricos por Meio de Mônadas (SOL/SBC)](https://sol.sbc.org.br/index.php/sblp/article/view/36946)
- [Performance of the new effects in comparison to monads (discuss.ocaml.org)](https://discuss.ocaml.org/t/performance-of-the-new-effects-in-comparison-to-monads/10744)

## 12. Recomendação

**Avaliação geral:** aceitar com correções obrigatórias. Na escala da skill, "Weak Accept". Como TCC II, o trabalho tem pesquisa real, método explícito, implementação, medição rastreável e análise crítica, e atende ao Regulamento, exceto pelo Art. 8º. As correções de G1 a G5 são viáveis no prazo de 48 horas pós-banca, desde que se aceite rebaixar afirmações quando não houver tempo de remedir: por exemplo, apresentar QP3 como análise qualitativa e retirar o achado sobre o R².

**Confiança:** média para alta. Li o artigo inteiro, conferi 85 números contra os dados brutos, reproduzi a Tabela 1, o oráculo OCaml, a semântica de referência e o experimento de vazamento, e li as quatro implementações e os harnesses. Não reexecutei a campanha de tempo nem a suíte Haskell. A estimativa de quanto o boilerplate cairia com a sintaxe do OCaml 5.3 é minha e não foi medida. Não verifiquei se o repositório público no GitHub está acessível.

**Nível de contribuição:** moderado (para um TCC).

### Sugestões práticas, em ordem de custo e benefício

1. Preencher a versão do modelo nos Agradecimentos e, se possível, reexecutar a campanha pelo próprio aluno (`make tudo`).
2. Pôr os intervalos de 95% na Tabela 2 e corrigir a legenda ("razão: mediana das razões por semente").
3. Acrescentar à Seção 7 uma resposta explícita a cada QP e retirar "cresce com ela" e a comparação de excedentes de alocação entre linguagens.
4. Dizer no Resumo que a razão do OCaml reflete três handlers instalados por expressão curta e acrescentar ao Resumo uma frase sobre QP1 a QP3.
5. Medir um cenário com estado e saída instalados uma vez por carga. É uma mudança pequena no harness e responde à pergunta mais óbvia da banca.
6. Remedir o boilerplate com a sintaxe `effect` do OCaml 5.3 ou mais recente, ou justificar o 5.2.1 e discutir o efeito da versão. Reportar a contagem sem o código exclusivo da suíte.
7. Fazer várias invocações por semente com ordem contrabalançada, e refazer a corrida de sensibilidade com tudo igual exceto cota e amostras. Se não houver tempo, rebaixar o "achado" do R² a observação.
8. Incluir Dolan et al. (2017) e as comparações com Lwt de Sivaramakrishnan et al. (2021) na Seção 3 e reformular a lacuna.
9. Incluir uma listagem curta de código e a tabela de regras da semântica, compensando o espaço com cortes na Seção 3.1 e no texto denso da Seção 4.3.
10. Reapresentar o vazamento de `discontinue` como confirmação de comportamento documentado, com citação.
