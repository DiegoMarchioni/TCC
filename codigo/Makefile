# Atalhos. Requer o ambiente do opam ativo: eval $(opam env)
# Detalhes em README.md.

.PHONY: ajuda testar testar-completo normalizar metricas quarto-efeito campanha \
	sensibilidade artigo figuras tudo mutantes experimento

ajuda:
	@echo "make tudo             do teste ao artigo, na ordem do protocolo (~35 min)"
	@echo "make testar           semântica, gerador, formato e oráculos (61/61 + 61/61)"
	@echo "make testar-completo  + mutantes e quarto efeito"
	@echo "make normalizar       aplica ocamlformat e ormolu"
	@echo "make metricas         QP1/QP3: métricas de código e planilhas de boilerplate"
	@echo "make quarto-efeito    QP2: aplica Input numa cópia, testa e conta pontos"
	@echo "make campanha         QP4: campanha completa (~20 min com os padrões)"
	@echo "make sensibilidade    corrida subdimensionada sobre a última campanha (~3 min)"
	@echo "make artigo           regrava números, tabelas e ambiente em ../artigo.tex"
	@echo "make figuras          figuras da apresentação, a partir dos resultados"
	@echo "make experimento      continuação abandonada vs discontinue (OCaml 5)"

# Pipeline completo, em passos estritamente sequenciais (também sob make -j).
# A suíte de oráculo é pré-condição de tudo o que vem depois. O artigo fica por
# último: se alguma afirmação do texto deixar de valer com os números novos, o
# pipeline termina com erro, com as figuras já geradas.
tudo:
	$(MAKE) testar-completo
	$(MAKE) metricas
	$(MAKE) quarto-efeito
	$(MAKE) campanha
	$(MAKE) sensibilidade
	$(MAKE) figuras
	$(MAKE) artigo

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

# Sem argumento, usa a campanha mais recente.
sensibilidade:
	scripts/rodar-sensibilidade.sh

# Regrava os blocos gerados do artigo e confere as afirmações marcadas no
# texto; mede as páginas se os arquivos do modelo SBC estiverem na raiz.
artigo:
	@python3 scripts/atualizar_artigo.py; estado=$$?; \
	scripts/medir-paginas.sh || estado=1; \
	exit $$estado

figuras:
	python3 scripts/figuras.py

mutantes:
	python3 scripts/mutantes.py

experimento:
	cd ocaml && dune build ./experimento/continuacao.exe
	ocaml/_build/default/experimento/continuacao.exe abandonar
	ocaml/_build/default/experimento/continuacao.exe discontinue
