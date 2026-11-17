# Roteiro de gravação

Gerado por `gerar_pptx.js` junto com `defesa.pptx`. Só o texto falado, do slide 1 ao slide do Obrigado, na ordem. Referências e apêndices não entram na gravação.

Leitura estimada: 13 a 15 minutos (1847 palavras).

## Slide 1: Capa

Olá. Sou o Diego Marchioni e vou apresentar o meu Trabalho de Conclusão de Curso, orientado pelo professor Marco Rodrigo. O trabalho compara duas formas de tratar efeitos em linguagens funcionais: as mônadas, no Haskell, e os efeitos algébricos, no OCaml.

## Slide 2: Sumário

A apresentação segue a ordem do artigo: o problema e as perguntas de pesquisa, os dois mecanismos, o método, os resultados e as conclusões.

## Slide 3: Seção 01: Introdução

Começo pelo contexto: o que são efeitos e por que existem dois mecanismos para eles.

## Slide 4: Dois mecanismos para os mesmos efeitos

Programas reais precisam guardar estado, lançar erros e imprimir, coisas que uma função pura não faz. As linguagens funcionais têm mecanismos para isso. No Haskell, as mônadas: cada efeito é uma camada, e o efeito aparece no tipo da função. No OCaml 5, os efeitos algébricos: o código pede uma operação com perform e um handler decide o que ela faz. Na teoria, os dois expressam as mesmas coisas, como mostraram Forster e colegas, em 2017, e Schrijvers e colegas, em 2019. As mônadas são a técnica consolidada, popularizada por Wadler em 1992. Os efeitos algébricos chegaram ao OCaml na versão 5, em 2022.

## Slide 5: O problema

Saber que os dois mecanismos são equivalentes na teoria não diz o que importa para quem programa: quanto custa escrever e quanto custa executar. Nenhum estudo tinha medido as duas coisas no mesmo programa. Então o objetivo foi comparar os dois no mesmo programa, em quatro dimensões, cada uma com uma questão de pesquisa.

## Slide 6: Seção 02: Fundamentação

Agora mostro como cada mecanismo aparece no código do trabalho.

## Slide 7: Mônadas no código

No Haskell, o efeito está no tipo. Interp é o tipo de toda computação do interpretador: uma pilha com exceção por fora, estado no meio e IO na base. No caso Var, get lê o estado, e se a variável não existir, throwError lança o erro.

## Slide 8: Efeitos algébricos no código

No OCaml, primeiro se declaram as operações: Get, Set, Fail e Output. O código chama perform para pedir uma delas. O handler de estado atende o Get: busca a variável na tabela e retoma o programa, que estava parado, com o valor encontrado. O k é a continuação, o resto do programa parado no ponto do perform.

## Slide 9: Seção 03: Metodologia

Agora o método: o que foi implementado, como foi verificado e o que foi medido.

## Slide 10: Quatro versões do mesmo interpretador

Escrevi o mesmo interpretador quatro vezes. Em cada linguagem há a versão com o mecanismo e uma base sem ele. Só comparo código dentro da mesma linguagem, e o desempenho de cada mecanismo é medido contra a sua base. A base do OCaml guarda as variáveis numa tabela hash e usa exceção nativa. A base do Haskell guarda o mesmo Map dentro de um IORef e também usa exceção nativa.

## Slide 11: Caso de uso: um interpretador pequeno

O caso de uso é um interpretador pequeno, com oito tipos de expressão, que usa os três efeitos. Antes de programar, fixei o que significa duas versões serem equivalentes: dar o mesmo valor, o mesmo estado final, a mesma saída e a mesma mensagem de erro que a semântica de referência. Isso vale para todos os pares de expressão e estado inicial cujos valores cabem no inteiro das duas linguagens. Fiz três simplificações de propósito: as variáveis são globais, um erro sempre encerra a avaliação e há um único programa.

## Slide 12: A função eval

