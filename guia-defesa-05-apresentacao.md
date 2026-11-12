# Guia de defesa, parte 5: Apresentação (20 min) e arguição (20 min)

*Escrito em 10/11/2026, com os resultados da campanha final.* O Regulamento
prevê 20 minutos de apresentação e 20 de arguição; as bancas vão de 02 a
10/12/2026, e a entrega à banca (4º PC, já revisada pelo orientador) é até
23/11/2026.

**Os slides** foram montados como uma apresentação no Claude (link enviado na
conversa), com 17 slides para os 20 minutos e 5 de apêndice para a arguição.
Pelo menu da própria página, a apresentação baixa como **PDF** (o mais seguro
para apresentar online) ou **PPTX** (editável: os gráficos são formas nativas,
não imagens). Não existe modelo oficial de slides da SBC, e o Regulamento só
exige o formato SBC para o artigo (Art. 3º); o visual é próprio, com o mesmo
código de cores das figuras: azul para OCaml/*handlers*, laranja para
Haskell/mônadas, cinza para as bases.

> **Os números dos slides são texto fixo.** Se você refizer a campanha com
> `make tudo`, confira os slides 11 a 15 e os apêndices A1 e A4 contra
> `codigo/resultados/campanha-*/resumo.md` (ou peça para regenerá-los).

As figuras do artigo estão em `codigo/resultados/figuras/`, em SVG (fonte) e
PNG 2×, e se regeneram com `make figuras`. Os números de cada figura estão em
`dados.md`, na mesma pasta.

> **Fale com as suas palavras.** As notas abaixo são o que cada slide precisa
> transmitir, não um texto para ler. Ensaie com cronômetro pelo menos duas
> vezes; 17 slides em 20 minutos dá cerca de 1min10s por slide.

---

## Roteiro, slide a slide

O **texto completo do que dizer**, palavra por palavra, com as respostas da
arguição e um plano de ensaio, está no **Guia 06** ([`guia-defesa-06-roteiro-falado.md`](guia-defesa-06-roteiro-falado.md)) e
nas notas do apresentador de cada slide. Abaixo, o mapa de tempos.

| # | Slide | Tempo | Acumulado |
|---|---|---:|---:|
| 1 | Capa | 0:30 | 0:30 |
| 2 | Dois mecanismos para efeitos | 1:20 | 1:50 |
| 3 | Cada mecanismo contra uma base | 1:30 | 3:20 |
| 4 | Questões de pesquisa | 1:00 | 4:20 |
| 5 | Um interpretador com três efeitos | 1:10 | 5:30 |
| 6 | A função eval | 1:20 | 6:50 |
| 7 | Quatro versões e a verificação | 1:10 | 8:00 |
| 8 | O mesmo trecho de eval, com e sem handlers | 0:50 | 8:50 |
| 9 | Legibilidade de eval | 0:40 | 9:30 |
| 10 | Composabilidade e infraestrutura | 1:20 | 10:50 |
| 11 | Destaque: 45 ns | 0:40 | 11:30 |
| 12 | Custo de tempo por expressão | 1:20 | 12:50 |
| 13 | Memória por expressão | 1:00 | 13:50 |
| 14 | Achados não previstos | 1:10 | 15:00 |
| 15 | Frente à literatura e ao TCC I | 1:00 | 16:00 |
| 16 | Conclusões e trabalhos futuros | 1:20 | 17:20 |
| 17 | Obrigado | 0:20 | 17:40 |
| A1–A5 | Apêndice: Tabela 2 completa, protocolo, quarto efeito, sensibilidade, uso de IA | arguição | |

Sobram cerca de 2 minutos e 20 segundos de folga. Os apêndices não entram na fala: abra-os só se a
banca perguntar.

*Os blocos abaixo são material de estudo: o contexto técnico por trás de cada
slide, para você entender e responder se perguntarem. Desde a simplificação de
12/11/2026, a fala (Guia 06) e os slides evitam esses termos; não é preciso
dizê-los na apresentação.*

### 1. Capa (0:30)
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

### 3. Cada mecanismo contra uma base (1:30)
- O mecanismo não se separa do *runtime*: mônadas rodam no GHC, *handlers* no
  OCaml. Comparar tempos absolutos é comparar duas variáveis de uma vez.
- Solução: **cada mecanismo contra uma base imperativa na própria linguagem**
  (imperativa com `Hashtbl` no OCaml; `IORef` com o mesmo `Map` no Haskell) e
  só então confrontar as razões, e com cautela: **exploratório**.
- Fórmula para guardar: razão = 1 + Δ / T_base. Uma base cara *deflaciona* a
  razão (vai voltar no slide 13).

### 4. Questões de pesquisa (1:00)
- QP1 legibilidade: LOC, operações de efeito e aninhamento de `eval`
  (*proxies* estruturais, não legibilidade percebida).
- QP2 composabilidade: pontos de modificação para inserir um 4º efeito
  (`Input`), definidos **antes** da implementação.
- QP3 abstração: *boilerplate* por regra mecânica + reutilização.
- QP4 desempenho: tempo e alocação, Bechamel e Criterion, 3 sementes.
- Toda comparação de código é **dentro da mesma linguagem**.

### 5. Um interpretador com três efeitos (1:10)
- Interpretador de 8 construtores (`Num`, `Var`, `Add`, `Mul`, `Div`, `Let`,
  `Seq`, `Print`), três efeitos.
- Semântica *small-step* com contextos de avaliação: determinismo, progresso,
  terminação. Equivalência = mesmo valor, mesmo estado, mesmo traço, mesma
  mensagem de erro.
- Limitações assumidas: ambiente global, exceção só abortiva, n = 1.

### 6. A função eval (1:20)
- O que é: a função principal do interpretador. Recebe uma expressão (uma
  árvore de construtores) e devolve o inteiro que ela vale, com um caso para
  cada um dos 8 construtores.
- É recursiva: no caso `Add`, chama a si mesma para cada lado e soma os
  resultados.
- Os efeitos acontecem dentro dela: `Var` e `Let` mexem no estado, `Div` por
  zero e variável inexistente dão erro, `Print` escreve na saída.
- Por que importa: a QP1 mede só a `eval`; a QP3 mede o resto do arquivo (o
  código em volta dela). O resultado principal sai dessa divisão.
- O código do slide é o de `codigo/ocaml/imperative/interp_imp.ml`, linhas 14
  a 23, com a anotação de tipo omitida e a mensagem de erro abreviada.

### 7. Quatro versões e a verificação (1:10)
- *Handlers* × imperativa (OCaml); mônadas × `IORef` (Haskell).
- Oráculo: 28 casos × 2 versões + 5 conferências = **61/61 nas duas
  linguagens**; é pré-condição da medição.
- **Testes de mutação: 8/8** decisões revertidas são detectadas (`quot`/`div`,
  ordem de avaliação, escopo de `Let`, ordem da pilha).
- Gerador replicado em OCaml, Haskell e Python: os *hashes* das 12 cargas batem
  nas três.

### 8. O mesmo trecho de eval, com e sem handlers (0:50)
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

### 9. Legibilidade de eval (0:40)
Tabela pequena: 29/5/2 (OCaml, nas duas) e 27/18/1 (Haskell, nas duas), igual
também construtor a construtor. **Pelos *proxies*, o mecanismo não pesa na
leitura do avaliador.**

### 10. Composabilidade e infraestrutura (1:20)
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

### 11. Destaque: 45 ns (0:40)
Slide azul, um número só. Fale devagar: "no OCaml, só instalar três *handlers*
em cada expressão custa 45 ns, sem nenhuma operação de efeito". Avance.

### 12. Custo de tempo por expressão (1:20)
Gráfico de barras do excedente por cenário. **Este é o slide central.**
- Arith no OCaml não faz operação de efeito nenhuma: os **45 ns** por expressão
  são só instalar três *handlers*. É o número mais limpo do trabalho.
- As operações somam a isso: 84 ns em State, 111 em Output.
- No Haskell, no máximo 10 ns (Arith, a carga com mais *binds*); três dos quatro
  intervalos de confiança incluem 1. O GHC quase apaga a pilha.
- Razões: OCaml 1,59 a 4,26; Haskell 0,97 a 1,08.

### 13. Memória por expressão (1:00)
Barras empilhadas: base em cinza, excedente na cor de cada linguagem.
- 11,5× contra 2,2× parece uma ordem de grandeza.
- Em bytes, o excedente é parecido: 168 contra 150 B por expressão.
- A diferença é a base: a imperativa do OCaml aloca 16 B (só o resultado), a do
  Haskell, 127 B. É o 1 + Δ/T_base do slide 3, na forma mais aguda.
- Ressalva honesta: as pilhas das *fibers* ficam fora do *heap* e fora dessa
  coluna.

### 14. Achados não previstos (1:10)
Dois cartões com os números; o detalhe da sensibilidade está no apêndice A4.
- **Vazamento:** abandonar a continuação (em vez de `discontinue`) vaza o
  segmento de pilha: 2 milhões de erros → ~1,2 GB contra ~6 MB. Nenhuma métrica
  de alocação vê isso (`make experimento` reproduz).
- **R² não basta:** uma corrida subdimensionada teve todos os R² ≥ 0,95 e
  deslocou as razões em até 28%. Configuração de amostragem é ameaça à
  validade.

### 15. Frente à literatura e ao TCC I (1:00)
- Sivaramakrishnan et al. 2021: 1% é para programas *sem* *handlers*; 6,7–12,3×
  é recursão não-*tail* sob *handler*. As razões daqui ficam abaixo, e os
  45 ns são da mesma ordem dos 23 ns que eles medem por *fiber*.
- Kammar 2013 e Xie & Leijen 2020: 1,0–1,3 para mônadas contra versão pura;
  aqui, limite inferior ou abaixo, porque a base não é pura.
- **TCC I:** previa *handlers* < 1,5× e mônadas > 2×. Falhou nas duas metades.
  Diga sem rodeio.

### 16. Conclusões e trabalhos futuros (1:20)
- Escrita: o custo dos mecanismos está na **infraestrutura**, não no avaliador;
  nos *handlers*, localizado e pago uma vez; nas mônadas, cresce com a pilha.
- Execução: *handlers* têm custo fixo por instalação e por operação; mônadas,
  com otimização, quase nada.
- Limitações: um caso de uso, uma máquina virtual, versões específicas, exceção
  só abortiva, legibilidade estrutural.
- Futuro: comparar na mesma linguagem, efeitos escopados e não determinismo,
  segurança de efeitos (Koka), estudo com pessoas.
- Feche com uma frase sua sobre o que você recomendaria a quem vai escolher.

### 17. Obrigado (0:20)
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
