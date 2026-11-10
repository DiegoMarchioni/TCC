# Guia de defesa — Parte 6: Roteiro falado

*Escrito em 10/11/2026 para a apresentação de 16 slides (Guia 05).* Este é o
texto do que dizer, slide a slide, para os 20 minutos de apresentação, mais as
respostas para os 20 minutos de arguição. O mesmo texto está nas **notas do
apresentador** de cada slide da apresentação, para você ler no modo de
apresentação do PowerPoint ou no Present da própria página.

## Como usar este roteiro

1. **Leia em voz alta uma vez, com cronômetro.** O texto tem cerca de 2.160
   palavras: uns 17 minutos e meio de fala a 125 palavras por minuto. Os
   2 minutos restantes da tabela ficam para pausas, apontamentos na tela e
   transições. Se passar de 20 minutos, corte nas frases marcadas como
   **[opcional]** e encurte as respostas que você improvisar.
2. **Reescreva com as suas palavras o que não soar como você.** O orientador
   já marcou “I.A.?” no resumo; na fala, isso pesa mais. Mantenha os números
   e as frases-âncora; o resto pode e deve virar o seu jeito de falar.
3. **Não leia no dia.** Ensaie até precisar só da **frase-âncora** de cada
   slide (a primeira linha de cada bloco abaixo). Quem lê perde a banca; quem
   fala a partir de âncoras parece, e está, dominando o assunto.
4. **Respeite o relógio.** A coluna “acumulado” diz onde você deve estar ao
   terminar cada slide. Se atrasar mais de 30 s, encurte o slide seguinte.

| # | Slide | Tempo | Acumulado | Palavras |
|---|---|---:|---:|---:|
| 1 | Capa | 0:20 | 0:20 | 46 |
| 2 | Dois mecanismos para efeitos | 1:20 | 1:40 | 166 |
| 3 | Comparação por razões intralinguagem | 1:30 | 3:10 | 179 |
| 4 | Questões de pesquisa | 1:20 | 4:30 | 142 |
| 5 | Um interpretador com três efeitos | 1:20 | 5:50 | 144 |
| 6 | Quatro versões e a verificação | 1:30 | 7:20 | 160 |
| 7 | O mesmo braço de eval | 1:10 | 8:30 | 123 |
| 8 | Legibilidade de eval | 0:50 | 9:20 | 80 |
| 9 | Composabilidade e boilerplate | 1:40 | 11:00 | 188 |
| 10 | Destaque: 45 ns | 0:40 | 11:40 | 64 |
| 11 | Custo de tempo por expressão | 1:40 | 13:20 | 189 |
| 12 | Alocação por expressão | 1:20 | 14:40 | 141 |
| 13 | Achados não previstos | 1:40 | 16:20 | 162 |
| 14 | Frente à literatura e ao TCC I | 1:20 | 17:40 | 169 |
| 15 | Conclusões e trabalhos futuros | 1:40 | 19:20 | 187 |
| 16 | Obrigado | 0:10 | 19:30 | 23 |

---

## O que dizer, slide a slide

### Slide 1 — Capa (0:20 · acumulado 0:20)

**Âncora:** comparei mônadas e efeitos algébricos no mesmo programa, em quatro
dimensões.

> Bom dia. Eu sou o Diego Marchioni, e este é o meu trabalho de conclusão de
> curso, orientado pelo professor Marco Rodrigo. Eu comparei duas formas de
> lidar com efeitos em linguagens funcionais, as mônadas e os efeitos
> algébricos, no mesmo programa e em quatro dimensões.

*Olhe para a câmera, não para a tela. Fale devagar: é o momento em que a banca
forma a primeira impressão.*

### Slide 2 — Dois mecanismos para efeitos (1:20 · 1:40)

**Âncora:** a teoria diz que os dois expressam o mesmo; ninguém mediu quanto
custam para escrever e para executar.

> Todo programa real precisa de efeitos: guardar estado, lançar uma exceção,
> escrever uma saída. Numa linguagem funcional, isso exige um mecanismo
> próprio, e hoje existem dois em uso.
>
> O primeiro são as mônadas, que no Haskell se combinam por meio de
> transformadores. À esquerda está a pilha que eu usei: ExceptT sobre StateT
> sobre IO. O efeito fica no tipo, e a ordem das camadas é decidida em tempo
> de compilação.
>
> O segundo são os efeitos algébricos com handlers, que o OCaml suporta
> nativamente desde a versão 5, de 2022. O código só declara a operação, como
> esse perform Get x, e quem decide o que ela faz é o handler instalado em
> volta.
>
> A teoria já mostrou que, para efeitos como estes, os dois mecanismos têm o
> mesmo poder expressivo. Mas falta a pergunta prática: quanto custa escrever
> com cada um, e quanto custa executar? Eu não encontrei nenhum estudo que
> medisse as duas coisas no mesmo programa. É essa lacuna que o trabalho cobre.

