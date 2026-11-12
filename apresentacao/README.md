# Apresentação da defesa

16 slides de fala e 5 de apêndice (A1 a A5), em 1920×1080.

| Arquivo | Para quê |
|---|---|
| `slides.pdf` | apresentar: abre em qualquer leitor de PDF, uma página por slide |
| `slides.html` | abrir no navegador; as fontes vêm do Google Fonts, então sem internet o texto aparece em Arial e Georgia |
| `fonte/deck.json` | ordem dos slides e fontes usadas |
| `fonte/slides/*.html` | um arquivo por slide; as **notas do apresentador** estão dentro de `<aside>`, no fim de cada arquivo |
| `ferramentas/montar.py`, `ferramentas/render.js` | geram `slides.html` e `slides.pdf` a partir da fonte |

O texto falado de cada slide, palavra por palavra, também está no
[Guia 06](../guia-defesa-06-roteiro-falado.md), e o mapa de tempos, no
[Guia 05](../guia-defesa-05-apresentacao.md). A versão de 12/11/2026 foi
simplificada: menos nomes de tipos e funções e menos detalhes estatísticos na
tela e na fala, com os mesmos números.

## Como regerar o PDF

Depois de editar um slide em `fonte/slides/`, na raiz do repositório:

```sh
python3 apresentacao/ferramentas/montar.py apresentacao/fonte apresentacao/slides.html
node apresentacao/ferramentas/render.js "$PWD/apresentacao/slides.html" apresentacao
```

O segundo comando precisa do Playwright com o Chromium instalado
(`npm install playwright` e `npx playwright install chromium`). Ele também
grava um PNG por slide (`s01.png` a `s21.png`), que não são versionados.

## Usando o PowerPoint

O PDF abre direto no modo de apresentação de qualquer leitor. Para ter as notas
do apresentador na tela do notebook, use a versão online dos slides (o link
privado está com você) e baixe como `.pptx` pelo menu da página: as notas vão
junto.
