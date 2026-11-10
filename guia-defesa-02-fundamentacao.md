# Guia de defesa — Parte 2: Fundamentação Teórica

*Reescrito em 09/11/2026 para a versão atual do `artigo.tex` (sem mudanças na Seção 2 em 10/11).* Cobre a Seção 2:
2.1 Mônadas e Transformadores, 2.2 Efeitos Algébricos e *Handlers*, 2.3
Relação Formal.

Esta é a seção em que a banca pede "escreve no quadro". Há uma parte só de
derivações no fim.

---

## A definição de trabalho (abertura da seção)

> Um **efeito** é um conjunto de operações cuja interpretação é deixada em
> aberto no ponto de uso e fixada em outro lugar do programa.

| | Onde a interpretação é fixada | Quando |
|---|---|---|
| Pilha de transformadores | pelo **tipo** da computação | estaticamente |
| Efeitos algébricos | por um ***handler*** instalado sobre um escopo | dinamicamente |

"É essa diferença que as quatro dimensões medem." Se perguntarem por que essas
quatro dimensões, a resposta parte daqui: são as consequências práticas de
fixar a interpretação no tipo ou no escopo.

---

## 2.1 Mônadas e transformadores

### Definição

Uma mônada é uma tripla (T, η, μ): T endofuntor, η : Id ⇒ T e μ : T² ⇒ T
transformações naturais, com

- associatividade: μ ∘ Tμ = μ ∘ μT (as duas de T³ em T);
- unidade: μ ∘ Tη = μ ∘ ηT = id_T (de T em T).

**Truque no quadro:** confira os tipos de cada lado. Se não fecharem, a lei está
errada.

**A contribuição de Moggi:** separar **valores** (tipo A) de **computações**
(tipo TA).

### Kleisli e o Haskell

A tripla de Kleisli (T, η, (−)*) é a apresentação que o programador usa:
η é o `return`, e a extensão f* = μ_B ∘ Tf, para f : A → TB, **corresponde ao
`>>=` com os argumentos trocados** (`=<<`). As três leis de `Monad` (identidade
à esquerda, identidade à direita, associatividade) são essas leis. São elas que
mantêm o raciocínio equacional sob efeitos (`wadler:90`, `wadler:92`).

### O problema: compor efeitos

Os transformadores (`liang:95`) impõem uma **ordem estática**, e a ordem muda o
significado:

- estado externo: `StateT s (Except e) a ≅ s → (e + (a × s))`: **o estado se
  perde no erro**;
- exceção externa: `ExceptT e (State s) a ≅ s → ((e + a) × s)`: **o estado
  sobrevive**.

"São funções de tipos distintos, não variantes de estilo." O trabalho usa
`ExceptT String (StateT Env IO)`, com a exceção externa, porque o critério de
equivalência exige que o estado sobreviva ao erro. Um caso do oráculo falha se a
pilha for invertida, e o teste de mutação (`scripts/mutantes.py`) confirma isso.

### mtl

Cada camada exige elevações (`lift`); o **mtl** as elimina no ponto de uso,
deslocando-as para as instâncias de classe. O trabalho usa mtl por comparar o
transformador **como é idiomaticamente usado**, e o texto observa que isso
reduz de antemão a vantagem que se atribuiria aos *handlers* em
*boilerplate*. **Fale disso por iniciativa sua**: é uma escolha conservadora
contra a sua própria hipótese.

---

## 2.2 Efeitos algébricos e *handlers*

### Operações e aridade

Cada operação tem assinatura e **aridade**, isto é, o número de continuações
que recebe. `raise` tem aridade **zero**: não há continuação para retomar. Essa
é a contrapartida algébrica de o *handler* de exceção não retomar a
continuação.

### Onde a ordem mora

> A composabilidade **não é ausência de ordenação**, e sim mudança de onde ela
> mora: sai do tipo e vai para o escopo de instalação dos *handlers*.

E o texto admite: ***handlers* de efeitos que interagem continuam não
comutando.** Se tentarem encurralar você com "mas *handlers* também não
comutam", a resposta é "sim, e está escrito na 2.2".

### *Handlers* e continuações

| O que o *handler* faz com a continuação | Modela |
|---|---|
| retoma uma vez | estado, saída |
| não retoma | exceção |
| retoma várias vezes | não determinismo |

Koka verifica estaticamente quais efeitos uma função realiza (*effect rows*,
`leijen:14`). O OCaml 5 não: um efeito não tratado é erro **em tempo de
execução** (exceção `Effect.Unhandled`). É a principal desvantagem da abordagem
estudada; o texto a põe nos trabalhos futuros (segurança estática de efeitos
como quinta dimensão).

### OCaml 5, concretamente

- Efeito: extensão do tipo `Effect.t`; disparo por `perform`.
- *Handler*: `match_with comp arg { retc; exnc; effc }`. `effc` devolve
  `Some (fun k -> …)` para as operações que trata e `None` para repassar ao
  *handler* externo, e é assim que *handlers* se encadeiam.
- A continuação `k` é retomada com `continue` ou encerrada com `discontinue`.
- *Handlers* **profundos** (`Effect.Deep`): permanecem instalados sobre a
  continuação retomada.
