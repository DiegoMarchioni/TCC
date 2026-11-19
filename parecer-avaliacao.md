# Parecer: Mônadas e Efeitos Algébricos em Linguagens Funcionais

Avaliação feita com a skill `academic-paper-review` (`.claude/skills/academic-paper-review/`), sobre o artigo compilado em 19/11/2026 (commit `e9b9971`, 16 páginas), usando também o Regulamento de TCC do curso como critério.

> **Limite deste parecer.** Ele foi escrito pelo mesmo assistente de IA que ajudou a produzir o código, a campanha e parte do texto. Um avaliador que participou do trabalho tende a não enxergar os próprios pontos cegos. Use-o como ensaio da banca, e não como substituto da leitura do orientador.

## Correções já aplicadas (commit `c231ce0`)

| Item | O que mudou no artigo |
|---|---|
| F1 | Seção 6.3: "as razões de tempo do OCaml valem para a instalação por expressão" |
| F2 | Seção 6.1: o empate decorre em parte do desenho, que deu às bases a estrutura dos mecanismos |
| F4 | Seção 6.2: o intervalo é conservador, [M_inf/B_sup, M_sup/B_inf], e envolve as três sementes |
| Contribuições | Introdução: incluído o gerador replicado, como nas Conclusões (agora são quatro nos dois lugares) |
| Lacuna | Introdução: "Os estudos existentes" virou "Os estudos revisados", como na Seção 3.2 |
| Páginas | Para continuar em 16, saíram uma frase de status ("estão concluídos…") e parte da abertura da Seção 6.1 |

Continuam com você: os resumos (F3), a versão da IA e os dados do orientador. A citação do effect-handlers-bench ficou de fora, porque o artigo está no limite de páginas.

## Dados do artigo
- **Autores:** Diego Marchioni, com orientação do Prof. Marco Rodrigo (PUC Minas)
- **Tipo:** TCC II, formato SBC
- **Área:** Linguagens de programação (mecanismos de efeitos) e engenharia de software experimental
- **Natureza:** Empírico, com fundamentação teórica (argumento de equivalência expressiva)

## Resumo executivo

O artigo compara mônadas (Haskell, pilha `ExceptT`/`StateT`/`IO` com mtl) e efeitos algébricos (handlers nativos do OCaml 5) em quatro dimensões: legibilidade, composabilidade, poder de abstração e desempenho. Para isso, usa um único caso de uso, um interpretador com estado, exceção e saída. A comparação não é feita entre linguagens: cada mecanismo é medido contra uma base imperativa da própria linguagem, e a comparação entre as duas razões é declarada exploratória. As quatro versões são verificadas contra uma semântica de referência (61/61 em cada linguagem, 8/8 mutantes detectados, cargas idênticas comprovadas por hash).

O ponto mais forte é o desenho experimental. Há um critério de equivalência funcional fixado antes do código, verificação automática e um pipeline que refaz cada número do texto. Os resultados são claros. O avaliador da `eval` empata com a base nas três métricas de legibilidade. O custo de escrita aparece fora dela (67 contra 3 linhas nos handlers, 20 contra 22 nas mônadas). Os dois mecanismos exigem 2 pontos de modificação para um quarto efeito. No OCaml, os handlers custam 45 ns por expressão mesmo sem nenhum efeito (razões de 1,59 a 4,26), enquanto as mônadas ficam perto de zero (0,97 a 1,08). O trabalho também documenta dois achados com valor prático: o vazamento de memória ao abandonar continuações e a insuficiência do R² para validar a configuração de medição.

As fraquezas principais não estão nos dados, mas em escolhas de desenho que a banca vai questionar e que o texto precisa defender melhor. A mais importante é que os três handlers são reinstalados a cada expressão. O resultado principal de desempenho depende dessa escolha, e o artigo não mede a alternativa. Há também uma questão de validade de construto na QP1: a base imperativa foi escrita com a mesma estrutura da versão com handlers, o que torna o empate em parte uma consequência do desenho. Por fim, os resumos não refletem o trabalho, porque não dizem nada sobre QP1 a QP3. Para um TCC, o conjunto está acima do esperado. A recomendação é **aprovar, com revisões menores no texto**.

