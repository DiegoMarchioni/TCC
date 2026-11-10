# Guia de defesa — Parte 5: Apresentação (20 min) e arguição (20 min)

*Escrito em 10/11/2026, com os resultados da campanha final.* O Regulamento
prevê 20 minutos de apresentação e 20 de arguição; as bancas vão de 02 a
10/12/2026, e a entrega à banca (4º PC, já revisada pelo orientador) é até
23/11/2026.

**Os slides** foram montados como uma apresentação no Claude (link enviado na
conversa), com 16 slides para os 20 minutos e 5 de apêndice para a arguição.
Pelo menu da própria página, a apresentação baixa como **PDF** (o mais seguro
para apresentar online) ou **PPTX** (editável: os gráficos são formas nativas,
não imagens). Não existe modelo oficial de slides da SBC, e o Regulamento só
exige o formato SBC para o artigo (Art. 3º); o visual é próprio, com o mesmo
código de cores das figuras: azul para OCaml/*handlers*, laranja para
Haskell/mônadas, cinza para as bases.

> **Os números dos slides são texto fixo.** Se você refizer a campanha com
> `make tudo`, confira os slides 10 a 14 e os apêndices A1 e A4 contra
> `codigo/resultados/campanha-*/resumo.md` (ou peça para regenerá-los).

As figuras do artigo estão em `codigo/resultados/figuras/`, em SVG (fonte) e
PNG 2×, e se regeneram com `make figuras`. Os números de cada figura estão em
`dados.md`, na mesma pasta.

> **Fale com as suas palavras.** As notas abaixo são o que cada slide precisa
> transmitir, não um texto para ler. Ensaie com cronômetro pelo menos duas
> vezes; 16 slides em 20 minutos dá cerca de 1min15s por slide.

---

## Roteiro, slide a slide

O **texto completo do que dizer**, palavra por palavra, com as respostas da
arguição e um plano de ensaio, está no **Guia 06** ([`guia-defesa-06-roteiro-falado.md`](guia-defesa-06-roteiro-falado.md)) e
nas notas do apresentador de cada slide. Abaixo, o mapa de tempos.

| # | Slide | Tempo | Acumulado |
|---|---|---:|---:|
| 1 | Capa | 0:20 | 0:20 |
| 2 | Dois mecanismos para efeitos | 1:20 | 1:40 |
| 3 | Comparação por razões intralinguagem | 1:30 | 3:10 |
| 4 | Questões de pesquisa | 1:20 | 4:30 |
| 5 | Um interpretador com três efeitos | 1:20 | 5:50 |
| 6 | Quatro versões e a verificação | 1:30 | 7:20 |
| 7 | O mesmo braço de eval, com e sem handlers | 1:10 | 8:30 |
| 8 | Legibilidade de eval (QP1) | 0:50 | 9:20 |
| 9 | Composabilidade e boilerplate (QP2, QP3) | 1:40 | 11:00 |
| 10 | Destaque: 45 ns | 0:40 | 11:40 |
| 11 | Custo de tempo por expressão (QP4) | 1:40 | 13:20 |
| 12 | Alocação por expressão (QP4) | 1:20 | 14:40 |
| 13 | Achados não previstos | 1:40 | 16:20 |
| 14 | Frente à literatura e ao TCC I | 1:20 | 17:40 |
| 15 | Conclusões e trabalhos futuros | 1:40 | 19:20 |
| 16 | Obrigado / perguntas | 0:10 | 19:30 |
| A1–A5 | Apêndice: Tabela 2 completa, protocolo, quarto efeito, sensibilidade, uso de IA | arguição | |

Sobram 30 segundos de folga. Os apêndices não entram na fala: abra-os só se a
banca perguntar.

### 1. Capa (0:20)
Título, autor, orientador, PUC Minas. Uma frase: "comparo duas formas de
lidar com efeitos em linguagens funcionais, em quatro dimensões, sobre o mesmo
programa".

### 2. Dois mecanismos para efeitos (1:20)
- Programas reais têm efeitos (estado, exceções, saída); linguagens funcionais
  precisam de um mecanismo para eles.
- Duas respostas: **mônadas** compostas por *transformers* (Haskell) e
  **efeitos algébricos com *handlers*** (nativos no OCaml 5, desde 2022).
- A teoria já diz que elas expressam o mesmo (Schrijvers et al. 2019); a
  pergunta prática, "qual escolher e a que custo", não tem evidência que junte
  custo de escrita e custo de execução.

### 3. Comparação por razões intralinguagem (1:30)
- O mecanismo não se separa do *runtime*: mônadas rodam no GHC, *handlers* no
  OCaml. Comparar tempos absolutos é comparar duas variáveis de uma vez.
- Solução: **cada mecanismo contra uma base imperativa na própria linguagem**
  (imperativa com `Hashtbl` no OCaml; `IORef` com o mesmo `Map` no Haskell) e
  só então confrontar as razões, e com cautela: **exploratório**.
- Fórmula para guardar: razão = 1 + Δ / T_base. Uma base cara *deflaciona* a
  razão (vai voltar no slide 11).

### 4. Questões de pesquisa (1:20)
- QP1 legibilidade: LOC, operações de efeito e aninhamento de `eval`
  (*proxies* estruturais, não legibilidade percebida).
- QP2 composabilidade: pontos de modificação para inserir um 4º efeito
  (`Input`), definidos **antes** da implementação.
- QP3 abstração: *boilerplate* por regra mecânica + reutilização.
- QP4 desempenho: tempo e alocação, Bechamel e Criterion, 3 sementes.
- Toda comparação de código é **dentro da mesma linguagem**.

### 5. Um interpretador com três efeitos (1:20)
- Interpretador de 8 construtores (`Num`, `Var`, `Add`, `Mul`, `Div`, `Let`,
  `Seq`, `Print`), três efeitos.
- Semântica *small-step* com contextos de avaliação: determinismo, progresso,
  terminação. Equivalência = mesmo valor, mesmo estado, mesmo traço, mesma
  mensagem de erro.
- Limitações assumidas: ambiente global, exceção só abortiva, n = 1.

### 6. Quatro versões e a verificação (1:30)
- *Handlers* × imperativa (OCaml); mônadas × `IORef` (Haskell).
- Oráculo: 28 casos × 2 versões + 5 conferências = **61/61 nas duas
  linguagens**; é pré-condição da medição.
- **Testes de mutação: 8/8** decisões revertidas são detectadas (`quot`/`div`,
  ordem de avaliação, escopo de `Let`, ordem da pilha).
- Gerador replicado em OCaml, Haskell e Python: os *hashes* das 12 cargas batem
  nas três.

### 7. O mesmo braço de `eval`, com e sem *handlers* (1:10)
Mostre o braço `Var` lado a lado (é o slide de código; mantenha curto):

```ocaml
(* handlers *)                                (* imperativa *)
| Var x -> (                                  | Var x -> (
    match perform (Get x) with                    match Hashtbl.find_opt env x with
    | Some v -> v                                 | Some v -> v
    | None -> perform (Fail (msg_unbound x)))     | None -> raise (Runtime_error (msg_unbound x)))
