# resultados/

Saídas geradas pelos scripts (não versionadas, exceto este arquivo):

| Gerado por | Arquivos |
|---|---|
| `scripts/metricas.py tabela` | `metricas-codigo.{json,csv,md}`, `boilerplate/<impl>.csv` (para a dupla contagem) |
| `scripts/metricas.py pontos BASE NOVO` | `pontos-modificacao.{json,md}` |
| `scripts/metricas.py concordancia` | `boilerplate.{json,md}` |
| `scripts/metricas.py latex` | `tabela-metricas.tex` (linhas da Tabela 1) |
| `scripts/rodar-campanha.sh` | `campanha-AAAAMMDD-HHMMSS/` com `ambiente.md`, `brutos/*.csv`, `resumo.{csv,md}`, `tabela-desempenho.tex`, `tabela-absolutos.tex` |

Para preservar uma campanha (recomendado: a que entra no artigo), versione a
pasta dela explicitamente com `git add -f resultados/campanha-...`.