*Aponte o código laranja ao falar da pilha e o azul ao falar do perform.*

### Slide 3 — Comparação por razões intralinguagem (1:30 · 3:10)

**Âncora:** cada mecanismo contra uma base na própria linguagem; razão = 1 + Δ
sobre a base.

> Então, como comparar de forma justa? O primeiro obstáculo é que o mecanismo
> não se separa da linguagem. As mônadas rodam no GHC; os handlers, no OCaml.
> Se eu comparasse os tempos diretamente, estaria comparando compiladores,
> coletores de lixo e mecanismos ao mesmo tempo, sem conseguir separar um do
> outro.
>
> A solução foi medir cada mecanismo contra uma base imperativa na própria
> linguagem. No OCaml, os handlers contra uma versão com tabela hash e
> exceções nativas. No Haskell, as mônadas contra uma versão com IORef que usa
> o mesmo Map, para que a diferença seja o mecanismo, e não a estrutura de
> dados. Cada linguagem me dá uma razão, e só no fim as duas razões são
> confrontadas.
>
> Esse confronto exige um cuidado, que está nesta fórmula: a razão vale um
> mais delta sobre a base. Delta é o custo a mais do mecanismo. Com o mesmo
> delta, uma base mais cara dá uma razão menor. Por isso eu reporto também os
> valores absolutos e trato a comparação entre as linguagens como
> exploratória. Essa fórmula vai voltar nos resultados.

*Pause meio segundo antes de “esta fórmula” e aponte para ela. É a ideia que
amarra a discussão dos slides 11 e 12.*

### Slide 4 — Questões de pesquisa (1:20 · 4:30)

**Âncora:** quatro questões; código só se compara dentro da mesma linguagem.

> Com esse desenho, eu formulei quatro questões de pesquisa.
>
> A QP1 é legibilidade. Eu meço três proxies estruturais sobre a função eval:
> linhas de código, operações de efeito e profundidade de aninhamento. São
> proxies; a legibilidade percebida exigiria um estudo com pessoas.
>
> A QP2 é composabilidade: quantas declarações existentes precisam mudar para
> inserir um quarto efeito. Eu fixei essa definição antes de implementar,
> para que ela não favorecesse nenhum dos lados.
>
> A QP3 é poder de abstração: quanto boilerplate existe fora de eval,
> classificado por uma regra mecânica, e quantas vezes um handler ou uma
> camada é reutilizado.
>
> E a QP4 é desempenho: tempo e memória alocada, sempre contra a base, em
> quatro cenários e com três sementes.
>
> Uma regra vale para todas as métricas de código: eu só comparo versões da
> mesma linguagem, porque cada linguagem tem o seu próprio idioma.

### Slide 5 — Um interpretador com três efeitos (1:20 · 5:50)

**Âncora:** semântica formal primeiro; equivalência é mesmo valor, estado,
traço e erro.

> O caso de uso é um interpretador para uma linguagem de expressões pequena,
> com estes oito construtores. Ele combina os três efeitos clássicos. Estado:
> Var lê e Let vincula variáveis, num ambiente global. Exceção: divisão por
> zero e variável não vinculada abortam a expressão. E saída: Print emite
> valores num traço.
>
> Antes de escrever qualquer implementação, eu fixei uma semântica formal, de
> passos pequenos, com avaliação da esquerda para a direita. Dela sai o
> critério de equivalência: duas implementações são equivalentes se produzem o
> mesmo valor, o mesmo estado final, o mesmo traço e a mesma mensagem de erro.
> Assim, as quatro versões são conferidas contra uma referência formal, e não
> umas contra as outras, o que deixaria passar um erro comum a duas delas.
>
> As simplificações estão assumidas desde o início: ambiente global, exceção
> que só aborta e um único caso de uso.

### Slide 6 — Quatro versões e a verificação (1:30 · 7:20)

**Âncora:** 61 de 61, 8 de 8, 12 hashes: nada é medido antes de provar
equivalência.