## Afirmações principais e evidência

| # | Afirmação | Evidência no artigo | Força |
|---|---|---|---|
| 1 | As quatro versões são funcionalmente equivalentes | Suíte de oráculo 61/61 por linguagem, 8/8 mutantes, conformidade por hash (Seções 5 e 5.3) | Forte, com a ressalva de que 28 casos testam o critério universal, mas não o demonstram (o próprio texto diz isso) |
| 2 | O mecanismo não altera a legibilidade da `eval` | Tabela 1: empate 29/5/2 e 27/18/1, também construtor a construtor | Moderada: os *proxies* são estruturais e a base espelha a estrutura do mecanismo (ver F2) |
| 3 | O custo de escrita está na infraestrutura | Tabela 1: 67 contra 3 (OCaml) e 20 contra 22 (Haskell) | Moderada no OCaml (18 das 67 linhas servem só aos testes) e fraca no Haskell (diferença de 2 linhas) |
| 4 | Os mecanismos exigem pontos de modificação e as bases não | Patch do quarto efeito: 2, 0, 2, 0 | Forte para este caso. A definição foi fixada a priori, o que protege contra viés |
| 5 | No OCaml o custo é fixo por instalação e por operação | Arith sem efeitos: 45 ns. State e Output: 84 e 111 ns | Forte como medição. A generalização depende da frequência de instalação (ver F1) |
| 6 | No Haskell o custo fica perto de zero | Razões de 0,97 a 1,08, três de quatro intervalos incluem 1 | Forte |
| 7 | A razão de alocação do OCaml é inflada pela base | 16 B contra 127 B de base, Δ de 168 e 150 B | Forte, bem explicada pela fórmula 1 + Δ/T_base |

## Pontos fortes

### P1: Equivalência verificada antes de medir
**O quê:** critério de equivalência funcional com quatro condições, suíte de oráculo lida pelas duas linguagens a partir de um arquivo neutro, mutação das decisões travadas e hash das cargas (Seções 4.1, 5 e 5.3, Figura 1).
**Por que importa:** é raro um trabalho comparativo provar que as versões comparadas fazem exatamente a mesma coisa. Isso elimina a crítica mais comum a benchmarks entre implementações, a de que se compara código diferente.

### P2: Normalização intralinguagem e controle do Arith
**O quê:** cada mecanismo é dividido pela base da própria linguagem. O cenário Arith, que não realiza nenhum efeito, separa o custo de estar sob o mecanismo do custo de usá-lo (Seções 4.3 e 6.3).
**Por que importa:** transforma a principal ameaça à validade, o confundimento com o *runtime*, em algo explicitamente tratado. A discussão de 1 + Δ/T_base (Seção 6.3) mostra maturidade: impede a leitura ingênua de que "a razão de memória do OCaml é dez vezes pior".

### P3: Reprodutibilidade
**O quê:** código, dados brutos, protocolo e scripts no repositório público. Um comando refaz cada número, e as afirmações do texto são conferidas automaticamente contra os dados.
**Por que importa:** atende com folga ao §3 do Art. 5º do Regulamento ("de maneira que possa ser reproduzido por outros pesquisadores").

### P4: Fundamentação que justifica o que se mede
**O quê:** a Seção 2.3 argumenta que os três efeitos estão na classe em que mônadas e handlers se correspondem (Schrijvers et al., 2019). Logo, só a ergonomia e o custo podem diferir.
**Por que importa:** dá ao trabalho uma pergunta bem posta, em vez de uma comparação genérica.

### P5: Achados não previstos com valor prático
**O quê:** abandonar a continuação vaza o segmento de pilha (1,2 GB contra 6 MB com `discontinue`, Seção 5.2). Uma corrida com todos os R² acima de 0,95 ainda deslocou as razões em até 28% (Seção 6.2).
**Por que importa:** são lições úteis a quem programa com OCaml 5 ou faz benchmarks. Mostram que o autor olhou os dados com atenção, e não só os números finais.

