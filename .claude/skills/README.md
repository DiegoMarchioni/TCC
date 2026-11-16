# Skills do Claude usadas na apresentação

Skills de projeto: o Claude Code carrega sozinho as pastas daqui
(`.claude/skills/<nome>/SKILL.md`) quando o repositório é aberto. Também dá
para usá-las no claude.ai, compactando cada pasta em `.zip` e enviando em
**Customize → Skills**.

| Pasta | O que faz | Origem | Versão | Licença |
|---|---|---|---|---|
| `academic-pptx/` | Regras de conteúdo e estrutura para apresentações acadêmicas: títulos de ação (cada título é a conclusão do slide), teste do "deck fantasma", um gráfico por slide de resultado, citações no slide e um slide de referências, terminar nas conclusões | [Gabberflast/academic-pptx-skill](https://github.com/Gabberflast/academic-pptx-skill) (1,6 mil estrelas em 16/11/2026) | commit `9f2b703` | MIT (`LICENSE`) |
| `beamer/` | Slides acadêmicos em LaTeX Beamer: tema Madrid, XeLaTeX, sem animações de revelar, no máximo dois blocos coloridos por slide, tabelas `booktabs`, gráficos `pgfplots`, código com `listings`, slide de referências e slides de reserva, e inclui revisão visual do PDF | [Noi1r/beamer-skill](https://github.com/Noi1r/beamer-skill), pasta `beamer/` (374 estrelas em 16/11/2026) | commit `f3d62c0` | MIT (`LICENSE`) |
| `pptx/` | A parte técnica: gerar o `.pptx` com `pptxgenjs`, validar o arquivo e conferir as imagens de cada slide | [anthropics/skills](https://github.com/anthropics/skills), pasta `skills/pptx` | commit `1780c5e` | Apache 2.0 (`LICENSE.txt`) |

As três foram copiadas sem modificação. Da beamer-skill veio só a pasta da skill, com a licença e o README. A pasta de exemplos do repositório original, que traz PDFs de artigos de terceiros, ficou de fora. A academic-pptx foi feita para ser
usada junto com a pptx: a primeira decide o conteúdo, a segunda constrói o
arquivo.

## Observações

- A academic-pptx cita `pptxgenjs.md` e `editing.md` da skill pptx. Esses
  arquivos existiam numa versão antiga da pptx e hoje estão dentro do próprio
  `pptx/SKILL.md` (seções "Creating with pptxgenjs" e "Editing existing
  decks").
- O cabeçalho do `academic-pptx/SKILL.md` diz "Proprietary", mas o arquivo
  `LICENSE` do repositório de origem é MIT, e é ele que vale.
- Dependências da pptx: `pptxgenjs` (npm), `python-pptx`, `defusedxml`,
  `lxml` e `Pillow` (pip), LibreOffice e `pdftoppm` (Poppler).

## Onde foram usadas

A versão PowerPoint da defesa, `apresentacao/defesa.pptx`, foi gerada com as
duas, a partir do mesmo conteúdo dos slides em `apresentacao/fonte/`. O
gerador está em `apresentacao/ferramentas/gerar_pptx.js`. Da academic-pptx
vieram os títulos que dizem a conclusão de cada slide, a trilha de seções,
as citações no slide, o slide de referências e o fim nas conclusões. Da pptx
vieram o tema, os layouts e as seções do arquivo, os gráficos nativos e a
validação e a conferência visual de cada slide.
