# Guia de defesa — Parte 1: Introdução

*Reescrito em 09/11/2026 e atualizado em 10/11/2026 com os resultados da campanha final.*
Cobre o título, os resumos e a Seção 1. Para cada bloco: o que o texto afirma,
o que cada citação sustenta, os termos que você precisa definir de cabeça e as
perguntas prováveis, com resposta. A última seção lista os pontos frágeis.

**A banca:** orientador + dois membros; 20 min de apresentação e 20 min de
arguição (Art. 18). O orientador fala por último.

---

## Mapa da Introdução

| Bloco | Função | Exigência do regulamento |
|---|---|---|
| 1º parágrafo | Contexto: transparência referencial × efeitos; os dois mecanismos | contextualização/motivação |
| **Problema e justificativa** | A lacuna e por que ela importa agora | problema; justificativa |
| **Objetivo e questões de pesquisa** | O que se compara, como (razões) e as QP1–QP4; os cinco objetivos específicos | objetivos geral e específicos |
| **Contribuições e síntese dos resultados** | O que fica para a área + números principais | síntese do que foi feito e principais resultados (4º PC) |
| Último parágrafo | Roteiro das seções | descrição das seções |

---

## Resumos (Abstract e Resumo)

### O que dizem

Gerenciar efeitos é um problema central; mônadas (Haskell, transformadores) e
efeitos algébricos (OCaml 5, *handlers*) são as duas abordagens; o mecanismo não
se separa do *runtime*, então a comparação é feita **por razões** contra uma base
imperativa em cada linguagem; quatro implementações, oráculo derivado da
semântica, gerador replicado; LOC se mostrou sensível ao estilo; sobrecusto medido.

### Antes da banca

- **Os dois resumos precisam caber em até 10 linhas e ficar na 1ª página**
  (modelo SBC). Hoje passam disso. `./medir.sh` confere.
- O orientador anotou "I.A.?" ao lado do resumo: **reescreva-o com as suas
  palavras.** Na arguição, você precisa conseguir dizer cada frase dele sem ler.
- Ao reescrever, não repita duas afirmações que o próprio artigo desmente:
  (1) a LOC **não** depende do "sequenciamento explícito exigido pelo OCaml" (as
  duas linguagens gastam três linhas por operador binário, Seção 6.1); (2) a
  restrição intralinguagem não é o remédio para o estilo; quem cuida do estilo
  é a normalização por formatadores.
- Os números do resumo têm de ser os da **sua** campanha final (ver Guia 04).

---

## 1º parágrafo — Contexto

### O que o texto afirma

O paradigma funcional se apoia na **transparência referencial**: trocar uma
expressão por outra de mesmo valor não muda o significado do programa. Isso
entra em tensão com operações que programas reais fazem (arquivos, exceções,
estado). Essas operações são os **efeitos computacionais**. Dois mecanismos
dominam: **mônadas** (encapsulam efeitos em tipos; em Haskell, combinadas por
*monad transformers*) e **efeitos algébricos** (efeitos como conjuntos de
operações, com semântica fixada por *handlers*).

### Citações

| Citação | Sustenta |
|---|---|
| `strachey:67` | a definição de transparência referencial (o `.bib` traz 2000 porque a versão citável é a republicação das notas de 1967) |
| `moggi:91`, `wadler:92` | mônadas como estrutura semântica e como técnica de programação |
| `liang:95` | *monad transformers* |
| `plotkin:03` | efeitos como **operações** algébricas (não trata de *handlers*) |
| `plotkin:09` | ***handlers*** de efeitos algébricos |

> **`hughes:89` saiu do texto em 10/11.** O 1º parágrafo o citava para
> "facilita o raciocínio equacional e a verificação formal", e Hughes argumenta
> pela **modularidade** (funções de alta ordem e avaliação preguiçosa), abrindo
> o artigo justamente contra quem defende a programação funcional pelo que ela
> não tem. A citação foi retirada; se você a reintroduzir ao reescrever o
> parágrafo, cite-o para a modularidade.

### Termos

