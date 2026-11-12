# Resumo da campanha (sensibilidade)

Razão = mecanismo / linha de base da mesma linguagem; mediana das sementes. IC = envelope dos IC conservadores de 95% das sementes. Dispersão = (máx − mín)/mediana.

| Linguagem | Cenário | Tempo | IC 95% | Disp. | Alocação | IC 95% | Disp. | R² mín |
|---|---|---:|---|---:|---:|---|---:|---:|
| haskell | arith | 1.11 | [1.05; 1.17] | 0.0% | 2.18 | [2.18; 2.18] | 0.0% | 0.991 |
| haskell | state | 0.92 | [0.80; 1.09] | 0.0% | 1.08 | [1.08; 1.08] | 0.0% | 0.954 |
| haskell | exn | 0.95 | [0.90; 1.02] | 0.0% | 2.14 | [2.14; 2.14] | 0.0% | 0.989 |
| haskell | output | 0.97 | [0.90; 1.05] | 0.0% | 1.08 | [1.08; 1.08] | 0.0% | 0.983 |
| ocaml | arith | 1.81 | [1.74; 1.87] | 0.0% | 12.61 | [12.37; 12.87] | 0.0% | 0.978 |
| ocaml | state | 2.44 | [2.31; 2.58] | 0.0% | 9.20 | [9.15; 9.25] | 0.0% | 0.962 |
| ocaml | exn | 1.88 | [1.82; 1.94] | 0.0% | 13.90 | [13.67; 14.17] | 0.0% | 0.975 |
| ocaml | output | 4.58 | [4.39; 4.81] | 0.0% | 6.71 | [6.68; 6.73] | 0.0% | 0.951 |

## Valores absolutos por expressão (medianas das sementes)

| Linguagem | Cenário | Base (ns) | Mecanismo (ns) | Base (bytes) | Mecanismo (bytes) |
|---|---|---:|---:|---:|---:|
| haskell | arith | 99.3 | 109.7 | 127.3 | 277.4 |
| haskell | state | 352.6 | 323.0 | 116.9 | 125.7 |
| haskell | exn | 114.3 | 109.1 | 118.6 | 254.3 |
| haskell | output | 40.6 | 39.3 | 104.3 | 112.3 |
| ocaml | arith | 79.6 | 144.0 | 14.4 | 181.9 |
| ocaml | state | 79.0 | 192.9 | 46.5 | 427.8 |
| ocaml | exn | 77.0 | 144.7 | 14.5 | 201.0 |
| ocaml | output | 34.1 | 156.2 | 62.9 | 422.0 |

Alocação: no OCaml, palavras do *minor heap* convertidas para bytes; os segmentos de pilha das *fibers* são alocados fora do heap e não aparecem aqui. No Haskell, bytes alocados pelo RTS (regressão allocated:iters do Criterion, sincronizada por coleta menor a cada amostra).

Sem alocacao-direta/: a alocação do OCaml vem da regressão do Bechamel, que subestima a base (ver o cabeçalho de scripts/resumir_campanha.py).

## Avisos

- haskell/arith: 1 semente(s); o protocolo usa três
- haskell/state: 1 semente(s); o protocolo usa três
- haskell/exn: 1 semente(s); o protocolo usa três
- haskell/output: 1 semente(s); o protocolo usa três
- ocaml/arith: 1 semente(s); o protocolo usa três
- ocaml/state: 1 semente(s); o protocolo usa três
- ocaml/exn: 1 semente(s); o protocolo usa três
- ocaml/output: 1 semente(s); o protocolo usa três
