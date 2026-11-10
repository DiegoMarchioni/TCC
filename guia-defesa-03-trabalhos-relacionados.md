# Guia de defesa, parte 3: Trabalhos Relacionados

*Reescrito em 09/11/2026 e atualizado em 10/11/2026.* Cobre a Seção 3:
o parágrafo de abertura, 3.1 (custo de execução dos *handlers*) e 3.2
(perspectiva comparativa e lacuna).

**O que mudou:** a tabela de cobertura (`tab:lacuna`) saiu do texto. Esta seção
é agora prosa, e **os fatos abaixo foram conferidos no texto das fontes** em
09/11/2026: Kammar et al. 2013, Xie & Leijen 2020, Sivaramakrishnan et al.
2021, Joriatti et al. 2025 e o código do *runtime* do OCaml 5.2.

---

## Mapa da seção

| Parte | Trabalhos | Função |
|---|---|---|
| Abertura | `kiselyov:13`, `kammar:13`, `xie:20`, `kiselyov:15`, `joriatti:25` | alternativas em Haskell; por que não comparar na mesma linguagem |
| 3.1 Custo | `karachalias:21`, `gaissert:25`, `sivaramakrishnan:21`, `ocaml:manual` | por que reportar razões, e não tempos absolutos |
| 3.2 Lacuna | fundamentos, expressividade, desempenho; os mais próximos: `kammar:13`, `xie:20`, `liang:95` | onde este trabalho entra |

---

## Abertura

- **`kiselyov:13`** (*extensible effects*): uniões abertas de funtores, como
  alternativa à pilha ordenada de transformadores.
- **`kammar:13`** (*Handlers in Action*): *handlers* em Haskell sem suporte
  nativo, sobre mônadas livres e continuações, **já com medição de custo**.
- **`xie:20`** (*Effect Handlers in Haskell, Evidently*): comparações
  posteriores na mesma linguagem.
