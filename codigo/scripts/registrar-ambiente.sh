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

# Os rótulos abaixo são lidos por scripts/atualizar_artigo.py: LC_ALL=C evita
# que o lscpu os traduza (em pt_BR sairia "Nome do modelo"), e no macOS, que
# não tem lscpu, as mesmas chaves são montadas a partir do sysctl.
secao "Processador e memória"
if command -v lscpu >/dev/null; then
  LC_ALL=C lscpu | grep -E '^(Model name|CPU\(s\)|Thread\(s\) per core|Core\(s\) per socket|CPU max MHz|CPU min MHz)'
elif sysctl -n machdep.cpu.brand_string >/dev/null 2>&1; then
  echo "Model name:                              $(sysctl -n machdep.cpu.brand_string)"
  echo "CPU(s):                                  $(sysctl -n hw.logicalcpu 2>/dev/null)"
else
  echo "(lscpu e sysctl indisponíveis: preencha 'Model name:' e 'CPU(s):' à mão)"
fi
grep -E '^MemTotal' /proc/meminfo 2>/dev/null || true

secao "Sistema"
uname -srm
if [ -r /etc/os-release ]; then
  grep -E '^(PRETTY_NAME)=' /etc/os-release
elif command -v sw_vers >/dev/null; then
  echo "PRETTY_NAME=\"$(sw_vers -productName) $(sw_vers -productVersion)\""
fi
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