> Com isso, eu implementei quatro versões: no OCaml, a versão com handlers e a
> base imperativa; no Haskell, a versão monádica e a base com IORef.
>
> Nenhuma medição roda antes de a equivalência ser verificada, e três números
> resumem essa verificação.
>
> Sessenta e uma verificações de oráculo em cada linguagem, todas passando:
> vinte e oito casos para cada uma das duas versões, mais cinco de
> conformidade entre as linguagens.
>
> Oito de oito mutações detectadas: eu desfiz de propósito cada decisão
> delicada, como trocar quot por div, inverter a ordem de avaliação ou
> inverter a pilha monádica, e a suíte acusou todas.
>
> E doze cargas com hash idêntico em OCaml, em Haskell e numa terceira réplica
> em Python: as duas linguagens avaliam exatamente as mesmas expressões.
>
> O código foi gerado com apoio de IA, como está declarado no artigo, e
> revisado por mim. É justamente esse aparato de verificação que permite
> confiar nele, e ele roda inteiro com um único comando.

*A última frase é recomendada: o Regulamento exige a declaração no artigo
(Arts. 6º a 9º), a banca vai lê-la, e dizê-la você mesmo, ligada à
verificação, transforma uma possível desconfiança num ponto forte.*

### Slide 7 — O mesmo braço de eval, com e sem handlers (1:10 · 8:30)

**Âncora:** cada operação direta virou exatamente uma operação de efeito.

> Para mostrar o que isso significa no código, este é o mesmo trecho da
> função eval, o da variável, nas duas versões em OCaml.
>
> À esquerda, com handlers: o avaliador faz perform Get x e, se a variável não
> existe, perform Fail. À direita, a base: Hashtbl.find_opt e raise.
>
> A estrutura é idêntica, linha por linha. Cada operação direta da base virou
> exatamente uma operação de efeito. Isso foi proposital: as versões foram
> escritas como espelho uma da outra, para que a diferença medida fosse só o
> mecanismo.
>
> **[opcional]** Um detalhe mostra o cuidado: o Get devolve um option, e quem
> decide que variável inexistente é erro é o avaliador, não o handler. Assim,
> o handler de estado não precisa saber nada sobre erros.

*Passe o cursor pelas partes em destaque enquanto fala delas.*

### Slide 8 — Legibilidade de eval (0:50 · 9:20)

**Âncora:** o eval empata; o mecanismo não pesa na leitura do avaliador.

> Os números confirmam o que o código mostra. No OCaml, a versão com handlers
> e a imperativa têm o mesmo eval: vinte e nove linhas, cinco operações de
> efeito e aninhamento dois. No Haskell, mônadas e IORef também empatam: vinte
> e sete, dezoito e um. E o empate vale construtor por construtor.
>
> Então, a resposta à QP1: pelos três proxies, o mecanismo não pesa na leitura
> do avaliador. Se há diferença no custo de escrita, ela está em outro lugar.

### Slide 9 — Composabilidade e boilerplate (1:40 · 11:00)

**Âncora:** o custo de escrita está na infraestrutura; para o quarto efeito,
só os mecanismos mudaram declarações.

> Esse outro lugar é a infraestrutura em volta do avaliador.
>
> No OCaml, a versão com handlers tem sessenta e sete linhas de boilerplate,
> contra três da base: são os registros do match_with, os casos que repassam
> operações ao handler de fora, as retomadas e as composições. Dezoito dessas
> linhas existem só para a suíte de oráculo. No Haskell, quase tudo fora de
> eval é cabeçalho e importação, igual nas duas versões, e a mônada fica até
> um pouco abaixo da base: vinte contra vinte e duas.
>
> Na composabilidade, o resultado contrariou a minha intuição. Para inserir o
> quarto efeito, só os mecanismos precisaram mudar declarações existentes:
> dois pontos em cada. Nos handlers, as duas composições que os instalam. Nas
> mônadas, o tipo da pilha, que ganhou uma camada StateT, e o executor; e a
> leitura ainda exigiu dois lift explícitos, porque o mtl só alcança uma
> camada de estado por pilha. As bases só ganharam uma função nova, porque
> nelas o efeito é ambiente.
>
> A contrapartida aparece na reutilização: só os handlers têm, duas
> instâncias. É o que permite trocar a interpretação da saída sem tocar no
> avaliador.

### Slide 10 — Destaque: 45 ns (0:40 · 11:40)

**Âncora:** 45 ns só para instalar três handlers, sem nenhum efeito.

