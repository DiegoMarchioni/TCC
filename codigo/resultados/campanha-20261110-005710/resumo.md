# Resumo da campanha (campanha-20261110-005710)

Razão = mecanismo / linha de base da mesma linguagem; mediana das sementes. IC = envelope dos IC conservadores de 95% das sementes. Dispersão = (máx − mín)/mediana.

| Linguagem | Cenário | Tempo | IC 95% | Disp. | Alocação | IC 95% | Disp. | R² mín |
|---|---|---:|---|---:|---:|---|---:|---:|
| haskell | arith | 1.08 | [1.04; 1.18] | 4.7% | 2.18 | [2.18; 2.18] | 0.0% | 0.994 |
| haskell | state | 0.99 | [0.89; 1.04] | 3.0% | 1.08 | [1.08; 1.08] | 0.0% | 0.989 |
| haskell | exn | 1.05 | [0.97; 1.13] | 1.4% | 2.14 | [2.14; 2.15] | 0.0% | 0.991 |
| haskell | output | 0.97 | [0.76; 1.04] | 18.3% | 1.08 | [1.08; 1.08] | 0.0% | 0.973 |
| ocaml | arith | 1.59 | [1.50; 1.64] | 3.0% | 11.99 | [11.92; 12.06] | 0.1% | 0.974 |
| ocaml | state | 1.98 | [1.84; 2.13] | 6.6% | 9.08 | [9.06; 9.10] | 0.1% | 0.954 |
| ocaml | exn | 1.63 | [1.53; 1.74] | 7.7% | 13.24 | [13.17; 13.33] | 0.2% | 0.976 |
| ocaml | output | 4.26 | [4.04; 4.45] | 4.6% | 6.65 | [6.65; 6.66] | 0.0% | 0.963 |

## Valores absolutos por expressão (medianas das sementes)

| Linguagem | Cenário | Base (ns) | Mecanismo (ns) | Base (bytes) | Mecanismo (bytes) |
|---|---|---:|---:|---:|---:|
| haskell | arith | 96.3 | 106.3 | 127.3 | 277.4 |
| haskell | state | 345.9 | 341.8 | 116.9 | 125.7 |
| haskell | exn | 94.6 | 99.4 | 118.6 | 254.4 |
| haskell | output | 40.9 | 38.6 | 104.3 | 112.3 |
| ocaml | arith | 77.1 | 122.4 | 15.3 | 183.1 |
| ocaml | state | 86.5 | 170.8 | 47.2 | 429.0 |
| ocaml | exn | 77.4 | 126.4 | 15.3 | 202.3 |
| ocaml | output | 33.9 | 144.6 | 63.6 | 423.0 |

Alocação: OCaml conta palavras do *minor heap* (Gc.minor_words, convertidas para bytes); os segmentos de pilha das *fibers* são alocados fora do heap e não aparecem aqui. Haskell conta bytes alocados pelo RTS (regressão allocated:iters).