- Continuações ***one-shot***: retomáveis no máximo uma vez. É a contrapartida
  da implementação por segmentos de pilha (*fibers*), que não precisam ser
  copiados. Consequência: não determinismo não é diretamente expressável.

> **Detalhe que vale ouro (e que está no código):** no OCaml 5.2,
> *abandonar* a continuação do efeito de exceção sem retomá-la **vaza o
> segmento de pilha**. O experimento `ocaml/experimento/continuacao.ml` mede
> isso: 2 milhões de erros levam a memória a ~1,2 GB abandonando, contra ~6 MB
> com `discontinue`. Por isso o *handler* de exceção usa `discontinue`. Na
> álgebra, "não retomar" continua valendo: `discontinue` encerra a computação
> interrompida levantando uma exceção nela, e não a continua. Ver Guia 04.

---

## 2.3 Relação formal: o argumento em três passos

Esta subseção sustenta a **justiça** da comparação.

**Passo 1. Inter-expressividade** (`forster:17`): *handlers*, reflexão monádica e
controle delimitado traduzem-se uns nos outros, com ressalvas no cenário
tipado.

**Passo 2. A correspondência fina** (`schrijvers:19`): há uma classe de efeitos
algébricos **modulares** em correspondência com uma classe de transformadores.
Dentro dela, a escolha não muda **o que** se expressa, apenas **como** e **a que
custo**. **É esse resíduo, ergonômico e de desempenho, que o trabalho mede.**
Decore essa frase.

**Passo 3. Os três efeitos do caso de uso estão na classe:** cada um tem
apresentação por assinatura e equações, com modelo livre, e corresponde a um
transformador da classe:

| Efeito | Operações | Transformador | Mônada |
|---|---|---|---|
| estado | `get`, `set` | `StateT` | S → (− × S) |
| exceção | `raise` (aridade 0) | `ExceptT` | (− + E) |
| saída | `out` | `WriterT` | (− × V*) |

Todos usam a continuação **no máximo uma vez** (uso afim: retomam uma vez ou não
retomam), e por isso cabem nas continuações *one-shot*. **Conclusão: para esses
três efeitos, os dois mecanismos têm o mesmo alcance expressivo.**

**Fora da classe:** efeitos **escopados**, isto é, operações que recebem uma
subcomputação como argumento (`wu:14`). Nenhum dos três efeitos do caso de uso é
desse tipo.

> **Mudou em relação à versão anterior:** o artigo **não** diz mais que o
> ambiente global é imposto pela teoria. A Seção 4.1 diz que é "simplificação da
> linguagem interpretada, e não imposição da teoria": o escopo léxico seria
> exprimível salvando e repondo o vínculo com as mesmas operações de primeira
> ordem. Defenda **essa** versão. Se perguntarem "e o escopo léxico?", a
> resposta é que é uma limitação do caso de uso, declarada, e não da
> correspondência.

### Se perguntarem sobre as equações do estado

A versão anterior falava em "quatro equações". Com **uma** célula de estado
são quatro (ler-ler, ler-escrever, escrever-ler, escrever-escrever). Este caso de
uso tem **uma posição por variável**, e a apresentação de Plotkin e Power para
várias posições tem **sete** equações: as quatro por posição mais três de
comutação entre posições distintas. O texto atual não entra nisso. Se a pergunta
vier, essa é a resposta precisa.

---

## Derivações para o quadro

### 1. Os dois isomorfismos (a mais provável)

```
StateT  s m a = s -> m (a, s)
ExceptT e m a = m (Either e a)

StateT s (Except e) a = s -> Either e (a, s)      ≅ s -> (e + (a × s))
ExceptT e (State s) a = s -> (Either e a, s)      ≅ s -> ((e + a) × s)
```

Leitura: **onde está o s de saída em relação ao +.** Dentro da soma, ele some no
erro; fora dela, sobrevive.

### 2. Extensão de Kleisli

f : A → TB; Tf : TA → T²B; μ_B : T²B → TB; logo f* = μ_B ∘ Tf : TA → TB.

### 3. Tipos das leis

Associatividade: T³ ⇒ T dos dois lados. Unidade: T ⇒ T.

---

## Perguntas mais prováveis

1. "Escreve o isomorfismo das duas ordens de pilha." → derivação 1.
2. "Se são equivalentes, o que sobra para medir?" → o como e o a que custo.
3. "*Handlers* comutam?" → não quando os efeitos interagem; está na 2.2. No
   código deste trabalho, estado e exceção comutam porque o estado está fora do
   *handler* (Guia 04).
4. "Por que aridade zero?" → não há continuação para retomar.
5. "Por que ambiente global?" → simplificação do caso de uso, não imposição da
   teoria (Seção 4.1).
6. "Dá para fazer não determinismo?" → não diretamente, com continuações
   *one-shot*; está nos trabalhos futuros.
7. "Por que mtl?" → comparar o idioma real, o que joga contra a hipótese de
   vantagem dos *handlers* em *boilerplate*.

---

## Pontos frágeis

1. A equivalência expressiva é **local aos três efeitos**, não geral.
2. Segurança estática de efeitos é desvantagem clara do OCaml 5; está como
   trabalho futuro.
3. Efeitos escopados estão fora da classe; o caso de uso não os exercita.
