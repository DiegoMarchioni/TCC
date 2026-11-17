# Explicação slide a slide

Gerado por `gerar_pptx.js` junto com `defesa.pptx`. O mesmo texto está nas notas do apresentador de cada slide.

## 1. Capa

**O que dizer.** Bom dia. Sou o Diego Marchioni e vou apresentar o meu TCC, orientado pelo professor Marco Rodrigo. O trabalho compara duas formas de tratar efeitos em linguagens funcionais: as mônadas, no Haskell, e os efeitos algébricos, no OCaml.

**O que cada coisa significa.**

- **Mônada**: forma clássica de programar efeitos no Haskell. O efeito fica registrado no tipo da função.
- **Efeito algébrico**: forma mais nova, nativa no OCaml 5. O código pede uma operação (perform) e um handler decide o que ela faz.
- **Legibilidade, composabilidade, poder de abstração e desempenho**: as quatro dimensões comparadas, uma por questão de pesquisa (QP1 a QP4).

## 2. Sumário

**O que dizer.** A apresentação segue a ordem do artigo: o problema e as perguntas, os dois mecanismos, o método, os resultados e as conclusões. São cerca de 20 minutos.

**O que cada coisa significa.**

- **QP**: questão de pesquisa. São quatro, uma para cada dimensão comparada.

## 3. Seção 01: Introdução

**O que dizer.** Começo pelo contexto: o que são efeitos e por que existem dois mecanismos para eles.

## 4. Dois mecanismos para os mesmos efeitos

**O que dizer.** Programas reais precisam guardar estado, lançar erros e imprimir, coisas que uma função pura não faz. As linguagens funcionais têm mecanismos para isso. No Haskell, as mônadas: cada efeito é uma camada, e o efeito aparece no tipo da função. No OCaml 5, os efeitos algébricos: o código pede uma operação com perform e um handler decide o que ela faz. Na teoria, os dois expressam as mesmas coisas, como mostraram Forster e colegas em 2017 e Schrijvers e colegas em 2019. As mônadas são a técnica consolidada (Wadler, 1992). Os efeitos algébricos são nativos no OCaml desde 2022.

**O que cada coisa significa.**

- **Efeito**: tudo o que uma função faz além de devolver um valor. Aqui são três: estado, exceção e saída.
- **Estado**: valores guardados que o programa lê e muda, como as variáveis do interpretador.
- **Exceção**: interrupção do cálculo por um erro, como divisão por zero.
- **Saída**: mostrar um valor para fora do programa (o Print do interpretador).
- **Função pura**: função cujo resultado depende só da entrada e que não tem efeitos.
- **Camadas empilhadas**: nas mônadas, cada efeito é um transformador (por exemplo, StateT para estado) colocado em volta de outro. O conjunto forma uma pilha.
- **perform**: comando do OCaml 5 que pede uma operação de efeito e pausa o código até alguém responder.
- **Handler**: a função que responde aos pedidos feitos com perform. Ela decide o que a operação faz.
- **Mesma expressividade**: Forster et al. (2017) e Schrijvers et al. (2019) mostraram que um mecanismo consegue simular o outro. Logo a diferença prática está em escrever e em executar.

## 5. O problema

**O que dizer.** Saber que os dois mecanismos são equivalentes na teoria não diz o que importa para quem programa: quanto custa escrever e quanto custa executar. Nenhum estudo tinha medido as duas coisas no mesmo programa. Então o objetivo foi comparar os dois no mesmo programa, em quatro dimensões, cada uma com uma questão de pesquisa.

**O que cada coisa significa.**

- **Carga de leitura (QP1)**: quanto o código tem de linhas, de operações de efeito e de blocos um dentro do outro. É uma medida indireta: legibilidade percebida exigiria testar com pessoas.
- **Mudanças para um efeito novo (QP2)**: quantas declarações já existentes precisam mudar para acrescentar um quarto efeito. Quanto menos, mais fácil compor efeitos.
- **Boilerplate (QP3)**: código de preparação, que não diz o que o efeito faz, só monta o mecanismo.
- **Reúso (QP3)**: usar a mesma peça (um handler, uma camada) em mais de um lugar sem reescrever.
- **Tempo e memória (QP4)**: o que o mecanismo gasta a mais em relação a uma versão sem ele.

## 6. Seção 02: Fundamentação

**O que dizer.** Agora mostro como cada mecanismo aparece no código do trabalho.

## 7. Mônadas no código

