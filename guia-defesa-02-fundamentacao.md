# Guia de defesa — Parte 2: Fundamentação Teórica

Cobre a Seção 2 do `artigo.tex` (`sec:fundamentacao`), incluindo as três
subseções: Mônadas e Transformadores, Efeitos Algébricos e Handlers, e Relação
Formal entre as Abordagens.

**Diferença em relação à Parte 1:** esta seção é majoritariamente matemática.
Isso muda o tipo de pergunta que você vai receber. Na introdução perguntam
"por que você acha isso?"; aqui perguntam **"prova"** ou **"escreve aí"**. Há uma
seção específica de derivações que você deve saber fazer no quadro.

---

## Mapa da seção

| Subseção | O que estabelece | Serve a |
|---|---|---|
| Abertura | Definição de trabalho de *efeito* | Vocabulário de todo o artigo |
| 2.1 Mônadas e Transformadores | Formalismo monádico + o problema da ordenação | Um lado da comparação |
| 2.2 Efeitos Algébricos e Handlers | Operações, aridades, handlers, OCaml 5 | O outro lado |
| 2.3 Relação Formal | Argumento em 4 passos de equivalência expressiva | **OE1 — a justiça da comparação** |

**A 2.3 é a subseção que mais importa.** Ela é o OE1 e sustenta a Contribuição 1.
Sem ela, comparar os dois mecanismos seria comparar coisas que fazem trabalhos
diferentes, e a comparação inteira desmoronaria.

---

## A definição de trabalho (abertura da seção)

> Um **efeito** é um conjunto de operações cuja interpretação é deixada em aberto
> no ponto de uso e fixada em outro lugar do programa.

**Decore essa frase.** Ela é o eixo do artigo inteiro, e a partir dela sai a
tese central da seção:

| | Onde a interpretação é fixada | Quando |
|---|---|---|
| **Mônadas** | Pelo tipo da computação e pela instância que o habita | **Estaticamente** |
| **Efeitos algébricos** | Por um handler instalado sobre um escopo | **Dinamicamente** |

**"É essa diferença que as quatro dimensões medem."** Se perguntarem por que
essas quatro dimensões e não outras, a resposta parte daqui: elas medem as
consequências práticas de fixar a interpretação estática ou dinamicamente.

---

## 2.1 — Mônadas e Transformadores

### A definição formal

Dada uma categoria $\mathcal{C}$, uma mônada é uma tripla $(T, \eta, \mu)$ com:
- $T : \mathcal{C} \to \mathcal{C}$ endofuntor
- $\eta : \mathrm{Id} \Rightarrow T$ (transformação natural)
- $\mu : T^2 \Rightarrow T$ (transformação natural)

sujeitas às **leis das mônadas**:

$$\mu \circ T\mu = \mu \circ \mu T \qquad \text{(associatividade)}$$
$$\mu \circ T\eta = \mu \circ \eta T = \mathrm{id}_T \qquad \text{(unidade)}$$

**Truque para não errar no quadro:** confira os tipos. Na associatividade, os
dois lados vão de $T^3 \Rightarrow T$. Na unidade, de $T \Rightarrow T$. Se os
tipos não fecharem, você escreveu errado.

### A contribuição de Moggi, em uma frase

Separar **valores** (tipo $A$) de **computações** (tipo $TA$). O efeito
acrescentado por $T$ passa a ser tratável uniformemente no sistema de tipos.

### A ponte para o Haskell

A formulação $(T,\eta,\mu)$ equivale à **tripla de Kleisli** $(T, \eta, (-)^*)$,
em que a extensão de $f : A \to TB$ é

$$f^* = \mu_B \circ Tf \;:\; TA \to TB$$

- $\eta$ é o `return`
- $f^*$ é o `>>=` **com os argumentos trocados** (ou seja, `=<<`)

**Derivação para o quadro:** $f : A \to TB$, logo $Tf : TA \to T^2B$, e
$\mu_B : T^2B \to TB$. Compondo: $TA \to TB$. Fecha.

As leis categóricas traduzem-se nas **três** leis que uma instância de `Monad`
em Haskell deve satisfazer (identidade à esquerda, identidade à direita,
associatividade). São elas que garantem que o raciocínio equacional prometido na
introdução sobreviva à introdução de efeitos.

### O problema: compor efeitos

