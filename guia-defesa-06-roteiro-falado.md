# Guia de defesa, parte 6: Roteiro falado

*Escrito em 10/11/2026 e simplificado em 12/11/2026.* Este é o texto do que
dizer, slide a slide, para os 20 minutos de apresentação, mais as respostas
para os 20 minutos de arguição. O mesmo texto está nas **notas do
apresentador** de cada slide (pasta `apresentacao/`).

**O que mudou na versão simplificada.** O texto evita termos que levariam a
perguntas que não ajudam o trabalho: nomes de tipos e funções (ExceptT,
Hashtbl, match_with, lift), detalhes estatísticos (intervalo de confiança,
cota de medição) e a lista longa de trabalhos futuros. Os números são os
mesmos. Se a banca perguntar por um desses detalhes, a resposta está na
seção da arguição, mais abaixo, e nos apêndices dos slides.

## Como usar este roteiro

1. **Leia em voz alta uma vez, com cronômetro.** O texto tem cerca de
   2.017 palavras: uns 19 minutos e meio de fala, já contando pausas
   curtas. Sobra margem dentro dos 20 minutos; use-a para falar devagar e
   apontar na tela.
2. **Reescreva com as suas palavras o que não soar como você.** O orientador
   já marcou “I.A.?” no resumo; na fala, isso pesa mais. Mantenha os números
   e as frases-âncora; o resto pode e deve virar o seu jeito de falar.
3. **Não leia no dia.** Ensaie até precisar só da **frase-âncora** de cada
   slide. Quem fala a partir de âncoras parece, e está, dominando o assunto.
4. **Só diga o que você explica em uma frase.** Se uma palavra do texto ainda
   for difícil para você, troque-a por uma que você explicaria a um colega.
5. **Respeite o relógio.** A coluna “acumulado” diz onde você deve estar ao
   terminar cada slide.

| # | Slide | Tempo | Acumulado | Palavras |
|---|---|---:|---:|---:|
| 1 | Capa | 0:30 | 0:30 | 45 |
| 2 | Sumário | 0:30 | 1:00 | 41 |
| 3 | Dois mecanismos para efeitos | 1:00 | 2:00 | 109 |
| 4 | Questões de pesquisa | 1:00 | 3:00 | 105 |
| 5 | Os dois mecanismos no código | 1:10 | 4:10 | 124 |
| 6 | Cada mecanismo contra uma base | 1:30 | 5:40 | 165 |
| 7 | Um interpretador com três efeitos | 1:10 | 6:50 | 125 |
| 8 | A função eval | 1:10 | 8:00 | 134 |
| 9 | Quatro versões e a verificação | 1:10 | 9:10 | 125 |
| 10 | O mesmo trecho de eval, com e sem handlers | 0:50 | 10:00 | 81 |
| 11 | Legibilidade de eval | 0:40 | 10:40 | 59 |
| 12 | Composabilidade e infraestrutura | 1:10 | 11:50 | 126 |
| 13 | O quarto efeito no código | 1:00 | 12:50 | 97 |
| 14 | Destaque: 45 ns | 0:40 | 13:30 | 59 |
| 15 | Custo de tempo por expressão | 1:20 | 14:50 | 148 |
| 16 | Memória por expressão | 1:00 | 15:50 | 100 |
| 17 | Achados não previstos | 1:10 | 17:00 | 121 |
| 18 | Frente à literatura e ao TCC I | 1:00 | 18:00 | 104 |
| 19 | Conclusões e trabalhos futuros | 1:10 | 19:10 | 127 |
| 20 | Obrigado | 0:20 | 19:30 | 22 |

---

## O que dizer, slide a slide

### Slide 1: Capa (0:30 · acumulado 0:30)

**Âncora:** comparei mônadas e efeitos algébricos usando o mesmo programa nas duas.

> Bom dia. Eu sou o Diego Marchioni, e este é o meu trabalho de conclusão de curso, orientado pelo professor Marco Rodrigo. Eu comparei duas formas de lidar com efeitos em programação funcional, as mônadas e os efeitos algébricos, usando o mesmo programa nas duas.

*Olhe para a câmera, não para a tela. Fale devagar.*

### Slide 2: Sumário (0:30 · acumulado 1:00)

**Âncora:** a apresentação segue a ordem do artigo.

