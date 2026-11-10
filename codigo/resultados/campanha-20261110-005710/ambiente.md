# Ambiente de medição — 2026-11-10 00:57:10 UTC

## Repositório
commit: 760e8002b2eb272cb1ec24b8c4a22573a815c9b0
alterações não commitadas: 0

## Processador e memória
CPU(s):                                  4
Model name:                              Intel(R) Xeon(R) Processor @ 2.10GHz
Thread(s) per core:                      1
Core(s) per socket:                      4
MemTotal:       16472400 kB

## Sistema
Linux 6.18.44-fc-v338 x86_64
PRETTY_NAME="Ubuntu 24.04.5 LTS"
virtualização: sim (flag hypervisor em /proc/cpuinfo)
executor: assistente de IA (Claude Code), em sessão na nuvem
(as duas linhas acima e as versões de pacotes Haskell abaixo foram acrescentadas em
 10/11/2026, depois da campanha, pelo critério do registrar-ambiente.sh corrigido)

## Controle de frequência
governor: 
intel_pstate/no_turbo: (indisponível)
cpufreq/boost: (indisponível)

## Afinidade e carga
TCC_TASKSET='taskset -c 3'
pid 762's current affinity mask: f
carga média: 0.04 0.08 0.03 2/106 785

## OCaml
ocamlopt 5.2.1
version: 5.2.1
flambda: true
dune 3.24.2
bechamel 0.5.0
yojson   3.0.0
flags do projeto (ocaml/dune):
    (ocamlopt_flags

## Haskell
The Glorious Glasgow Haskell Compilation System, version 9.4.7
cabal-install version 3.8.1.0
base-4.17.2.0
containers-0.6.7
criterion-1.6.1.0
mtl-2.2.2
statistics-0.16.2.1
flags (tcc-efeitos.cabal):
    ghc-options:      -O2 -Wall
    ghc-options:    -rtsopts "-with-rtsopts=-T"

## Formatadores
ocamlformat 0.26.2
ormolu 0.5.3.0

## Parâmetros da campanha
SEMENTES=42 43 44 TCC_QUOTA=20 TCC_LIMIT=5000 TCC_RESAMPLES=1000
TCC_BOOTSTRAP=1000 TCC_CENARIOS=todos TCC_TASKSET=taskset -c 3

## Repetições por R²
Medições com R² do tempo < 0.95 remedidas em par (mecanismo e base), na ordem da campanha, com os mesmos parâmetros e afinidade.
- 2026-11-10 01:15 UTC, commit 760e800 com alterações não commitadas apenas nos harnesses (ordem entre as versões fixa por cenário, para que a repetição isolada mantivesse a ordem da campanha): ocaml/state/semente 43 remedido (R² antes: efeitos 0.972, imperativa 0.949; depois: efeitos 0.962, imperativa 0.962); linhas antigas em descartados/ocaml-43-state-descarte1.csv
