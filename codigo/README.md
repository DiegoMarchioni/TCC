# Código do TCC — mônadas × efeitos algébricos

Implementações, testes, *harnesses* de *benchmark* e scripts de métricas do
artigo *Mônadas e Efeitos Algébricos em Linguagens Funcionais* (TCC II,
Ciência da Computação, PUC Minas).

> **Uso de IA.** Este código foi gerado com assistência de IA (Claude, da
> Anthropic, via Claude Code) e revisado pelo autor. A campanha em
> `resultados/campanha-20261110-005710/` também foi executada pela ferramenta,
> numa máquina virtual de nuvem. A declaração exigida pelos Arts. 6º a 8º do
> Regulamento está no artigo e se ajusta sozinha a quem executou a campanha.

## Começo rápido

```bash
cd codigo
eval $(opam env --switch=tcc)   # ver Instalação
make testar                     # tudo deve passar: 28/28, 61/61, 61/61
make tudo                       # do teste ao artigo, na ordem do protocolo (~35 min)
```

`make tudo` encadeia: `testar-completo` (oráculos, mutantes, quarto efeito) →
`metricas` (QP1, QP3) → `quarto-efeito` (QP2) → `campanha` (QP4, com repetição
automática de R² < 0,95) → `sensibilidade` → `artigo` (regrava números,
tabelas e ambiente em `../artigo.tex` e confere as afirmações do texto) →
`figuras` (figuras da apresentação). `make ajuda` lista os alvos.

## Estrutura

| Caminho | Seção do artigo | Conteúdo |
|---|---|---|
| `docs/semantica.md` | 4.1 | semântica *small-step* e critério de equivalência |
| `referencia/semantica.py` | 4.1 | a semântica executável, regra por regra |
| `referencia/gerador.py` | 5 | gerador de cargas de referência (terceira réplica, neutra) |
| `shared/conformance.json` | 5, 5.3 | mensagens canônicas, 28 casos de oráculo, amostras e *hashes* das 12 cargas |
| `ocaml/lib/expr.ml` | 5 | núcleo comum OCaml: sintaxe, mensagens, emissão, gerador |
| `ocaml/effects/interp_effects.ml` | 5.2 | **efeitos algébricos e *handlers*** |
| `ocaml/imperative/interp_imp.ml` | 5.1 | **linha de base imperativa OCaml** |
| `ocaml/test/test_oracle.ml` | 5.3 | suíte de oráculo e conformidade (61 verificações) |
| `ocaml/bench/bench_main.ml` | 4.3, 6.2 | *harness* Bechamel |
| `ocaml/experimento/continuacao.ml` | 5.2 | vazamento ao abandonar a continuação |
| `ocaml/tools/` | 4.2 | `metricas_ocaml` (métricas por AST) e `cargas` (despejo das cargas) |
| `haskell/src/Expr.hs` | 5 | núcleo comum Haskell |
| `haskell/src/Interp/Monadic.hs` | 5.1 | **mônadas: `ExceptT String (StateT Env IO)`** |
| `haskell/src/Interp/IORefBase.hs` | 5.1 | **linha de base `IORef` Haskell** |
| `haskell/test/Spec.hs` | 5.3 | suíte de oráculo e conformidade (61 verificações) |
| `haskell/bench/Main.hs` | 4.3, 6.2 | *harness* Criterion |
| `metricas-hs/` | 4.2 | métricas por AST para Haskell (`ghc-lib-parser`) |
| `docs/protocolo-metricas.md` | 4.2 | definições operacionais e critério de *boilerplate* |
| `quarto-efeito/` | 4.2, 5.3 | o quarto efeito (`Input`) como *patch*, e a medição de QP2 |
| `scripts/` | — | testes, normalização, métricas, mutantes, campanha, repetição por R², resumo, sensibilidade |
| `scripts/atualizar_artigo.py` | 1, 4–7 | gera os números, as Tabelas 1 e 2 e o ambiente do artigo e confere as frases marcadas `AFIRMACAO` |
| `scripts/figuras.py` | — | figuras da apresentação (SVG, sem dependências) |
| `resultados/` | 6 | métricas, campanha citada, sensibilidade e figuras (versionados) |

## Instalação

Versões do artigo: **OCaml 5.2.1 com flambda**, Bechamel **0.5.0**, **GHC
9.4.x**, Criterion **1.6**, ocamlformat **0.26.2**, ormolu **0.5.3.0**.

**OCaml** (opam):

```bash
opam init
opam switch create tcc --packages=ocaml-variants.5.2.1+options,ocaml-option-flambda
eval $(opam env --switch=tcc)
opam install dune bechamel.0.5.0 yojson ocamlformat.0.26.2
ocamlopt -config | grep flambda      # deve dizer: flambda: true
```

Sem flambda, `-O3` é ignorado e a configuração deixa de ser a do artigo.

**Haskell** (ghcup):

```bash
ghcup install ghc 9.4.8 && ghcup set ghc 9.4.8
ghcup install cabal && cabal update
cabal install ormolu-0.5.3.0        # o normalizador recusa outra versão
```

As dependências (`criterion`, `aeson`, `ghc-lib-parser` 9.4) vêm do Hackage na
primeira compilação. Os limites de versão estão nos `.cabal`.

**Outros:** `python3` (só a biblioteca padrão), `make`, `patch`; no Linux,
`taskset` para fixar afinidade.