Transformadores empilham mônadas. Mas a composição impõe **ordenação explícita e
estática**, e a ordem muda a semântica. Os dois isomorfismos:

**Estado externo — estado se perde no erro:**
$$\texttt{StateT}\;s\;(\texttt{Except}\;e)\;a \;\cong\; s \to (e + (a \times s))$$

**Exceção externa — estado sobrevive:**
$$\texttt{ExceptT}\;e\;(\texttt{State}\;s)\;a \;\cong\; s \to ((e + a) \times s)$$

> **Esta é a derivação mais provável de ser pedida no quadro.** Veja a seção
> "Derivações que você deve saber fazer" no fim.

**A frase que fecha o ponto:** "não é diferença estilística — são funções de
tipos distintos."

### A escolha do `mtl`, e por que ela é um argumento a seu favor

Cada camada exige operações de elevação (`lift`, `liftIO`), e as instâncias de
elevação crescem **quadraticamente** com o número de transformadores e classes.
Bibliotecas baseadas em classes de tipos (`mtl`) eliminam boa parte dessas
elevações no ponto de uso, deslocando-as para a definição das instâncias.

**O trabalho adota `mtl` deliberadamente**, por comparar o transformador *como
ele é idiomaticamente usado*.

> **Volunteie isso na apresentação.** É um viés conservador autoimposto: a
> escolha **reduz de antemão** a vantagem esperada dos handlers em volume de
> boilerplate (H3). Logo, qualquer vantagem que ainda assim se observe é mais
> significativa. Quem monta o experimento contra a própria hipótese ganha
> credibilidade.

---

## 2.2 — Efeitos Algébricos e Handlers

### Operações e aridades

Cada operação tem uma assinatura e uma **aridade** — o número de continuações
que recebe:

| Operação | Aridade | Significado |
|---|---|---|
| `get` | indexada pelos valores possíveis | uma continuação por valor de estado |
| `set` | um | uma continuação |
| `raise` | **zero** | nenhuma continuação |

**A aridade zero de `raise` é a contrapartida algébrica exata de o handler de
exceção descartar a continuação.** Essa correspondência entre um fato algébrico
e um fato operacional é dos melhores momentos da seção — saiba dizê-la.

### A tese sobre composabilidade (não exagere a favor)

> A composabilidade **não é ausência de ordenação**, e sim mudança de **onde a
> ordenação mora**: deixa de ser fixada estaticamente no tipo e passa a ser
> determinada dinamicamente pelo escopo de instalação dos handlers.

E o texto admite explicitamente: **handlers de efeitos que interagem — estado e
exceção — continuam não comutando**, do mesmo modo que camadas de uma pilha
monádica.

> Muitos textos vendem efeitos algébricos como "livres de ordem". O seu não vende.
> Se alguém tentar te encurralar com "mas handlers também não comutam", a resposta
> é: **sim, e está escrito na Seção 2.2**.

### Handlers e continuações

Um handler intercepta operações num escopo delimitado e recebe a **continuação**
da computação interrompida:

| O que faz com a continuação | Modela |
|---|---|
| Retoma **uma vez** | Estado, entrada/saída |
| **Descarta** | Exceções |
| Retoma **múltiplas vezes** | Não determinismo |

Marcos citados: consolidação em **Eff** (`bauer:15`); **effect rows** em Koka,
verificando estaticamente quais efeitos uma função pode realizar (`leijen:14`).

### A quinta dimensão que ficou de fora — e por que admiti-la ajuda

O OCaml 5 **não tem sistema de tipos para efeitos**: efeito não tratado falha em
**tempo de execução**. Em Haskell, o tipo `ExceptT String (StateT Env IO) Int`
declara os três efeitos e a omissão de tratamento é **erro de compilação**.

O texto chama isso de **quinta dimensão de comparação** — segurança estática de
efeitos — e a deixa deliberadamente fora do arcabouço, retomando-a como limitação
em `sec:protocolo`. (Verifiquei: a promessa é cumprida lá.)

> Diga isso antes que perguntem. É a desvantagem mais óbvia da abordagem que você
> está estudando, e admiti-la de frente é mais forte do que ser pego por ela.

### OCaml 5, concretamente