> Agora, o desempenho. Começo pelo número que eu considero o mais limpo do
> trabalho.
>
> No cenário Arith, as expressões não fazem nenhuma operação de efeito. Mesmo
> assim, no OCaml, a versão com handlers gasta quarenta e cinco nanossegundos
> a mais por expressão. Esse é o custo só de instalar os três handlers. No
> Haskell, o maior excedente do experimento inteiro foi de dez nanossegundos.

*Fale este slide mais devagar que os outros e deixe uma pausa depois de
“quarenta e cinco nanossegundos”. É o número que você quer que a banca leve.*

### Slide 11 — Custo de tempo por expressão (1:40 · 13:20)

**Âncora:** no OCaml, custo fixo por instalação e por operação; no Haskell,
quase apagado pelo compilador.

> Este é o quadro completo, em nanossegundos a mais por expressão, sempre
> sobre a base da mesma linguagem. As medições rodaram numa máquina virtual na
> nuvem, como está declarado no artigo, com afinidade fixa e três sementes; o
> protocolo completo está no apêndice.
>
> Em azul, o OCaml. Arith, quarenta e cinco: a instalação. Exn, quarenta e
> nove: quase o mesmo, porque os erros somam pouco ao custo de instalar.
> State, oitenta e quatro, e Output, cento e onze: aqui as operações de efeito
> se somam à instalação.
>
> Em laranja, o Haskell: dez nanossegundos no máximo, e em State e Output a
> diferença fica até levemente negativa, dentro do ruído. Três dos quatro
> intervalos de confiança incluem o um.
>
> Em razão, isso dá de 1,59 a 4,26 no OCaml e de 0,97 a 1,08 no Haskell. Mas,
> pela fórmula do início, eu não leio isso como “qual mecanismo é mais
> rápido”, porque as bases e os compiladores diferem. O que os dados sustentam
> é a forma do custo: no OCaml, um custo fixo por instalação e por operação;
> no Haskell, um custo proporcional às vinculações, que o compilador quase
> apaga.

*Percorra as barras azuis de cima para baixo e depois as laranja. Se você
refizer a campanha no seu computador, troque a segunda frase por: “Eu medi no
meu computador, com afinidade fixa num núcleo e três sementes; o protocolo
completo está no apêndice.”*

### Slide 12 — Alocação por expressão (1:20 · 14:40)

**Âncora:** a razão de alocação mede a base: excedentes parecidos, bases
diferentes.

> Na memória alocada aparece a armadilha da fórmula. Em Arith, a razão do
> OCaml é doze, e a do Haskell, 2,2. Parece uma diferença de uma ordem de
> grandeza.
>
> Mas olhem as barras. O excedente, em bytes por expressão, é parecido: cento
> e sessenta e oito no OCaml e cento e cinquenta no Haskell. A diferença está
> na base. A imperativa do OCaml aloca quinze bytes por expressão,
> praticamente só o resultado; a do Haskell aloca cento e vinte e sete. Uma
> base que quase não aloca torna enorme qualquer razão: é o um mais delta
> sobre a base na sua forma mais aguda.
>
> E uma ressalva honesta: os segmentos de pilha das fibers do OCaml são
> alocados fora do heap e, por isso, ficam fora desta medida. É justamente
> fora dela que está o primeiro achado que eu não esperava.

*Aponte o pequeno trecho cinza da barra do OCaml ao dizer “quinze bytes”.*

### Slide 13 — Achados não previstos (1:40 · 16:20)

**Âncora:** continuação abandonada vaza 1,2 GB; R² bom não garante a
estimativa.

> No OCaml 5.2, a forma mais simples de implementar exceção com handlers, que
> é só não retomar a continuação, vaza memória. Cada continuação abandonada
> segura o seu segmento de pilha. Num experimento com dois milhões de erros, a
> memória residente chegou a 1,2 gigabyte; encerrando a continuação com
> discontinue, ficou em seis megabytes. Nenhuma métrica de alocação do
> benchmark enxerga isso. O meu código usa discontinue, e o experimento está
> no repositório para quem quiser reproduzir.
>
> O segundo achado é sobre a própria medição. Eu repeti as medições com uma
> configuração mais curta, com cota de cinco segundos em vez de vinte. Todos
> os R² continuaram acima de 0,95, que é o critério usual para aceitar uma
> medição. E, mesmo assim, as razões se deslocaram em até vinte e oito por
> cento. Ou seja: um R² bom não garante uma estimativa estável. A
> configuração de amostragem é, ela mesma, uma ameaça à validade, e isso só
> apareceu porque eu fiz o teste.

### Slide 14 — Frente à literatura e ao TCC I (1:20 · 17:40)

