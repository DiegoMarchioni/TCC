// Gera apresentacao/dissertacao/defesa.pptx (PowerPoint editável) e
// apresentacao/dissertacao/explicacao-slides.md (o que cada coisa de cada slide
// significa), a partir do mesmo conteúdo.
//
// Estilo de apresentação de dissertação: fundo branco, rótulo da seção em laranja
// no canto superior esquerdo, título grande, rodapé com linha fina, tabelas com
// separadores sutis, código em Courier New sobre fundo cinza com um comentário em
// cada linha. Feito com a skill .claude/skills/pptx (deck estruturado: tema,
// layouts com placeholders, seções, gráficos e tabelas nativos).
//
// Cada slide tem, nas notas do apresentador, o que dizer e o que cada termo do
// slide significa. Os termos centrais também aparecem no slide, num quadro
// "O que é".
//
// Uso, na raiz do repositório (precisa do pptxgenjs: npm install pptxgenjs):
//   NODE_PATH=<pasta node_modules com pptxgenjs> node apresentacao/dissertacao/gerar_pptx.js

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = path.resolve(__dirname, "..", "..");
const SAIDA = path.join(__dirname, "defesa.pptx");
const SAIDA_MD = path.join(__dirname, "explicacao-slides.md");
const { applyTheme } = require(path.join(RAIZ, ".claude", "skills", "pptx", "scripts", "apply_theme.js"));

// ---- tema --------------------------------------------------------------------
const HEX = {
  texto: "1A1A1A", corpo: "3A3A3A", fundo: "FFFFFF", cinzaCodigo: "F3F3F3",
  marinho: "2D4B8E", rosa: "A63C5A", verdeazul: "3B8A7A", laranja: "E8603C",
  base: "B5B5B5", rodape: "888888", linha: "D6D6D6", comentario: "6E6E6E",
  quadro: "F2F4F8",
};
const THEME = {
  name: "Defesa TCC dissertacao",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: HEX.texto, lt1: HEX.fundo, dk2: HEX.corpo, lt2: HEX.cinzaCodigo,
    accent1: HEX.marinho, accent2: HEX.rosa, accent3: HEX.verdeazul, accent4: HEX.laranja,
    accent5: HEX.base, accent6: HEX.rodape, hlink: HEX.marinho, folHlink: HEX.rosa,
  },
};
const CODIGO = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13,333" x 7,5"
pres.author = "Diego Marchioni";
pres.title = "Mônadas e Efeitos Algébricos em Linguagens Funcionais";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

const W = 13.333, MX = 0.9, CW = W - 2 * MX; // margem lateral e largura útil
const RODAPE = "PUC Minas - Ciência da Computação";