- Efeito: extensão do tipo `Effect.t`, cujo parâmetro registra o tipo de retorno
- Disparo: `Effect.perform`
- Instalação: `match_with`, com três cláusulas:
  - `retc` — aplicada ao valor quando a computação termina sem efeito
  - `exnc` — exceções nativas
  - `effc` — interpretação das operações; devolve `Some` para as que trata e
    `None` para as que repassa ao handler externo
- **`None` é o mecanismo de encadeamento entre handlers.** Saiba isso.
- Continuação `k`: `continue` (retoma), `discontinue` (retoma lançando exceção),
  ou descarte
- **Handlers profundos** (`match_with`) permanecem instalados sobre a continuação
  retomada; **rasos** (`Effect.Shallow`) precisariam ser reinstalados a cada
  operação. O trabalho usa profundos.

### Continuações one-shot

Cada continuação pode ser retomada **no máximo uma vez**. É a contrapartida da
implementação por segmentos de pilha (`sec:custo`): é *porque* são one-shot que o
segmento não precisa ser copiado.

**Consequência:** não determinismo — que exige retomada múltipla — **não é
diretamente expressável** nessa implementação. Limitação registrada na validade
externa.

---

## 2.3 — Relação Formal: o argumento em quatro passos

Esta é a subseção que sustenta a justiça da comparação. Saiba recitar os quatro
passos em ordem.

### Passo 1 — Inter-expressividade estabelecida

Handlers de efeito, reflexão monádica e controle delimitado são
inter-expressáveis, com traduções formais entre os três e ressalvas explícitas
para o cenário tipado (`forster:17`).

**A noção relevante é macro-expressividade** (`felleisen:91`): a pergunta não é
se ambos computam as mesmas funções — isso é trivialmente verdadeiro —, mas se um
pode ser traduzido no outro por transformação **local e composicional**,
homomórfica nos construtores sintáticos e conservativa sobre a linguagem-núcleo,
**sem reescrita global**.

Antecedente histórico: qualquer mônada é representável por continuações
delimitadas e uma única célula de estado (`filinski:94`).

> Se perguntarem "o que é macro-expressividade?", a resposta curta: é a diferença
> entre "dá para fazer" e "dá para fazer sem reescrever o programa inteiro".

### Passo 2 — A correspondência, refinada

Existe uma classe identificável de efeitos algébricos **modulares** em
correspondência com uma classe específica de transformadores monádicos
(`schrijvers:19`).

**A consequência é a frase-chave do trabalho:** dentro dessa classe, a escolha
entre os mecanismos não altera *o que* pode ser expresso, apenas *como* se
expressa e *a que custo*. **É exatamente esse resíduo — ergonômico e de
desempenho — que o trabalho mede.**

### Passo 3 — Os três efeitos deste caso de uso se qualificam

**São algébricos** (assinatura + equações, com modelo livre):

| Efeito | Operações | Equações | Modelo livre |
|---|---|---|---|
| Estado | `get`, `set` | **quatro** (abaixo) | $S \to (- \times S)$ |
| Exceções | `raise`, aridade zero | nenhuma (teoria livre) | $(- + E)$ |
| Saída | `out` | monoide livre sobre os valores | $(- \times V^*)$ |

**As quatro equações do estado** — saiba enunciar:
1. Duas leituras consecutivas devolvem o mesmo valor
2. Ler após escrever devolve o escrito
3. A última escrita prevalece
4. Escrever de volta o valor lido é inócuo

**Usam a continuação no máximo uma vez:** `get`, `set` e `out` retomam
exatamente uma vez; `raise` descarta. Uso **afim**, não estritamente linear —
justamente por causa do descarte. Nenhum exige retomada múltipla, e todos cabem
sob as continuações one-shot do OCaml 5.

> **Detalhe que vale ouro:** as equações do estado são precisamente o que a suíte
> de oráculo verifica nos casos de persistência e revinculação de `Let`. Ou seja,
> a teoria algébrica não ficou no papel — virou teste executável. Diga isso.

### Passo 4 — A conclusão, com a ressalva

Para **os três efeitos deste caso de uso**, os dois mecanismos têm o mesmo
alcance expressivo, e as diferenças observáveis são de ergonomia e desempenho.

**A ressalva é obrigatória:** sob continuações one-shot, efeitos de retomada
múltipla não são diretamente expressáveis. A equivalência invocada é **local ao
caso de uso**, não uma equivalência entre os mecanismos em geral.

### O qualificador final