**Âncora:** mesma ordem de grandeza da literatura; a hipótese do TCC I se
inverteu.

> Comparando com a literatura, com o cuidado de que cada fonte mede um regime
> diferente.
>
> O artigo que introduziu os handlers no OCaml reporta cerca de vinte e três
> nanossegundos para alocar uma fiber e trocar de pilha. Os meus quarenta e
> cinco nanossegundos, para três handlers, estão na mesma ordem de grandeza. O
> mesmo artigo reporta desacelerações de 6,7 a 12,3 vezes em recursão sob
> handler; num caso de uso integrado, as minhas razões ficaram abaixo disso.
>
> No Haskell, Kammar e Xie encontram de 1,0 a 1,3 para mônadas contra uma
> versão pura. As minhas razões ficaram no limite inferior dessa faixa ou
> abaixo dele, o que é coerente com uma base que não é pura: ela também paga o
> custo do IO.
>
> E a última linha é a que mais me ensinou. No TCC I, eu previ handlers
> abaixo de 1,5 vez e mônadas acima de duas vezes. Os dados contrariaram as
> duas metades: a minha intuição sobre os dois mecanismos estava invertida
> neste caso de uso.

*Diga a última frase com tranquilidade, sem tom de desculpa. Uma previsão
refutada é resultado, e o orientador conhece essa previsão.*

### Slide 15 — Conclusões e trabalhos futuros (1:40 · 19:20)

**Âncora:** escrita, custo na infraestrutura; execução, handlers cobram por
instalação e mônadas quase nada.

> Para concluir, respondendo às questões de pesquisa.
>
> Em escrita, que são as QP1 a QP3, o custo dos mecanismos não está no
> avaliador, que fica idêntico ao da base. Ele está na infraestrutura. Nos
> handlers, concentra-se nas composições: é localizado e pago uma vez. Nas
> mônadas, mora no tipo da pilha e cresce a cada efeito novo.
>
> Em execução, a QP4, os handlers cobram por instalação e por operação, mesmo
> quando não há efeito nenhum. A pilha monádica, otimizada pelo GHC, quase não
> custa.
>
> Para quem precisa escolher, a minha leitura é esta: no OCaml, o custo está
> em instalar handlers, então vale instalá-los em escopos que cubram muito
> trabalho, embora esse regime eu não tenha medido. No Haskell, o preço da
> pilha aparece na hora de evoluí-la, não na de executá-la.
>
> Os limites estão no slide: um caso de uso, uma máquina virtual, versões
> específicas, exceção só abortiva e legibilidade estrutural. E deles saem os
> trabalhos futuros: comparar os dois mecanismos numa mesma linguagem, cobrir
> efeitos escopados e não determinismo, incluir a segurança de tipos de
> efeito, como em Koka, e medir a legibilidade com pessoas.

*O parágrafo “Para quem precisa escolher” é a sua opinião fundamentada: é o
que diferencia uma conclusão de um resumo. Diga olhando para a câmera.*

### Slide 16 — Obrigado (0:10 · 19:30)

**Âncora:** obrigado; tudo reproduzível com um comando.

> Obrigado. O código, os dados e o artigo estão no repositório, e um único
> comando refaz cada número. Fico à disposição da banca.

*Deixe este slide aberto durante a arguição. Os apêndices A1 a A5 vêm logo
depois, para responder com números na tela.*

---

## Arguição: como responder

A arguição tem 20 minutos para os três membros, e o orientador fala por último
(Art. 18). Para cada pergunta:

1. **Ouça até o fim**, sem interromper. Se não entendeu, peça para repetir ou
   reformule: “Se entendi, a pergunta é se…”.
2. **Responda em três tempos:** primeiro a resposta, numa frase; depois a
   evidência (um número, um slide, um apêndice); por fim, o limite (“isso vale
   para este caso de uso”). Até um minuto por resposta.
3. **Não sabe?** Diga o que sabe e como verificaria: “Isso eu não medi; o que
   os dados mostram é…; eu verificaria assim…”. Nunca invente um número: o
   apêndice A1 tem todos.
4. **Crítica?** Reconheça o que for justo, diga como o texto trata o ponto e
   anote como sugestão: o 5º PC exige incorporar as sugestões da banca.

Use os apêndices: **A1** (todos os números), **A2** (protocolo), **A3**
(quarto efeito), **A4** (sensibilidade), **A5** (uso de IA).

## Respostas para as perguntas mais prováveis

### Sobre o método