Esta é a eval da versão com handlers. Ela olha o tipo da expressão e decide o que fazer. Num devolve o número. Var pede o valor ao handler de estado. Add avalia os dois lados, em ordem fixa, e soma. Um exemplo: dois mais n, com n valendo três. A eval cai no caso Add. O lado esquerdo é o número dois. O lado direito é a variável n: a eval faz perform Get, o handler lê o valor três na tabela e retoma a eval com esse valor. No fim, dois mais três, cinco. Os outros casos seguem a mesma ideia. A legibilidade, que é a primeira questão de pesquisa, é medida dentro desta função.

## Slide 13: Mesma estrutura, outro mecanismo

As duas versões OCaml têm a mesma estrutura, linha por linha. Onde a imperativa lê a tabela direto, a de handlers faz perform Get. Onde a imperativa lança raise, a de handlers faz perform Fail. As duas usam a mesma tabela hash. Por isso a diferença medida é o mecanismo, e não a estrutura.

## Slide 14: Verificação antes de medir

Antes de qualquer medição, as quatro versões tiveram de passar nos testes. Foram 61 casos de oráculo em cada linguagem. Para saber se os testes pegam erros de verdade, coloquei 8 erros de propósito, e os testes acusaram os 8. E as 12 cargas de medição têm o mesmo hash nas duas linguagens. O código foi gerado com apoio de IA, como declarado no artigo, e revisado por mim. Essa verificação é o que garante que ele faz o que deve.

## Slide 15: Desempenho medido por razões

Não dá para comparar o tempo do OCaml com o do Haskell, porque isso mediria também os compiladores. Então cada mecanismo é dividido pela sua base: handlers pela imperativa, mônadas pela IORef. A razão é o tempo do mecanismo dividido pelo da base, que é o mesmo que 1 mais o custo a mais dividido pelo custo da base. Essa fórmula não vem da literatura, é só a definição de razão reescrita, e ela mostra que uma base barata faz qualquer custo a mais parecer grande. Isso volta no slide da memória.

## Slide 16: Seção 04: Resultados

Agora os resultados. Primeiro os do código, que respondem às três primeiras questões, e depois os de desempenho.

## Slide 17: QP1: legibilidade da eval

A eval empata. No OCaml, as duas versões têm 29 linhas, 5 operações de efeito e aninhamento 2. No Haskell, 27 linhas, 18 operações e aninhamento 1. O empate vale também construtor por construtor. Então, se existe diferença para escrever, ela está fora da eval.

## Slide 18: QP2: um quarto efeito nos handlers

Para testar a composabilidade, acrescentei um quarto efeito: ler valores de uma entrada. Nos handlers, o efeito novo precisa ser instalado onde os outros já são. As linhas em vermelho saem e as em verde entram: o handler novo, de entrada, passa a ficar entre o de saída e o de erro. A mesma mudança acontece na composição usada pelos testes. Por isso são dois pontos de modificação. Na imperativa, a leitura é só uma função nova, e nada do que existia muda.

## Slide 19: QP2: um quarto efeito nas mônadas

No Haskell, o efeito novo vira uma camada a mais na pilha. Então o tipo da pilha muda, e a função run, que executa a pilha, muda junto: também dois pontos de modificação. A leitura é uma função nova, que precisa de dois lift para chegar na camada nova. Na base com IORef, como na imperativa, nada do que existia muda. Então handlers e mônadas empatam em dois, e a diferença é onde a mudança cai: nos handlers, nas composições. Nas mônadas, no tipo e no executor.

## Slide 20: QP3: código em volta da eval

Fora da eval aparece a diferença. A versão com handlers tem 67 linhas de infraestrutura contra 3 da imperativa, e 18 delas existem só para os testes. No Haskell, mônadas e IORef ficam parecidas: 20 contra 22. Em compensação, esse código é feito de peças que se recombinam. Para os testes, troquei só o handler de saída e reaproveitei os de estado e de erro sem mudar nada: são 2 instâncias de reúso. As outras versões têm zero porque não têm peça para instalar: elas trocam a saída por uma referência a função, colocada de antemão no código. Com um único programa, essa contagem discrimina pouco, e o artigo registra isso. O reúso é a contrapartida do boilerplate.