> Vou seguir esta ordem. Primeiro, o problema e as perguntas que o trabalho responde. Depois, os dois mecanismos, já no código. Em seguida, o método e as implementações, os resultados de cada pergunta e, por fim, a discussão e as conclusões.

### Slide 3: Dois mecanismos para efeitos (1:00 · acumulado 2:00)

**Âncora:** na teoria os dois expressam o mesmo. Falta medir quanto custam na prática.

> Todo programa real precisa de efeitos: guardar um valor, lançar um erro, mostrar uma saída. Em programação funcional, isso exige um mecanismo próprio, e hoje existem dois. As mônadas, que o Haskell usa, e os efeitos algébricos, que o OCaml tem desde a versão 5, de 2022. Daqui a pouco eu mostro os dois no código.
>
> Trabalhos teóricos já mostraram que, para efeitos como estes, os dois mecanismos conseguem expressar as mesmas coisas. O que falta é a parte prática: quanto custa escrever com cada um, e quanto custa executar. Eu não encontrei um estudo que medisse as duas coisas no mesmo programa. É isso que este trabalho faz.

### Slide 4: Questões de pesquisa (1:00 · acumulado 3:00)

**Âncora:** quatro perguntas: legibilidade, composabilidade, abstração e desempenho.

> O trabalho responde a quatro perguntas.
>
> A primeira é legibilidade. Eu meço três coisas na eval, a função principal do interpretador, que eu mostro daqui a pouco: o número de linhas, o número de operações de efeito e o quanto o código é aninhado. São medidas indiretas.
>
> A segunda é composabilidade: quantas partes do código que já existe precisam mudar para acrescentar um quarto efeito.
>
> A terceira é abstração: quanto código de infraestrutura existe fora da eval, e quanto dele é reaproveitado.
>
> A quarta é desempenho: tempo e memória, sempre comparados com a base.
>
> E as métricas de código só comparam versões da mesma linguagem.

### Slide 5: Os dois mecanismos no código (1:10 · acumulado 4:10)

**Âncora:** no Haskell o efeito está no tipo, no OCaml numa operação que o handler interpreta.

> Antes do método, vale ver os dois mecanismos como eles aparecem no meu código.
>
> À esquerda, o Haskell. O tipo Interp é a pilha: uma camada de exceção, sobre uma de estado, sobre IO. Na eval, o caso da variável lê o estado com get e, se a variável não existe, lança o erro com throwError. O efeito está no tipo da função.
>
> À direita, o OCaml. Primeiro eu declaro as operações: Get, Set, Fail e Output. Embaixo está o handler de estado. Quando o código pede Get, ele procura a variável na tabela e retoma a computação com continue, entregando o valor.
>
> A diferença central é esta: no Haskell, quem decide o efeito é o tipo. No OCaml, é quem trata a operação.

*Aponte o tipo Interp ao falar da pilha e a linha do continue ao falar do handler.*

### Slide 6: Cada mecanismo contra uma base (1:30 · acumulado 5:40)

**Âncora:** cada mecanismo contra uma base na mesma linguagem. A razão depende da base.

> Para responder a essas perguntas de forma justa, há um problema: cada mecanismo vive numa linguagem diferente. Se eu comparasse os tempos do Haskell com os do OCaml, estaria comparando também os compiladores, e não só os mecanismos.
>
> Por isso, eu comparo cada mecanismo com uma versão simples na mesma linguagem, que eu chamo de base. No OCaml, a base é imperativa: uma tabela e exceções normais. No Haskell, a base guarda o estado numa variável mutável, o IORef. Em cada linguagem, o mecanismo e a base usam a mesma estrutura de dados, então a diferença é só o mecanismo.
>
> O resultado é uma razão: quanto o mecanismo custa em relação à base. A fórmula mostra um cuidado. A razão é um mais o custo extra dividido pelo custo da base. Se a base for muito barata, a razão fica grande, mesmo com um custo extra pequeno. Por isso eu mostro também os valores absolutos, e a comparação entre as duas linguagens é só indicativa.

*Aponte a fórmula. Ela volta no slide 16.*

### Slide 7: Um interpretador com três efeitos (1:10 · acumulado 6:50)

**Âncora:** um interpretador pequeno com estado, exceção e saída. Equivalência definida antes.

