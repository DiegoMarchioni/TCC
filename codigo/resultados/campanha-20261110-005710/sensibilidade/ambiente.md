# Ambiente de medição — 2026-11-10 01:17:14 UTC

## Repositório
commit: 760e8002b2eb272cb1ec24b8c4a22573a815c9b0
alterações não commitadas: 8

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

## Controle de frequência
governor: 
intel_pstate/no_turbo: (indisponível)
cpufreq/boost: (indisponível)

## Afinidade e carga
TCC_TASKSET='taskset -c 3'
pid 2563's current affinity mask: f
carga média: 0.61 0.75 0.68 2/102 2587

## OCaml
ocamlopt 5.2.1
version: 5.2.1
flambda: true
dune 3.24.2
bechamel 0.5.0
yojson   3.0.0
flags do projeto (ocaml/dune):
   (ocamlopt_flags (:standard -O3)))) 

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
SEMENTES=42 TCC_QUOTA=5 TCC_LIMIT=2000 TCC_RESAMPLES=1000