**“Por que razões, e não tempo absoluto?”**
> Porque o mecanismo não se separa da linguagem. Se eu comparasse tempos,
> estaria medindo GHC contra OCaml, e não mônadas contra handlers. A razão
> contra uma base da mesma linguagem tira o fator da linguagem. Mas eu também
> reporto os absolutos, base e delta, porque a razão sozinha engana, como
> mostrei na alocação.

**“Então a comparação entre as linguagens não vale?”**
> Vale como exploratória, e o texto diz isso. O que eu não faço é afirmar que
> um mecanismo é mais rápido que o outro. O que eu sustento é a forma do
> custo: no OCaml, fixo por instalação e por operação, aparecendo até sem
> efeito; no Haskell, proporcional aos binds e quase apagado pelo compilador.

**“Por que não comparar na mesma linguagem, com uma biblioteca de efeitos em
Haskell?”**
> Porque eu quis comparar cada mecanismo como ele é usado em produção:
> handlers nativos, com runtime próprio, no OCaml 5, e a pilha mtl, que é o
> idioma padrão do Haskell. Uma biblioteca de efeitos em Haskell mediria a
> maturidade da biblioteca junto com o mecanismo. Essa comparação dentro de
> uma linguagem é o primeiro trabalho futuro.

**“Por que Map na base do Haskell, e não uma tabela hash?”**
> Para a razão isolar o mecanismo, e não a estrutura de dados: a versão
> monádica usa Map, então a base usa o mesmo Map dentro de um IORef. O preço é
> uma base cara em State, 346 nanossegundos por expressão, que deflaciona a
> razão ali. Por isso eu leio o State do Haskell com cuidado.

**“Por que três handlers por expressão? Isso não infla o custo?”**
> O de exceção precisa ser por expressão; senão, o primeiro erro encerraria a
> carga inteira. Os outros dois poderiam ser por carga, e eu os instalei
> juntos, o que triplica a instalação; está declarado. É exatamente o regime
> que o Arith isola: 45 nanossegundos. Com escopos maiores, esse custo se
> diluiria, mas esse regime eu não medi.

**“Arith é controle no Haskell também?”**
> Não. No OCaml, Arith não tem operação de efeito, então isola a instalação.
> No Haskell, cada vinculação do eval passa pela pilha, então Arith mede o
> custo do bind. O texto faz essa distinção.

**“Um caso de uso e três sementes bastam?”**
> Para generalizar, não, e eu digo isso: n igual a um. As três sementes geram
> cargas diferentes e mostram que o resultado não depende da carga sorteada;
> não são uma amostra de programas. O que o trabalho oferece é um método
> reprodutível, que pode ser aplicado a outros casos de uso.

**“Como garante que o otimizador não eliminou trabalho de um lado só?”**
> As cargas são geradas fora da região medida; o resultado é forçado no
> Haskell e passa por Sys.opaque_identity no OCaml, nas duas versões; e os
> flags são idênticos dentro de cada linguagem, -O3 no OCaml e -O2 no
> Haskell. Além disso, antes de medir, o harness confere que mecanismo e base
> dão a mesma soma, os mesmos erros e o mesmo traço.

**“Por que ambiente global, se a teoria permite escopo léxico?”**
> Foi uma simplificação da linguagem interpretada, não uma imposição da
> teoria. Escopo léxico seria exprimível com as mesmas operações, salvando e
> repondo o vínculo. Mantive global para reduzir variáveis, e isso está nas
> limitações. A suíte tem até um caso que falha se alguém restaurar o escopo,
> para travar a decisão.

### Sobre as métricas

**“LOC, operações e aninhamento medem legibilidade?”**
> Não medem a legibilidade percebida; são proxies estruturais, e eu os chamo
> assim. O aninhamento segue a Cognitive Complexity, que tem validação
> empírica com tempo de compreensão. Medir legibilidade de verdade exige
> estudo com pessoas, que é trabalho futuro.

**“A regra de boilerplate não é arbitrária?”**
> Ela é fixa, publicada e mecânica: uma linha é semântica se contém um
> marcador de efeito, como a operação na tabela ou o resultado de erro; o
> resto é infraestrutura. Cada linha tem o motivo gravado num arquivo, então
> qualquer pessoa pode auditar. Se a banca discordar de uma linha, eu mostro o
> marcador. E deixei pronta a validação humana, com kappa, se quiserem fazer.