- **`joriatti:25`** (SBLP 2025): traduz, por regras dirigidas pela sintaxe,
  código com efeitos inferidos para a biblioteca *extensible-effects*. O texto
  afirma que a tradução cobre as operações e **não** os *handlers*, que é
  validada por exemplos e não por preservação de semântica, e que não mede custo.
  **As quatro afirmações conferem com o artigo** (Conclusão: "limita-se à
  tradução das funções e efeitos, não podendo gerar os códigos equivalentes aos
  handlers"; Resultados por testes; nenhuma medição). A biblioteca alvo é a de
  mônadas *freer* de `kiselyov:15`, citada ali desde 10/11.
- **A pergunta que o próprio texto levanta:** por que não comparar as duas
  abordagens na mesma linguagem? Resposta: comparar cada mecanismo **como é
  suportado em produção**; *handlers* nativos com *runtime* dedicado no OCaml 5,
  transformadores com mtl no Haskell. A comparação na mesma linguagem é
  complementar e está nos trabalhos futuros.

---

## 3.1 O custo de execução dos *handlers*

- **`karachalias:21`**: compilador otimizador de Eff para OCaml; boa parte do
  sobrecusto some com transformações fonte-a-fonte.
- **`gaissert:25`**: compilação *just-in-time* por rastreamento para efeitos e
  *handlers*.

**As duas consequências (decore):**

1. Parte substancial do sobrecusto é propriedade da **implementação**, não do
   mecanismo; medições num *runtime* não se transferem para outro.
2. O OCaml 5 implementa *handlers* sobre **segmentos de pilha alocados
   dinamicamente** (*fibers*), não por tradução para continuações. Isso está
   ligado às continuações *one-shot*: como só se retoma uma vez, o segmento não
   precisa ser copiado.

Daí a decisão de reportar razões contra uma base na mesma linguagem.

### Fatos conferidos em Sivaramakrishnan et al. (PLDI 2021)

| O que o artigo do TCC diz | O que a fonte diz |
|---|---|
| ~1% de sobrecusto | resumo: "mean 1% overhead on a comprehensive macro benchmark suite that **does not use** effect handlers": é o custo que o *retrofit* impõe ao resto da linguagem |
| 6,7 a 12,3× em recursão não-*tail* com *handler* | Tabela 2, "Micro benchmarks with handlers but **no perform**": 12,25 / 12,05 / 11,44 / 6,74 / 8,9 sobre a versão idiomática |
| 23 ns e 5 ns | §6.3: alocar uma *fiber* e trocar para ela, 23 ns ("dominated by the memory allocation"); realizar e tratar um efeito, 5 ns |
| *fibers* fora do *heap* | §5.2: "Fibers are allocated on the C heap using malloc", com um cache de pilhas liberadas |

> **Use a Tabela 2 a seu favor:** "*handlers* instalados e nenhum `perform`" é
> exatamente o regime do cenário **Arith**. A fonte mede 6,7–12,3× porque instala
> um *handler* por chamada recursiva; aqui ele é instalado por expressão (várias
> operações por instalação), e o custo se dilui.

---

## 3.2 Perspectiva comparativa e lacuna

### O argumento

Nenhum dos trabalhos revisados reúne as quatro dimensões sobre um mesmo caso:

- **fundamentação** (`plotkin:03`, `plotkin:09`): estabelece o mecanismo, sem
  medir custo;
- **expressividade e composição** (`swierstra:08`, `pretnar:15`, `lindley:17`):
  trata de legibilidade e abstração, sem medição;
- **desempenho** (`sivaramakrishnan:21`, `karachalias:21`, `gaissert:25`): mede
  com rigor, mas não compara *handlers* com **transformadores monádicos** nem
  avalia as demais dimensões.

### Os dois grupos mais próximos

**1. Comparações intralinguagem com versão pura de controle (`kammar:13`,
`xie:20`).** Conferido nas fontes:

- Kammar et al. (Tab. 1, *count* com estado): pure **51 ms**, *state monad*
  **51 ms**, *handlers* (continuações) 77 ms. "As a control, we also tested a
  pure version."
- Xie & Leijen (§6, Fig. 2): comparam EV (*handlers*), EE, FE e **MTL**, com
  versões Pure/RunST. Counter: Pure 9 ms = MTL 9 ms. Counter5: Pure 247, MTL 327
  (1,32×). Error: Pure 57,2, MTL 62,2 (1,09×). E ainda: "MTL suffers severely
  for deep stacks".

O que lhes falta: assentam sobre ***microbenchmarks*** (contadores), não sobre um
caso de uso integrado, e não tratam das outras três dimensões.

**2. O antecedente do caso de uso (`liang:95`).** Interpretadores modulares com
transformadores: o único trabalho revisado que articula vários efeitos sobre um
caso integrado. Não mede desempenho e não podia contrastar com efeitos
algébricos, formulados em 2003 (`plotkin:03`); os *handlers* vêm só em 2009
(`plotkin:09`).

> **A pergunta mais provável da arguição:** "a sua normalização por linha de
> base já não está em Kammar 2013?" **Sim, a ideia de medir contra uma versão
> pura na mesma linguagem está lá.** O que este trabalho acrescenta é
> (a) confrontar as duas razões **entre linguagens**, cada uma com a base da
> sua; (b) fazê-lo sobre um **caso integrado** com três efeitos e
> equivalência verificada; (c) junto com as três dimensões de código. Responda
> assim, sem reivindicar a normalização como inédita.

### O confronto com a literatura nas Conclusões

O seu resultado de Haskell em **State** pode ser lido contra Kammar e Xie:
mônada de estado/MTL contra versão pura dá **1,0–1,3** nos contadores. Se a sua
campanha der algo nessa faixa, é convergência; se der fora, é discussão (pilha
de três camadas, execução por expressão, base com `Map`).

---

## Perguntas mais prováveis

1. "Por que não comparar na mesma linguagem?" → idioma de produção de cada
   mecanismo; a comparação intralinguagem é complementar e é trabalho futuro.
2. "Kammar já não fez isso?" → ver o quadro acima.
3. "O seu sobrecusto é comparável aos 6,7–12,3× da literatura?" → é o mesmo
   regime (*handler* sem `perform`), mas com mais trabalho por instalação.
4. "Se o sobrecusto depende da implementação, o que o seu número significa?" →
   descreve o OCaml 5.2.1, não "os efeitos algébricos"; por isso razões, e não
   absolutos; e por isso a conclusão o chama de "fotografia de uma implementação
   em evolução".
5. "E Joriatti 2025?" → percorre a direção inversa (efeitos → mônadas livres),
   sem *handlers*, sem prova de preservação, sem custo.

---

## Pendência bibliográfica

`gaissert:25`: o `.bib` atual diz "Marius" e pp. 978–1006; uma versão anterior
dizia "Marcial", artigo 307, DOI 10.1145/3763085. **Não foi possível conferir**
(dblp e ACM bloquearam o acesso automático). Confira no PDF antes da entrega.