## Testes e verificação

```bash
make testar           # semântica de referência 28/28; gerador = conformance.json;
                      # formato; oráculo OCaml 61/61; oráculo Haskell 61/61
make testar-completo  # + testes de mutação (8/8) + quarto efeito (73/73 + 73/73)
```

- **Oráculo**: 28 casos × 2 implementações + 5 conferências (mensagens, amostra
  do LCG, primeiras expressões de Arith, *hashes* das **12 cargas**, integridade
  da tabela) = 61 por linguagem.
- **Conformidade entre linguagens**: o gerador existe em Python, OCaml e
  Haskell; os *hashes* das 4 × 3 cargas coincidem nas três. Para localizar uma
  divergência: `ocaml/_build/default/tools/cargas.exe exn 43` contra
  `cabal run -v0 cargas -- exn 43`.
- **Mutantes** (`scripts/mutantes.py`): cada decisão que o oráculo deve travar
  (quot, ordem de avaliação, ambiente global, ordem da pilha) é revertida numa
  cópia, e o caso correspondente precisa falhar.

## Métricas de código (QP1, QP2, QP3)

```bash
scripts/normalizar.sh verificar        # condição de validade das contagens
python3 scripts/metricas.py tabela     # QP1 + QP3 (regra mecânica) + reutilização
quarto-efeito/medir.sh                 # QP2: aplica Input numa cópia, testa, conta
python3 scripts/metricas.py latex      # linhas prontas da Tabela 1
```

O *boilerplate* é classificado por **regra mecânica** sobre os *tokens* do
compilador (`docs/protocolo-metricas.md`, seção 4.1), com o motivo de cada
linha em `resultados/boilerplate-regra/<impl>.csv`. Validação humana opcional:
duas pessoas preenchem, separadamente, as colunas `autor` e `segundo` de
`resultados/boilerplate/*.csv` e depois a coluna `consenso`;
`python3 scripts/metricas.py concordancia` dá o kappa entre elas e entre a
regra e o consenso.

## Campanha de desempenho (QP4)

```bash
scripts/rodar-campanha.sh
```

Gera `resultados/campanha-AAAAMMDD-HHMMSS/` com o ambiente registrado
(`ambiente.md`, inclusive virtualização e quem executou: `TCC_EXECUTOR`, padrão
`autor`), os CSV brutos, `resumo.md` (razões, IC conservadores, dispersão, R²,
**tempos e alocação absolutos por expressão**) e as linhas LaTeX das tabelas.
A campanha aborta se qualquer oráculo falhar, e remede em par, até três vezes,
toda medição com R² < 0,95 (`scripts/repetir_r2.py`), guardando as descartadas
em `descartados/` e registrando cada repetição em `ambiente.md`.
`make sensibilidade` repete a medição com cota de 5 s e 2.000 amostras, para a
comparação da Seção 6.2.

**Para medir bem** (Seção 4.3; anote o que fizer):

- fixe o *governor* em `performance` e desligue o *turbo*;
- em CPU híbrida (o i5-1345U é 2P+8E), fixe a afinidade num núcleo P:
  `TCC_TASKSET="taskset -c 0" scripts/rodar-campanha.sh` (confira com `lscpu -e`
  qual núcleo é P);
- feche os outros programas e use a máquina na tomada;
- parâmetros: `SEMENTES`, `TCC_QUOTA` (20), `TCC_LIMIT` (5000),
  `TCC_RESAMPLES` (1000), `TCC_BOOTSTRAP` (1000), `TCC_CENARIOS`.

Versione a campanha que entra no artigo junto com o `artigo.tex` regenerado.

## Decisões de implementação que o artigo precisa refletir

- **Exceção com `discontinue`.** Abandonar a continuação vaza o segmento de
  pilha no OCaml 5.2 (`make experimento`: ~1,2 GB contra ~6 MB em 2 milhões de
  erros).
- **Três *handlers* instalados por expressão**, como a Seção 4.3 descreve.
- **`-O3` em todas as bibliotecas OCaml** (não só no executável); `-O2` no
  Haskell.
- **IC da razão no OCaml calculado pelo *harness***: o Bechamel 0.5.0 não expõe
  o IC do *bootstrap* na API.
- **A coluna de alocação do OCaml não inclui os segmentos de pilha**
  (`Gc.minor_words`; as *fibers* são alocadas com `malloc`).

## Do resultado ao artigo

Nenhum número dos resultados é digitado à mão no `artigo.tex`.
`python3 scripts/atualizar_artigo.py` (`make artigo`) lê `resultados/` (as
métricas e a campanha mais recente) e regrava, entre os marcadores
`%%%% <<GERADO:nome>>` e `%%%% <</GERADO:nome>>`, quatro blocos: as macros dos
números (`\RTOcamlArith`, `\DeltaNsOcamlArith`, `\BoilerHandlers`…), as linhas
das Tabelas 1 e 2 e o parágrafo do ambiente. Em seguida confere cada frase
marcada no texto com `%% AFIRMACAO:id` contra os resultados e lista as que
deixaram de valer (sai com código 1 se houver alguma): os números se atualizam
sozinhos, mas a interpretação precisa ser revista por quem escreve.
`--verificar` só confere, sem regravar. Se `sbc-template.sty` e `sbc.bst`
estiverem na raiz, `make artigo` mede também as páginas (`../medir.sh`).