> Para comparar, eu precisava de um programa que usasse os três efeitos. Escolhi um interpretador de uma linguagem pequena, com estes oito comandos. Var lê uma variável e Let guarda um valor: esse é o estado. Dividir por zero ou ler uma variável que não existe dá erro: essa é a exceção. E Print mostra um valor: essa é a saída.
>
> Antes de programar, eu escrevi uma especificação formal que diz qual é o resultado certo de cada expressão. Com ela, duas versões são equivalentes se dão o mesmo valor, deixam o mesmo estado, mostram a mesma saída e dão a mesma mensagem de erro.
>
> Fiz três simplificações, de propósito: as variáveis são globais, o erro sempre encerra a expressão, e é um único programa.

### Slide 8: A função eval (1:10 · acumulado 8:00)

**Âncora:** a eval recebe uma expressão e calcula o valor. Os efeitos acontecem dentro dela.

> Antes de mostrar as versões, vale explicar a peça central. Todo interpretador tem uma função chamada eval, de evaluate, avaliar. Ela recebe uma expressão e calcula quanto ela vale. À esquerda está o começo dela, na versão com handlers: um caso para cada comando.
>
> À direita, ela rodando sobre dois mais n, com n valendo três. A eval recebe uma soma, cai no caso Add e avalia os dois lados. O lado esquerdo cai no caso Num e devolve dois. O lado direito cai no caso Var: pede n com perform, e o handler de estado devolve três. Por fim, a linha x mais y soma os dois e devolve cinco.
>
> Essa divisão vai importar nos resultados: a legibilidade mede o código dentro da eval, e a infraestrutura é o código em volta dela.

*Siga os passos 1 a 4 com o cursor, apontando a linha do código de cada caso.*

### Slide 9: Quatro versões e a verificação (1:10 · acumulado 9:10)

**Âncora:** quatro versões. Nada é medido antes de os testes passarem.

> Então eu implementei quatro versões, duas em cada linguagem. No OCaml, uma usa handlers e a outra é a base imperativa. No Haskell, uma usa mônadas e a outra é a base com IORef.
>
> Antes de medir, eu verifiquei que as quatro fazem a mesma coisa.
>
> Sessenta e um testes em cada linguagem, todos passando.
>
> Oito de oito erros que eu coloquei de propósito no código foram detectados pelos testes. Isso mostra que os testes pegam erros de verdade.
>
> E as duas linguagens rodam exatamente as mesmas doze cargas de expressões nas medições.
>
> O código foi gerado com apoio de IA, como está declarado no artigo, e revisado por mim. Esses testes são o que permite confiar nele, e tudo roda com um único comando.

*A frase sobre a IA é recomendada: a declaração está no artigo, e dizê-la você mesmo, ligada aos testes, vira um ponto forte.*

### Slide 10: O mesmo trecho de eval, com e sem handlers (0:50 · acumulado 10:00)

**Âncora:** a estrutura é a mesma. Só a operação muda.

> Este é o mesmo trecho da eval nas duas versões em OCaml: o que lê uma variável.
>
> À esquerda, com handlers, o código pede o valor com perform. À direita, a base lê direto da tabela. Se a variável não existe, um pede o erro com perform, e o outro lança a exceção com raise.
>
> A estrutura é a mesma, linha por linha. Eu escrevi as versões como espelho uma da outra, para que a diferença medida fosse só o mecanismo.

*Passe o cursor pelas linhas em destaque enquanto fala.*

### Slide 11: Legibilidade de eval (0:40 · acumulado 10:40)

**Âncora:** a eval empata. O mecanismo não muda a leitura.

> Os números confirmam. No OCaml, as duas versões têm a mesma eval: vinte e nove linhas, cinco operações de efeito e aninhamento dois. No Haskell, também empatam: vinte e sete, dezoito e um.
>
> Então, a resposta à primeira pergunta: o mecanismo não muda a leitura da eval. Se existe diferença na hora de escrever, ela está em outro lugar.

### Slide 12: Composabilidade e infraestrutura (1:10 · acumulado 11:50)

**Âncora:** o custo de escrever está no código em volta da eval.