```

"Cada operação direta da base virou exatamente uma operação de efeito. A
diferença não está aqui."

### 8. Legibilidade de `eval` (0:50)
Tabela pequena: 29/5/2 (OCaml, nas duas) e 27/18/1 (Haskell, nas duas), igual
também construtor a construtor. **Pelos *proxies*, o mecanismo não pesa na
leitura do avaliador.**

### 9. Composabilidade e *boilerplate* (1:40)
Gráfico de barras do *boilerplate* e os pontos de modificação ao lado.
- *Handlers*: 67 linhas de *boilerplate* contra 3 da base (registros de
  `match_with`, repasses `| _ -> None`, `continue`, composições); 18 delas só
  servem ao oráculo.
- Haskell: 20 × 22, quase tudo cabeçalho e importação comuns às duas versões.
- 4º efeito: **só os mecanismos** precisaram mudar declarações existentes (2 e
  2); as bases, nenhuma. Nos *handlers*, as composições que os instalam; nas
  mônadas, o tipo da pilha e o executor, e dois `lift` explícitos, porque o
  *mtl* só alcança uma camada de estado.
- Reutilização: só os *handlers* (2): o preço do *boilerplate* compra a troca
  de interpretação sem tocar no avaliador.

### 10. Destaque: 45 ns (0:40)
Slide azul, um número só. Fale devagar: "no OCaml, só instalar três *handlers*
em cada expressão custa 45 ns, sem nenhuma operação de efeito". Avance.

### 11. Custo de tempo por expressão (1:40)
Gráfico de barras do excedente por cenário. **Este é o slide central.**
- Arith no OCaml não faz operação de efeito nenhuma: os **45 ns** por expressão
  são só instalar três *handlers*. É o número mais limpo do trabalho.
- As operações somam a isso: 84 ns em State, 111 em Output.
- No Haskell, no máximo 10 ns (Arith, a carga com mais *binds*); três dos quatro
  intervalos de confiança incluem 1. O GHC quase apaga a pilha.
- Razões: OCaml 1,59 a 4,26; Haskell 0,97 a 1,08.

### 12. Alocação por expressão (1:20)
Barras empilhadas: base em cinza, excedente na cor de cada linguagem.
- 12× contra 2,2× parece uma ordem de grandeza.
- Em bytes, o excedente é parecido: 168 contra 150 B por expressão.
- A diferença é a base: a imperativa do OCaml aloca 15 B (só o resultado), a do
  Haskell, 127 B. É o 1 + Δ/T_base do slide 3, na forma mais aguda.
- Ressalva honesta: as pilhas das *fibers* ficam fora do *heap* e fora dessa
  coluna.

### 13. Achados não previstos (1:40)
Dois cartões com os números; o detalhe da sensibilidade está no apêndice A4.
- **Vazamento:** abandonar a continuação (em vez de `discontinue`) vaza o
  segmento de pilha: 2 milhões de erros → ~1,2 GB contra ~6 MB. Nenhuma métrica
  de alocação vê isso (`make experimento` reproduz).
- **R² não basta:** uma corrida subdimensionada teve todos os R² ≥ 0,95 e
  deslocou as razões em até 28%. Configuração de amostragem é ameaça à
  validade.

### 14. Frente à literatura e ao TCC I (1:20)
- Sivaramakrishnan et al. 2021: 1% é para programas *sem* *handlers*; 6,7–12,3×
  é recursão não-*tail* sob *handler*. As razões daqui ficam abaixo, e os
  45 ns são da mesma ordem dos 23 ns que eles medem por *fiber*.
- Kammar 2013 e Xie & Leijen 2020: 1,0–1,3 para mônadas contra versão pura;
  aqui, limite inferior ou abaixo, porque a base não é pura.
- **TCC I:** previa *handlers* < 1,5× e mônadas > 2×. Falhou nas duas metades.
  Diga sem rodeio.

### 15. Conclusões e trabalhos futuros (1:40)
- Escrita: o custo dos mecanismos está na **infraestrutura**, não no avaliador;
  nos *handlers*, localizado e pago uma vez; nas mônadas, cresce com a pilha.
- Execução: *handlers* têm custo fixo por instalação e por operação; mônadas,
  com otimização, quase nada.
- Limitações: um caso de uso, uma máquina virtual, versões específicas, exceção
  só abortiva, legibilidade estrutural.
- Futuro: comparar na mesma linguagem, efeitos escopados e não determinismo,
  segurança de efeitos (Koka), estudo com pessoas.
- Feche com uma frase sua sobre o que você recomendaria a quem vai escolher.

### 16. Obrigado / perguntas (0:10)
Agradeça e passe a palavra à banca. Deixe este slide aberto durante a
arguição; os apêndices A1 a A5 estão logo depois, para responder com números.

---

## Arguição: perguntas prováveis e respostas curtas

**Sobre o método**
1. *"Por que razões, e não tempo absoluto?"* → mecanismo e *runtime* não se
   separam; a razão contra a base da mesma linguagem tira o fator da linguagem.
2. *"Então o confronto OCaml × Haskell vale?"* → é exploratório e o texto diz;
   o que se sustenta é a **forma** do custo, não qual razão é menor.
3. *"Por que `Map` na base Haskell?"* → para a razão medir o mecanismo, não a
   estrutura de dados. O preço é a base cara em State (346 ns).
4. *"Por que três *handlers* por expressão?"* → o de exceção precisa (senão o
   1º erro encerra a carga); os outros vão junto. Está declarado.
5. *"Arith é controle no Haskell?"* → não: lá cada `<-` é *bind* da pilha. É
   controle só no OCaml, e o texto diz.
6. *"Três sementes bastam?"* → medem sensibilidade à carga sorteada, não
   amostram uma população de programas; n = 1 caso de uso, declarado.

**Sobre os resultados**
7. *"Output tem 4,26: saída é cara?"* → é a base mais barata (34 ns, árvores
   menores). Em absoluto, 111 ns, dos quais 45 são instalação.
8. *"Por que o Haskell quase não paga nada?"* → o GHC especializa a pilha
   concreta; e a base não é pura, também paga `IO`.
9. *"Os números valem numa VM?"* → razões na mesma sessão, ordem alternada,
   afinidade fixa, R² ≥ 0,95 com repetição automática; a VM está declarada e a
   replicação em máquina dedicada, indicada. `make tudo` refaz tudo.
10. *"E a dispersão de 18% no Haskell/Output?"* → a base oscilou numa semente
    (477 µs contra ~400 µs nas outras); por isso a mediana, e por isso o
    intervalo dele inclui 1.

**Sobre o código e a IA**
11. *"Quem escreveu o código?"* → gerado com assistência de IA, como declarado;
    você revisou, rodou e explica cada decisão (Guia 04). A campanha foi
    executada pela ferramenta numa VM de nuvem, e a declaração diz isso.
12. *"Como sabe que as quatro versões fazem a mesma coisa?"* → oráculo 61/61,
    *hashes* das cargas, pré-condição dentro do *harness* e mutação 8/8.
13. *"A regra de *boilerplate* não é arbitrária?"* → é fixa, publicada e
    auditável linha a linha (`boilerplate-regra/*.csv`); a contagem humana fica
    como validação.

Respostas mais longas: Guias 01 a 04.

---

## Checklist antes da entrega (23/11) e da banca

- [ ] Reescrever **Abstract e Resumo** com as suas palavras, até 10 linhas cada,
      ambos na 1ª página (o orientador marcou "I.A.?"); os números já são
      macros.
- [ ] Preencher a versão do modelo no lugar de `[PREENCHER]` (Agradecimentos).
- [ ] Conferir o ano e o repositório de `marchioni:tcc1` no `.bib` (a nota
      "CONFERIR" sai impressa nas referências).
- [ ] Conferir o e-mail e o nome completo do orientador (comentário no fonte).
- [ ] Integrar o ramo de trabalho à `main`, para a URL do código resolver.
- [ ] Compilar no Overleaf com o modelo SBC oficial e conferir: no máximo 16
      páginas, resumos na 1ª, nenhum `??`.
- [ ] Revisar com as suas palavras os trechos marcados `%% NOVO (10/11)` no
      fonte (Seções 1, 5.3, 6 e 7).
- [ ] Opcional, mas recomendável: `make tudo` no seu computador, para trocar a
      VM por uma máquina física; o script avisa se alguma frase mudar de
      sentido.
- [ ] Baixar a apresentação em PDF (e em PPTX, de reserva) e ensaiar duas vezes
      com cronômetro, em chamada de vídeo com a câmera ligada (Art. 18, § 1º).