**“A definição de ponto de modificação não favorece as bases?”**
> Ela foi fixada antes da implementação. As bases saíram com zero porque nelas
> o efeito é ambiente: um efeito novo é uma referência nova. Nos mecanismos,
> o efeito precisa ser instalado, e o lugar da instalação já existe. É
> estrutural, não um artefato da definição.

**“Por que as operações de efeito são contadas de forma diferente nas duas
linguagens?”**
> Porque o sequenciamento é explícito no Haskell, onde cada bind conta, e
> implícito no OCaml. Por isso eu nunca comparo essa contagem entre
> linguagens, só dentro de cada uma.

### Sobre os resultados

**“Output deu 4,26 no OCaml: saída é cara?”**
> A razão é alta porque a base de Output é a mais barata, 34 nanossegundos,
> com árvores menores. Em valor absoluto, Output soma 111 nanossegundos, dos
> quais uns 45 são a instalação. É mais um exemplo de por que eu olho o delta,
> e não só a razão.

**“Por que o Haskell quase não tem sobrecusto?”**
> O GHC especializa a pilha concreta, ExceptT sobre StateT sobre IO, e elimina
> boa parte do custo dos binds. O que sobra aparece em Arith, a carga com mais
> vinculações, 10 nanossegundos. E a base também não é pura: ela paga IO, o
> que reduz a diferença.

**“A dispersão de 18% no Haskell Output não compromete?”**
> Ela vem de uma semente em que a base oscilou, 477 microssegundos contra cerca
> de 400 nas outras. Por isso eu uso a mediana, e por isso o intervalo de
> confiança desse cenário inclui o um. Não muda a leitura: no Haskell, a
> diferença está no ruído.

**“Os números valem numa máquina virtual?”**
> As razões são tomadas na mesma sessão, com afinidade fixa num núcleo e a
> ordem entre mecanismo e base alternada, o que atenua o ruído de outros
> usuários da máquina. O texto declara a máquina virtual e recomenda replicar
> em máquina dedicada. E um único comando refaz tudo, inclusive o artigo, que
> é gerado a partir dos dados.

*Se você refizer a campanha no seu computador: “Eu repeti a campanha no meu
computador, e o próprio pipeline conferiu que as afirmações do texto
continuaram valendo.”*

**“Alguma medição ficou abaixo do limiar de R²?”**
> Uma: um par em OCaml, cenário State, semente 43, com R² de 0,949. O
> protocolo manda refazer o par inteiro, e a repetição deu 0,962. O original
> está guardado, com o registro da repetição.

**“Como mediu a alocação, e por que as fibers não aparecem?”**
> No OCaml, conto as palavras do heap menor, convertidas em bytes; no
> Haskell, os bytes que o runtime reporta. As fibers do OCaml são alocadas
> fora do heap do coletor, então não entram nessa coluna. Eu digo isso no
> texto, e foi o que me levou ao experimento do vazamento.

**“O vazamento é um bug do OCaml?”**
> Eu não chamaria de bug. No OCaml 5, a continuação é de uso único e deve ser
> retomada ou encerrada. Se ela é abandonada, o segmento de pilha, que fica
> fora do heap, continua preso. O experimento mede o tamanho do problema: 1,2
> gigabyte contra 6 megabytes. É um cuidado que quem implementa exceção com
> handlers precisa conhecer.

### Sobre o código e a IA

**“Quem escreveu o código? Qual foi o papel da IA?”**
> O código foi gerado com assistência de IA, e isso está declarado no artigo,
> como o Regulamento exige, junto com a execução das medições e a redação
> preliminar dos resultados. O meu papel foi definir o problema e o método,
> revisar, entender e verificar cada decisão. Foi por isso que eu investi
> tanto em verificação: oráculo, mutação e conformidade. Posso explicar
> qualquer parte do código.

*Estude o Guia 04 antes da banca: ele explica cada arquivo e cada decisão. Se
pedirem, abra o código e explique um trecho; é a melhor resposta possível a
essa pergunta.*

**“Como garante que as quatro versões fazem a mesma coisa?”**
> Em quatro camadas: a suíte de oráculo, 61 de 61 em cada linguagem, contra
> resultados derivados da semântica formal; os testes de mutação, oito de
> oito; os hashes das doze cargas, iguais nas três réplicas; e a pré-condição
> dentro do próprio harness, que compara soma, erros e traço antes de medir.

**“A emissão por referência a função é idiomática no mtl?”**
> Não. O idioma mtl seria uma classe, algo como MonadEmit, com duas
> instâncias. Usei a referência para que a suíte observasse a saída sem mudar
> o avaliador nas versões sem handlers. É uma limitação da comparação de QP3,
> e é justamente essa assimetria que mostra o ponto forte dos handlers:
> trocar a interpretação sem preparar nada antes.

