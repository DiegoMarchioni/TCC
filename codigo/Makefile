# Atalhos. Requer o ambiente do opam ativo: eval $(opam env)
# Detalhes em README.md.

.PHONY: ajuda testar testar-completo normalizar metricas quarto-efeito campanha mutantes experimento

ajuda:
	@echo "make testar           semântica, gerador, formato e oráculos (61/61 + 61/61)"
	@echo "make testar-completo  + mutantes e quarto efeito"
	@echo "make normalizar       aplica ocamlformat e ormolu"
	@echo "make metricas         QP1/QP3: métricas de código e planilhas de boilerplate"
	@echo "make quarto-efeito    QP2: aplica Input numa cópia, testa e conta pontos"
	@echo "make campanha         QP4: campanha completa (~20 min com os padrões)"
	@echo "make experimento      continuação abandonada vs discontinue (OCaml 5)"

testar:
	scripts/testar.sh

testar-completo:
	scripts/testar.sh completo

normalizar:
	scripts/normalizar.sh

metricas:
	scripts/normalizar.sh verificar
	python3 scripts/metricas.py tabela
	python3 scripts/metricas.py latex

quarto-efeito:
	quarto-efeito/medir.sh
	python3 scripts/metricas.py latex

campanha:
	scripts/rodar-campanha.sh

mutantes:
	python3 scripts/mutantes.py

experimento:
	cd ocaml && dune build ./experimento/continuacao.exe
	ocaml/_build/default/experimento/continuacao.exe abandonar
	ocaml/_build/default/experimento/continuacao.exe discontinue
