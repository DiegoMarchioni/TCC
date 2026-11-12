# Resumo da campanha (campanha-20261110-005710)

Razão = mecanismo / linha de base da mesma linguagem; mediana das sementes. IC = envelope dos IC conservadores de 95% das sementes. Dispersão = (máx − mín)/mediana.

| Linguagem | Cenário | Tempo | IC 95% | Disp. | Alocação | IC 95% | Disp. | R² mín |
|---|---|---:|---|---:|---:|---|---:|---:|
| haskell | arith | 1.08 | [1.04; 1.18] | 4.7% | 2.18 | [2.18; 2.18] | 0.0% | 0.994 |
| haskell | state | 0.99 | [0.89; 1.04] | 3.0% | 1.08 | [1.08; 1.08] | 0.0% | 0.989 |
| haskell | exn | 1.05 | [0.97; 1.13] | 1.4% | 2.14 | [2.14; 2.15] | 0.0% | 0.991 |
| haskell | output | 0.97 | [0.76; 1.04] | 18.3% | 1.08 | [1.08; 1.08] | 0.0% | 0.973 |
| ocaml | arith | 1.59 | [1.50; 1.64] | 3.0% | 11.50 | [11.50; 11.50] | 0.0% | 0.974 |
| ocaml | state | 1.98 | [1.84; 2.13] | 6.6% | 8.96 | [8.96; 8.96] | 0.0% | 0.954 |
| ocaml | exn | 1.63 | [1.53; 1.74] | 7.7% | 12.70 | [12.70; 12.70] | 0.0% | 0.976 |
| ocaml | output | 4.26 | [4.04; 4.45] | 4.6% | 6.62 | [6.62; 6.62] | 0.0% | 0.963 |

## Valores absolutos por expressão (medianas das sementes)

| Linguagem | Cenário | Base (ns) | Mecanismo (ns) | Base (bytes) | Mecanismo (bytes) |
|---|---|---:|---:|---:|---:|
| haskell | arith | 96.3 | 106.3 | 127.3 | 277.4 |
| haskell | state | 345.9 | 341.8 | 116.9 | 125.7 |
| haskell | exn | 94.6 | 99.4 | 118.6 | 254.4 |
| haskell | output | 40.9 | 38.6 | 104.3 | 112.3 |
| ocaml | arith | 77.1 | 122.4 | 16.0 | 184.0 |
| ocaml | state | 86.5 | 170.8 | 48.0 | 430.0 |
| ocaml | exn | 77.4 | 126.4 | 16.0 | 203.2 |
| ocaml | output | 33.9 | 144.6 | 64.0 | 424.0 |

Alocação: no OCaml, palavras do *minor heap* convertidas para bytes; os segmentos de pilha das *fibers* são alocados fora do heap e não aparecem aqui. No Haskell, bytes alocados pelo RTS (regressão allocated:iters do Criterion, sincronizada por coleta menor a cada amostra).

## Alocação do OCaml: contagem direta × regressão do Bechamel

A contagem direta (Gc.minor_words entre duas coletas menores forçadas) é exata e determinística, e é a que o resumo usa. O contador que o Bechamel lê só avança a cada coleta menor, e a regressão subestima sobretudo a base.

| Cenário | Versão | Direta (palavras/execução) | Regressão | Diferença |
|---|---|---:|---:|---:|
| arith | imperativa | 20,003 | 19,093 | -4.5% |
| arith | efeitos | 230,003 | 228,870 | -0.5% |
| state | imperativa | 60,005 | 59,064 | -1.6% |
| state | efeitos | 537,526 | 536,256 | -0.2% |
| exn | imperativa | 20,003 | 19,093 | -4.5% |
| exn | efeitos | 254,003 | 252,837 | -0.5% |
| output | imperativa | 80,003 | 79,466 | -0.7% |
| output | efeitos | 530,003 | 528,760 | -0.2% |