**O que dizer.** No Haskell, o efeito está no tipo. Interp é o tipo de toda computação do interpretador: uma pilha com exceção por fora, estado no meio e IO na base. No caso Var, get lê o estado, e se a variável não existir, throwError lança o erro.

**O que cada coisa significa.**

- **type Env = Map String Int**: define o estado do interpretador: um dicionário (Map) de nomes (String) para valores inteiros (Int).
- **type Interp a**: nome curto para o tipo da pilha. Uma função que devolve Interp Int calcula um inteiro e pode usar os três efeitos.
- **Mônada**: tipo que encadeia passos de cálculo levando um efeito junto.
- **ExceptT String**: camada de exceção (um transformador). Permite interromper o cálculo com uma mensagem de erro (String).
- **StateT Env**: camada de estado. Guarda o Env e permite lê-lo (get) e mudá-lo.
- **IO**: camada da base, que executa ações no mundo externo, como imprimir.
- **Pilha**: as camadas uma dentro da outra. Lê-se de fora para dentro: ExceptT envolve StateT, que envolve IO. Com a exceção por fora, o estado sobrevive a um erro, como o critério de equivalência exige.
- **do**: bloco que executa passos em sequência dentro da mônada.
- **env <- get**: executa get, que lê o estado, e chama o resultado de env.
- **maybe a b m**: se m não tem valor (Nothing), executa a. Se tem (Just v), executa b com v.
- **Map.lookup x env**: procura x no dicionário. Devolve Just valor ou Nothing.
- **throwError**: lança o erro na camada ExceptT.
- **return**: devolve um valor sem efeito nenhum.

## 8. Efeitos algébricos no código

**O que dizer.** No OCaml, primeiro se declaram as operações: Get, Set, Fail e Output. O código chama perform para pedir uma delas. O handler de estado atende o Get: busca a variável na tabela e retoma o programa, que estava parado, com o valor encontrado. O k é a continuação, o resto do programa parado no ponto do perform.

**O que cada coisa significa.**

- **type _ Effect.t +=**: acrescenta operações novas ao tipo de efeitos do OCaml. Cada linha é uma operação e diz o que recebe e o que devolve.
- **Get : string -> int option**: recebe o nome da variável e devolve talvez um inteiro (option): Some v se existe, None se não existe.
- **Set : string * int -> unit**: recebe nome e valor e não devolve nada útil (unit).
- **Fail : string -> 'a**: recebe a mensagem de erro. O 'a quer dizer que ela nunca volta com um valor, então serve em qualquer lugar.
- **Output : int -> unit**: recebe o valor a mostrar.
- **perform**: pede uma operação (Get, Set...) e pausa o código até o handler responder.
- **Handler**: função que atende os pedidos de perform. Este trecho é do handler de estado, run_state.
- **run_state**: função que instala o handler de estado em volta de um trecho de código. Usa match_with, do OCaml.
- **Some (fun k -> ...)**: o jeito de o handler dizer: este pedido é meu, e eis o que fazer com ele.
- **k (continuação)**: o resto do programa a partir do perform, guardado e parado.
- **continue k v**: retoma o programa. O perform que estava esperando devolve v.
- **Hashtbl.find_opt tbl x**: procura x na tabela de variáveis (Hashtbl). Devolve Some valor ou None.

## 9. Seção 03: Metodologia

**O que dizer.** Agora o método: o que foi implementado, como foi verificado e o que foi medido.

## 10. Quatro versões do mesmo interpretador

**O que dizer.** Escrevi o mesmo interpretador quatro vezes. Em cada linguagem há a versão com o mecanismo e uma base sem ele. Só comparo código dentro da mesma linguagem, e o desempenho de cada mecanismo é medido contra a sua base. A base do OCaml guarda as variáveis numa Hashtbl e usa exceção nativa. A base do Haskell guarda o mesmo Map dentro de um IORef e também usa exceção nativa.

**O que cada coisa significa.**

- **Interpretador**: programa que lê uma expressão e calcula o resultado dela.
- **Mecanismo**: a forma de tratar efeitos que está sendo estudada: handlers no OCaml, mônadas no Haskell.
- **Base**: versão sem o mecanismo, com estado e erro diretos, que serve de régua para medir o custo do mecanismo.
- **OCaml 5.2.1 e GHC 9.4.7**: as versões exatas do compilador de cada linguagem (GHC é o compilador do Haskell).
- **Hashtbl**: tabela de dispersão do OCaml, que guarda as variáveis. As duas versões OCaml usam a mesma.
- **IORef**: uma variável mutável do Haskell, usada dentro de IO. A base guarda nela o mesmo Map da versão monádica.
- **Exceção nativa**: o erro da própria linguagem: raise no OCaml, throwIO no Haskell.
- **Por que dentro da mesma linguagem**: comparar OCaml com Haskell mediria também os compiladores e os runtimes, e não só os mecanismos.