- **Transparência referencial**: substituir uma expressão pelo seu valor não
  muda o programa; é o que permite raciocinar por equações.
- **Efeito computacional** (definição de trabalho da Seção 2): um conjunto de
  operações cuja interpretação fica em aberto no ponto de uso e é fixada em
  outro lugar.
- **Por que não "efeito colateral"**: "colateral" sugere acidente; na tradição
  algébrica o efeito é uma operação declarada, com semântica própria.

---

## Problema e justificativa

### O que o texto afirma

A relação **teórica** entre os mecanismos está estabelecida
(`schrijvers:19`, `forster:17`); as consequências **práticas**, não. Os estudos
tratam fundamentos, expressividade ou custo **em separado**, e nenhum reúne as
quatro dimensões sobre um mesmo caso de uso. A escolha deixou de ser hipotética:
com *handlers* nativos no OCaml 5, a alternativa existe numa linguagem de uso
industrial, e quem decide hoje não tem evidência que informe ao mesmo tempo
custo de execução e custo de escrita.

### Como defender

- **"Nenhum reúne"**: diga "nenhum dos trabalhos revisados", como a Seção 3.2.
  Afirmar que nada existe é indefensável; afirmar que a revisão feita não
  encontrou é honesto e suficiente.
- **Por que agora**: OCaml 5.0 (dez/2022) tornou *handlers* nativos disponíveis
  em produção. Antes, a decisão prática era só "qual arranjo monádico".
- **Quem precisa da resposta**: quem projeta linguagens (oferecer o mecanismo
  como primitiva?) e quem mantém código monádico (migrar compensa?). A segunda
  audiência é o argumento mais forte, porque a decisão dela depende de custo e
  ergonomia **juntos**.

---

## Objetivo e questões de pesquisa

### O objetivo

Comparar mônadas e efeitos algébricos em **legibilidade, composabilidade, poder
de abstração e desempenho**, sobre um caso de uso único com estado, exceções e
saída.

### O desenho por razões (a ideia central do trabalho)

O mecanismo não se separa do *runtime*: a versão monádica roda no GHC e a versão
com *handlers* no OCaml. Comparar tempos absolutos entre as duas seria comparar
duas variáveis de uma vez. Então:

```
razão_OCaml   = handlers  / base imperativa em OCaml
razão_Haskell = mônadas   / base com IORef em Haskell
```

e só então as duas razões são confrontadas. **Esse confronto é exploratório**:
as bases têm custos diferentes, em *runtimes* diferentes, e o desenho não separa
as duas coisas. Diga isso antes que perguntem.

### As QPs

| | Pergunta | Métrica (Seção 4.2) |
|---|---|---|
| QP1 | menos carga estrutural de leitura? | LOC de `eval`, operações de efeito (por construtor), aninhamento |
| QP2 | menos pontos de modificação para compor/estender? | pontos de modificação ao inserir o quarto efeito |
| QP3 | menos *boilerplate*, mais reuso? | *boilerplate* por regra mecânica sobre os *tokens*; instâncias de reutilização |
| QP4 | qual o custo de execução, em tempo e memória? | razões de tempo e de alocação |

**Fora do escopo:** legibilidade **percebida** (exigiria estudo com pessoas); as
métricas são *proxies* estruturais.

### Os cinco objetivos específicos

Sistematizar as diferenças e o argumento de equivalência; especificar a semântica
e o critério de equivalência; implementar as quatro versões com oráculo e
gerador; aplicar as métricas de código; medir o sobrecusto. **Os três primeiros
são instrumentais; os dois últimos, de avaliação** (geram as QPs).

---

## Contribuições e síntese dos resultados

O texto põe a contribuição **no desenho que torna a comparação legítima**, e não
num artefato isolado:

1. o argumento de equivalência expressiva (Seção 2.3);
2. o critério de equivalência funcional verificável e a suíte de oráculo que o
   realiza;
3. a normalização intralinguagem, que separa o que cabe ao mecanismo do que
   cabe ao *runtime*.

