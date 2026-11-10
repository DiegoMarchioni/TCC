# resultados/

Saídas dos scripts. **São versionadas**: o artigo é gerado a partir delas
(`make artigo`), e a campanha que ele cita precisa estar no repositório para
que cada número seja conferível (Art. 5º, § 3º, do Regulamento).

| Gerado por | Arquivos |
|---|---|
| `scripts/metricas.py tabela` (`make metricas`) | `metricas-codigo.{json,csv,md}`; `boilerplate-regra/<impl>.csv` (classificação mecânica de cada linha, com o motivo); `boilerplate/<impl>.csv` (planilhas em branco para a validação humana opcional) |
| `quarto-efeito/medir.sh` (`make quarto-efeito`) | `pontos-modificacao.{json,md}` |
| `scripts/metricas.py latex` | `tabela-metricas.tex` |
| `scripts/rodar-campanha.sh` (`make campanha`) | `campanha-AAAAMMDD-HHMMSS/`: `ambiente.md` (máquina, versões, quem executou, repetições), `brutos/*.csv`, `descartados/` (medições refeitas por R² < 0,95), `resumo.{csv,md}`, `tabela-*.tex`, `oraculo-*.txt` |
| `scripts/rodar-sensibilidade.sh` (`make sensibilidade`) | `campanha-…/sensibilidade/` (corrida subdimensionada) |
| `scripts/figuras.py` (`make figuras`) | `figuras/*.svg` e `figuras/dados.md` (os PNG 2× foram renderizados a partir dos SVG) |

## Campanha citada no artigo

`campanha-20261110-005710/`: Intel Xeon @ 2,10 GHz, 4 vCPU, **máquina virtual
de nuvem**, Ubuntu 24.04.5, OCaml 5.2.1+flambda, GHC 9.4.7, afinidade fixa no
núcleo 3, sementes 42, 43 e 44, cota de 20 s. **Executada por assistente de IA
(Claude Code)**, como registram `ambiente.md` e a declaração de IA do artigo.
Um par de medições (OCaml/State/semente 43) foi refeito por R² 0,949 < 0,95; o
original está em `descartados/`.

Se você refizer a campanha (`make tudo`), a pasta nova passa a ser a mais
recente, e `make artigo` a usa; versione-a junto com o artigo regenerado.