## 11. Caso de uso: um interpretador pequeno

**O que dizer.** O caso de uso é um interpretador pequeno, com oito tipos de expressão, que usa os três efeitos. Antes de programar, fixei o que significa duas versões serem equivalentes: dar o mesmo valor, o mesmo estado final, a mesma saída e a mesma mensagem de erro que a semântica de referência. Formalmente, para todo par de expressão e estado inicial no conjunto E64, o resultado da implementação é igual ao da semântica. Simplificações de propósito: variáveis globais, erro sempre aborta e um único programa.

**O que cada coisa significa.**

- **Construtor**: cada tipo de expressão: Num (número), Var (variável), Add, Mul, Div (soma, multiplicação, divisão), Let (dar valor a uma variável e continuar), Seq (fazer uma coisa e depois outra), Print (mostrar um valor).
- **Semântica de referência**: a definição matemática do resultado de cada expressão, no estilo small-step de Felleisen e Hieb (1992). É a resposta certa contra a qual as versões são testadas.
- **Small-step**: estilo de semântica que descreve a execução passo a passo.
- **E64**: conjunto dos pares (expressão, estado inicial) em que nenhum valor passa do maior inteiro comum às duas linguagens, que é o de 63 bits do OCaml.
- **Fórmula, se perguntarem**: ⟦I⟧(e, σ0) = D(e, σ0) para todo (e, σ0) em E64: o que a implementação I produz é igual ao que a semântica D define.
- **Mesma saída (traço)**: a lista de valores impressos por Print, na mesma ordem.
- **Simplificações**: variáveis são globais (sem escopo), qualquer erro encerra a avaliação e há um único programa de teste. Foram escolhas para manter o caso controlado.

## 12. A função eval

**O que dizer.** Esta é a eval da versão com handlers. Ela olha o tipo da expressão e decide o que fazer. Num devolve o número. Var pede o valor ao handler de estado. Add avalia os dois lados, em ordem fixa, e soma. Um exemplo: 2 + n, com n valendo 3. A eval cai no caso Add. O lado esquerdo é o número 2. O lado direito é a variável n: a eval faz perform Get, o handler lê 3 na tabela e retoma a eval com esse valor. No fim, 2 + 3 = 5. Os outros casos, Mul, Div, Let, Seq e Print, seguem a mesma ideia. A legibilidade (QP1) é medida dentro desta função.

**O que cada coisa significa.**

- **eval**: a função principal do interpretador. A legibilidade (QP1) é medida só dentro dela.
- **let rec**: define uma função que pode chamar a si mesma (recursiva).
- **function | ...**: a função escolhe um caso conforme o tipo da expressão recebida.
- **match ... with**: examina um valor e escolhe o caso que combina com ele.
- **perform (Get x)**: pede ao handler de estado o valor de x. O código para até o handler responder.
- **Some v / None**: as duas respostas possíveis de Get: o valor existe (Some v) ou não existe (None).
- **perform (Fail ...)**: pede ao handler de erro que interrompa a avaliação com a mensagem.
- **Ordem fixa**: o OCaml não garante em que ordem avalia os argumentos de uma função, por isso cada lado é avaliado num let separado. Isso importa quando os dois lados imprimem.
- **Exemplo 2 + n (passo a passo)**: 1) eval (Add (Num 2, Var "n")) cai no caso Add. 2) eval (Num 2) devolve 2. 3) eval (Var "n") faz perform (Get "n"), o handler lê 3 e retoma. 4) x + y devolve 5. Está no apêndice A7.

## 13. Mesma estrutura, outro mecanismo

**O que dizer.** As duas versões OCaml têm a mesma estrutura, linha por linha. Onde a imperativa lê a tabela direto, a de handlers faz perform Get. Onde a imperativa lança raise, a de handlers faz perform Fail. As duas usam a mesma Hashtbl. Por isso a diferença medida é o mecanismo, e não a estrutura.

**O que cada coisa significa.**

- **Hashtbl.find_opt env x**: lê x direto da tabela de variáveis, sem passar por handler nenhum.
- **raise (Runtime_error ...)**: lança a exceção nativa do OCaml, que interrompe a avaliação.
- **msg_unbound x**: monta a mensagem de erro de variável não vinculada, com o nome de x. As versões usam a mesma função.
- **Arquivos**: interp_effects.ml (handlers) e interp_imp.ml (imperativa).

