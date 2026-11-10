#!/usr/bin/env bash
# Registra o ambiente de medição (Seção 4.3 do artigo): máquina, sistema,
# controle de frequência, afinidade e versões exatas das ferramentas. Chamado
# por rodar-campanha.sh; pode ser rodado sozinho. Não registra nome de host
# nem usuário.
set -uo pipefail
cd "$(dirname "$0")/.."

secao() { printf '\n## %s\n' "$1"; }
ler() { [ -r "$1" ] && cat "$1" 2>/dev/null || echo "(indisponível)"; }

echo "# Ambiente de medição — $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

secao "Repositório"
echo "commit: $(git rev-parse HEAD 2>/dev/null || echo '?')"
echo "alterações não commitadas: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

secao "Processador e memória"
if command -v lscpu >/dev/null; then
  lscpu | grep -E '^(Model name|CPU\(s\)|Thread\(s\) per core|Core\(s\) per socket|CPU max MHz|CPU min MHz)'
else
  sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "(lscpu indisponível)"
fi
grep -E '^MemTotal' /proc/meminfo 2>/dev/null || true

secao "Sistema"
uname -srm
grep -E '^(PRETTY_NAME)=' /etc/os-release 2>/dev/null || true
if grep -qw hypervisor /proc/cpuinfo 2>/dev/null; then
  echo "virtualização: sim (flag hypervisor em /proc/cpuinfo)"
else
  echo "virtualização: não detectada"
fi
echo "executor: ${TCC_EXECUTOR:-autor}"

secao "Controle de frequência"
echo "governor: $(cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor 2>/dev/null | sort | uniq -c | tr '\n' ' ')"
echo "intel_pstate/no_turbo: $(ler /sys/devices/system/cpu/intel_pstate/no_turbo)"
echo "cpufreq/boost: $(ler /sys/devices/system/cpu/cpufreq/boost)"

secao "Afinidade e carga"
echo "TCC_TASKSET='${TCC_TASKSET:-}'"
command -v taskset >/dev/null && taskset -p $$ 2>/dev/null
echo "carga média: $(ler /proc/loadavg)"

secao "OCaml"
command -v ocamlfind >/dev/null && ocamlfind ocamlopt -version 2>/dev/null | sed 's/^/ocamlopt /'
ocamlopt -config 2>/dev/null | grep -E '^(version|flambda):'
echo "dune $(dune --version 2>/dev/null)"
command -v opam >/dev/null && opam list --short --columns=name,version bechamel yojson 2>/dev/null
echo "flags do projeto (ocaml/dune):"; grep -A1 -E 'ocamlopt_flags' ocaml/dune | tr -s ' \n' ' ' | sed 's/^/  /'; echo

secao "Haskell"
ghc --version 2>/dev/null
cabal --version 2>/dev/null | head -1
# Versões efetivamente usadas na compilação (plano do cabal), e não as do
# banco global de pacotes, onde as dependências do projeto não ficam.
if [ -f haskell/dist-newstyle/cache/plan.json ]; then
  python3 - haskell/dist-newstyle/cache/plan.json <<'PY'
import json, sys
plano = json.load(open(sys.argv[1], encoding="utf-8"))["install-plan"]
vistos = {}
for p in plano:
    if p.get("pkg-name") in ("criterion", "statistics", "mtl", "containers", "base"):
        vistos[p["pkg-name"]] = p["pkg-version"]
for nome in sorted(vistos):
    print(f"{nome}-{vistos[nome]}")
PY
else
  ghc-pkg list --simple-output criterion mtl containers 2>/dev/null
fi
echo "flags (tcc-efeitos.cabal):"; grep -E 'ghc-options' haskell/tcc-efeitos.cabal | sed 's/^/  /'

secao "Formatadores"
echo "ocamlformat $(ocamlformat --version 2>/dev/null)"
ormolu --version 2>/dev/null | head -1