## Fraquezas

### F1 (principal): o resultado de desempenho depende da frequência de instalação dos handlers
**O quê:** os três handlers são reinstalados a cada uma das 10.000 expressões. O texto reconhece que os de estado e de saída poderiam ser instalados uma vez por carga, e que instalar os três juntos "triplica a criação de segmentos de pilha" (Seção 4.3).
**Onde:** Seção 4.3, linhas sobre a instalação por expressão. Seção 6.3, "Com escopos curtos, como os daqui, a instalação domina".
**Por que importa:** os 45 ns e boa parte das razões de 1,59 a 4,26 vêm dessa escolha. A banca pode perguntar se isso representa o uso idiomático. Um programa real costuma instalar os handlers uma vez, em volta de muito trabalho.
**Como resolver:** o ideal seria uma variante com estado e saída instalados uma vez por carga, ficando só o de exceção por expressão. Se não houver tempo ou páginas (o artigo já tem 16), basta uma frase no texto. Ela deve dizer explicitamente que os números de tempo valem para escopos curtos e que a razão tende a 1 conforme o escopo cresce. A conclusão já aponta nessa direção ("no OCaml, cuidado com quantas vezes se instala um handler"), mas pode ser mais direta. **Na defesa:** tenha essa resposta pronta.

### F2: o empate da QP1 é em parte consequência do desenho
**O quê:** a base imperativa foi escrita com "a mesma estrutura do avaliador" da versão com handlers (Seção 5.1), para isolar o mecanismo. Com isso, o empate em LOC, operações e aninhamento era esperado por construção.
**Onde:** Seção 5.1 ("a estrutura do avaliador é a mesma") e Seção 6.1 ("cada operação direta da base deu lugar a exatamente uma operação de efeito").
**Por que importa:** é uma questão de validade de construto. O resultado mostra que o mecanismo **pode** ser usado sem alterar a forma da `eval`, e não que um programador escreveria assim espontaneamente.
**Como resolver:** uma frase na Seção 6.1 ou nas ameaças à validade (4.3) explicando que o empate decorre da escolha de espelhar a estrutura, feita para isolar o mecanismo, e que bases idiomáticas independentes poderiam diferir.

### F3: os resumos não refletem o trabalho
**O quê:** o resumo e o abstract falam só da razão de tempo. Não citam os resultados de QP1 a QP3, a verificação por oráculo nem a memória.
**Onde:** Resumo e Abstract.
**Por que importa:** é a parte mais lida pela banca. Hoje ela sugere um trabalho só de desempenho. Além disso, a declaração de IA afirma que os resumos não tiveram edição da IA, e o orientador anotou "I.A.?" ao lado deles.
**Como resolver:** reescrever com as suas palavras, dentro de 10 linhas, com uma frase por grupo de resultado. Por exemplo: o empate da `eval`, o custo de escrita fora dela, os 2 pontos nos mecanismos e as razões de tempo.

### F4: poder estatístico e generalização limitados
**O quê:** um caso de uso, uma máquina virtual compartilhada, três sementes, mediana de três valores e dispersão entre sementes de até 18,3% no tempo. O texto diz "Nenhum intervalo de 95% da razão de tempo inclui 1 no OCaml", mas não deixa claro se o intervalo é de cada semente (*bootstrap* da regressão) ou do conjunto.
**Onde:** Seções 4.3 e 6.2, Tabela 2.
**Por que importa:** as limitações estão declaradas, o que é correto. Mas a banca pode pedir para explicar a que se refere o intervalo.
**Como resolver:** especificar na Seção 6.2 que o intervalo é o do *bootstrap* de cada medição e indicar a semente usada. Os intervalos das três sementes, ou o pior caso, podem ir no repositório, se não couberem.

### F5: a QP3 tem discriminação baixa
**O quê:** das 67 linhas de infraestrutura dos handlers, 18 existem só para a suíte de testes. O reúso é 2 contra 0, e as 2 instâncias também vêm da composição dos testes. No Haskell, a diferença é de 2 linhas.
**Onde:** Seção 6.1, Tabela 1.
**Por que importa:** o próprio texto reconhece que "essa contagem discrimina pouco". A resposta à QP3 fica apoiada mais na análise qualitativa do que nos números.
**Como resolver:** já está bem tratado no texto. Na defesa, reconheça o limite em vez de defender o número.