## 14. Verificação antes de medir

**O que dizer.** Antes de qualquer medição, as quatro versões tiveram de passar nos testes. Foram 61 casos de oráculo em cada linguagem. Para saber se os testes pegam erros de verdade, coloquei 8 erros de propósito, e os testes acusaram os 8. E as 12 cargas de medição têm o mesmo hash nas duas linguagens. O código foi gerado com apoio de IA, como declarado no artigo, e revisado por mim. Essa verificação é o que garante que ele faz o que deve.

**O que cada coisa significa.**

- **Testes de oráculo (61/61)**: 61 casos de teste. Cada um compara valor, estado final, saída e erro de cada versão com a semântica de referência (o oráculo, a resposta certa). Todos passaram nas quatro versões.
- **Erros plantados, ou mutantes (8/8)**: oito cópias do código, cada uma com uma decisão sutil revertida, por exemplo arredondar a divisão para baixo (div) em vez de truncar (quot) ou inverter a ordem da pilha monádica. A suíte acusou as oito.
- **Hash FNV-1a**: algoritmo que transforma um texto num número de 64 bits, uma impressão digital. Se as cargas geradas nas duas linguagens dão o mesmo número, elas são iguais.
- **12 cargas**: 4 cenários (Arith, State, Exn, Output) vezes 3 sementes do gerador (42, 43 e 44). Cada carga tem 10.000 expressões.
- **IA**: o código foi gerado com apoio de IA, declarado no artigo e revisado pelo autor. Detalhes no apêndice A5.

## 15. Desempenho medido por razões

**O que dizer.** Não dá para comparar o tempo do OCaml com o do Haskell, porque isso mediria também os compiladores. Então cada mecanismo é dividido pela sua base: handlers pela imperativa, mônadas pela IORef. A razão é o tempo do mecanismo dividido pelo da base, que é o mesmo que 1 mais o custo a mais dividido pelo custo da base. Essa fórmula não vem da literatura, é só a definição de razão reescrita, e ela mostra que uma base barata faz qualquer custo a mais parecer grande. Isso volta no slide da memória.

**O que cada coisa significa.**

- **Razão**: tempo (ou memória) do mecanismo dividido pelo da base. Razão 1 quer dizer custo igual ao da base. Razão 2 quer dizer o dobro.
- **Fórmula completa**: razão = T_mec ÷ T_base = (T_base + Δ) ÷ T_base = 1 + Δ ÷ T_base.
- **T_mec**: tempo (ou memória) da versão com o mecanismo.
- **T_base**: tempo (ou memória) da base da mesma linguagem.
- **Δ (delta)**: a diferença T_mec menos T_base: o que o mecanismo gasta a mais, em nanossegundos ou bytes por expressão.
- **Indicativo**: serve para ter ideia, mas não para afirmar que um mecanismo é mais rápido que o outro.

## 16. Seção 04: Resultados

**O que dizer.** Agora os resultados, primeiro do código (QP1 a QP3) e depois do desempenho (QP4).

## 17. QP1: legibilidade da eval

**O que dizer.** A eval empata. No OCaml, as duas versões têm 29 linhas, 5 operações de efeito e aninhamento 2. No Haskell, 27 linhas, 18 operações e aninhamento 1. O empate vale também construtor por construtor. Então, se existe diferença para escrever, ela está fora da eval.

**O que cada coisa significa.**

- **Linhas**: linhas de código da eval, sem linhas em branco, depois de formatar com o formatador oficial de cada linguagem.
- **Operação de efeito**: cada ponto em que a eval usa um efeito. No OCaml: perform, leitura direta da tabela, raise ou emissão. No Haskell: cada passo monádico (<-) e cada operação sobre estado, erro ou IORef.
- **Aninhamento**: profundidade máxima de blocos dentro de blocos, seguindo a Cognitive Complexity (Campbell, 2018), que pune o aninhamento porque código aninhado é mais difícil de entender.
- **Empate**: o mecanismo não muda a forma da eval: onde a base faz uma operação direta, o mecanismo faz uma operação de efeito, uma por uma.
- **Construtor a construtor**: a contagem também foi feita para cada caso (Num, Var, Add...), e cada caso empata.
- **Por que o Haskell tem 18 operações**: porque cada passo monádico (x <- eval a) conta. Não se compara o 18 com o 5: as linguagens são diferentes.
- **Contagem automática**: um programa conta as métricas sobre o código formatado, sem contagem à mão.

## 18. QP3: código em volta da eval

