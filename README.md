# TCC: Mônadas e Efeitos Algébricos em Linguagens Funcionais

Diego Marchioni · orientador: Marco Rodrigo · Ciência da Computação, PUC Minas.

| Arquivo | Conteúdo |
|---|---|
| `artigo.tex`, `sbc-template.bib` | o artigo (modelo SBC) e a bibliografia; os números dos resultados são gerados a partir de `codigo/resultados/` |
| `medir.sh` | mede o artigo contra o Regulamento: páginas, resumo na 1ª página, pendências impressas (precisa de `sbc-template.sty` e `sbc.bst` do modelo SBC) |
| `codigo/` | implementações, testes, *harnesses*, métricas, resultados e scripts ([README](codigo/README.md)) |
| `apresentacao/` | os slides da defesa: `slides.pdf` para apresentar, `slides.html` para abrir no navegador, a fonte de cada slide com as notas do apresentador ([README](apresentacao/README.md)) |
| `codigo/resultados/figuras/` | figuras da apresentação (SVG e PNG), com os números em `dados.md` |
| `guia-defesa-0*.md` | guias de estudo para a banca: 01 Introdução, 02 Fundamentação, 03 Trabalhos Relacionados, 04 Metodologia, código e resultados, 05 Roteiro da apresentação e arguição, 06 Roteiro falado (o texto de cada slide e as respostas da arguição) |
| `revisao-completa.md` | revisão do artigo, com a conformidade ao Regulamento e as pendências |
| `marcacoes-estilo.md` | padrões de texto gerado por IA: o que foi tirado, o que você reescreve e como reconhecê-los |
| `Regulamento_TCC_CC.pdf` | Regulamento Geral de TCC do curso |

Para refazer tudo, do teste ao artigo: `cd codigo && make tudo` (ver o
README do código).

O código e os scripts foram gerados com assistência de IA, e a campanha de
medição citada no artigo foi executada pela ferramenta numa máquina virtual de
nuvem, como declarado no artigo (Arts. 6º a 8º do Regulamento).