## Avaliação da metodologia

| Critério | Nota (1 a 5) | Justificativa |
|---|:---:|---|
| Solidez | 4 | Desenho correto e bem justificado. Perde um ponto pela instalação por expressão sem variante de controle (F1) |
| Originalidade | 3 | A combinação de quatro dimensões sobre um caso integrado e verificado é nova entre os trabalhos revisados. Cada técnica isolada é conhecida |
| Reprodutibilidade | 5 | Código, dados brutos, protocolo e pipeline completo, com verificação automática das afirmações |
| Desenho experimental | 3 | Bases bem escolhidas e oráculo exemplar. As bases espelham o mecanismo (F2) e há um único caso de uso |
| Rigor estatístico | 3 | Regressão com *bootstrap*, critério de R², medianas e alocação determinística. Só três sementes, e o intervalo de confiança precisa ser explicado melhor (F4) |
| Escalabilidade | 2 | O comportamento com escopos maiores é discutido só qualitativamente. Programas maiores e outros efeitos ficam como trabalho futuro, o que é aceitável num TCC |

## Perguntas que a banca deve fazer

1. Por que instalar os três handlers a cada expressão, se dois poderiam ser instalados uma vez por carga? Quanto mudariam os 45 ns?
2. A base imperativa foi escrita para espelhar a versão com handlers. Um programador escreveria a versão imperativa desse jeito? O empate da QP1 não é consequência disso?
3. Por que comparar entre linguagens, e não usar uma biblioteca de efeitos algébricos em Haskell (effectful, polysemy, Xie e Leijen)? *(O texto responde na Seção 4.3: comparar o suporte em produção. Tenha a resposta na ponta da língua.)*
4. Os resultados valem para versões mais novas do OCaml? O 5.2.1 já foi superado.
5. A que se referem os intervalos de 95% citados na Seção 6.2: a uma semente ou às três?
6. O código foi gerado com apoio de IA. Quais decisões foram suas? Você consegue explicar a suíte de oráculo e a ordem da pilha monádica? *(Esta é quase certa, por causa da anotação "I.A.?" do orientador.)*
7. Com um único interpretador, o que dá para generalizar?

## Questões menores

- **Declaração de IA:** "[PREENCHER]" sai impresso no PDF. O Art. 8º exige a versão da ferramenta.
- **Contribuições inconsistentes:** a Introdução lista três contribuições (argumento, critério com a suíte e normalização). As Conclusões dizem "quatro contribuições" e incluem o gerador replicado. Alinhe as duas.
- **Afirmação de lacuna mais forte na Introdução do que na Seção 3.2:** a Introdução diz que "os estudos existentes" não reúnem as quatro dimensões. A Seção 3.2 diz "nenhum dos trabalhos revisados". A segunda formulação é a defensável. Use-a nas duas.
- **Limite de páginas:** o artigo tem exatamente 16 páginas, o máximo. Qualquer acréscimo exige um corte equivalente.
- **Gráficos:** o Regulamento pede resultados em "gráficos, figuras ou tabelas", e tabelas bastam. Um gráfico dos Δ de tempo (como o dos slides) ajudaria a leitura, mas só se couber.
- **Dados do orientador:** confira o nome completo e o e-mail.
- **Compilação:** a contagem de 16 páginas foi feita com uma réplica do modelo SBC. Confira no Overleaf com o modelo oficial.

## Posição na literatura

A revisão cobre bem a fundamentação (Moggi, Wadler, Plotkin e Power, Plotkin e Pretnar), a relação formal (Forster et al., Schrijvers et al.), o custo dos handlers (Sivaramakrishnan et al., Karachalias et al., Gaißert et al.) e as comparações na mesma linguagem (Kammar et al., Xie e Leijen). A busca feita para este parecer não encontrou nenhum estudo que compare handlers do OCaml 5 com transformadores de mônadas do Haskell sobre um mesmo programa nas quatro dimensões. A lacuna declarada na Seção 3.2 se sustenta.