**O que dizer.** Fora da eval aparece a diferença. A versão com handlers tem 67 linhas de infraestrutura contra 3 da imperativa, e 18 delas existem só para os testes. No Haskell, mônadas e IORef ficam parecidas: 20 contra 22. Em compensação, só os handlers são reaproveitados: dois deles são usados em dois lugares.

**O que cada coisa significa.**

- **Infraestrutura (boilerplate)**: linhas fora da eval que só montam o mecanismo, sem dizer o que o efeito faz. Um programa classifica cada linha sobre os tokens do compilador, e a classificação é auditável em codigo/resultados/boilerplate-regra/.
- **67 linhas**: o código dos handlers (run_state, run_exn, run_output_emit, run_output_acc) e das composições run e run_acc.
- **18 só para os testes**: o handler de saída que acumula os valores (run_output_acc) e a composição run_acc, usados pela suíte de oráculo para ler o traço.
- **3 linhas**: a imperativa só precisa de uma pequena função que executa a eval e captura o erro.
- **Reúso**: o mesmo handler usado em mais de um lugar sem reescrever. run_state e run_exn são instalados tanto em run quanto em run_acc.

## 19. QP2: um quarto efeito nos handlers

**O que dizer.** Para testar a composabilidade, acrescentei um quarto efeito: ler valores de uma entrada. Nos handlers, o efeito novo precisa ser instalado onde os outros já são. As linhas em vermelho saem e as em verde entram: o handler novo, run_input, passa a ficar entre o de saída e o de erro. A mesma mudança acontece na composição dos testes, run_acc. Por isso são 2 pontos de modificação. Na imperativa, a leitura é só uma função nova, e nada do que existia muda.

**O que cada coisa significa.**

- **Quarto efeito (Input)**: ler o próximo valor de um fluxo de entrada. Se a entrada acabar, é erro. Foi escolhido antes de implementar, de propósito, porque interage com o efeito de exceção.
- **Linhas com - e +**: - é linha removida (em vermelho), + é linha adicionada (em verde).
- **run**: a composição que instala os handlers em volta da eval, usada na execução normal e nas medições.
- **run_acc**: a mesma composição, mas com o handler de saída que acumula os valores, usada nos testes. Também muda.
- **Instalar um handler**: colocar o handler em volta de um trecho de código (com match_with). Enquanto o trecho roda, cada perform que ele faz é atendido por esse handler.
- **Ordem dos handlers**: um envolve o outro. O de erro fica mais perto da eval, para que um erro interrompa só a avaliação, sem perder o estado e a saída.
- **run_input**: o handler novo, que atende Input entregando o próximo valor da entrada.
- **Ponto de modificação (declaração que muda)**: declaração que já existia e teve o texto alterado. Adições puras, como a declaração de Input e o próprio run_input, contam à parte. A definição foi fixada antes de implementar.

## 20. QP2: um quarto efeito nas mônadas

**O que dizer.** No Haskell, o efeito novo vira uma camada a mais na pilha. Então o tipo da pilha muda, e a função run, que executa a pilha, muda junto: também 2 pontos de modificação. A leitura é uma função nova que precisa de dois lift para chegar na camada nova. Na base IORef, como na imperativa, nada do que existia muda. Então handlers e mônadas empatam em 2, e a diferença é onde a mudança cai: nos handlers, nas composições. Nas mônadas, no tipo e no executor.

**O que cada coisa significa.**

- **StateT [Int]**: camada de estado nova, que guarda a lista de entradas ainda não lidas.
- **runStateT, runExceptT**: funções que executam uma camada da pilha e devolvem o resultado. run chama uma para cada camada, de fora para dentro.
- **state**: operação que lê e atualiza o estado de uma vez (aqui, tira o primeiro valor da lista).
- **lift**: leva uma operação de uma camada interna da pilha para a camada de fora. Com duas camadas de estado, o get comum só alcança a primeira, então a leitura da segunda precisa de lift duas vezes.
- **mtl**: a biblioteca de transformadores usada. Ela resolve automaticamente uma camada de cada tipo, não duas.

## 21. QP4: o custo de instalar os handlers

**O que dizer.** Este é o número que resume o desempenho do OCaml. No cenário Arith, que só faz contas e não usa efeito nenhum, os handlers já custam 45 nanossegundos a mais por expressão. Esse é o custo de instalar os três handlers. Instalar quer dizer rodar o código sob o handler, e o OCaml cria uma pilha própria para isso. No Haskell, a maior diferença em todo o experimento foi de 10 nanossegundos. Os números são a mediana de 3 cargas de 10.000 expressões, numa máquina virtual de nuvem.