> Esse outro lugar é o código em volta da eval.
>
> No OCaml, a versão com handlers tem sessenta e sete linhas de infraestrutura, contra três da base. É o código que instala os handlers e liga um ao outro. Dezoito dessas linhas existem só para os testes. No Haskell, quase não há diferença: vinte linhas na versão com mônadas e vinte e duas na base.
>
> Para acrescentar um quarto efeito, só as versões com mecanismo precisaram mudar código existente: dois pontos em cada. As bases só ganharam uma função nova. O próximo slide mostra essas mudanças no código.
>
> Em troca, só os handlers têm reaproveitamento: dois handlers são usados em mais de um lugar. Isso permite trocar o que a saída faz sem mexer na eval.

### Slide 13: O quarto efeito no código (1:00 · acumulado 12:50)

**Âncora:** nos mecanismos, o efeito novo mexe em código existente. Nas bases, não.

> Este é o código dessa mudança. À esquerda, os handlers. A eval não muda. O que muda é a composição que instala os handlers, que agora inclui o run_input. Isso acontece nas duas composições, por isso são dois pontos.
>
> À direita, as mônadas. O tipo da pilha ganha uma camada de estado para a entrada, e a função run precisa executar essa camada nova. Além disso, para ler da camada nova, o código usa dois lift, que sobem a operação até a camada certa.
>
> Nas bases, nenhuma linha existente mudou: entrou só uma função nova de leitura.

*Mostre primeiro a linha vermelha e depois as verdes, em cada lado.*

### Slide 14: Destaque: 45 ns (0:40 · acumulado 13:30)

**Âncora:** 45 ns só para instalar os handlers, sem nenhum efeito.

> Agora, o desempenho. Começo pelo número mais claro do trabalho.
>
> No cenário Arith, as expressões só fazem contas, sem nenhum efeito. Mesmo assim, no OCaml, a versão com handlers gasta quarenta e cinco nanossegundos a mais por expressão. Esse é o custo só de instalar os handlers. No Haskell, a maior diferença do experimento inteiro foi de dez nanossegundos.

*Fale mais devagar e faça uma pausa depois de “quarenta e cinco nanossegundos”.*

### Slide 15: Custo de tempo por expressão (1:20 · acumulado 14:50)

**Âncora:** no OCaml, custo para instalar e a cada operação. No Haskell, quase nenhum.

> Este é o quadro completo, em nanossegundos a mais que a base, por expressão. As medições rodaram numa máquina virtual na nuvem, como está declarado no artigo, com três conjuntos de expressões diferentes.
>
> Em azul, o OCaml. Arith, quarenta e cinco, e Exn, quarenta e nove: quase só o custo de instalar. State, oitenta e quatro, e Output, cento e onze: aqui o custo de cada operação se soma.
>
> Em laranja, o Haskell: no máximo dez nanossegundos, e em dois cenários a diferença fica até um pouco negativa, o que é ruído de medição.
>
> Eu não leio isso como “um mecanismo é mais rápido que o outro”, porque as linguagens são diferentes. O que os dados mostram é como cada um cobra. No OCaml, há um custo para instalar os handlers e outro a cada operação. No Haskell, o compilador otimiza a pilha, e o custo quase desaparece.

*Percorra as barras azuis de cima para baixo e depois as laranja.*

### Slide 16: Memória por expressão (1:00 · acumulado 15:50)

**Âncora:** a memória a mais é parecida. O que muda é a base.

> Na memória aparece o cuidado com a fórmula. No cenário Arith, a razão do OCaml é 11,5, e a do Haskell, 2,2. Parece uma diferença enorme.
>
> Mas olhem as barras. A memória a mais que cada mecanismo usa é parecida: cento e sessenta e oito bytes por expressão no OCaml e cento e cinquenta no Haskell. O que muda é a base. A base do OCaml usa só dezesseis bytes por expressão, e a do Haskell usa cento e vinte e sete. Como a base do OCaml é muito barata, a razão fica grande. É exatamente o efeito da fórmula.

*Aponte o pequeno trecho cinza da barra do OCaml ao dizer “dezesseis bytes”.*

### Slide 17: Achados não previstos (1:10 · acumulado 17:00)

**Âncora:** um vazamento de memória no OCaml e uma medição sensível à configuração.

