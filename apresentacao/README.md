# Apresentação da defesa

20 slides de fala e 5 de apêndice (A1 a A5), em 1920×1080.

| Arquivo | Para quê |
|---|---|
| `dissertacao/defesa.pdf` | **versão no estilo de apresentação de dissertação**: fundo branco, rótulo de seção em laranja, título grande sem serifa (Open Sans), rodapé com linha fina, tabelas com separadores sutis, código em fonte monoespaçada sobre fundo cinza e slides de transição entre as seções |
| `dissertacao/defesa-notas.pdf` | a mesma versão com as notas do apresentador ao lado de cada slide |
| `dissertacao/defesa.tex` | fonte dessa versão |
| `beamer/defesa.pdf` | **versão acadêmica em LaTeX Beamer** (tema Madrid), feita com a skill `.claude/skills/beamer`: sumário e roteiro a cada seção, tabelas `booktabs`, gráficos `pgfplots`, código do trabalho com `listings`, referências e slides de reserva |
| `beamer/defesa-notas.pdf` | a mesma versão Beamer com as notas do apresentador ao lado de cada slide (para o segundo monitor) |
| `beamer/defesa.tex` | fonte da versão Beamer |
| `slides.pdf` | apresentar: abre em qualquer leitor de PDF, uma página por slide |
| `defesa.pptx` | versão PowerPoint, editável, com notas do apresentador em cada slide e gráficos nativos; segue as skills de `.claude/skills/` (títulos que dizem a conclusão de cada slide, citações no slide, referências, termina nas conclusões) |
| `slides.html` | abrir no navegador. As fontes vêm do Google Fonts, então sem internet o texto aparece em Arial e Georgia |
| `fonte/deck.json` | ordem dos slides e fontes usadas |
| `fonte/slides/*.html` | um arquivo por slide. As **notas do apresentador** estão dentro de `<aside>`, no fim de cada arquivo |
| `ferramentas/montar.py`, `ferramentas/render.js` | geram `slides.html` e `slides.pdf` a partir da fonte |
| `ferramentas/gerar_pptx.js` | gera `defesa.pptx`; as notas vêm dos mesmos arquivos da fonte |

O texto falado de cada slide, palavra por palavra, também está no
[Guia 06](../guia-defesa-06-roteiro-falado.md), e o mapa de tempos, no
[Guia 05](../guia-defesa-05-apresentacao.md). A versão de 12/11/2026 foi
simplificada (menos nomes de tipos e funções e menos detalhes estatísticos na
tela e na fala, com os mesmos números) e ganhou mais código: o sumário (slide 2), os dois mecanismos no código do
trabalho (slide 5), a função `eval` com handlers (slide 8) e o quarto efeito
no código (slide 13).

## Como regerar a versão no estilo de dissertação

Precisa das fontes Open Sans e IBM Plex Mono (`fonts-open-sans` e
`fonts-ibm-plex` no Ubuntu). Na pasta `apresentacao/dissertacao/`, os mesmos
comandos da versão Beamer abaixo.

## Como regerar a versão Beamer

Na pasta `apresentacao/beamer/`, com TeX Live (pacotes `texlive-xetex`,
`texlive-luatex` e `texlive-lang-portuguese`):

```sh
xelatex defesa.tex && xelatex defesa.tex
lualatex -jobname=defesa-notas "\def\comnotas{1}\input{defesa}"
lualatex -jobname=defesa-notas "\def\comnotas{1}\input{defesa}"
```

A versão com notas usa LuaLaTeX porque, no XeLaTeX, o modo de notas em
segunda tela perde a cor do texto depois de trechos coloridos.

## Como regerar o PDF

Depois de editar um slide em `fonte/slides/`, na raiz do repositório:

```sh
python3 apresentacao/ferramentas/montar.py apresentacao/fonte apresentacao/slides.html
node apresentacao/ferramentas/render.js "$PWD/apresentacao/slides.html" apresentacao
```

O segundo comando precisa do Playwright com o Chromium instalado
(`npm install playwright` e `npx playwright install chromium`). Ele também
grava um PNG por slide (`s01.png` a `s25.png`), que não são versionados.

## Como regerar o PowerPoint

Na raiz do repositório, com o `pptxgenjs` instalado (`npm install pptxgenjs`):

```sh
NODE_PATH=<pasta node_modules com o pptxgenjs> node apresentacao/ferramentas/gerar_pptx.js
python3 .claude/skills/pptx/scripts/office/validate.py apresentacao/defesa.pptx
```

O segundo comando é a validação da skill pptx.

## Usando o PowerPoint

O PDF abre direto no modo de apresentação de qualquer leitor. Para ter as notas
do apresentador na tela do notebook, abra o `defesa.pptx` no PowerPoint (ou no
Google Slides) e use o modo do apresentador.