**“Por que mtl, e não outra biblioteca?”**
> Porque é o idioma mais usado para combinar efeitos em Haskell. Isso até
> reduz de antemão a vantagem dos handlers em boilerplate, já que o mtl
> elimina os lift na maior parte do código. Outras bibliotecas de efeitos
> entram na comparação dentro do Haskell, no trabalho futuro.

### Perguntas gerais

**“Qual é a principal contribuição?”**
> O desenho que torna a comparação legítima: a equivalência verificada, a
> normalização por razões dentro de cada linguagem e as métricas mecânicas.
> Os resultados vêm daí: o avaliador empata, o custo de escrita está na
> infraestrutura e o custo de execução tem formas diferentes nas duas
> linguagens. E há dois achados práticos: o vazamento e o limite do R².

**“O que você faria diferente?”**
> Mediria em máquina dedicada desde o início e incluiria um cenário com
> escopos de handler maiores, para medir a diluição da instalação que hoje eu
> só consigo inferir. E faria a validação humana da regra de boilerplate com o
> orientador.

---

## Como eu avaliaria esta apresentação

Não tenho a ficha de avaliação oficial da banca; o Regulamento diz apenas que
a apresentação é avaliada junto com o artigo. Os critérios abaixo são os que
bancas de computação costumam usar, e é por eles que este roteiro foi
construído.

| Critério | O que a nota máxima exige | Onde o roteiro atende |
|---|---|---|
| Problema e motivação | lacuna clara e relevante, dita cedo | slide 2, em 1 min 40 s |
| Objetivos e perguntas | perguntas explícitas e mensuráveis | slide 4 |
| Rigor do método | ameaças à validade tratadas, e não escondidas | slides 3, 5 e 6 (confundimento, viés da razão, equivalência) |
| Resultados | evidência para cada pergunta, com números | slides 8 a 12 |
| Honestidade | limites, resultados contrários e o que não foi medido | slides 12, 13, 14 e 15 |
| Discussão | confronto com a literatura, com cuidado | slide 14 |
| Conclusões | respostas às perguntas e uma recomendação | slide 15 |
| Tempo | dentro dos 20 minutos, sem correria | 19 min 30 s, com folga |
| Clareza | uma ideia por slide, transições explícitas | âncoras e frases de ligação |
| Domínio na arguição | respostas diretas, com evidência e limite | seção anterior, Guias 01 a 04 |
| Integridade | uso de IA declarado, reprodutibilidade | slide 6, apêndice A5, `make tudo` |

**O que ainda depende de você, e decide a nota:**

- **Falar, e não ler.** Ensaie até precisar só das âncoras.
- **Soar como você.** Reescreva o que não for o seu jeito de falar.
- **Dominar o código.** A pergunta sobre a IA é quase certa; a melhor
  resposta é explicar qualquer trecho que pedirem (Guia 04).
- **Fechar as pendências do artigo:** resumos, versão do modelo, revisão do
  orientador (Guia 05, checklist).

## Plano de ensaio até a banca

| Quando | Ensaio | Objetivo |
|---|---|---|
| Ensaio 1 | lendo este roteiro, com cronômetro | acertar o tempo de cada slide |
| Ensaio 2 | só com as âncoras, em voz alta | falar sem ler |
| Ensaio 3 | gravado, em chamada de vídeo com câmera | ver ritmo, vícios de linguagem e o olhar |
| Ensaio 4 | para o orientador ou colegas, com perguntas | treinar a arguição |
| Véspera | só a abertura e o fechamento, de memória | começar e terminar firme |

**No dia (online, Art. 18, § 1º):** câmera ligada e na altura dos olhos, luz
de frente, fone com microfone; apresentação em PDF aberta em tela cheia e o
PPTX de reserva; notificações desligadas; o repositório aberto numa aba, para
mostrar código se pedirem; água por perto. Entre na sala 10 minutos antes e
teste o compartilhamento de tela.

**Pronúncia, para não tropeçar:** OCaml (ô-cámel), Haskell (rás-kel), handler
(rén-dler), mtl (ême-tê-éle), GHC (gê-agá-cê), ExceptT (except-tê), StateT
(stêit-tê), IORef (ai-ô-ref), fiber (fái-ber), perform (per-fórm), discontinue
(dis-con-tí-niu), boilerplate (bói-ler-pleit).