> Dois resultados eu não esperava.
>
> O primeiro é um vazamento de memória no OCaml. Quando um handler trata um erro, a computação interrompida fica guardada. Se o código simplesmente a abandona, o OCaml não libera essa memória. Num teste com dois milhões de erros, a memória chegou a 1,2 gigabyte. Encerrando a computação do jeito certo, com a função discontinue, ficou em seis megabytes. O meu código usa o jeito certo, e o teste está no repositório.
>
> O segundo é sobre a medição. Repeti as medições com um tempo de coleta quatro vezes menor. Todas passaram no critério de qualidade, e mesmo assim as razões mudaram até vinte e oito por cento. Ou seja, a configuração da medição muda o resultado.

### Slide 18: Frente à literatura e ao TCC I (1:00 · acumulado 18:00)

**Âncora:** mesma ordem de grandeza da literatura. A previsão do TCC I não se confirmou.

> Comparando com outros trabalhos, sabendo que cada um mede uma situação diferente.
>
> O artigo que trouxe os handlers para o OCaml mede cerca de vinte e três nanossegundos para instalar um handler. Os meus quarenta e cinco, para três handlers, estão na mesma ordem de grandeza.
>
> No Haskell, outros trabalhos encontram mônadas de 1,0 a 1,3 vez o custo de uma versão sem efeitos. As minhas razões ficaram perto de 1, o que combina com isso.
>
> E o mais interessante: no TCC I, eu previ handlers abaixo de 1,5 vez a base e mônadas acima de duas vezes. Aconteceu o contrário nos dois casos.

*Diga a última frase com tranquilidade, sem tom de desculpa: uma previsão que não se confirma também é resultado.*

### Slide 19: Conclusões e trabalhos futuros (1:10 · acumulado 19:10)

**Âncora:** escrita: custo em volta da eval. Execução: handlers cobram, mônadas quase nada.

> Para concluir.
>
> Na escrita, o mecanismo não muda a eval, que fica igual à da base. O custo está no código em volta. Nos handlers, ele fica concentrado onde os handlers são instalados. Nas mônadas, ele fica no tipo da pilha, que muda a cada efeito novo.
>
> Na execução, os handlers do OCaml cobram para ser instalados e a cada operação, mesmo sem efeito nenhum. As mônadas do Haskell, otimizadas pelo compilador, quase não custam.
>
> Na prática: no OCaml, o cuidado é com quantas vezes se instala um handler. No Haskell, o custo aparece quando a pilha precisa mudar.
>
> Os limites estão no slide. Como trabalhos futuros, eu vejo comparar os dois mecanismos numa mesma linguagem, testar outros programas e efeitos, e medir a legibilidade com pessoas.

*O parágrafo “Na prática” é a sua opinião sobre os dados. Diga olhando para a câmera.*

### Slide 20: Obrigado (0:20 · acumulado 19:30)

**Âncora:** obrigado. Tudo se refaz com um comando.

> Obrigado. O código, os dados e o artigo estão no repositório, e um único comando refaz todos os números. Fico à disposição.

*Deixe este slide aberto durante a arguição. Os apêndices vêm logo depois.*

---

## Arguição: como responder

A arguição tem 20 minutos para os três membros, e o orientador fala por último
(Art. 18). Para cada pergunta:

1. **Ouça até o fim**, sem interromper. Se não entendeu, peça para repetir ou
   reformule: “Se entendi, a pergunta é se…”.
2. **Responda em três tempos:** primeiro a resposta, numa frase. Depois a
   evidência (um número, um slide, um apêndice). Por fim, o limite (“isso vale
   para este caso de uso”). Até um minuto por resposta.
3. **Não sabe?** Diga o que sabe e como verificaria: “Isso eu não medi. O que
   os dados mostram é… Eu verificaria assim…”. Nunca invente um número: o
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
> efeito. No Haskell, proporcional aos binds e quase apagado pelo compilador.

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
> O de exceção precisa ser por expressão. Senão, o primeiro erro encerraria a
> carga inteira. Os outros dois poderiam ser por carga, e eu os instalei
> juntos, o que triplica a instalação. Está declarado. É exatamente o regime
> que o Arith isola: 45 nanossegundos. Com escopos maiores, esse custo se
> diluiria, mas esse regime eu não medi.

**“Arith é controle no Haskell também?”**
> Não. No OCaml, Arith não tem operação de efeito, então isola a instalação.
> No Haskell, cada vinculação do eval passa pela pilha, então Arith mede o
> custo do bind. O texto faz essa distinção.