> **Cuidado com a 3.** Kammar et al. (2013) e Xie & Leijen (2020) já medem
> *handlers* e mônadas contra uma **versão pura** na mesma linguagem (conferido
> nas fontes). O que é próprio deste trabalho é **confrontar as duas razões
> entre linguagens** e fazê-lo sobre um **caso integrado**. Diga assim. Se
> disser que a normalização por base é inédita, a resposta da banca é "Kammar,
> 2013, Tabela 1".

**Síntese dos resultados (campanha de 10/11, máquina virtual de nuvem):**

- **QP1:** dentro de cada linguagem, `eval` do mecanismo e da base empatam nas
  três métricas (29/5/2 no OCaml, 27/18/1 no Haskell), também por construtor.
- **QP2/QP3:** a diferença está fora de `eval`: *boilerplate* 67 × 3 linhas no
  OCaml (*handlers* × imperativa) e 20 × 22 no Haskell (mônadas × `IORef`); só
  os mecanismos exigiram pontos de modificação para o quarto efeito (2 e 2,
  contra 0 e 0).
- **QP4:** *handlers* custam 1,59 a 4,26 vezes a base em tempo e 6,7 a 13,2 em
  alocação; mônadas, 0,97 a 1,08 e 1,1 a 2,2.

Os números do texto são **macros geradas** pela campanha (`make artigo`): se
você refizer a campanha no seu computador, eles mudam sozinhos, e o script
avisa se alguma frase qualitativa deixar de valer (Guia 04, seção 8).

---

## Perguntas mais prováveis

1. **"Por que razões e não tempos?"** → porque o mecanismo não se separa do
   *runtime*; a razão contra uma base na mesma linguagem cancela o fator da
   linguagem.
2. **"O confronto entre as linguagens vale?"** → é exploratório, e o texto diz
   isso; as bases têm custos diferentes (`Map` × `Hashtbl`) e o viés
   1 + Δ/T_base tem direção conhecida.
3. **"Kammar e Xie já não fazem isso?"** → fazem a comparação **intralinguagem**,
   com versão pura de controle, em *microbenchmarks* de contador; este trabalho
   integra quatro dimensões sobre um interpretador e confronta as duas razões.
4. **"Você mede legibilidade?"** → mede três *proxies* estruturais, não a
   legibilidade percebida, que fica como trabalho futuro.
5. **"Por que um interpretador?"** → é o caso de uso canônico de efeitos
   combinados (`liang:95`, `pretnar:15`): pequeno o bastante para ter semântica
   formal e equivalência verificável, e com os três efeitos clássicos. O preço é
   n = 1, e o texto declara.
6. **"E as hipóteses do TCC I?"** → ver "Pontos frágeis", item 2.

---

## Pontos frágeis — leia antes de apresentar

1. **Resumos acima de 10 linhas e com marca "I.A.?".** Reescreva com as suas
   palavras.
2. **A hipótese do TCC I foi refutada, e o texto diz isso** (Seção 6.3, com
   `marchioni:tcc1`): previa-se sobrecusto abaixo de 1,5× no OCaml e acima de
   2,0× no Haskell; mediu-se 1,59–4,26 e 0,97–1,08. Apresente isso como
   resultado, não como problema: uma previsão refutada é informação.
3. **QP1–QP3 estão medidas por regra mecânica.** A classificação de cada linha
   de *boilerplate* está em `codigo/resultados/boilerplate-regra/*.csv`. A dupla
   contagem humana virou validação opcional (`metricas.py concordancia`); se o
   orientador quiser fazê-la, as planilhas estão prontas.
4. **Uso de IA.** O código, a execução da campanha (em máquina virtual de
   nuvem) e a redação preliminar dos trechos de resultados foram feitos com a
   ferramenta, e a declaração diz isso (Arts. 7º e 8º). Falta só a versão do
   modelo no lugar de `[PREENCHER]`. Se perguntarem, responda com transparência
   e mostre que entende cada decisão (Guia 04).
5. **Um único caso de uso, uma máquina, versões específicas de compilador.**
