# Código do TCC — mônadas × efeitos algébricos

Implementações, testes, *harnesses* de *benchmark* e scripts de métricas do
artigo *Mônadas e Efeitos Algébricos em Linguagens Funcionais* (TCC II,
Ciência da Computação, PUC Minas).

> **Uso de IA.** Este código foi gerado com assistência de IA (Claude, da
> Anthropic, via Claude Code) e revisado pelo autor. A declaração exigida pelos
> Arts. 6º a 8º do Regulamento está no artigo.

## Começo rápido

```bash
cd codigo
eval $(opam env --switch=tcc)   # ver Instalação
make testar                     # tudo deve passar: 28/28, 61/61, 61/61
make metricas                   # QP1 e preparação de QP3
make quarto-efeito              # QP2
make campanha                   # QP4 (~20 min com os parâmetros do artigo)
```

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
| `scripts/` | — | testes, normalização, métricas, mutantes, campanha e resumo |

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
python3 scripts/metricas.py tabela     # QP1 + planilhas de boilerplate
quarto-efeito/medir.sh                 # QP2: aplica Input numa cópia, testa, conta
# QP3: você e o orientador preenchem, separadamente, as colunas 'autor' e
# 'segundo' de resultados/boilerplate/*.csv com B ou N (critério em
# docs/protocolo-metricas.md); depois, a coluna 'consenso' das divergências.
python3 scripts/metricas.py concordancia
python3 scripts/metricas.py latex      # linhas prontas da Tabela 1
```

## Campanha de desempenho (QP4)

```bash
scripts/rodar-campanha.sh
```

Gera `resultados/campanha-AAAAMMDD-HHMMSS/` com o ambiente registrado
(`ambiente.md`), os CSV brutos, `resumo.md` (razões, IC conservadores,
dispersão, R², **tempos e alocação absolutos por expressão**) e as linhas
LaTeX das tabelas. A campanha aborta se qualquer oráculo falhar.

**Para medir bem** (Seção 4.3; anote o que fizer):

- fixe o *governor* em `performance` e desligue o *turbo*;
- em CPU híbrida (o i5-1345U é 2P+8E), fixe a afinidade num núcleo P:
  `TCC_TASKSET="taskset -c 0" scripts/rodar-campanha.sh` (confira com `lscpu -e`
  qual núcleo é P);
- feche os outros programas e use a máquina na tomada;
- parâmetros: `SEMENTES`, `TCC_QUOTA` (20), `TCC_LIMIT` (5000),
  `TCC_RESAMPLES` (1000), `TCC_BOOTSTRAP` (1000), `TCC_CENARIOS`.

Para guardar a campanha que entra no artigo: `git add -f resultados/campanha-…`.

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

## Impacto no artigo ao adotar este código

O artigo atual descreve uma campanha feita com outro código. Ao adotar este,
atualize:

1. **Seção 5 (abertura):** URL do código, por exemplo
   `https://github.com/DiegoMarchioni/TCC/tree/main/codigo` (depois de integrar o
   ramo à `main`).
2. **Seção 5 (conformidade):** a frase sobre "amostra de conferência […] e não
   em toda a carga" deixa de valer: agora o teste confere os *hashes* das 12
   cargas, com uma terceira réplica de referência em Python.
3. **Seção 5.2:** a exceção encerra a continuação com `discontinue`; abandoná-la
   vaza memória (o experimento é um achado relatável).
4. **Seção 4.3 e 6.2:** *flags* (`-O3` nas bibliotecas, `-O2` no GHC), ambiente
   (de `ambiente.md`) e parâmetros; os comentários `CONFERIR` sobre `-O3` e
   `bench_main.ml` ficam resolvidos.
5. **Tabela 2, Seção 6.3, Introdução, Resumo, Conclusões:** **todos os números
   de desempenho**, da nova campanha. Inclua os tempos absolutos das bases (o
   resumo os traz), o que elimina a limitação "ausência dos tempos absolutos" e
   a "primeira leitura recusada" passa a poder ser feita.
6. **Tabela 1 e Seção 6.1:** métricas de código (`tabela-metricas.tex`) e os
   dois parágrafos que faltam; as contagens são idênticas por construtor dentro
   de cada linguagem, o que deve ser lido como propriedade do desenho.
7. **Seção 5.3:** o parágrafo do quarto efeito no passado, com o que cada versão
   exigiu (`quarto-efeito/README.md`).
8. **Seção 4.2:** a definição operacional do aninhamento
   (`docs/protocolo-metricas.md`, seção 2).
9. **Agradecimentos:** a declaração de IA precisa incluir a geração do código
   (já acrescentada) e a versão do modelo.