**O que cada coisa significa.**

- **Instalar um handler**: executar o trecho de código sob o handler, com a função match_with do OCaml. Enquanto o trecho roda, cada perform dele é atendido por esse handler. Na composição run, os três handlers (estado, saída e erro) são instalados um dentro do outro em volta da eval.
- **Pilha própria (fiber)**: a cada instalação, o OCaml 5 cria um segmento de pilha novo (uma fiber) para o trecho e registra o handler. É trabalho feito antes de qualquer efeito acontecer, e é isso que custa tempo.
- **Por expressão**: os handlers são instalados de novo para cada uma das 10.000 expressões da carga. O de erro precisa ser, senão a primeira divisão por zero encerraria a carga inteira. Os outros dois poderiam ser instalados uma vez só, mas foram instalados juntos, o que triplica o custo.
- **Sem usar nenhum efeito (Arith)**: cenário só com contas (Num, Add, Mul, Div), sem Var, Let nem Print. Não faz operação de efeito, então mede o custo de estar sob o mecanismo, e não o de usá-lo.
- **ns**: nanossegundo, um bilionésimo de segundo.
- **10 ns no Haskell**: aparece justamente em Arith, a carga com mais passos monádicos por expressão. É o custo de cada passo (bind) da pilha.
- **Mediana de 3 cargas**: cada número é o do meio entre as medições das 3 sementes, o que reduz a influência de uma medição fora da curva.
- **Máquina virtual de nuvem**: as medições rodaram numa máquina virtual, como declarado no artigo. Isso é uma ameaça à validade, tratada no protocolo (apêndice A2).

## 22. QP4: tempo de execução

**O que dizer.** No OCaml, o custo cresce com o uso: começa em 45 nanossegundos só para instalar e sobe para 84 em State e 111 em Output, porque cada operação de efeito também custa. No Haskell, fica perto de zero em todos os cenários. Em razões, os handlers levaram de 1,59 a 4,26 vezes o tempo da imperativa, e as mônadas de 0,97 a 1,08 vezes o da IORef. Não é uma comparação de qual linguagem é mais rápida: cada barra é o custo a mais sobre a base da própria linguagem.

**O que cada coisa significa.**

- **Barra azul**: quantos nanossegundos a versão com handlers gasta a mais que a imperativa, por expressão.
- **Barra rosa**: quantos nanossegundos a versão com mônadas gasta a mais que a com IORef.
- **Arith**: só contas, nenhuma operação de efeito.
- **State**: 500 variáveis e duas leituras por expressão: muitas operações Get.
- **Exn**: 20% das expressões têm divisão por zero: muitas operações Fail.
- **Output**: cada expressão imprime: muitas operações Output. Os valores são acumulados em vez de escritos, para não medir o sistema de entrada e saída.
- **Por que cresce com o uso**: cada perform procura o handler, troca de pilha e volta com continue. Por isso State e Output custam mais que Arith.
- **Perto de zero**: o GHC otimiza a pilha de mônadas a ponto de quase não sobrar custo. Três dos quatro intervalos de confiança do Haskell incluem a razão 1.
- **Valores negativos**: os valores -4 e -2 são ruído de medição. Não querem dizer que as mônadas são mais rápidas que a base.

## 23. QP4: memória alocada

**O que dizer.** Na memória, a razão do OCaml parece dez vezes pior que a do Haskell: 11,5 contra 2,2. Mas a memória a mais é parecida, 168 e 150 bytes por expressão. O que muda é a base: a imperativa do OCaml aloca só 16 bytes. É a fórmula da razão no caso extremo: base barata, razão enorme.

**O que cada coisa significa.**

- **Bytes por expressão**: quanta memória o programa reserva, em média, para avaliar uma expressão.
- **Barra cinza**: a memória da base. Em cima dela, a memória a mais do mecanismo.
- **16 B**: a imperativa do OCaml só aloca o próprio resultado.
- **127 B**: a base do Haskell aloca mais porque também passa pelo IORef e pelo Map.
- **168 B a mais nos handlers**: os fechamentos (funções criadas na hora) e registros de cada instalação. Os segmentos de pilha (fibers) não entram aqui, porque o OCaml 5 os aloca fora da memória contada pelo coletor.
- **Razões 11,5 e 2,2**: (16 + 168) ÷ 16 ≈ 11,5 no OCaml e (127 + 150) ÷ 127 ≈ 2,2 no Haskell.
- **Como foi contada**: no OCaml, entre duas coletas de lixo chamadas de propósito, para não depender do momento em que o coletor roda.