// ---- layouts -----------------------------------------------------------------
const cantos = [
  { text: { text: "PUC Minas", options: { x: MX, y: 0.4, w: 4, h: 0.3, fontSize: 12, color: C.accent4, margin: 0 } } },
  { text: { text: "Ciência da Computação", options: { x: W - MX - 4, y: 0.4, w: 4, h: 0.3, fontSize: 12, color: C.accent4, align: "right", margin: 0 } } },
];
pres.defineSlideMaster({
  title: "CAPA",
  background: { color: C.background1 },
  objects: [
    ...cantos,
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 2.0, w: CW, h: 1.5, fontSize: 40, color: C.text1, align: "left", valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitulo", type: "body", x: MX, y: 3.6, w: CW, h: 0.9, fontSize: 20, color: C.text2, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "autor", type: "body", x: MX, y: 4.6, w: CW, h: 1.6, fontSize: 16, color: C.text2, valign: "top", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});
pres.defineSlideMaster({
  title: "SECAO",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "numero", type: "body", x: MX, y: 2.7, w: CW, h: 0.5, fontSize: 22, color: C.accent4, align: "center", valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 3.25, w: CW, h: 0.9, fontSize: 40, color: C.text1, align: "center", valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTEUDO",
  background: { color: C.background1 },
  margin: [0.4, MX, 0.8, MX],
  objects: [
    { placeholder: { options: { name: "rotulo", type: "body", x: MX, y: 0.4, w: 8, h: 0.32, fontSize: 12, color: C.accent4, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.78, w: CW, h: 0.75, fontSize: 32, color: C.text1, align: "left", valign: "top", margin: 0 }, text: "" } },
    { line: { x: MX, y: 6.85, w: CW, h: 0, line: { color: HEX.linha, width: 0.75 } } },
    { text: { text: RODAPE, options: { x: MX, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});
pres.defineSlideMaster({
  title: "FINAL",
  background: { color: C.background1 },
  objects: [
    ...cantos,
    { placeholder: { options: { name: "title", type: "title", x: MX, y: 2.9, w: CW, h: 0.9, fontSize: 40, color: C.text1, align: "center", valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "contato", type: "body", x: MX, y: 3.9, w: CW, h: 0.5, fontSize: 18, color: C.text2, align: "center", valign: "top", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});

// ---- ajudantes ---------------------------------------------------------------
let n = 0;
const md = ["# Explicação slide a slide", "",
  "Gerado por `gerar_pptx.js` junto com `defesa.pptx`. O mesmo texto está nas notas do apresentador de cada slide.", ""];

function registrar(slide, titulo, fala, termos) {
  n += 1;
  let notas = "O QUE DIZER\n" + fala;
  if (termos && termos.length) {
    notas += "\n\nO QUE CADA COISA DO SLIDE SIGNIFICA\n" + termos.map(([t, e]) => "- " + t + ": " + e).join("\n");
  }
  slide.addNotes(notas);
  md.push("## " + n + ". " + titulo, "", "**O que dizer.** " + fala, "");
  if (termos && termos.length) {
    md.push("**O que cada coisa significa.**", "");
    termos.forEach(([t, e]) => md.push("- **" + t + "**: " + e));
    md.push("");
  }
}

function conteudo(secao, titulo, secaoPpt) {
  const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: secaoPpt || secao });
  s.addText(secao, { placeholder: "rotulo" });
  s.addText(titulo, { placeholder: "title" });
  return s;
}

function texto(s, partes, o) {
  // partes: string ou array de runs; o: posição e estilo
  s.addText(partes, Object.assign({ isTextBox: true, fontSize: 16, color: C.text2, margin: 0, valign: "top", paraSpaceAfter: 4 }, o));
}

// runs com **negrito** marcado no texto
function runs(str, base) {
  const out = [];
  str.split(/(\*\*[^*]+\*\*)/).forEach((p) => {
    if (!p) return;
    const neg = p.startsWith("**");
    out.push({ text: neg ? p.slice(2, -2) : p, options: Object.assign({}, base || {}, neg ? { bold: true } : {}) });
  });
  return out;
}

function bullets(s, itens, o) {
  const arr = [];
  itens.forEach((it, i) => {
    const r = runs(it);
    r[0].options = Object.assign({}, r[0].options, { bullet: { indent: 18 } });
    if (i < itens.length - 1) r[r.length - 1].options = Object.assign({}, r[r.length - 1].options, { breakLine: true });
    arr.push(...r);
  });
  texto(s, arr, Object.assign({ paraSpaceAfter: 6 }, o));
}

function numerada(s, itens, o) {
  const arr = [];
  itens.forEach((it, i) => {
    const r = runs(it);
    r[0].options = Object.assign({}, r[0].options, { bullet: { type: "number", indent: 22 } });
    if (i < itens.length - 1) r[r.length - 1].options = Object.assign({}, r[r.length - 1].options, { breakLine: true });
    arr.push(...r);
  });
  texto(s, arr, Object.assign({ paraSpaceAfter: 6 }, o));
}

// Bloco de código: linhas [código, comentário, tipo] com tipo "-", "+" ou " ".
function codigo(s, linhas, o) {
  const tam = o.fontSize || 12;
  const col = Math.max(...linhas.filter((l) => l[1]).map((l) => l[0].length)) + 2;
  const arr = [];
  linhas.forEach(([cod, com, tipo], i) => {
    const corCod = tipo === "-" ? HEX.rosa : tipo === "+" ? HEX.verdeazul : HEX.texto;
    const ult = i === linhas.length - 1;
    const pad = com ? cod.padEnd(col, " ") : cod;
    arr.push({ text: pad.length ? pad : " ", options: { fontFace: CODIGO, color: corCod, breakLine: com ? false : !ult } });
    if (com) arr.push({ text: com, options: { fontFace: CODIGO, color: HEX.comentario, italic: true, breakLine: !ult } });
  });
  const h = o.h || linhas.length * tam * 1.2 / 72 + 0.3;
  s.addShape(pres.shapes.RECTANGLE, { x: o.x, y: o.y, w: o.w, h, fill: { color: HEX.cinzaCodigo }, line: { type: "none" }, objectName: "fundo do código" });
  s.addText(arr, { isTextBox: true, x: o.x, y: o.y, w: o.w, h, fontSize: tam, margin: [6, 10, 6, 10], valign: "middle", lineSpacingMultiple: 1.0, objectName: "código" });
  return h;
}

function legenda(s, t, o) {
  texto(s, runs(t), Object.assign({ fontSize: 12, italic: true, color: C.text2, align: "center", h: 0.3 }, o));
}

function fonte(s, t, y) {
  texto(s, t, { x: MX, y: y || 6.4, w: CW, h: 0.35, fontSize: 11, color: C.accent6 });
}

// Quadro "O que é" com os termos centrais do slide
function quadro(s, termos, o) {
  const arr = [{ text: "O que é", options: { bold: true, color: HEX.marinho, breakLine: true } }];
  termos.forEach(([t, e], i) => {
    arr.push({ text: t + ": ", options: { bold: true, color: HEX.texto } });
    arr.push({ text: e, options: { color: HEX.corpo, breakLine: i < termos.length - 1 } });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: HEX.quadro }, line: { type: "none" }, objectName: "quadro O que é" });
  s.addText(arr, { isTextBox: true, x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.fontSize || 12, margin: [8, 12, 8, 12], valign: "top", paraSpaceAfter: 3, objectName: "texto O que é" });
}

// Caixa com borda fina e título em negrito (como no modelo)
function caixa(s, titulo, itens, o) {
  s.addShape(pres.shapes.RECTANGLE, { x: o.x, y: o.y, w: o.w, h: o.h, fill: { color: HEX.fundo }, line: { color: HEX.texto, width: 0.75 }, objectName: "caixa " + titulo });
  texto(s, [{ text: titulo, options: { bold: true, color: C.text1 } }], { x: o.x + 0.2, y: o.y + 0.15, w: o.w - 0.4, h: 0.4, fontSize: 17 });
  bullets(s, itens, { x: o.x + 0.2, y: o.y + 0.6, w: o.w - 0.4, h: o.h - 0.7, fontSize: o.fontSize || 15 });
}

// Tabela: cabeçalho em negrito, separadores cinza-claros, linhas fortes em cima e embaixo
function tabela(s, cab, linhas, o) {
  const fs_ = o.fontSize || 14;
  const nada = { type: "none" };
  const fino = { type: "solid", pt: 0.75, color: HEX.linha };
  const forte = { type: "solid", pt: 1.25, color: HEX.texto };
  const al = o.align || [];
  const rows = [];
  rows.push(cab.map((t, j) => ({ text: t, options: { bold: true, color: HEX.texto, align: al[j] || "left", border: [forte, nada, { type: "solid", pt: 0.75, color: HEX.texto }, nada] } })));
  linhas.forEach((l, i) => {
    const ultima = i === linhas.length - 1;
    rows.push(l.map((cel, j) => {
      const obj = typeof cel === "object" ? cel : { t: cel };
      return { text: obj.t, options: { color: obj.cor || HEX.corpo, bold: !!obj.b, fontFace: obj.mono ? CODIGO : undefined, align: al[j] || "left", border: [nada, nada, ultima ? forte : fino, nada] } };
    }));
  });
  s.addTable(rows, { x: o.x, y: o.y, w: o.w, colW: o.colW, fontSize: fs_, valign: "middle", margin: [4, 6, 4, 6], rowH: o.rowH });
}

const eixo = {
  catAxisLabelColor: HEX.corpo, valAxisLabelColor: HEX.corpo, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
  catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
  valAxisTitleFontFace: "+mn-lt", valGridLine: { color: HEX.linha, size: 0.5 }, catGridLine: { style: "none" },
  catAxisLineColor: HEX.rodape, valAxisLineShow: false, dataLabelColor: HEX.texto, dataLabelFontSize: 11,
  valAxisTitleColor: HEX.corpo, valAxisTitleFontSize: 11,
};

function secao(numero, titulo, fala) {
  pres.addSection({ title: titulo });
  const s = pres.addSlide({ masterName: "SECAO", sectionTitle: titulo });
  s.addText(numero, { placeholder: "numero" });
  s.addText(titulo, { placeholder: "title" });
  registrar(s, "Seção " + numero + ": " + titulo, fala, []);
}

// =============================================================================
// SLIDES
// =============================================================================

// 1. Capa
pres.addSection({ title: "Abertura" });
{
  const s = pres.addSlide({ masterName: "CAPA", sectionTitle: "Abertura" });
  s.addText("Mônadas e Efeitos Algébricos em Linguagens Funcionais", { placeholder: "title" });
  s.addText("Uma análise comparativa em legibilidade, composabilidade, poder de abstração e desempenho", { placeholder: "subtitulo" });
  s.addText([
    { text: "Diego Marchioni", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "Orientador: ", options: { bold: true } }, { text: "Prof. Marco Rodrigo (PUC Minas)", options: { breakLine: true } },
    { text: "Trabalho de Conclusão de Curso II, ", options: { bold: true } }, { text: "Ciência da Computação, dezembro de 2026" },
  ], { placeholder: "autor" });
  registrar(s, "Capa",
    "Bom dia. Sou o Diego Marchioni e vou apresentar o meu TCC, orientado pelo professor Marco Rodrigo. O trabalho compara duas formas de tratar efeitos em linguagens funcionais: as mônadas, no Haskell, e os efeitos algébricos, no OCaml.",
    [
      ["Mônada", "forma clássica de programar efeitos no Haskell. O efeito fica registrado no tipo da função."],
      ["Efeito algébrico", "forma mais nova, nativa no OCaml 5. O código pede uma operação (perform) e um handler decide o que ela faz."],
      ["Legibilidade, composabilidade, poder de abstração e desempenho", "as quatro dimensões comparadas, uma por questão de pesquisa (QP1 a QP4)."],
    ]);
}

// 2. Sumário
{
  const s = conteudo("Sumário", "Sumário", "Abertura");
  const itens = [
    ["01", "Introdução: o problema e as quatro questões de pesquisa"],
    ["02", "Fundamentação: os dois mecanismos e os trabalhos relacionados"],
    ["03", "Metodologia: caso de uso, versões, verificação e métricas"],
    ["04", "Resultados: código (QP1 a QP3) e desempenho (QP4)"],
    ["05", "Conclusões: literatura, limites e trabalhos futuros"],
  ];
  itens.forEach(([num, t], i) => {
    texto(s, num, { x: MX, y: 2.0 + i * 0.75, w: 0.8, h: 0.5, fontSize: 20, color: C.accent4 });
    texto(s, t, { x: MX + 0.9, y: 2.0 + i * 0.75, w: CW - 0.9, h: 0.5, fontSize: 20, color: C.text2 });
  });
  registrar(s, "Sumário",
    "A apresentação segue a ordem do artigo: o problema e as perguntas, os dois mecanismos, o método, os resultados e as conclusões. São cerca de 20 minutos.",
    [["QP", "questão de pesquisa. São quatro, uma para cada dimensão comparada."]]);
}

// 3. Seção 01
secao("01", "Introdução", "Começo pelo contexto: o que são efeitos e por que existem dois mecanismos para eles.");

// 4. Efeitos em linguagens funcionais
{
  const s = conteudo("Introdução", "Efeitos em linguagens funcionais");
  texto(s, runs("Efeitos como **estado**, **exceção** e **saída** não cabem numa função pura. Linguagens funcionais tratam esses efeitos com um mecanismo próprio."), { x: MX, y: 1.75, w: CW, h: 0.75 });
  caixa(s, "Mônadas (Haskell)", ["cada efeito é uma camada de uma pilha", "o efeito aparece no **tipo** da função", "técnica consolidada (Wadler, 1992)"], { x: MX, y: 2.65, w: 5.6, h: 2.0 });
  caixa(s, "Efeitos algébricos (OCaml 5)", ["o código **pede** a operação com perform", "um **handler** decide o que ela faz", "nativos no OCaml desde 2022"], { x: MX + 5.93, y: 2.65, w: 5.6, h: 2.0 });
  quadro(s, [
    ["Efeito", "tudo o que uma função faz além de devolver um valor: ler ou mudar uma variável, lançar um erro, imprimir."],
    ["Função pura", "função que só calcula o resultado a partir da entrada, sempre o mesmo para a mesma entrada."],
  ], { x: MX, y: 4.85, w: CW, h: 1.1 });
  fonte(s, "Os dois têm a mesma expressividade em teoria: Forster et al. (2017) e Schrijvers et al. (2019).", 6.2);
  registrar(s, "Efeitos em linguagens funcionais",
    "Em programação funcional, uma função ideal só calcula. Mas programas reais precisam guardar estado, lançar erros e imprimir. Há dois mecanismos para isso. As mônadas, no Haskell, empilham os efeitos em camadas que aparecem no tipo. Os efeitos algébricos, no OCaml 5, deixam o código pedir uma operação e um handler decide o que fazer. Na teoria, os dois expressam as mesmas coisas.",
    [
      ["Efeito", "tudo o que uma função faz além de devolver um valor. Aqui são três: estado, exceção e saída."],
      ["Estado", "valores guardados que o programa lê e muda, como as variáveis do interpretador."],
      ["Exceção", "interrupção do cálculo por um erro, como divisão por zero."],
      ["Saída", "mostrar um valor para fora do programa (o Print do interpretador)."],
      ["Função pura", "função cujo resultado depende só da entrada e que não tem efeitos."],
      ["Camada de uma pilha", "nas mônadas, cada efeito é um transformador (por exemplo, StateT para estado) colocado em volta de outro. O conjunto forma uma pilha."],
      ["perform", "comando do OCaml 5 que pede uma operação de efeito e pausa o código até alguém responder."],
      ["Handler", "a função que responde aos pedidos feitos com perform. Ela decide o que a operação faz."],
      ["Wadler (1992)", "artigo que popularizou as mônadas como forma de programar efeitos."],
      ["Mesma expressividade", "Forster et al. (2017) e Schrijvers et al. (2019) mostraram que um mecanismo consegue simular o outro. Logo a diferença prática está em escrever e em executar."],
    ]);
}

// 5. O problema
{
  const s = conteudo("Introdução", "O problema");
  texto(s, runs("A equivalência teórica não diz quanto custa **escrever** nem quanto custa **executar** com cada mecanismo. Nenhum estudo mediu as duas coisas no mesmo programa, com as versões verificadas como equivalentes."), { x: MX, y: 1.75, w: CW, h: 1.0 });
  texto(s, runs("**Objetivo:** comparar mônadas e efeitos algébricos no mesmo programa, em legibilidade, composabilidade, poder de abstração e desempenho."), { x: MX, y: 2.85, w: CW, h: 0.75 });
  texto(s, [{ text: "Questões de pesquisa:", options: { bold: true, color: C.text1 } }], { x: MX, y: 3.75, w: CW, h: 0.4 });
  numerada(s, [
    "**Legibilidade:** qual abordagem acrescenta menos carga estrutural de leitura?",
    "**Composabilidade:** qual exige menos pontos de modificação para estender os efeitos?",
    "**Abstração:** qual exige menos boilerplate, com maior reúso?",
    "**Desempenho:** qual o custo de execução de cada uma, em tempo e memória?",
  ], { x: MX, y: 4.2, w: CW, h: 2.3 });
  registrar(s, "O problema",
    "Saber que os dois mecanismos são equivalentes na teoria não diz o que importa para quem programa: quanto custa escrever e quanto custa executar. Então o objetivo foi comparar os dois no mesmo programa, em quatro dimensões, cada uma com uma pergunta.",
    [
      ["Carga estrutural de leitura", "quanto o código tem de linhas, de operações de efeito e de blocos um dentro do outro. É uma medida indireta: legibilidade percebida exigiria testar com pessoas."],
      ["Ponto de modificação", "declaração que já existia e precisou mudar para acrescentar um efeito novo. Quanto menos, mais fácil compor efeitos."],
      ["Boilerplate", "código de preparação, que não diz o que o efeito faz, só monta o mecanismo."],
      ["Reúso", "usar a mesma peça (um handler, uma camada) em mais de um lugar sem reescrever."],
      ["Custo de execução", "tempo e memória a mais que o mecanismo gasta em relação a uma versão sem ele."],
    ]);
}

// 6. Contribuições
{
  const s = conteudo("Introdução", "Contribuições");
  bullets(s, [
    "**Argumento de equivalência expressiva:** deixa como diferença genuína só a ergonomia e o custo",
    "**Critério de equivalência funcional verificável**, realizado numa suíte de oráculo",
    "**Gerador de cargas replicado** nas duas linguagens, com teste de conformidade",
    "**Normalização intralinguagem:** cada mecanismo medido contra uma base da própria linguagem, separando o mecanismo do runtime",
  ], { x: MX, y: 1.8, w: CW, h: 2.4 });
  quadro(s, [
    ["Suíte de oráculo", "conjunto de testes em que a resposta certa vem de uma semântica de referência, e cada versão é comparada com ela."],
    ["Runtime", "o sistema que executa o programa compilado: gerenciador de memória, pilhas, coletor de lixo."],
  ], { x: MX, y: 4.35, w: CW, h: 1.15 });
  texto(s, runs("Quatro implementações, suíte de oráculo, quarto efeito e dois harnesses de medição, reproduzíveis com um comando: **make tudo**."), { x: MX, y: 5.65, w: CW, h: 0.7 });
  registrar(s, "Contribuições",
    "A contribuição principal é o desenho que torna a comparação justa: mostrar que só ergonomia e custo podem diferir, verificar que as versões fazem exatamente a mesma coisa e medir cada mecanismo dentro da própria linguagem. Tudo se refaz com um comando.",
    [
      ["Argumento de equivalência expressiva", "a parte do texto que reúne a teoria e conclui que os dois mecanismos expressam os mesmos efeitos."],
      ["Ergonomia", "o quanto o mecanismo é confortável de usar ao escrever código."],
      ["Critério de equivalência funcional", "regra precisa do que significa duas versões fazerem a mesma coisa: mesmo valor, mesmo estado final, mesma saída e mesma mensagem de erro."],
      ["Suíte de oráculo", "61 casos de teste comparados com uma semântica de referência (o oráculo, a resposta certa)."],
      ["Gerador de cargas", "programa que cria as expressões usadas nas medições. Foi escrito nas duas linguagens e produz exatamente as mesmas expressões."],
      ["Teste de conformidade", "teste que confere que os dois geradores produzem as mesmas cargas."],
      ["Normalização intralinguagem", "dividir o tempo do mecanismo pelo de uma base da mesma linguagem, para não comparar compiladores diferentes."],
      ["Runtime", "o sistema que executa o programa compilado (memória, pilhas, coletor de lixo)."],
      ["Harness de medição", "programa que roda as cargas muitas vezes e mede tempo e memória. Bechamel no OCaml, Criterion no Haskell."],
      ["make tudo", "comando que compila, testa, mede e regera os números do artigo."],
    ]);
}

// 7. Seção 02
secao("02", "Fundamentação", "Agora mostro como cada mecanismo aparece no código do trabalho.");

// 8. Mônadas no código
{
  const s = conteudo("Fundamentação", "Mônadas no código");
  texto(s, runs("No Haskell, o efeito aparece no **tipo** da função. Trecho de Monadic.hs:"), { x: MX, y: 1.7, w: CW, h: 0.45 });
  const h = codigo(s, [
    ["type Env = Map String Int", "-- o estado: cada variável com o seu valor"],
    ["type Interp a =", "-- o tipo de toda computação do interpretador"],
    ["  ExceptT String (StateT Env IO) a", "-- é uma pilha: exceção, estado e IO"],
    ["", ""],
    ["eval (Var x) = do", "-- caso Var: ler o valor da variável x"],
    ["  env <- get", "-- get lê o estado (camada StateT)"],
    ["  maybe (throwError (msgUnbound x))", "-- se x não está no Map, lança o erro (ExceptT)"],
    ["        return (Map.lookup x env)", "-- busca x no Map e, se achar, devolve o valor"],
  ], { x: MX, y: 2.2, w: CW });
  quadro(s, [
    ["Mônada", "tipo que encadeia passos de cálculo levando um efeito junto."],
    ["ExceptT, StateT", "transformadores: cada um acrescenta um efeito (erro, estado) em volta de outra mônada, formando a pilha."],
    ["IO", "a mônada da base, que fala com o mundo externo. Aqui, ela faz a saída."],
  ], { x: MX, y: 2.35 + h, w: CW, h: 1.35 });
  registrar(s, "Mônadas no código",
    "No Haskell, o efeito está no tipo. Interp é o tipo de toda computação do interpretador: uma pilha com exceção por fora, estado no meio e IO na base. No caso Var, get lê o estado, e se a variável não existir, throwError lança o erro.",
    [
      ["type Env = Map String Int", "define o estado do interpretador: um dicionário (Map) de nomes (String) para valores inteiros (Int)."],
      ["type Interp a", "nome curto para o tipo da pilha. Uma função que devolve Interp Int calcula um inteiro e pode usar os três efeitos."],
      ["ExceptT String", "camada de exceção. Permite interromper o cálculo com uma mensagem de erro (String)."],
      ["StateT Env", "camada de estado. Guarda o Env e permite lê-lo (get) e mudá-lo."],
      ["IO", "camada da base, que executa ações no mundo externo, como imprimir."],
      ["Pilha", "as camadas uma dentro da outra. Lê-se de fora para dentro: ExceptT envolve StateT, que envolve IO. Com a exceção por fora, o estado sobrevive a um erro, como o critério de equivalência exige."],
      ["do", "bloco que executa passos em sequência dentro da mônada."],
      ["env <- get", "executa get, que lê o estado, e chama o resultado de env."],
      ["maybe a b m", "se m não tem valor (Nothing), executa a. Se tem (Just v), executa b com v."],
      ["Map.lookup x env", "procura x no dicionário. Devolve Just valor ou Nothing."],
      ["throwError", "lança o erro na camada ExceptT."],
      ["return", "devolve um valor sem efeito nenhum."],
    ]);
}

// 9. Efeitos algébricos no código
{
  const s = conteudo("Fundamentação", "Efeitos algébricos no código");
  texto(s, runs("No OCaml, o código **pede** a operação e um **handler** decide o que ela faz. Trechos de interp_effects.ml:"), { x: MX, y: 1.7, w: CW, h: 0.45 });
  const h = codigo(s, [
    ["type _ Effect.t +=", "(* declara as operações de efeito *)"],
    ["  | Get : string -> int option Effect.t", "(* lê uma variável, que pode não existir *)"],
    ["  | Set : string * int -> unit Effect.t", "(* guarda um valor numa variável *)"],
    ["  | Fail : string -> 'a Effect.t", "(* interrompe com uma mensagem de erro *)"],
    ["  | Output : int -> unit Effect.t", "(* mostra um valor na saída *)"],
    ["", ""],
    ["(* dentro do handler de estado, run_state *)", ""],
    ["| Get x -> Some (fun k ->", "(* atende Get x. k é o programa parado *)"],
    ["    continue k (Hashtbl.find_opt tbl x))", "(* busca x e retoma o programa com o valor *)"],
  ], { x: MX, y: 2.2, w: CW });
  quadro(s, [
    ["perform", "pede uma operação (Get, Set...) e pausa o código até o handler responder."],
    ["Continuação (k)", "o resto do programa, parado no ponto do perform. continue k v retoma o programa, e o perform devolve v."],
  ], { x: MX, y: 2.35 + h, w: CW, h: 1.1 });
  registrar(s, "Efeitos algébricos no código",
    "No OCaml, primeiro se declaram as operações: Get, Set, Fail e Output. O código chama perform para pedir uma delas. O handler de estado atende o Get: busca a variável na tabela e retoma o programa, que estava parado, com o valor encontrado.",
    [
      ["type _ Effect.t +=", "acrescenta operações novas ao tipo de efeitos do OCaml. Cada linha é uma operação e diz o que recebe e o que devolve."],
      ["Get : string -> int option", "recebe o nome da variável e devolve talvez um inteiro (option): Some v se existe, None se não existe."],
      ["Set : string * int -> unit", "recebe nome e valor e não devolve nada útil (unit)."],
      ["Fail : string -> 'a", "recebe a mensagem de erro. O 'a quer dizer que ela nunca volta com um valor, então serve em qualquer lugar."],
      ["Output : int -> unit", "recebe o valor a mostrar."],
      ["Handler", "função que atende os pedidos de perform. Este trecho é do handler de estado, run_state."],
      ["run_state", "função que instala o handler de estado em volta de um trecho de código. Usa match_with, do OCaml."],
      ["Some (fun k -> ...)", "o jeito de o handler dizer: este pedido é meu, e eis o que fazer com ele."],
      ["k (continuação)", "o resto do programa a partir do perform, guardado e parado."],
      ["continue k v", "retoma o programa. O perform que estava esperando devolve v."],
      ["Hashtbl.find_opt tbl x", "procura x na tabela de variáveis (Hashtbl). Devolve Some valor ou None."],
    ]);
}

// 10. Trabalhos relacionados
{
  const s = conteudo("Fundamentação", "Trabalhos relacionados");
  texto(s, runs("**Expressividade:** mônadas e handlers expressam os mesmos efeitos (Forster et al., 2017) e podem ser traduzidos um no outro (Schrijvers et al., 2019)."), { x: MX, y: 1.8, w: CW, h: 0.8 });
  texto(s, [{ text: "Desempenho medido na literatura:", options: { bold: true, color: C.text1 } }], { x: MX, y: 2.8, w: CW, h: 0.4 });
  bullets(s, [
    "Sivaramakrishnan et al. (2021): cerca de 23 ns para alocar uma fiber e trocar de pilha no OCaml 5",
    "Kammar et al. (2013) e Xie e Leijen (2020): mônadas a 1,0 a 1,3 vezes uma versão sem efeitos",
  ], { x: MX, y: 3.25, w: CW, h: 1.1 });
  texto(s, runs("**Lacuna:** esses números vêm de programas e situações diferentes. Nenhum trabalho compara os dois mecanismos no mesmo programa, em escrita e em execução."), { x: MX, y: 4.6, w: CW, h: 0.8 });
  registrar(s, "Trabalhos relacionados",
    "A teoria já mostrou que os mecanismos são equivalentes. Na prática, há medições de cada um separado: no OCaml, o custo das fibers que os handlers usam, e no Haskell, o custo das mônadas contra código sem efeitos. Faltava comparar os dois no mesmo programa.",
    [
      ["Forster et al. (2017)", "mostraram que um mecanismo consegue simular o outro, ou seja, têm a mesma expressividade."],
      ["Schrijvers et al. (2019)", "mostraram como traduzir transformadores de mônadas em efeitos algébricos e vice-versa."],
      ["Fiber", "o segmento de pilha que o OCaml 5 cria para o trecho de código sob um handler. É por causa dela que instalar um handler custa tempo."],
      ["Trocar de pilha", "passar a execução de uma fiber para outra, o que acontece em cada perform e em cada continue."],
      ["Sivaramakrishnan et al. (2021)", "artigo que implementou os handlers no OCaml 5 e mediu seus custos."],
      ["1,0 a 1,3 vezes", "a versão com mônadas levou de 1,0 a 1,3 vezes o tempo da versão sem efeitos nos microbenchmarks desses autores."],
    ]);
}

// 11. Seção 03
secao("03", "Metodologia", "Agora o método: o que foi implementado, como foi verificado e o que foi medido.");

// 12. Visão geral
{
  const s = conteudo("Metodologia", "Visão geral");
  texto(s, "O mesmo interpretador foi escrito quatro vezes, duas por linguagem:", { x: MX, y: 1.75, w: CW, h: 0.45 });
  tabela(s, ["Versão", "Linguagem", "Papel"], [
    [{ t: "Handlers", cor: HEX.marinho }, "OCaml 5.2.1", "mecanismo: efeitos algébricos"],
    ["Imperativa", "OCaml 5.2.1", "base: estado em Hashtbl, exceção nativa"],
    [{ t: "Mônadas", cor: HEX.rosa }, "GHC 9.4.7", "mecanismo: ExceptT String (StateT Env IO)"],
    ["IORef", "GHC 9.4.7", "base: o mesmo Map dentro de um IORef, exceção nativa"],
  ], { x: MX, y: 2.3, w: CW, colW: [2.4, 2.4, CW - 4.8], fontSize: 15 });
  bullets(s, [
    "Código (QP1 a QP3): só entre versões da **mesma** linguagem",
    "Desempenho (QP4): cada mecanismo dividido pela sua base",
  ], { x: MX, y: 4.45, w: 6.4, h: 1.0 });
  quadro(s, [
    ["Base", "versão da mesma linguagem sem o mecanismo, que faz o mesmo trabalho com estado e erro diretos."],
  ], { x: MX + 6.7, y: 4.4, w: CW - 6.7, h: 1.3 });
  registrar(s, "Visão geral",
    "Escrevi o mesmo interpretador quatro vezes. Em cada linguagem há a versão com o mecanismo e uma base sem ele. Só comparo código dentro da mesma linguagem, e o desempenho de cada mecanismo é medido contra a sua base.",
    [
      ["Interpretador", "programa que lê uma expressão e calcula o resultado dela."],
      ["Mecanismo", "a forma de tratar efeitos que está sendo estudada: handlers no OCaml, mônadas no Haskell."],
      ["Base", "versão sem o mecanismo, com estado e erro diretos, que serve de régua para medir o custo do mecanismo."],
      ["OCaml 5.2.1 e GHC 9.4.7", "as versões exatas do compilador de cada linguagem (GHC é o compilador do Haskell)."],
      ["Hashtbl", "tabela de dispersão do OCaml, que guarda as variáveis. As duas versões OCaml usam a mesma."],
      ["IORef", "uma variável mutável do Haskell, usada dentro de IO. A base guarda nela o mesmo Map da versão monádica."],
      ["Exceção nativa", "o erro da própria linguagem: raise no OCaml, throwIO no Haskell."],
    ]);
}

// 13. Caso de uso
{
  const s = conteudo("Metodologia", "Caso de uso: o interpretador");
  texto(s, [
    { text: "Expressões com oito construtores:", options: { breakLine: true } },
    { text: "Num, Var, Add, Mul, Div, Let, Seq, Print", options: { fontFace: CODIGO, fontSize: 15 } },
  ], { x: MX, y: 1.8, w: 5.4, h: 0.9 });
  bullets(s, [
    "**Estado:** Var lê, Let guarda",
    "**Exceção:** divisão por zero, variável inexistente",
    "**Saída:** Print mostra um valor",
  ], { x: MX, y: 2.85, w: 5.4, h: 1.6 });
  s.addShape(pres.shapes.RECTANGLE, { x: MX + 5.9, y: 1.8, w: CW - 5.9, h: 2.65, fill: { color: HEX.fundo }, line: { color: HEX.laranja, width: 1.25 }, objectName: "definição" });
  texto(s, [
    { text: "Equivalência funcional", options: { bold: true, color: C.text1, breakLine: true } },
    { text: "Uma implementação I é equivalente à semântica D se, para todo (e, σ", options: {} },
    { text: "0", options: { subscript: true } }, { text: ") em E", options: {} }, { text: "64", options: { subscript: true } },
    { text: ", vale ⟦I⟧(e, σ", options: {} }, { text: "0", options: { subscript: true } }, { text: ") = D(e, σ", options: {} },
    { text: "0", options: { subscript: true } }, { text: "), isto é, mesmo valor, mesmo estado final, mesmo traço e mesma mensagem de erro.", options: {} },
  ], { x: MX + 6.1, y: 1.95, w: CW - 6.3, h: 2.4, fontSize: 15 });
  quadro(s, [
    ["E64", "os pares (expressão, estado inicial) cujos valores cabem no inteiro das duas linguagens (63 bits do OCaml)."],
    ["Traço", "a sequência de valores impressos por Print, na ordem."],
  ], { x: MX, y: 4.65, w: CW, h: 1.15 });
  fonte(s, "Semântica small-step no estilo de Felleisen e Hieb (1992). Simplificações: variáveis globais, erro sempre aborta, um único programa.", 6.05);
  registrar(s, "Caso de uso: o interpretador",
    "O caso de uso é um interpretador pequeno, com oito tipos de expressão, que usa os três efeitos. Antes de programar, fixei o que significa duas versões serem equivalentes: dar o mesmo valor, o mesmo estado final, a mesma saída e a mesma mensagem de erro.",
    [
      ["Construtor", "cada tipo de expressão: Num (número), Var (variável), Add, Mul, Div (soma, multiplicação, divisão), Let (dar valor a uma variável e continuar), Seq (fazer uma coisa e depois outra), Print (mostrar um valor)."],
      ["Semântica D", "a definição matemática do resultado de cada expressão. É a resposta certa contra a qual as versões são testadas."],
      ["Small-step", "estilo de semântica que descreve a execução passo a passo. Felleisen e Hieb (1992) é a referência desse estilo."],
      ["(e, σ0)", "uma expressão e e o estado inicial σ0 (os valores das variáveis no começo)."],
      ["E64", "conjunto dos pares em que nenhum valor passa do maior inteiro comum às duas linguagens, que é o de 63 bits do OCaml."],
      ["⟦I⟧(e, σ0)", "o que a implementação I produz ao avaliar e a partir de σ0."],
      ["Traço", "a lista de valores impressos por Print, na ordem em que saíram."],
      ["Simplificações", "variáveis são globais (sem escopo), qualquer erro encerra a avaliação e há um único programa de teste. Foram escolhas para manter o caso controlado."],
    ]);
}

// 14. A função eval
{
  const s = conteudo("Metodologia", "A função eval");
  texto(s, "A eval recebe uma expressão e calcula o seu valor. Os efeitos acontecem dentro dela.", { x: MX, y: 1.7, w: CW, h: 0.45 });
  const h = codigo(s, [
    ["let rec eval = function", "(* recebe uma expressão, devolve um int *)"],
    ["  | Num n -> n", "(* número: o valor é o próprio número *)"],
    ["  | Var x -> (", "(* variável: ler o valor de x *)"],
    ["      match perform (Get x) with", "(* pede o valor de x ao handler de estado *)"],
    ["      | Some v -> v", "(* x existe: o resultado é v *)"],
    ["      | None -> perform (Fail ...))", "(* x não existe: pede o erro ao handler *)"],
    ["  | Add (a, b) ->", "(* soma: avaliar os dois lados *)"],
    ["      let x = eval a in", "(* primeiro o lado esquerdo *)"],
    ["      let y = eval b in", "(* depois o direito, em ordem fixa *)"],
    ["      x + y", "(* devolve a soma dos dois *)"],
  ], { x: MX, y: 2.2, w: CW });
  legenda(s, "Trecho de interp_effects.ml. Mul, Div, Let, Seq e Print seguem a mesma ideia.", { x: MX, y: 2.3 + h, w: CW });
  quadro(s, [
    ["eval", "a função principal do interpretador. A legibilidade (QP1) é medida só dentro dela."],
  ], { x: MX, y: 2.75 + h, w: CW, h: 0.7 });
  registrar(s, "A função eval",
    "Esta é a eval da versão com handlers. Ela olha o tipo da expressão e decide o que fazer. Num devolve o número. Var pede o valor ao handler de estado. Add avalia os dois lados, em ordem fixa, e soma.",
    [
      ["let rec", "define uma função que pode chamar a si mesma (recursiva)."],
      ["function | ...", "a função escolhe um caso conforme o tipo da expressão recebida."],
      ["match ... with", "examina um valor e escolhe o caso que combina com ele."],
      ["perform (Get x)", "pede ao handler de estado o valor de x. O código para até o handler responder."],
      ["Some v / None", "as duas respostas possíveis de Get: o valor existe (Some v) ou não existe (None)."],
      ["perform (Fail ...)", "pede ao handler de erro que interrompa a avaliação com a mensagem."],
      ["Ordem fixa", "o OCaml não garante em que ordem avalia os argumentos de uma função, por isso cada lado é avaliado num let separado. Isso importa quando os dois lados imprimem."],
    ]);
}

// 15. Exemplo
{
  const s = conteudo("Metodologia", "Exemplo: avaliando 2 + n, com n = 3");
  tabela(s, ["Passo", "Chamada", "O que acontece", "Resultado"], [
    ["1", { t: 'eval (Add (Num 2, Var "n"))', mono: true }, "caso Add: avalia os dois lados", "–"],
    ["2", { t: "eval (Num 2)", mono: true }, "caso Num: o valor é o próprio número", "2"],
    ["3", { t: 'eval (Var "n")', mono: true }, 'perform (Get "n"): o handler lê n e retoma com o valor', "3"],
    ["4", { t: "x + y", mono: true }, "soma os dois lados", { t: "5", b: true, cor: HEX.verdeazul }],
  ], { x: MX, y: 1.8, w: CW, colW: [1.0, 4.1, 5.1, CW - 10.2], fontSize: 15, align: ["center", "left", "left", "center"] });
  texto(s, runs("O efeito acontece no passo 3: a eval **pede**, o handler **responde** e a eval **continua** de onde parou."), { x: MX, y: 4.6, w: CW, h: 0.8 });
  registrar(s, "Exemplo: avaliando 2 + n",
    "Para ver a eval funcionando: 2 + n, com n valendo 3. A eval cai no caso Add e avalia os dois lados. O lado esquerdo é o número 2. O lado direito é a variável n: a eval faz perform Get, o handler de estado lê 3 na tabela e retoma a eval com esse valor. No fim, 2 + 3 = 5.",
    [
      ["Add (Num 2, Var \"n\")", "a expressão 2 + n escrita como o interpretador a representa."],
      ["Retoma", "o handler chama continue k 3, e a eval continua exatamente de onde parou, com 3 como resultado do perform."],
    ]);
}

// 16. Mesma estrutura
{
  const s = conteudo("Metodologia", "Mesma estrutura, outro mecanismo");
  texto(s, [{ text: "Handlers", options: { bold: true, color: HEX.marinho } }, { text: ", interp_effects.ml" }], { x: MX, y: 1.65, w: CW, h: 0.35, fontSize: 14 });
  const h1 = codigo(s, [
    ["| Var x -> (", "(* caso Var: ler a variável x *)"],
    ["    match perform (Get x) with", "(* pede x ao handler: operação de efeito *)"],
    ["    | Some v -> v", "(* achou: devolve v *)"],
    ["    | None -> perform (Fail", "(* não achou: pede o erro ao handler *)"],
    ["        (msg_unbound x)))", "(* mensagem de erro com o nome de x *)"],
  ], { x: MX, y: 2.0, w: CW });
  texto(s, [{ text: "Imperativa", options: { bold: true, color: C.text1 } }, { text: ", interp_imp.ml" }], { x: MX, y: 2.15 + h1, w: CW, h: 0.35, fontSize: 14 });
  const h2 = codigo(s, [
    ["| Var x -> (", "(* caso Var: ler a variável x *)"],
    ["    match Hashtbl.find_opt env x with", "(* lê x direto da tabela, sem efeito *)"],
    ["    | Some v -> v", "(* achou: devolve v *)"],
    ["    | None -> raise (Runtime_error", "(* não achou: lança a exceção nativa *)"],
    ["        (msg_unbound x)))", "(* a mesma mensagem de erro *)"],
  ], { x: MX, y: 2.5 + h1, w: CW });
  legenda(s, "Só a 2ª e a 4ª linha mudam: a diferença medida é o mecanismo, com a mesma Hashtbl.", { x: MX, y: 2.6 + h1 + h2, w: CW });
  registrar(s, "Mesma estrutura, outro mecanismo",
    "As duas versões OCaml têm a mesma estrutura, linha por linha. Onde a imperativa lê a tabela direto, a de handlers faz perform Get. Onde a imperativa lança raise, a de handlers faz perform Fail. Por isso a diferença medida é o mecanismo, e não a estrutura.",
    [
      ["Hashtbl.find_opt env x", "lê x direto da tabela de variáveis, sem passar por handler nenhum."],
      ["raise (Runtime_error ...)", "lança a exceção nativa do OCaml, que interrompe a avaliação."],
      ["msg_unbound x", "monta a mensagem de erro de variável não vinculada, com o nome de x. As versões usam a mesma função."],
    ]);
}

// 17. Verificação
{
  const s = conteudo("Metodologia", "Verificação antes de medir");
  texto(s, "Nada foi medido antes de as quatro versões passarem nos testes.", { x: MX, y: 1.75, w: CW, h: 0.45 });
  tabela(s, ["Resultado", "Verificação", "O que garante"], [
    [{ t: "61/61", b: true, cor: HEX.verdeazul }, "suíte de oráculo, em cada linguagem", "as versões são equivalentes"],
    [{ t: "8/8", b: true, cor: HEX.verdeazul }, "erros colocados de propósito (mutantes)", "os testes pegam erros reais"],
    [{ t: "12", b: true, cor: HEX.verdeazul }, "cargas com o mesmo hash nas duas linguagens", "as cargas medidas são idênticas"],
  ], { x: MX, y: 2.3, w: CW, colW: [1.7, 5.3, CW - 7.0], fontSize: 15, align: ["center", "left", "left"] });
  quadro(s, [
    ["Mutante", "cópia do código com uma decisão sutil invertida de propósito. Se os testes falham, eles pegaram o erro."],
    ["Hash", "impressão digital calculada sobre a carga (FNV-1a). Hash igual nas duas linguagens quer dizer carga igual."],
  ], { x: MX, y: 4.25, w: CW, h: 1.15 });
  fonte(s, "Código gerado com apoio de IA, declarado no artigo e revisado pelo autor.", 5.65);
  registrar(s, "Verificação antes de medir",
    "Antes de qualquer medição, as quatro versões tiveram de passar nos testes. Foram 61 casos de oráculo em cada linguagem. Para saber se os testes pegam erros de verdade, coloquei 8 erros de propósito, e os testes acusaram os 8. E as 12 cargas de medição têm o mesmo hash nas duas linguagens. Como o código teve apoio de IA, essa verificação é o que garante que ele faz o que deve.",
    [
      ["Suíte de oráculo (61/61)", "61 casos de teste. Cada um compara valor, estado final, saída e erro de cada versão com a semântica de referência. Todos passaram nas quatro versões."],
      ["Mutantes (8/8)", "oito cópias do código, cada uma com uma decisão sutil revertida, por exemplo arredondar a divisão para baixo (div) em vez de truncar (quot) ou inverter a ordem da pilha monádica. A suíte acusou as oito."],
      ["Hash FNV-1a", "algoritmo que transforma um texto num número de 64 bits. Se as cargas geradas nas duas linguagens dão o mesmo número, elas são iguais."],
      ["12 cargas", "4 cenários (Arith, State, Exn, Output) vezes 3 sementes do gerador (42, 43 e 44)."],
      ["Carga", "lista de 10.000 expressões avaliadas numa medição."],
    ]);
}

// 18. Métricas
{
  const s = conteudo("Metodologia", "Métricas");
  tabela(s, ["QP", "Métrica", "Como se mede"], [
    ["QP1", "linhas, operações de efeito, aninhamento", "contagem automática na eval, aninhamento pela Cognitive Complexity"],
    ["QP2", "pontos de modificação", "declarações existentes que mudam ao inserir um quarto efeito"],
    ["QP3", "infraestrutura e reúso", "linhas fora da eval, classificadas por regra mecânica"],
    ["QP4", "razão de tempo e de memória", "mecanismo dividido pela base da mesma linguagem"],
  ], { x: MX, y: 1.85, w: CW, colW: [1.0, 4.2, CW - 5.2], fontSize: 15 });
  quadro(s, [
    ["Operação de efeito", "cada perform, leitura da tabela, raise ou emissão (OCaml), e cada passo monádico ou operação de estado, erro ou IORef (Haskell)."],
    ["Aninhamento", "quantos blocos ficam um dentro do outro. Mais níveis, mais difícil de ler (Cognitive Complexity, Campbell, 2018)."],
  ], { x: MX, y: 4.55, w: CW, h: 1.3 });
  registrar(s, "Métricas",
    "Para o código, três medidas. Na QP1, linhas, operações de efeito e aninhamento dentro da eval. Na QP2, quantas declarações já existentes mudam para acrescentar um efeito. Na QP3, quantas linhas de infraestrutura existem fora da eval e quanto delas é reaproveitado. Para o desempenho, a razão entre mecanismo e base.",
    [
      ["Linhas (LOC efetiva)", "linhas de código da eval, sem linhas em branco, depois de formatar o código com o formatador oficial de cada linguagem."],
      ["Operação de efeito", "cada ponto em que a eval usa um efeito. No OCaml: perform, leitura direta da tabela, raise ou emissão. No Haskell: cada passo monádico (<-) e cada operação sobre estado, erro ou IORef."],
      ["Aninhamento", "profundidade máxima de blocos dentro de blocos (um match dentro de um caso, por exemplo)."],
      ["Cognitive Complexity", "métrica de Campbell (2018) que pune o aninhamento, porque código aninhado é mais difícil de entender."],
      ["Ponto de modificação", "declaração que já existia e teve o texto alterado. Adições puras (código novo) são contadas à parte."],
      ["Infraestrutura (boilerplate)", "linhas fora da eval que só montam o mecanismo, sem dizer o que o efeito faz. Uma regra mecânica classifica cada linha."],
      ["Reúso", "o mesmo handler ou camada usado em mais de um lugar sem reescrever."],
      ["Razão", "tempo (ou memória) do mecanismo dividido pelo da base. Explicada no próximo slide."],
    ]);
}

// 19. Razão
{
  const s = conteudo("Metodologia", "Desempenho medido por razões");
  texto(s, "Comparar tempos entre linguagens mediria também os compiladores. Cada mecanismo é dividido pela base da própria linguagem:", { x: MX, y: 1.7, w: CW, h: 0.75 });
  const cx = MX + 0.8, bw = 3.2, bh = 0.6;
  [["Handlers (OCaml)", "Imperativa (OCaml)", "razão do OCaml", HEX.marinho, 2.6], ["Mônadas (Haskell)", "IORef (Haskell)", "razão do Haskell", HEX.rosa, 3.4]].forEach(([a, b, r, cor, y]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y, w: bw, h: bh, fill: { color: HEX.fundo }, line: { color: HEX.corpo, width: 0.75 } });
    texto(s, [{ text: a, options: { bold: true, color: cor } }], { x: cx, y, w: bw, h: bh, align: "center", valign: "middle", fontSize: 15 });
    texto(s, "÷", { x: cx + bw, y, w: 0.6, h: bh, align: "center", valign: "middle", fontSize: 18 });
    s.addShape(pres.shapes.RECTANGLE, { x: cx + bw + 0.6, y, w: bw, h: bh, fill: { color: HEX.fundo }, line: { color: HEX.corpo, width: 0.75 } });
    texto(s, b, { x: cx + bw + 0.6, y, w: bw, h: bh, align: "center", valign: "middle", fontSize: 15 });
    s.addShape(pres.shapes.LINE, { x: cx + 2 * bw + 0.7, y: y + bh / 2, w: 0.8, h: 0, line: { color: HEX.rodape, width: 1.25, endArrowType: "triangle" } });
    texto(s, r, { x: cx + 2 * bw + 1.6, y, w: 2.6, h: bh, valign: "middle", fontSize: 15 });
  });
  texto(s, [
    { text: "razão = T", options: {} }, { text: "mec", options: { subscript: true } }, { text: " ÷ T", options: {} }, { text: "base", options: { subscript: true } },
    { text: " = (T", options: {} }, { text: "base", options: { subscript: true } }, { text: " + Δ) ÷ T", options: {} }, { text: "base", options: { subscript: true } },
    { text: " = 1 + Δ ÷ T", options: {} }, { text: "base", options: { subscript: true } },
  ], { x: MX, y: 4.25, w: CW, h: 0.5, align: "center", fontSize: 20, color: C.text1 });
  quadro(s, [
    ["Δ (delta)", "o custo a mais do mecanismo sobre a base, em nanossegundos ou bytes por expressão."],
    ["Por que cuidado", "base barata faz a razão crescer. Por isso a comparação de razões entre linguagens é só indicativa."],
  ], { x: MX, y: 5.0, w: CW, h: 1.15 });
  registrar(s, "Desempenho medido por razões",
    "Não dá para comparar o tempo do OCaml com o do Haskell, porque isso mediria também os compiladores. Então cada mecanismo é dividido pela sua base. A razão é 1 mais o custo a mais dividido pelo custo da base. Essa fórmula não vem da literatura, é só a definição de razão reescrita, e ela mostra que uma base barata faz qualquer custo a mais parecer grande. Isso volta no slide da memória.",
    [
      ["T_mec", "tempo (ou memória) da versão com o mecanismo."],
      ["T_base", "tempo (ou memória) da base da mesma linguagem."],
      ["Δ", "a diferença T_mec menos T_base: o que o mecanismo gasta a mais."],
      ["Razão 1", "quer dizer custo igual ao da base. Razão 2 quer dizer o dobro."],
      ["Indicativa", "serve para ter ideia, mas não para afirmar que um mecanismo é mais rápido que o outro."],
    ]);
}

// 20. Seção 04
secao("04", "Resultados", "Agora os resultados, primeiro do código (QP1 a QP3) e depois do desempenho (QP4).");

// 21. QP1
{
  const s = conteudo("Resultados", "QP1: legibilidade da eval");
  tabela(s, ["Versão", "Linhas", "Operações de efeito", "Aninhamento"], [
    [{ t: "Handlers (OCaml)", cor: HEX.marinho }, "29", "5", "2"],
    ["Imperativa (OCaml)", "29", "5", "2"],
    [{ t: "Mônadas (Haskell)", cor: HEX.rosa }, "27", "18", "1"],
    ["IORef (Haskell)", "27", "18", "1"],
  ], { x: MX + 1.0, y: 1.85, w: CW - 2.0, colW: [3.7, 1.6, 2.6, CW - 2.0 - 7.9], fontSize: 15, align: ["left", "right", "right", "right"] });
  bullets(s, [
    "Mecanismo e base **empatam** em cada linguagem, também construtor a construtor",
    "Se há diferença ao escrever, ela está **fora** da eval",
  ], { x: MX, y: 4.25, w: CW, h: 1.0 });
  fonte(s, "Contagem automática sobre o código formatado. Aninhamento segundo Campbell (2018). O número de operações do Haskell é maior porque cada passo monádico (<-) conta.", 5.6);
  registrar(s, "QP1: legibilidade da eval",
    "A eval empata. No OCaml, as duas versões têm 29 linhas, 5 operações de efeito e aninhamento 2. No Haskell, 27 linhas, 18 operações e aninhamento 1. O empate vale também construtor por construtor. Então, se existe diferença para escrever, ela está fora da eval.",
    [
      ["Empate", "o mecanismo não muda a forma da eval: onde a base faz uma operação direta, o mecanismo faz uma operação de efeito, uma por uma."],
      ["Construtor a construtor", "a contagem também foi feita para cada caso (Num, Var, Add...), e cada caso empata."],
      ["Por que o Haskell tem 18 operações", "porque cada passo monádico (x <- eval a) conta como operação. Não se compara o 18 com o 5: as linguagens são diferentes."],
    ]);
}

// 22. QP3
{
  const s = conteudo("Resultados", "QP3: infraestrutura fora da eval");
  s.addChart(pres.charts.BAR, [{ name: "linhas", labels: ["IORef (Haskell)", "Mônadas (Haskell)", "Imperativa (OCaml)", "Handlers (OCaml)"], values: [22, 20, 3, 67] }], Object.assign({}, eixo, {
    x: MX, y: 1.75, w: 7.2, h: 3.7, barDir: "bar", valAxisMinVal: 0, valAxisMaxVal: 80,
    chartColors: [HEX.base, HEX.rosa, HEX.base, HEX.marinho], showValue: true, dataLabelPosition: "outEnd", showLegend: false,
    barGapWidthPct: 60, showValAxisTitle: true, valAxisTitle: "linhas de infraestrutura", objectName: "gráfico QP3",
  }));
  bullets(s, [
    "**Handlers: 67 contra 3**, sendo 18 só para os testes",
    "**Mônadas: 20 contra 22**",
    "Reúso só nos handlers: 2 handlers usados em dois lugares",
  ], { x: MX + 7.5, y: 1.9, w: CW - 7.5, h: 2.2, fontSize: 15 });
  quadro(s, [
    ["Infraestrutura", "código que só monta o mecanismo (os handlers, as composições), sem dizer o que o efeito faz."],
  ], { x: MX + 7.5, y: 4.2, w: CW - 7.5, h: 1.25 });
  fonte(s, "Classificação de cada linha auditável em codigo/resultados/boilerplate-regra/.", 5.75);
  registrar(s, "QP3: infraestrutura fora da eval",
    "Fora da eval aparece a diferença. A versão com handlers tem 67 linhas de infraestrutura contra 3 da imperativa, e 18 delas existem só para os testes. No Haskell, mônadas e IORef ficam parecidas: 20 contra 22. Em compensação, só os handlers são reaproveitados: dois deles são usados em dois lugares.",
    [
      ["67 linhas", "o código dos handlers (run_state, run_exn, run_output_emit, run_output_acc) e das composições run e run_acc."],
      ["18 só para os testes", "o handler de saída que acumula os valores (run_output_acc) e a composição run_acc, usados pela suíte de oráculo para ler o traço."],
      ["3 linhas", "a imperativa só precisa de uma pequena função que executa a eval e captura o erro."],
      ["Reúso", "run_state e run_exn são instalados tanto em run quanto em run_acc, sem reescrever."],
      ["Regra mecânica", "cada linha é classificada por um programa, sobre os tokens do compilador, e não à mão."],
    ]);
}

// 23. QP2 handlers
{
  const s = conteudo("Resultados", "QP2: o quarto efeito nos handlers");
  texto(s, "Para ler a entrada (efeito Input), a composição run passa a instalar mais um handler:", { x: MX, y: 1.7, w: CW, h: 0.45 });
  const h = codigo(s, [
    ["  run_state tbl (fun () ->", "(* instala o handler de estado (não muda) *)", " "],
    ["- run_output_emit (fun () ->", "(* antes: o handler de saída envolvia *)", "-"],
    ["-   run_exn (fun () -> eval e)))", "(* o de erro, que envolvia a eval *)", "-"],
    ["+ run_output_emit (fun () ->", "(* agora: o handler de saída envolve *)", "+"],
    ["+   run_input (fun () ->", "(* o novo handler de entrada, que envolve *)", "+"],
    ["+     run_exn (fun () -> eval e))))", "(* o de erro, que envolve a eval *)", "+"],
  ], { x: MX, y: 2.2, w: CW });
  texto(s, [
    { text: "−", options: { bold: true, color: HEX.rosa } }, { text: " linha removida      ", options: { italic: true } },
    { text: "+", options: { bold: true, color: HEX.verdeazul } }, { text: " linha adicionada", options: { italic: true } },
  ], { x: MX, y: 2.3 + h, w: CW, h: 0.3, fontSize: 12, align: "center" });
  texto(s, runs("A mesma mudança acontece em run_acc: **2 pontos de modificação**. Na versão imperativa, a leitura é uma função nova e nada do que existia muda: **0 pontos**."), { x: MX, y: 2.75 + h, w: CW, h: 0.75 });
  quadro(s, [
    ["Instalar um handler", "colocá-lo em volta de um trecho de código: dali em diante, cada perform do trecho é atendido por ele."],
  ], { x: MX, y: 3.6 + h, w: CW, h: 0.75 });
  registrar(s, "QP2: o quarto efeito nos handlers",
    "Para testar a composabilidade, acrescentei um quarto efeito: ler valores de uma entrada. Nos handlers, o efeito novo precisa ser instalado onde os outros já são. Por isso as duas composições, run e run_acc, mudaram: 2 pontos de modificação. Na imperativa, a leitura é só uma função nova, e nada do que existia muda.",
    [
      ["Quarto efeito (Input)", "ler o próximo valor de um fluxo de entrada. Se a entrada acabar, é erro. Foi escolhido antes de implementar, de propósito, porque interage com o efeito de exceção."],
      ["run", "a composição que instala os handlers em volta da eval, usada na execução normal e nas medições."],
      ["run_acc", "a mesma composição, mas com o handler de saída que acumula os valores, usada nos testes."],
      ["Instalar um handler", "colocar o handler em volta de um trecho de código (com match_with). Enquanto o trecho roda, cada perform que ele faz é atendido por esse handler."],
      ["Ordem dos handlers", "um envolve o outro. O de erro fica mais perto da eval, para que um erro interrompa só a avaliação, sem perder o estado e a saída."],
      ["run_input", "o handler novo, que atende Input entregando o próximo valor da entrada."],
      ["Ponto de modificação", "declaração que já existia e mudou. run e run_acc mudaram, então são 2."],
    ]);
}

// 24. QP2 mônadas
{
  const s = conteudo("Resultados", "QP2: o quarto efeito nas mônadas");
  texto(s, "No Haskell, o efeito novo entra no tipo da pilha, e quem executa a pilha muda junto:", { x: MX, y: 1.7, w: CW, h: 0.45 });
  const h = codigo(s, [
    ["- ExceptT String (StateT Env IO)", "-- antes: a pilha tinha exceção, estado e IO", "-"],
    ["+ ExceptT String (StateT Env", "-- agora: entra uma segunda camada de estado", "+"],
    ["+   (StateT [Int] IO))", "-- com a lista de entradas ainda não lidas", "+"],
    ["- run = runStateT (runExceptT ...)", "-- antes: run executava a pilha antiga", "-"],
    ["+ run = runStateT (runStateT ...)", "-- agora: run executa também a camada nova", "+"],
    ["+ ler = lift (lift (state ...))", "-- função nova: desce duas camadas com lift", "+"],
  ], { x: MX, y: 2.2, w: CW });
  tabela(s, ["", "Handlers", "Imperativa", "Mônadas", "IORef"], [
    ["Pontos de modificação", "2", "0", "2", "0"],
  ], { x: MX, y: 2.4 + h, w: 7.4, colW: [2.8, 1.15, 1.25, 1.15, 1.05], fontSize: 15, align: ["left", "center", "center", "center", "center"] });
  quadro(s, [
    ["lift", "leva uma operação de uma camada de dentro da pilha para a camada de fora."],
  ], { x: MX + 7.7, y: 2.4 + h, w: CW - 7.7, h: 1.0 });
  registrar(s, "QP2: o quarto efeito nas mônadas",
    "No Haskell, o efeito novo vira uma camada a mais na pilha. Então o tipo da pilha muda, e a função run, que executa a pilha, muda junto: também 2 pontos. A leitura é uma função nova que precisa de dois lift para chegar na camada nova.",
    [
      ["StateT [Int]", "camada de estado nova, que guarda a lista de entradas ainda não lidas."],
      ["runStateT, runExceptT", "funções que executam uma camada da pilha e devolvem o resultado. run chama uma para cada camada, de fora para dentro."],
      ["state", "operação que lê e atualiza o estado de uma vez (aqui, tira o primeiro valor da lista)."],
      ["lift", "leva uma operação de uma camada interna para a camada de fora. Com duas camadas de estado, o get comum só alcança a primeira, então a leitura da segunda precisa de lift duas vezes."],
      ["mtl", "a biblioteca de transformadores usada. Ela resolve automaticamente uma camada de cada tipo, não duas."],
      ["Empate em pontos", "handlers e mônadas mudaram 2 declarações cada. A diferença é onde: nos handlers, as composições. Nas mônadas, o tipo e o executor."],
    ]);
}

// 25. 45 ns
{
  const s = conteudo("Resultados", "QP4: o custo de instalar os handlers");
  texto(s, [{ text: "45 ns", options: { bold: true, color: HEX.marinho } }], { x: MX, y: 1.6, w: 5.3, h: 1.4, fontSize: 72, align: "center", valign: "middle" });
  texto(s, runs("a mais por expressão no cenário **Arith**, que só faz contas: é o custo de **instalar** os três handlers"), { x: MX, y: 3.0, w: 5.3, h: 1.0, fontSize: 16, align: "center" });
  texto(s, [{ text: "10 ns", options: { bold: true, color: HEX.rosa } }, { text: " é a maior diferença das mônadas em todo o experimento" }], { x: MX, y: 4.15, w: 5.3, h: 0.8, fontSize: 16, align: "center" });
  quadro(s, [
    ["Instalar um handler", "rodar um trecho de código sob ele, com match_with. O OCaml cria então um segmento de pilha só para o trecho (uma fiber), e cada perform do trecho passa a ser atendido pelo handler."],
    ["Por que custa", "criar e preparar essa pilha leva tempo. Aqui os três handlers são instalados de novo a cada expressão avaliada, 10.000 vezes por carga."],
    ["Arith", "cenário só com Num, Add, Mul e Div: nenhuma operação de efeito. Logo, todo o custo a mais é a instalação."],
  ], { x: MX + 5.7, y: 1.75, w: CW - 5.7, h: 3.9, fontSize: 13 });
  fonte(s, "Mediana de 3 cargas de 10.000 expressões, em máquina virtual de nuvem (Tabela 2 do artigo).", 6.1);
  registrar(s, "QP4: o custo de instalar os handlers",
    "Este é o número que resume o desempenho do OCaml. No cenário Arith, que só faz contas e não usa efeito nenhum, os handlers já custam 45 nanossegundos a mais por expressão. Esse é o custo de instalar os três handlers. No Haskell, a maior diferença em todo o experimento foi de 10 nanossegundos.",
    [
      ["Instalar um handler", "executar o trecho de código sob o handler, com a função match_with do OCaml. Enquanto o trecho roda, cada perform dele é atendido por esse handler. Na composição run, os três handlers (estado, saída e erro) são instalados um dentro do outro em volta da eval."],
      ["O que custa na instalação", "a cada instalação, o OCaml 5 cria um segmento de pilha novo (uma fiber) para o trecho e registra o handler. É trabalho feito antes de qualquer efeito acontecer."],
      ["Por expressão", "os handlers são instalados de novo para cada uma das 10.000 expressões da carga. O de erro precisa ser, senão a primeira divisão por zero encerraria a carga inteira. Os outros dois poderiam ser instalados uma vez só, mas foram instalados juntos, o que triplica o custo."],
      ["ns", "nanossegundo, um bilionésimo de segundo."],
      ["Arith", "cenário só com contas (Num, Add, Mul, Div), sem Var, Let nem Print. Não faz operação de efeito, então mede o custo de estar sob o mecanismo, e não o de usá-lo."],
      ["10 ns no Haskell", "aparece justamente em Arith, a carga com mais passos monádicos por expressão. É o custo de cada passo (bind) da pilha."],
      ["Mediana de 3 cargas", "cada número é o do meio entre as medições das 3 sementes, o que reduz a influência de uma medição fora da curva."],
      ["Máquina virtual de nuvem", "as medições rodaram numa máquina virtual, como declarado no artigo. Isso é uma ameaça à validade, tratada no protocolo (slide A2)."],
    ]);
}

// 26. Tempo
{
  const s = conteudo("Resultados", "QP4: tempo de execução");
  s.addChart(pres.charts.BAR, [
    { name: "mônadas sobre IORef (Haskell)", labels: ["Output", "Exn", "State", "Arith"], values: [-2, 5, -4, 10] },
    { name: "handlers sobre imperativa (OCaml)", labels: ["Output", "Exn", "State", "Arith"], values: [111, 49, 84, 45] },
  ], Object.assign({}, eixo, {
    x: MX, y: 1.7, w: 7.4, h: 4.1, barDir: "bar", catAxisLabelPos: "low", valAxisMinVal: -20, valAxisMaxVal: 130,
    chartColors: [HEX.rosa, HEX.marinho], showValue: true, dataLabelPosition: "outEnd", showLegend: true, legendPos: "t",
    legendFontSize: 11, legendColor: HEX.corpo, barGapWidthPct: 50, showValAxisTitle: true, valAxisTitle: "ns a mais por expressão, sobre a base",
    objectName: "gráfico de tempo",
  }));
  bullets(s, [
    "**OCaml:** custo de instalar mais o de cada operação",
    "**Haskell:** o compilador elimina quase tudo",
    "Razões: 1,59 a 4,26 (OCaml) e 0,97 a 1,08 (Haskell)",
  ], { x: MX + 7.7, y: 1.9, w: CW - 7.7, h: 2.0, fontSize: 15 });
  quadro(s, [
    ["Cenários", "Arith só contas, State lê variáveis, Exn tem 20% de divisões por zero, Output imprime."],
    ["Valor negativo", "a diferença ficou dentro do ruído de medição."],
  ], { x: MX + 7.7, y: 4.0, w: CW - 7.7, h: 1.8 });
  fonte(s, "Mediana de 3 cargas, máquina virtual de nuvem.", 6.1);
  registrar(s, "QP4: tempo de execução",
    "No OCaml, o custo cresce com o uso: começa em 45 nanossegundos só para instalar e sobe para 84 em State e 111 em Output, porque cada operação de efeito também custa. No Haskell, fica perto de zero em todos os cenários. Não é uma comparação de qual linguagem é mais rápida: cada barra é o custo a mais sobre a base da própria linguagem.",
    [
      ["Barra azul", "quantos nanossegundos a versão com handlers gasta a mais que a imperativa, por expressão."],
      ["Barra rosa", "quantos nanossegundos a versão com mônadas gasta a mais que a com IORef."],
      ["State", "500 variáveis e duas leituras por expressão: muitas operações Get."],
      ["Exn", "20% das expressões têm divisão por zero: muitas operações Fail."],
      ["Output", "cada expressão imprime: muitas operações Output. Os valores são acumulados em vez de escritos, para não medir o sistema de entrada e saída."],
      ["Custo de cada operação", "cada perform procura o handler, troca de pilha e volta com continue. Por isso State e Output custam mais que Arith."],
      ["O compilador elimina quase tudo", "o GHC otimiza a pilha de mônadas a ponto de quase não sobrar custo. Três dos quatro intervalos de confiança do Haskell incluem a razão 1."],
      ["Ruído", "variação natural entre medições. Os valores -4 e -2 não querem dizer que as mônadas são mais rápidas que a base."],
      ["Razão 1,59 a 4,26", "os handlers levaram de 1,59 a 4,26 vezes o tempo da imperativa, dependendo do cenário."],
    ]);
}

// 27. Memória
{
  const s = conteudo("Resultados", "QP4: memória alocada");
  s.addChart(pres.charts.BAR, [
    { name: "base", labels: ["Haskell", "OCaml"], values: [127, 16] },
    { name: "a mais nos handlers", labels: ["Haskell", "OCaml"], values: [0, 168] },
    { name: "a mais nas mônadas", labels: ["Haskell", "OCaml"], values: [150, 0] },
  ], Object.assign({}, eixo, {
    x: MX, y: 1.7, w: 7.4, h: 3.6, barDir: "bar", barGrouping: "stacked", valAxisMinVal: 0, valAxisMaxVal: 300,
    chartColors: [HEX.base, HEX.marinho, HEX.rosa], showValue: true, dataLabelPosition: "ctr", dataLabelFormatCode: "#;-#;", dataLabelColor: "FFFFFF",
    showLegend: true, legendPos: "t", legendFontSize: 11, legendColor: HEX.corpo, barGapWidthPct: 60,
    showValAxisTitle: true, valAxisTitle: "bytes por expressão, cenário Arith", objectName: "gráfico de memória",
  }));
  bullets(s, [
    "A mais: 168 B e 150 B, parecidos",
    "Base: 16 B contra 127 B",
    "Razões: 11,5 e 2,2",
  ], { x: MX + 7.7, y: 1.9, w: CW - 7.7, h: 1.6, fontSize: 15 });
  quadro(s, [
    ["Por que 11,5", "é o 1 + Δ ÷ base no caso extremo: a base do OCaml quase não aloca (16 B), então qualquer Δ vira uma razão enorme."],
  ], { x: MX + 7.7, y: 3.6, w: CW - 7.7, h: 1.7 });
  fonte(s, "No OCaml, alocação contada diretamente entre duas coletas forçadas.", 5.75);
  registrar(s, "QP4: memória alocada",
    "Na memória, a razão do OCaml parece dez vezes pior que a do Haskell: 11,5 contra 2,2. Mas a memória a mais é parecida, 168 e 150 bytes por expressão. O que muda é a base: a imperativa do OCaml aloca só 16 bytes. É a fórmula da razão no caso extremo.",
    [
      ["Bytes por expressão", "quanta memória o programa reserva, em média, para avaliar uma expressão."],
      ["Barra cinza", "a memória da base. Em cima dela, a memória a mais do mecanismo."],
      ["16 B", "a imperativa do OCaml só aloca o próprio resultado."],
      ["127 B", "a base do Haskell aloca mais porque também passa pelo IORef e pelo Map."],
      ["168 B a mais nos handlers", "os fechamentos (funções criadas na hora) e registros de cada instalação. Os segmentos de pilha (fibers) não entram aqui, porque o OCaml 5 os aloca fora da memória contada pelo coletor."],
      ["Coleta forçada", "a memória foi contada entre duas coletas de lixo chamadas de propósito, para não depender do momento em que o coletor roda."],
    ]);
}

// 28. Achados
{
  const s = conteudo("Resultados", "Dois achados não previstos");
  const box = (x, titulo, numero, cor, txt) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.8, w: 5.55, h: 2.45, fill: { color: HEX.fundo }, line: { color: HEX.texto, width: 0.75 } });
    texto(s, [{ text: titulo, options: { bold: true, color: C.text1 } }], { x: x + 0.25, y: 1.95, w: 5.05, h: 0.4, fontSize: 16 });
    texto(s, [{ text: numero, options: { bold: true, color: cor } }], { x: x + 0.25, y: 2.4, w: 5.05, h: 0.6, fontSize: 28 });
    texto(s, txt, { x: x + 0.25, y: 3.05, w: 5.05, h: 1.15, fontSize: 14 });
  };
  box(MX, "Vazamento de memória no OCaml 5.2", "1,2 GB → 6 MB", HEX.marinho, "Abandonar a computação interrompida não libera a memória. Encerrá-la com discontinue resolve (2 milhões de erros).");
  box(MX + 5.98, "Medição sensível à configuração", "até 28%", HEX.laranja, "Com coleta 4 vezes menor, todos os R² passam de 0,95 e mesmo assim as razões mudam.");
  quadro(s, [
    ["discontinue k", "encerra a continuação k lançando um erro dentro dela, o que desmonta a pilha e libera a memória."],
    ["R²", "quanto a reta usada na medição explica os tempos medidos. 1 é perfeito. Acima de 0,95 é o critério usual de medição confiável."],
  ], { x: MX, y: 4.45, w: CW, h: 1.3 });
  fonte(s, "Experimento em codigo/ocaml/experimento/continuacao.ml. Sensibilidade no apêndice A4.", 6.0);
  registrar(s, "Dois achados não previstos",
    "Dois achados que eu não esperava. Primeiro, um vazamento de memória no OCaml 5.2: se o handler de erro só abandona a computação interrompida, a memória não é liberada. Com 2 milhões de erros, chegou a 1,2 GB. Encerrando com discontinue, ficou em 6 MB, e o código final usa discontinue. Segundo, a medição é sensível à configuração: com uma coleta quatro vezes menor, todas as medições pareciam boas pelo R², e mesmo assim as razões mudaram até 28%.",
    [
      ["Computação interrompida", "a continuação k que o handler de erro recebe quando acontece um Fail: o resto da eval, que não vai mais rodar."],
      ["Abandonar", "simplesmente não usar k. No OCaml 5.2, o segmento de pilha de k fica preso na memória."],
      ["discontinue k e", "retoma k lançando a exceção e dentro dela. A pilha é desmontada normalmente e a memória volta."],
      ["1,2 GB → 6 MB", "memória residente do processo depois de 2 milhões de erros, sem e com discontinue."],
      ["Coleta 4 vezes menor", "corrida curta: cota de 5 segundos e 2.000 amostras, contra 20 segundos na campanha."],
      ["R²", "coeficiente de determinação da regressão do tempo sobre o número de execuções. O critério do protocolo é 0,95 ou mais."],
      ["Lição", "um R² alto sozinho não garante que a configuração de medição foi suficiente."],
    ]);
}

// 29. Seção 05
secao("05", "Conclusões", "Para fechar: como os resultados se comparam com a literatura e o que concluo.");

// 30. Literatura
{
  const s = conteudo("Conclusões", "Comparação com a literatura");
  tabela(s, ["Fonte", "O que mede", "Neste trabalho"], [
    ["Sivaramakrishnan et al. (2021)", "cerca de 23 ns para alocar uma fiber e trocar de pilha", "45 ns para instalar três handlers"],
    ["Kammar et al. (2013), Xie e Leijen (2020)", "mônadas a 1,0 a 1,3 vezes uma versão sem efeitos", "0,97 a 1,08 vezes"],
    ["TCC I (previsão)", "handlers abaixo de 1,5 vezes, mônadas acima de 2 vezes", { t: "o contrário nos dois casos", b: true, cor: HEX.laranja }],
  ], { x: MX, y: 1.85, w: CW, colW: [3.8, 4.6, CW - 8.4], fontSize: 15 });
  texto(s, "Cada trabalho mede uma situação diferente: a comparação é de ordem de grandeza.", { x: MX, y: 4.6, w: CW, h: 0.5 });
  registrar(s, "Comparação com a literatura",
    "Os números ficam na mesma ordem de grandeza da literatura. O custo de instalar os três handlers é da ordem do custo de criar uma fiber. As mônadas ficam no limite de baixo da faixa medida por outros autores. E a previsão do TCC I não se confirmou: os handlers custaram mais, e as mônadas, menos do que eu esperava.",
    [
      ["Ordem de grandeza", "comparação aproximada, de dezenas de nanossegundos com dezenas de nanossegundos, e não valor exato."],
      ["Fiber", "segmento de pilha criado para o trecho de código sob um handler."],
      ["TCC I", "a primeira etapa do trabalho, em que fiz a revisão e a previsão: sobrecusto abaixo de 1,5 vez nos handlers e acima de 2 nas mônadas."],
      ["O contrário", "os handlers passaram de 1,5 vez (1,59 a 4,26) e as mônadas ficaram abaixo de 2 (0,97 a 1,08)."],
    ]);
}

// 31. Conclusões
{
  const s = conteudo("Conclusões", "Conclusões");
  numerada(s, [
    "**Escrita:** a eval não muda. O custo está no código em volta, nas composições dos handlers e no tipo da pilha de mônadas",
    "**Execução:** handlers cobram ao ser instalados e a cada operação. As mônadas, otimizadas pelo GHC, quase não custam",
    "**Na prática:** no OCaml, cuidado com quantas vezes se instala um handler. No Haskell, o custo aparece quando a pilha muda",
  ], { x: MX, y: 1.8, w: CW, h: 2.5 });
  texto(s, runs("**Limites:** um programa, uma máquina virtual, versões específicas dos compiladores."), { x: MX, y: 4.5, w: CW, h: 0.45 });
  texto(s, runs("**Trabalhos futuros:** os dois mecanismos numa mesma linguagem, outros programas e efeitos, legibilidade medida com pessoas."), { x: MX, y: 5.0, w: CW, h: 0.75 });
  registrar(s, "Conclusões",
    "Três conclusões. Na escrita, a eval não muda, e o custo está no código em volta. Na execução, os handlers cobram para ser instalados e a cada operação, e as mônadas quase não custam. Na prática, no OCaml vale cuidar de quantas vezes se instala um handler, e no Haskell o custo aparece quando a pilha muda. Os limites são um único programa e uma única máquina, e os próximos passos são comparar os dois mecanismos na mesma linguagem e medir legibilidade com pessoas.",
    [
      ["Composições dos handlers", "as funções run e run_acc, que instalam os handlers em volta da eval."],
      ["Tipo da pilha", "a linha type Interp, que lista as camadas da pilha de mônadas."],
      ["Os dois mecanismos numa mesma linguagem", "há bibliotecas de efeitos algébricos para Haskell. Medir nelas eliminaria a diferença de compiladores."],
    ]);
}

// 32. Referências
{
  const s = conteudo("Conclusões", "Referências");
  bullets(s, [
    "Campbell, G. A. (2018). Cognitive complexity: an overview and evaluation. TechDebt '18, 57–58.",
    "Felleisen, M. e Hieb, R. (1992). The revised report on the syntactic theories of sequential control and state. Theoretical Computer Science, 103(2), 235–271.",
    "Forster, Y., Kammar, O., Lindley, S. e Pretnar, M. (2017). On the expressive power of user-defined effects. PACMPL, 1(ICFP).",
    "Kammar, O., Lindley, S. e Oury, N. (2013). Handlers in action. ICFP '13, 145–158.",
    "Marchioni, D. (2026). Mônadas e efeitos algébricos em linguagens funcionais. Relatório do TCC I, PUC Minas.",
    "Schrijvers, T., Piróg, M., Wu, N. e Jaskelioff, M. (2019). Monad transformers and modular algebraic effects. Haskell 2019, 98–113.",
    "Sivaramakrishnan, K. C. et al. (2021). Retrofitting effect handlers onto OCaml. PLDI 2021, 206–221.",
    "Wadler, P. (1992). The essence of functional programming. POPL '92, 1–14.",
    "Xie, N. e Leijen, D. (2020). Effect handlers in Haskell, evidently. Haskell 2020, 95–108.",
  ], { x: MX, y: 1.7, w: CW, h: 4.9, fontSize: 12, paraSpaceAfter: 4 });
  registrar(s, "Referências", "Slide de consulta, não entra na fala.", []);
}

// 33. Obrigado
{
  const s = pres.addSlide({ masterName: "FINAL", sectionTitle: "Conclusões" });
  s.addText("Obrigado! Dúvidas?", { placeholder: "title" });
  s.addText("github.com/DiegoMarchioni/TCC", { placeholder: "contato" });
  registrar(s, "Obrigado! Dúvidas?", "Obrigado. O código, os dados e o artigo estão no repositório, e tudo se refaz com um comando. Fico à disposição para as perguntas.", []);
}

// 34 a 38. Apêndice
pres.addSection({ title: "Apêndice" });
function apendice(titulo) {
  const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: "Apêndice" });
  s.addText("Apêndice", { placeholder: "rotulo" });
  s.addText(titulo, { placeholder: "title" });
  return s;
}
{
  const s = apendice("A1. Tempo e memória, todos os cenários");
  const cab = ["Cenário", "base", "Δ", "razão", "base", "Δ", "razão"];
  const al = ["left", "right", "right", "right", "right", "right", "right"];
  const cw = [1.25, 0.75, 0.75, 0.85, 0.75, 0.75, 0.85];
  texto(s, [{ text: "Tempo (ns por expressão)", options: { bold: true, color: C.text1 } }], { x: MX, y: 1.7, w: 5.95, h: 0.35, fontSize: 14, align: "center" });
  texto(s, [{ text: "OCaml", options: { bold: true, color: HEX.marinho } }, { text: "                         " }, { text: "Haskell", options: { bold: true, color: HEX.rosa } }], { x: MX + 1.25, y: 2.05, w: 4.7, h: 0.3, fontSize: 12, align: "center" });
  tabela(s, cab, [
    ["Arith", "77", "45", "1,59", "96", "10", "1,08"], ["State", "87", "84", "1,98", "346", "−4", "0,99"],
    ["Exn", "77", "49", "1,63", "95", "5", "1,05"], ["Output", "34", "111", "4,26", "41", "−2", "0,97"],
  ], { x: MX, y: 2.35, w: 5.95, colW: cw, fontSize: 13, align: al });
  texto(s, [{ text: "Memória (bytes por expressão)", options: { bold: true, color: C.text1 } }], { x: MX + 6.25, y: 1.7, w: 5.95, h: 0.35, fontSize: 14, align: "center" });
  texto(s, [{ text: "OCaml", options: { bold: true, color: HEX.marinho } }, { text: "                         " }, { text: "Haskell", options: { bold: true, color: HEX.rosa } }], { x: MX + 7.5, y: 2.05, w: 4.7, h: 0.3, fontSize: 12, align: "center" });
  tabela(s, cab, [
    ["Arith", "16", "168", "11,5", "127", "150", "2,2"], ["State", "48", "382", "9,0", "117", "9", "1,1"],
    ["Exn", "16", "187", "12,7", "119", "136", "2,1"], ["Output", "64", "360", "6,6", "104", "8", "1,1"],
  ], { x: MX + 6.25, y: 2.35, w: 5.95, colW: cw, fontSize: 13, align: al });
  bullets(s, [
    "IC de 95% da razão de tempo: nenhum inclui 1 no OCaml. No Haskell, só o de Arith o exclui ([1,04; 1,18])",
    "Dispersão entre sementes de até 18,3% no tempo. Menor R²: 0,954 (Bechamel) e 0,973 (Criterion)",
  ], { x: MX, y: 4.55, w: CW, h: 1.2, fontSize: 14 });
  registrar(s, "A1. Tempo e memória, todos os cenários",
    "Se perguntarem pelos números completos: em cada linha, a base, o custo a mais e a razão, para cada linguagem e cenário.",
    [
      ["IC de 95%", "intervalo de confiança: a faixa em que a razão verdadeira deve estar, com 95% de confiança, calculada por bootstrap."],
      ["Inclui 1", "se o intervalo contém 1, não dá para dizer que o mecanismo custa mais que a base."],
      ["Bootstrap", "técnica que reamostra as medições muitas vezes para estimar a incerteza."],
      ["Dispersão entre sementes", "quanto o resultado variou entre as 3 cargas. O maior caso, 18,3%, foi o Haskell Output, e por isso se usa a mediana."],
      ["Bechamel e Criterion", "as bibliotecas de medição do OCaml e do Haskell."],
    ]);
}
{
  const s = apendice("A2. Protocolo de medição");
  tabela(s, ["Item", "Configuração"], [
    ["Máquina", "Intel Xeon @ 2,10 GHz, 4 vCPU, máquina virtual de nuvem, Ubuntu 24.04.5, afinidade fixa num núcleo"],
    ["Compilação", "OCaml 5.2.1 + flambda com -O3 e GHC 9.4.7 com -O2, iguais para mecanismo e base"],
    ["Harnesses", "Bechamel 0.5.0 (cota de 20 s, limit 5000) e Criterion 1.6.1.0 (1.000 reamostragens)"],
    ["Cargas", "4 cenários × 10.000 expressões × 3 sementes (42, 43, 44), geradas fora da região medida"],
    ["Regras", "oráculo como pré-condição, ordem alternada, R² ≥ 0,95 (um par com 0,949 foi remedido: 0,962)"],
    ["Execução", "pela ferramenta de IA, em sessão na nuvem, como declara o artigo"],
  ], { x: MX, y: 1.8, w: CW, colW: [2.0, CW - 2.0], fontSize: 14 });
  registrar(s, "A2. Protocolo de medição",
    "Se perguntarem como foi medido: a máquina, as opções de compilação, as bibliotecas de medição, as cargas e as regras.",
    [
      ["vCPU", "processador virtual da máquina de nuvem."],
      ["Afinidade fixa", "o programa medido roda sempre no mesmo núcleo, o que reduz variação."],
      ["flambda, -O3, -O2", "opções de otimização dos compiladores, as mesmas para mecanismo e base."],
      ["Cota de 20 s", "tempo máximo que o Bechamel gasta medindo cada caso."],
      ["Gerada fora da região medida", "as expressões são criadas antes de começar a medir, para que o tempo de gerar não entre no resultado."],
      ["Ordem alternada", "em cada cenário, ora mede o mecanismo primeiro, ora a base, para não favorecer um lado."],
    ]);
}
{
  const s = apendice("A3. O quarto efeito em cada versão");
  tabela(s, ["Versão", "O que mudou em declarações existentes", "Pontos", "Adições"], [
    [{ t: "Handlers", cor: HEX.marinho }, "run e run_acc passam a instalar o handler de Input", "2", "2"],
    ["Imperativa", "–", "0", "1"],
    [{ t: "Mônadas", cor: HEX.rosa }, "o tipo da pilha ganha StateT [Int] e run passa a executá-la", "2", "1"],
    ["IORef", "–", "0", "1"],
  ], { x: MX, y: 1.8, w: CW, colW: [2.0, CW - 4.4, 1.2, 1.2], fontSize: 15, align: ["left", "left", "center", "center"] });
  texto(s, "Ponto de modificação: declaração preexistente cujo texto mudou, definida antes de implementar. Nas bases a leitura é uma função nova. Com o efeito, a suíte passa com 73/73 em cada linguagem.", { x: MX, y: 4.3, w: CW, h: 0.9, fontSize: 15 });
  registrar(s, "A3. O quarto efeito em cada versão",
    "Se perguntarem se a contagem favorece as bases: a definição de ponto de modificação foi fixada antes de implementar.",
    [
      ["Adições", "código novo que não altera nada existente: a declaração da operação Input e o handler run_input nos handlers, a função de leitura nas outras versões."],
      ["73/73", "a suíte de oráculo ganhou casos para o efeito novo e passou inteira nas quatro versões."],
    ]);
}
{
  const s = apendice("A4. Sensibilidade à configuração");
  s.addChart(pres.charts.BAR, [{ name: "desvio", labels: ["Haskell Output", "Haskell Exn", "Haskell State", "Haskell Arith", "OCaml Output", "OCaml Exn", "OCaml State", "OCaml Arith"], values: [-1, -9, -8, 2, 5, 11, 28, 14] }], Object.assign({}, eixo, {
    x: MX, y: 1.7, w: 8.2, h: 4.4, barDir: "bar", valAxisMinVal: -15, valAxisMaxVal: 35, catAxisLabelPos: "low",
    chartColors: [HEX.rosa, HEX.rosa, HEX.rosa, HEX.rosa, HEX.marinho, HEX.marinho, HEX.marinho, HEX.marinho],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: '+0"%";-0"%";0"%"', showLegend: false, barGapWidthPct: 50,
    showValAxisTitle: true, valAxisTitle: "desvio da razão de tempo (%), mesma semente", objectName: "gráfico de sensibilidade",
  }));
  texto(s, "Cota de 5 s e 2.000 amostras contra a campanha (cota de 20 s). Todos os R² da corrida curta ficaram em 0,95 ou mais.", { x: MX + 8.5, y: 2.0, w: CW - 8.5, h: 2.0, fontSize: 15 });
  registrar(s, "A4. Sensibilidade à configuração",
    "Se perguntarem do achado do R²: a corrida curta teve todos os R² acima de 0,95 e mesmo assim deslocou as razões, até 28% no OCaml State.",
    [
      ["Desvio", "quanto a razão da corrida curta diferiu da razão da campanha, para a mesma semente."],
      ["Corrida curta", "medição com menos tempo e menos amostras, feita para testar a configuração."],
    ]);
}
{
  const s = apendice("A5. Uso de inteligência artificial");
  texto(s, runs("**Ferramenta:** Claude (Anthropic), versão informada na declaração do artigo."), { x: MX, y: 1.75, w: CW, h: 0.45 });
  bullets(s, [
    "revisão crítica de todas as seções",
    "edição de estilo, exceto resumos e primeiro parágrafo da introdução",
    "redação preliminar dos trechos de resultados, revisada pelo autor",
    "geração do código-fonte, revisado pelo autor",
    "execução da campanha de medição, em máquina virtual de nuvem",
  ], { x: MX, y: 2.3, w: CW, h: 2.4 });
  texto(s, "O conteúdo técnico, os resultados e a redação final são de responsabilidade do autor (Arts. 6º a 9º do Regulamento).", { x: MX, y: 4.9, w: CW, h: 0.8 });
  registrar(s, "A5. Uso de inteligência artificial",
    "Se perguntarem sobre IA: o uso está declarado no artigo, como o Regulamento exige. Investi em verificação (oráculo, mutação e conformidade) justamente por isso, e posso explicar qualquer parte do código.",
    [["Regulamento", "o regulamento do TCC do curso, que exige declarar o uso de IA (Arts. 6º a 9º)."]]);
}

// ---- gravar ------------------------------------------------------------------
// O pptxgenjs repete <a:pPr> antes de cada trecho de um parágrafo com vários
// trechos (por exemplo, um rótulo em negrito seguido de texto normal). Só o
// primeiro é válido: os outros apagariam o marcador da lista e o PowerPoint
// pediria para reparar o arquivo. Aqui eles são removidos.
async function corrigirParagrafos(arquivo) {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(arquivo));
  const nomes = Object.keys(zip.files).filter((f) => /^ppt\/(slides|slideLayouts|notesSlides)\/[^/]+\.xml$/.test(f));
  for (const f of nomes) {
    const xml = await zip.file(f).async("string");
    const novo = xml.replace(/(<\/a:r>)<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, "$1");
    if (novo !== xml) zip.file(f, novo);
  }
  fs.writeFileSync(arquivo, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

(async () => {
  await pres.writeFile({ fileName: SAIDA });
  await applyTheme(SAIDA, THEME);
  await corrigirParagrafos(SAIDA);
  fs.writeFileSync(SAIDA_MD, md.join("\n") + "\n");
  console.log("ok", n, "slides");
})();