**“Um caso de uso e três sementes bastam?”**
> Para generalizar, não, e eu digo isso: n igual a um. As três sementes geram
> cargas diferentes e mostram que o resultado não depende da carga sorteada.
> Não são uma amostra de programas. O que o trabalho oferece é um método
> reprodutível, que pode ser aplicado a outros casos de uso.

**“Como garante que o otimizador não eliminou trabalho de um lado só?”**
> As cargas são geradas fora da região medida. O resultado é forçado no
> Haskell e passa por Sys.opaque_identity no OCaml, nas duas versões. Os
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
> Não medem a legibilidade percebida. São proxies estruturais, e eu os chamo
> assim. O aninhamento segue a Cognitive Complexity, que tem validação
> empírica com tempo de compreensão. Medir legibilidade de verdade exige
> estudo com pessoas, que é trabalho futuro.

**“A regra de boilerplate não é arbitrária?”**
> Ela é fixa, publicada e mecânica: uma linha é semântica se contém um
> marcador de efeito, como a operação na tabela ou o resultado de erro. O
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
> No OCaml, por contagem direta: as palavras do heap menor alocadas entre
> duas coletas forçadas, convertidas em bytes. É um valor exato e
> determinístico. Eu não usei a regressão do Bechamel porque o contador que
> ele lê só avança a cada coleta menor, e isso subestimava a base em até 4,7%.
> No Haskell, o Criterion já sincroniza o contador a cada amostra. As fibers
> do OCaml são alocadas fora do heap do coletor, então não entram nessa
> coluna. Eu digo isso no texto, e foi o que me levou ao experimento do
> vazamento.

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
pedirem, abra o código e explique um trecho. É a melhor resposta possível a
essa pergunta.*

**“Como garante que as quatro versões fazem a mesma coisa?”**
> Em quatro camadas: a suíte de oráculo, 61 de 61 em cada linguagem, contra
> resultados derivados da semântica formal. Os testes de mutação, oito de
> oito. Os hashes das doze cargas, iguais nas três réplicas. A pré-condição
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

Não tenho a ficha de avaliação oficial da banca. O Regulamento diz apenas que
a apresentação é avaliada junto com o artigo. Os critérios abaixo são os que
bancas de computação costumam usar, e é por eles que este roteiro foi
construído.

| Critério | O que a nota máxima exige | Onde o roteiro atende |
|---|---|---|
| Problema e motivação | lacuna clara e relevante, dita cedo | slide 3, em 2 min |
| Objetivos e perguntas | perguntas explícitas e mensuráveis | slide 4 |
| Rigor do método | ameaças à validade tratadas, e não escondidas | slides 3, 5 e 6 (confundimento, viés da razão, equivalência) |
| Resultados | evidência para cada pergunta, com números | slides 11 a 16 |
| Honestidade | limites, resultados contrários e o que não foi medido | slides 12, 13, 14 e 15 |
| Discussão | confronto com a literatura, com cuidado | slide 18 |
| Conclusões | respostas às perguntas e uma recomendação | slide 19 |
| Tempo | dentro dos 20 minutos, sem correria | 19 min 30 s, com folga |
| Clareza | uma ideia por slide, transições explícitas | âncoras e frases de ligação |
| Domínio na arguição | respostas diretas, com evidência e limite | seção anterior, Guias 01 a 04 |
| Integridade | uso de IA declarado, reprodutibilidade | slide 9, apêndice A5, `make tudo` |

**O que ainda depende de você, e decide a nota:**

- **Falar, e não ler.** Ensaie até precisar só das âncoras.
- **Soar como você.** Reescreva o que não for o seu jeito de falar.
- **Dominar o código.** A pergunta sobre a IA é quase certa. A melhor
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
de frente, fone com microfone. Apresentação em PDF aberta em tela cheia e o
PPTX de reserva. Notificações desligadas. O repositório aberto numa aba, para
mostrar código se pedirem. Água por perto. Entre na sala 10 minutos antes e
teste o compartilhamento de tela.

**Pronúncia, para não tropeçar:** OCaml (ô-cámel), Haskell (rás-kel), handler
(rén-dler), mtl (ême-tê-éle), GHC (gê-agá-cê), ExceptT (except-tê), StateT
(stêit-tê), IORef (ai-ô-ref), fiber (fái-ber), perform (per-fórm), discontinue
(dis-con-tí-niu), boilerplate (bói-ler-pleit).