## 24. Dois achados não previstos

**O que dizer.** Dois achados que eu não esperava. Primeiro, um vazamento de memória no OCaml 5.2: se o handler de erro só abandona a computação interrompida, a memória não é liberada. Com 2 milhões de erros, chegou a 1,2 GB. Encerrando com discontinue, ficou em 6 MB, e o código final usa discontinue. O experimento está em codigo/ocaml/experimento/continuacao.ml. Segundo, a medição é sensível à configuração: com uma coleta quatro vezes menor, todas as medições pareciam boas pelo R², acima de 0,95, e mesmo assim as razões mudaram até 28%. Detalhes no apêndice A4.

**O que cada coisa significa.**

- **Computação interrompida**: a continuação k que o handler de erro recebe quando acontece um Fail: o resto da eval, que não vai mais rodar.
- **Abandonar**: simplesmente não usar k. No OCaml 5.2, o segmento de pilha de k fica preso na memória.
- **discontinue k e**: retoma k lançando a exceção e dentro dela. A pilha é desmontada normalmente e a memória volta.
- **1,2 GB → 6 MB**: memória residente do processo depois de 2 milhões de erros, sem e com discontinue.
- **Coleta 4 vezes menor**: corrida curta: cota de 5 segundos e 2.000 amostras, contra 20 segundos na campanha.
- **R²**: quanto a reta usada na medição explica os tempos medidos. 1 é perfeito. O critério do protocolo é 0,95 ou mais.
- **Lição**: um R² alto sozinho não garante que a configuração de medição foi suficiente.

## 25. Seção 05: Conclusões

**O que dizer.** Para fechar: como os resultados se comparam com a literatura e o que concluo.

## 26. Comparação com a literatura

**O que dizer.** A literatura já tinha medido cada mecanismo separado, mas ninguém tinha comparado os dois no mesmo programa. Os números daqui ficam na mesma ordem de grandeza. Sivaramakrishnan e colegas, em 2021, mediram cerca de 23 nanossegundos para alocar uma fiber e trocar de pilha, da ordem dos 45 que a instalação de três handlers custou aqui. Kammar e colegas, em 2013, e Xie e Leijen, em 2020, mediram mônadas entre 1,0 e 1,3 vezes uma versão sem efeitos, e as daqui ficam no limite de baixo. E a previsão do TCC I não se confirmou: os handlers custaram mais, e as mônadas, menos do que eu esperava. Cada trabalho mede uma situação diferente, então a comparação é de ordem de grandeza.

**O que cada coisa significa.**

- **Fiber**: o segmento de pilha que o OCaml 5 cria para o trecho de código sob um handler.
- **23 ns por fiber**: Sivaramakrishnan et al. (2021) mediram cerca de 23 ns para alocar uma fiber e trocar de pilha. Não é o custo de instalar um handler inteiro.
- **1,0 a 1,3 vezes**: Kammar et al. (2013) e Xie e Leijen (2020): a versão com mônadas levou de 1,0 a 1,3 vezes o tempo da versão sem efeitos nos microbenchmarks deles.
- **TCC I**: a primeira etapa do trabalho, em que fiz a revisão e a previsão: sobrecusto abaixo de 1,5 vez nos handlers e acima de 2 nas mônadas.
- **O contrário**: os handlers passaram de 1,5 vez (1,59 a 4,26) e as mônadas ficaram abaixo de 2 (0,97 a 1,08).
- **Ordem de grandeza**: comparação aproximada, de dezenas de nanossegundos com dezenas de nanossegundos, e não valor exato.

## 27. Conclusões

**O que dizer.** Três conclusões. Na escrita, a eval não muda, e o custo está no código em volta: nas composições dos handlers e no tipo da pilha de mônadas. Na execução, os handlers cobram para ser instalados e a cada operação, e as mônadas, otimizadas pelo GHC, quase não custam. Na prática, no OCaml vale cuidar de quantas vezes se instala um handler, e no Haskell o custo aparece quando a pilha muda. O trabalho deixa também o desenho da comparação: o argumento de equivalência, a suíte de oráculo, o gerador de cargas igual nas duas linguagens e a medição por razões dentro de cada linguagem. Os limites são um único programa, uma máquina virtual e versões específicas dos compiladores. Os próximos passos são comparar os dois mecanismos na mesma linguagem, testar outros programas e efeitos e medir legibilidade com pessoas.

**O que cada coisa significa.**

