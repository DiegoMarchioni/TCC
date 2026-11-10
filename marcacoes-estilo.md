# Marcações de estilo: padrões de texto gerado por IA

*10/11/2026.* O que eu mudei, o que ficou para você reescrever e como reconhecer
os padrões quando você mesmo escrever. Os números de linha referem-se ao
`artigo.tex` desta data.

## O que eu mudei

- **Travessões.** Tirei todos do texto do artigo (58 ocorrências), trocando por
  vírgula, parênteses, dois-pontos ou ponto, sem mudar o conteúdo. Ficaram só os
  do endereço no cabeçalho, que seguem o modelo da SBC, e as faixas de páginas da
  bibliografia, que são tipografia padrão. Os guias e os READMEs também ficaram
  sem travessões; os slides não tinham nenhum.
- **Construções típicas de texto gerado,** nas partes que eu tinha redigido e em
  algumas frases suas:
  - “não X, e sim Y” sem necessidade (“A composabilidade não é ausência de
    ordenação, e sim mudança de onde ela mora”);
  - aberturas de efeito (“As grandezas mais citadas medem outra coisa”);
  - frases que terminam em avaliação (“É o número mais limpo do trabalho”);
  - termos que ninguém usa falando (“Registre-se”, “cotejo”, “assenta”);
  - ênfases do tipo “Duas grandezas, e não uma”.
- **O que não mudou:** nenhum número, macro, citação ou referência cruzada. As
  20 afirmações conferidas contra os dados continuam valendo, e o artigo
  continua com 16 páginas.
- **A declaração de IA** agora diz que a ferramenta também fez a edição de
  estilo do texto, exceto os resumos e o primeiro parágrafo da introdução. Isso
  mantém a declaração exata (Art. 7º).

## O que você precisa reescrever (eu só marquei)

Estes trechos estão marcados `VOZ` no fonte: o orientador pediu que você os
escrevesse com as suas palavras, por isso não mexi neles. Para cada frase, o
padrão que a denuncia e uma direção. A frase nova é sua.

### Abstract (linhas 263 a 278)

| Frase (início) | Padrão | Direção |
|---|---|---|
| “Managing computational effects is a central challenge…” | abertura genérica, seguida de dois-pontos que anunciam uma lista | comece pelo que você fez e por quê |
| “The mechanism cannot be isolated from the host language runtime, so…” | frase longa encadeada por dois-pontos, voz passiva | duas frases curtas, na voz ativa |
| “Four functionally equivalent implementations … were built, together with…” | voz passiva e lista de três itens | diga o que construiu em uma frase direta |
| “Counting lines of code proved highly sensitive … to the explicit sequencing OCaml requires…” | além do padrão, **erro factual**: o Haskell também sequencia explicitamente (ver o comentário no fonte) | diga que a contagem depende do estilo e do idioma de cada linguagem, e por isso só se compara dentro da mesma |
| “The measured overhead lies between…” | o resumo termina sem conclusão | feche com o achado principal: o avaliador empata, e o custo está na infraestrutura e na instalação dos handlers |

### Resumo (linhas 283 a 300)

Os mesmos padrões, em português: a abertura genérica (“é um desafio central”),
“de modo que a comparação é feita por razões:” (passiva com dois-pontos), a
lista de três itens em “Foram construídas…”, o mesmo erro factual sobre o
sequenciamento explícito e o fecho sem conclusão. **Os dois resumos precisam
caber em até 10 linhas cada,** ambos na primeira página (hoje têm 12 e 14).

### Primeiro parágrafo da Introdução (linha 310)

| Frase (início) | Padrão | Direção |
|---|---|---|
| “O paradigma funcional tem como premissa central a transparência referencial: a propriedade de que…” | abertura de manual, com definição depois de dois-pontos | diga o que é e por que importa para o seu problema |
| “…com operações que um programa real precisa realizar: ler arquivos, lançar exceções, manipular estado mutável.” | lista de três itens depois de dois-pontos | escolha o exemplo que interessa ao trabalho, ou deixe a lista sem os dois-pontos |
| “Dois mecanismos concentram a atenção da literatura: as mônadas, que… e os efeitos algébricos, que…” | estrutura paralela longa depois de dois-pontos | separe em duas frases, uma para cada mecanismo |

A citação de Hughes saiu dessa frase (ela não sustentava a afirmação). Se você
quiser citá-lo, use-o para modularidade.

## Padrões que ainda estão no texto (decisão sua)

Estes não tirei porque são escolhas de redação, não erros, e estão em
partes que são suas:

- **Construções impessoais em série:** “Adota-se” (linha 396), “Pergunta-se”
  (linha 353), “Especifica-se” (linha 564), “Segue-se que”. São normais em texto
  acadêmico, mas várias seguidas soam mecânicas. Varie algumas.
- **Frases longas encadeadas por ponto e vírgula:** o parágrafo da semântica
  (linha 564) junta determinismo, progresso e terminação numa frase só.
  Considere dividir em três.
- **“e não X” com função de precisão:** “para que a razão isole o mecanismo e
  não a estrutura de dados”, “assentam sobre microbenchmarks, e não sobre um
  caso de uso integrado”. Esses carregam conteúdo; pode manter.
- **Os trechos marcados `NOVO (10/11)`** (linhas 374, 799, 855 e 924)
  continuam sendo texto que eu redigi, agora sem os vícios acima. O ideal
  continua sendo você reescrevê-los com as suas palavras; a declaração de IA
  já cobre esses trechos de qualquer forma.

## Como reconhecer os padrões quando você escrever

Ao reescrever, procure:

1. travessões usados para inserir comentários no meio da frase;
2. “não é X, e sim Y” e “não apenas X, mas também Y”;
3. listas de exatamente três itens, repetidas parágrafo após parágrafo;
4. dois-pontos que anunciam a conclusão da própria frase;
5. frases que terminam com uma avaliação (“é o resultado mais importante”);
6. aberturas genéricas (“X é um desafio central em Y”);
7. palavras que você não usaria falando (“registre-se”, “cotejo”, “dirimir”);
8. frases vizinhas com a mesma estrutura (“A primeira… A segunda…”).

O teste mais simples: **leia em voz alta.** Se você não falaria daquele jeito
explicando para um colega, reescreva.