Duas referências próximas não aparecem e podem ser levantadas pela banca:
- **Suítes de benchmark de efeitos entre linguagens**, como o [effect-handlers-bench](https://github.com/se-tuebingen/effect-handlers-bench), que inclui OCaml com handlers ao lado de Koka, Effekt e outras. Elas medem o custo de handlers entre implementações, mas por microbenchmarks e sem as outras dimensões. Citá-las reforçaria a Seção 3.2. Confira se há artigo associado antes de citar.
- **Relatos de migração na indústria**, como o da Jane Street, que trocou mônadas por efeitos algébricos numa biblioteca de testes ([blog da Jane Street](https://blog.janestreet.com/fun-with-algebraic-effects-hardcaml/)). É evidência qualitativa sobre ergonomia, sem números, e por isso é opcional. Serve como motivação de que a decisão "deixou de ser hipotética" (Introdução).

## Conformidade com o Regulamento

| Exigência | Onde no Regulamento | Situação |
|---|---|---|
| LaTeX no padrão SBC | Art. 3º | ✅ (conferir no Overleaf com o modelo oficial) |
| 10 a 16 páginas | Art. 4º | ✅ 16 páginas, no limite |
| Introdução com contexto, justificativa, problema, objetivos gerais e específicos e roteiro | Art. 4º, §1º, I | ✅ |
| Referencial teórico e revisão de literatura | Art. 4º, §1º, II | ✅ Seções 2 e 3 |
| Metodologia com figura e ferramentas citadas | Art. 4º, §1º, III | ✅ Figura 1, Criterion, Bechamel, ormolu, ocamlformat |
| Resultados comentados, em gráficos, figuras ou tabelas | Art. 4º, §1º, IV e Art. 5º, §3º | ✅ Tabelas 1 e 2 |
| Conclusões com contribuições, comparação com a literatura e trabalhos futuros | Art. 5º, §3º | ✅ Seção 7 |
| No mínimo 10 referências | Art. 4º, §1º, VI | ✅ 33 referências |
| Reprodutível por outros pesquisadores | Art. 5º, §3º | ✅ repositório público com pipeline |
| Declaração de IA: ferramenta, finalidade e seções | Art. 7º | ✅ |
| Declaração de IA: nome, versão e fornecedor | Art. 8º | ❌ falta a versão ("[PREENCHER]") |
| Responsabilidade do autor pelo conteúdo | Art. 9º | ⚠️ depende de você revisar os trechos marcados "NOVO" e reescrever os resumos, como a declaração afirma |

## Recomendação

**Avaliação geral:** aprovar com revisões menores no texto.
**Confiança:** média. Conferi os números contra os dados e a literatura por busca, mas este parecer vem de quem participou do trabalho (ver o aviso no início).
**Nível da contribuição:** moderado. É uma contribuição sólida e bem verificada para o nível de TCC, sem pretensão de mudar a área.

### Sugestões práticas, em ordem de prioridade
1. **Reescrever os resumos** com as suas palavras, cobrindo QP1 a QP4 em 10 linhas (F3).
2. **Preencher a versão da IA** e revisar os trechos marcados "NOVO" (Art. 8º e Art. 9º).
3. **Acrescentar uma frase** na Seção 4.3 ou 6.3 limitando o resultado de tempo a escopos curtos de instalação (F1).
4. **Acrescentar uma frase** sobre o empate da QP1 decorrer do espelhamento da estrutura (F2).
5. **Esclarecer** a que se refere o intervalo de 95% na Seção 6.2 (F4).
6. **Alinhar** o número de contribuições e a formulação da lacuna entre a Introdução e as Seções 3.2 e 7.
7. **Opcional:** citar o effect-handlers-bench na Seção 3.2.

Os itens 3 a 6 cabem em poucas linhas. Como o artigo está no limite de 16 páginas, compense cada acréscimo com um corte equivalente.