- **Em volta dela**: as composições dos handlers (run e run_acc) e o tipo da pilha de mônadas (type Interp).
- **Contribuições**: argumento de equivalência expressiva, critério de equivalência funcional verificável com a suíte de oráculo, gerador de cargas replicado com teste de conformidade e normalização intralinguagem (medir contra a base da mesma linguagem). Tudo se refaz com make tudo.
- **Limites**: um único programa, uma máquina virtual de nuvem e versões específicas do OCaml e do GHC.
- **Os dois mecanismos na mesma linguagem**: há bibliotecas de efeitos algébricos para Haskell. Medir nelas eliminaria a diferença de compiladores.

## 28. Referências

**O que dizer.** Slide de consulta, não entra na fala.

## 29. Obrigado! Dúvidas?

**O que dizer.** Obrigado. O código, os dados e o artigo estão no repositório, e tudo se refaz com um comando. Fico à disposição para as perguntas.

## 30. A1. Tempo e memória, todos os cenários

**O que dizer.** Se perguntarem pelos números completos: em cada linha, a base, o custo a mais e a razão, para cada linguagem e cenário.

**O que cada coisa significa.**

- **IC de 95%**: intervalo de confiança: a faixa em que a razão verdadeira deve estar, com 95% de confiança, calculada por bootstrap.
- **Inclui 1**: se o intervalo contém 1, não dá para dizer que o mecanismo custa mais que a base.
- **Bootstrap**: técnica que reamostra as medições muitas vezes para estimar a incerteza.
- **Dispersão entre sementes**: quanto o resultado variou entre as 3 cargas. O maior caso, 18,3%, foi o Haskell Output, e por isso se usa a mediana.
- **Bechamel e Criterion**: as bibliotecas de medição do OCaml e do Haskell.

## 31. A2. Protocolo de medição

**O que dizer.** Se perguntarem como foi medido: a máquina, as opções de compilação, as bibliotecas de medição, as cargas e as regras.

**O que cada coisa significa.**

- **vCPU**: processador virtual da máquina de nuvem.
- **Afinidade fixa**: o programa medido roda sempre no mesmo núcleo, o que reduz variação.
- **flambda, -O3, -O2**: opções de otimização dos compiladores, as mesmas para mecanismo e base.
- **Cota de 20 s**: tempo máximo que o Bechamel gasta medindo cada caso.
- **Gerada fora da região medida**: as expressões são criadas antes de começar a medir, para que o tempo de gerar não entre no resultado.
- **Ordem alternada**: em cada cenário, ora mede o mecanismo primeiro, ora a base, para não favorecer um lado.

## 32. A3. O quarto efeito em cada versão

**O que dizer.** Se perguntarem se a contagem favorece as bases: a definição de ponto de modificação foi fixada antes de implementar.

**O que cada coisa significa.**

- **Adições**: código novo que não altera nada existente: a declaração da operação Input e o handler run_input nos handlers, a função de leitura nas outras versões.
- **73/73**: a suíte de oráculo ganhou casos para o efeito novo e passou inteira nas quatro versões.

## 33. A4. Sensibilidade à configuração

**O que dizer.** Se perguntarem do achado do R²: a corrida curta teve todos os R² acima de 0,95 e mesmo assim deslocou as razões, até 28% no OCaml State.

**O que cada coisa significa.**

- **Desvio**: quanto a razão da corrida curta diferiu da razão da campanha, para a mesma semente.
- **Corrida curta**: medição com menos tempo e menos amostras, feita para testar a configuração.

## 34. A5. Uso de inteligência artificial

**O que dizer.** Se perguntarem sobre IA: o uso está declarado no artigo, como o Regulamento exige. Investi em verificação (oráculo, mutação e conformidade) justamente por isso, e posso explicar qualquer parte do código.

**O que cada coisa significa.**

- **Regulamento**: o regulamento do TCC do curso, que exige declarar o uso de IA (Arts. 6º a 9º).

## 35. A6. Métricas de código

**O que dizer.** Se perguntarem como cada QP foi medida: esta tabela resume as métricas.

**O que cada coisa significa.**

- **Cognitive Complexity**: métrica de Campbell (2018) que pune o aninhamento, porque código aninhado é mais difícil de entender.
- **Regra mecânica**: um programa classifica cada linha sobre os tokens do compilador, e não à mão.

## 36. A7. Exemplo: avaliando 2 + n

**O que dizer.** Se pedirem para mostrar a eval funcionando: 2 + n, com n valendo 3, passo a passo.

**O que cada coisa significa.**

- **Retoma**: o handler chama continue k 3, e a eval continua exatamente de onde parou, com 3 como resultado do perform.