## Slide 21: QP4: o custo de instalar os handlers

Este é o número que resume o desempenho do OCaml. No cenário Arith, que só faz contas e não usa efeito nenhum, os handlers já custam 45 nanossegundos a mais por expressão. Esse é o custo de instalar os três handlers. Instalar quer dizer rodar o código sob o handler, e o OCaml cria uma pilha própria para isso. No Haskell, a maior diferença em todo o experimento foi de 10 nanossegundos. Os números são a mediana de três cargas de dez mil expressões, medidas numa máquina virtual de nuvem.

## Slide 22: QP4: tempo de execução

No OCaml, o custo cresce com o uso: começa em 45 nanossegundos só para instalar e sobe para 84 em State e 111 em Output, porque cada operação de efeito também custa. No Haskell, fica perto de zero em todos os cenários. Em razões, os handlers levaram de 1,59 a 4,26 vezes o tempo da imperativa, e as mônadas de 0,97 a 1,08 vezes o da IORef. Não é uma comparação de qual linguagem é mais rápida: cada barra é o custo a mais sobre a base da própria linguagem.

## Slide 23: QP4: memória alocada

Na memória, a razão do OCaml parece dez vezes pior que a do Haskell: 11,5 contra 2,2. Mas a memória a mais é parecida, 168 e 150 bytes por expressão. O que muda é a base: a imperativa do OCaml aloca só 16 bytes. É a fórmula da razão no caso extremo: base barata, razão enorme.

## Slide 24: Dois achados não previstos

Dois achados que eu não esperava. Primeiro, um vazamento de memória no OCaml 5.2: se o handler de erro só abandona a computação interrompida, a memória não é liberada. Com 2 milhões de erros, chegou a 1,2 GB. Encerrando com discontinue, ficou em 6 MB, e o código final usa discontinue. O experimento está no repositório. Segundo, a medição é sensível à configuração: com uma coleta quatro vezes menor, todas as medições pareciam boas pelo indicador de qualidade, o R quadrado, e mesmo assim as razões mudaram até 28 por cento.

## Slide 25: Seção 05: Conclusões

Para fechar: como os resultados se comparam com a literatura e o que concluo.

## Slide 26: Comparação com a literatura

A literatura já tinha medido cada mecanismo separado, mas ninguém tinha comparado os dois no mesmo programa. Os números daqui ficam na mesma ordem de grandeza. Sivaramakrishnan e colegas, em 2021, mediram cerca de 23 nanossegundos para alocar uma fiber e trocar de pilha, da ordem dos 45 que a instalação de três handlers custou aqui. Kammar e colegas, em 2013, e Xie e Leijen, em 2020, mediram mônadas entre 1,0 e 1,3 vezes uma versão sem efeitos, e as daqui ficam no limite de baixo. E a previsão do TCC I não se confirmou: os handlers custaram mais, e as mônadas, menos do que eu esperava. Cada trabalho mede uma situação diferente, então a comparação é de ordem de grandeza.

## Slide 27: Conclusões

Três conclusões. Na escrita, a eval não muda, e o custo está no código em volta: nas composições dos handlers e no tipo da pilha de mônadas. Na execução, os handlers cobram para ser instalados e a cada operação, e as mônadas, otimizadas pelo GHC, quase não custam. Na prática, no OCaml vale cuidar de quantas vezes se instala um handler, e no Haskell o custo aparece quando a pilha muda. O trabalho deixa também o desenho da comparação: o argumento de equivalência, a suíte de oráculo, o gerador de cargas igual nas duas linguagens e a medição por razões dentro de cada linguagem. Os limites são um único programa, uma máquina virtual e versões específicas dos compiladores. Os próximos passos são comparar os dois mecanismos na mesma linguagem, testar outros programas e efeitos e medir legibilidade com pessoas.

## Slide 29: Obrigado!

Obrigado pela atenção. O código, os dados e o artigo estão no repositório do trabalho, e todos os números se refazem com um único comando.