A correspondência recai sobre efeitos cuja teoria admite apresentação
**algébrica**, de modelo livre (`plotkin:03`). Nem toda mônada é algébrica:

- **Contraexemplo clássico:** a mônada de continuação
- **Caso limítrofe:** os efeitos **escopados** (`sec:custo`)

**E é por essa razão — e não por conveniência — que o caso de uso adota ambiente
global sem restauração de vínculos.** Essa frase antecipa uma acusação séria
("você escolheu escopo global porque era mais fácil"). A resposta é que escopo
com restauração seria um efeito *escopado*, que cai fora da classe onde a
correspondência formal vale.

---

## Derivações que você deve saber fazer no quadro

### 1. Os dois isomorfismos (a mais provável)

Parta das definições:
```
StateT  s m a  =  s -> m (a, s)
ExceptT e m a  =  m (Either e a)
```

**Estado externo:**
```
StateT s (Except e) a
  = s -> Except e (a, s)
  = s -> Either e (a, s)
  ≅ s -> (e + (a × s))
```
No caso `Left e` **não há componente de estado**. Estado perdido.

**Exceção externa:**
```
ExceptT e (State s) a
  = State s (Either e a)
  = s -> (Either e a, s)
  ≅ s -> ((e + a) × s)
```
O `s` final está **fora** da soma — existe tanto no sucesso quanto no erro.
Estado sobrevive.

**A leitura que fecha:** olhe onde o $s$ de saída está em relação ao $+$. Dentro
da soma, some no erro; fora dela, sobrevive.

### 2. A extensão de Kleisli

$f : A \to TB$; $Tf : TA \to T^2B$; $\mu_B : T^2B \to TB$; logo
$f^* = \mu_B \circ Tf : TA \to TB$.

### 3. Verificação de tipos das leis

Associatividade: $T^3 \Rightarrow T$ dos dois lados.
Unidade: $T \Rightarrow T$ dos dois lados.

---

## Perguntas mais prováveis

1. **"Escreve o isomorfismo das duas ordens de pilha."** → Derivações, item 1
2. **"O que é macro-expressividade e por que ela importa aqui?"** → Passo 1
3. **"Se são formalmente equivalentes, o que sobra para medir?"** → Passo 2: sobra
   o *como* e o *a que custo*
4. **"Handlers também não comutam, comutam?"** → 2.2, e está admitido no texto
5. **"Por que aridade zero para `raise`?"** → sem continuação para retomar; é a
   contrapartida algébrica do descarte
6. **"Por que ambiente global e não escopo léxico?"** → escopo com restauração
   seria efeito *escopado*, fora da classe onde a correspondência vale
7. **"Por que `mtl` e não transformadores puros?"** → comparar o idioma real, e
   isso enfraquece a própria H3
8. **"Vocês conseguem expressar não determinismo?"** → não, sob one-shot; está
   registrado como limitação

---

## Pontos frágeis conhecidos

1. **A equivalência expressiva é local ao caso de uso**, não geral. O texto diz
   isso, mas se você generalizar na fala, será corrigido.
2. **Segurança estática de efeitos** é desvantagem clara do OCaml 5, reconhecida
   como quinta dimensão e deixada fora.
3. **Não determinismo fora de alcance** sob continuações one-shot.
4. **Efeitos escopados** ficam no limite da correspondência formal — é o ponto
   onde a teoria que você invoca começa a não valer.
5. **Handlers profundos apenas**; rasos não foram avaliados.

---

## Correções aplicadas nesta seção (histórico)

Para você não ser pego dizendo a versão antiga:

- `StateT (ExceptT IO)` estava sem os parâmetros de tipo → agora
  `StateT s (ExceptT e IO)`
- "uso **linear** da continuação" era impreciso, porque `raise` descarta →
  agora "no máximo uma vez", com a distinção **afim** vs. linear explicitada
- Macro-expressividade estava **sem citação** → agora `felleisen:91`
  (*On the Expressive Power of Programming Languages*, 1991), que é diferente do
  `felleisen:92` usado na semântica para contextos de avaliação
- "formulação monoidal" → "formulação em termos de $(T,\eta,\mu)$", para não
  confundir com categoria monoidal
- Apresentação algébrica de modelo livre: `plotkin:09` → `plotkin:03`, que é o
  artigo de operações algébricas
