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
// Versão enxuta: pouco texto na tela. Cada slide tem, nas notas do
// apresentador, o que dizer e o que cada termo do slide significa.
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


function fonte(s, t, y) {
  texto(s, t, { x: MX, y: y || 6.4, w: CW, h: 0.35, fontSize: 11, color: C.accent6 });
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
// SLIDES (versão enxuta: pouco texto na tela, explicações nas notas)
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
  ["Introdução", "Fundamentação", "Metodologia", "Resultados", "Conclusões"].forEach((t, i) => {
    texto(s, "0" + (i + 1), { x: MX, y: 2.0 + i * 0.8, w: 0.8, h: 0.5, fontSize: 22, color: C.accent4 });
    texto(s, t, { x: MX + 0.9, y: 2.0 + i * 0.8, w: 6, h: 0.5, fontSize: 22, color: C.text1 });
  });
  registrar(s, "Sumário",
    "A apresentação segue a ordem do artigo: o problema e as perguntas, os dois mecanismos, o método, os resultados e as conclusões. São cerca de 20 minutos.",
    [["QP", "questão de pesquisa. São quatro, uma para cada dimensão comparada."]]);
}

// Seção 01
secao("01", "Introdução", "Começo pelo contexto: o que são efeitos e por que existem dois mecanismos para eles.");

// 3. Dois mecanismos
{
  const s = conteudo("Introdução", "Dois mecanismos para os mesmos efeitos");
  texto(s, runs("**Estado**, **exceção** e **saída**: o que uma função pura não faz."), { x: MX, y: 1.85, w: CW, h: 0.5, fontSize: 20 });
  const caixaSimples = (x, titulo, linha1, linha2) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.75, w: 5.55, h: 2.2, fill: { color: HEX.fundo }, line: { color: HEX.texto, width: 0.75 }, objectName: "caixa " + titulo });
    texto(s, [{ text: titulo, options: { bold: true, color: C.text1 } }], { x: x + 0.3, y: 2.95, w: 5.0, h: 0.5, fontSize: 20 });
    bullets(s, [linha1, linha2], { x: x + 0.3, y: 3.6, w: 5.0, h: 1.2, fontSize: 18, paraSpaceAfter: 10 });
  };
  caixaSimples(MX, "Mônadas (Haskell)", "o efeito fica no **tipo**", "camadas empilhadas");
  caixaSimples(MX + 5.98, "Efeitos algébricos (OCaml 5)", "o código **pede** a operação", "um **handler** responde");
  fonte(s, "Mesma expressividade em teoria (Forster et al., 2017).", 5.35);
  registrar(s, "Dois mecanismos para os mesmos efeitos",
    "Programas reais precisam guardar estado, lançar erros e imprimir, coisas que uma função pura não faz. As linguagens funcionais têm mecanismos para isso. No Haskell, as mônadas: cada efeito é uma camada, e o efeito aparece no tipo da função. No OCaml 5, os efeitos algébricos: o código pede uma operação com perform e um handler decide o que ela faz. Na teoria, os dois expressam as mesmas coisas, como mostraram Forster e colegas em 2017 e Schrijvers e colegas em 2019. As mônadas são a técnica consolidada (Wadler, 1992). Os efeitos algébricos são nativos no OCaml desde 2022.",
    [
      ["Efeito", "tudo o que uma função faz além de devolver um valor. Aqui são três: estado, exceção e saída."],
      ["Estado", "valores guardados que o programa lê e muda, como as variáveis do interpretador."],
      ["Exceção", "interrupção do cálculo por um erro, como divisão por zero."],
      ["Saída", "mostrar um valor para fora do programa (o Print do interpretador)."],
      ["Função pura", "função cujo resultado depende só da entrada e que não tem efeitos."],
      ["Camadas empilhadas", "nas mônadas, cada efeito é um transformador (por exemplo, StateT para estado) colocado em volta de outro. O conjunto forma uma pilha."],
      ["perform", "comando do OCaml 5 que pede uma operação de efeito e pausa o código até alguém responder."],
      ["Handler", "a função que responde aos pedidos feitos com perform. Ela decide o que a operação faz."],
      ["Mesma expressividade", "Forster et al. (2017) e Schrijvers et al. (2019) mostraram que um mecanismo consegue simular o outro. Logo a diferença prática está em escrever e em executar."],
    ]);
}

// 4. O problema
{
  const s = conteudo("Introdução", "O problema");
  texto(s, runs("Na teoria são equivalentes. Na prática, quanto custa **escrever** e quanto custa **executar**?"), { x: MX, y: 1.85, w: CW, h: 0.9, fontSize: 20 });
  [["QP1", "Legibilidade", "carga de leitura do código"], ["QP2", "Composabilidade", "mudanças para um efeito novo"],
   ["QP3", "Abstração", "boilerplate e reúso"], ["QP4", "Desempenho", "tempo e memória"]].forEach(([q, d, o], i) => {
    const y = 3.0 + i * 0.75;
    texto(s, q, { x: MX, y, w: 1.0, h: 0.5, fontSize: 20, color: C.accent4 });
    texto(s, [{ text: d, options: { bold: true, color: C.text1 } }], { x: MX + 1.1, y, w: 3.2, h: 0.5, fontSize: 20 });
    texto(s, o, { x: MX + 4.4, y, w: CW - 4.4, h: 0.5, fontSize: 20 });
  });
  registrar(s, "O problema",
    "Saber que os dois mecanismos são equivalentes na teoria não diz o que importa para quem programa: quanto custa escrever e quanto custa executar. Nenhum estudo tinha medido as duas coisas no mesmo programa. Então o objetivo foi comparar os dois no mesmo programa, em quatro dimensões, cada uma com uma questão de pesquisa.",
    [
      ["Carga de leitura (QP1)", "quanto o código tem de linhas, de operações de efeito e de blocos um dentro do outro. É uma medida indireta: legibilidade percebida exigiria testar com pessoas."],
      ["Mudanças para um efeito novo (QP2)", "quantas declarações já existentes precisam mudar para acrescentar um quarto efeito. Quanto menos, mais fácil compor efeitos."],
      ["Boilerplate (QP3)", "código de preparação, que não diz o que o efeito faz, só monta o mecanismo."],
      ["Reúso (QP3)", "usar a mesma peça (um handler, uma camada) em mais de um lugar sem reescrever."],
      ["Tempo e memória (QP4)", "o que o mecanismo gasta a mais em relação a uma versão sem ele."],
    ]);
}

// Seção 02
secao("02", "Fundamentação", "Agora mostro como cada mecanismo aparece no código do trabalho.");

// 5. Mônadas no código
{
  const s = conteudo("Fundamentação", "Mônadas no código");
  texto(s, runs("No Haskell, o efeito está no **tipo**."), { x: MX, y: 1.8, w: CW, h: 0.5, fontSize: 20 });
  codigo(s, [
    ["type Env = Map String Int", "-- as variáveis"],
    ["type Interp a =", "-- a pilha:"],
    ["  ExceptT String (StateT Env IO) a", "-- erro, estado, IO"],
    ["", ""],
    ["eval (Var x) = do", "-- ler a variável x"],
    ["  env <- get", "-- lê o estado"],
    ["  maybe (throwError (msgUnbound x))", "-- não achou: erro"],
    ["        return (Map.lookup x env)", "-- achou: o valor"],
  ], { x: MX, y: 2.5, w: CW, fontSize: 14 });
  fonte(s, "Monadic.hs", 5.2);
  registrar(s, "Mônadas no código",
    "No Haskell, o efeito está no tipo. Interp é o tipo de toda computação do interpretador: uma pilha com exceção por fora, estado no meio e IO na base. No caso Var, get lê o estado, e se a variável não existir, throwError lança o erro.",
    [
      ["type Env = Map String Int", "define o estado do interpretador: um dicionário (Map) de nomes (String) para valores inteiros (Int)."],
      ["type Interp a", "nome curto para o tipo da pilha. Uma função que devolve Interp Int calcula um inteiro e pode usar os três efeitos."],
      ["Mônada", "tipo que encadeia passos de cálculo levando um efeito junto."],
      ["ExceptT String", "camada de exceção (um transformador). Permite interromper o cálculo com uma mensagem de erro (String)."],
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

// 6. Efeitos algébricos no código
{
  const s = conteudo("Fundamentação", "Efeitos algébricos no código");
  texto(s, runs("No OCaml, o código **pede** e o **handler** responde."), { x: MX, y: 1.8, w: CW, h: 0.5, fontSize: 20 });
  codigo(s, [
    ["type _ Effect.t +=", "(* as operações *)"],
    ["  | Get : string -> int option Effect.t", "(* ler variável *)"],
    ["  | Set : string * int -> unit Effect.t", "(* guardar valor *)"],
    ["  | Fail : string -> 'a Effect.t", "(* erro *)"],
    ["  | Output : int -> unit Effect.t", "(* saída *)"],
    ["", ""],
    ["| Get x -> Some (fun k ->", "(* handler atende Get *)"],
    ["    continue k (Hashtbl.find_opt tbl x))", "(* retoma com o valor *)"],
  ], { x: MX, y: 2.5, w: CW, fontSize: 14 });
  fonte(s, "interp_effects.ml (as duas últimas linhas são do handler de estado, run_state)", 5.2);
  registrar(s, "Efeitos algébricos no código",
    "No OCaml, primeiro se declaram as operações: Get, Set, Fail e Output. O código chama perform para pedir uma delas. O handler de estado atende o Get: busca a variável na tabela e retoma o programa, que estava parado, com o valor encontrado. O k é a continuação, o resto do programa parado no ponto do perform.",
    [
      ["type _ Effect.t +=", "acrescenta operações novas ao tipo de efeitos do OCaml. Cada linha é uma operação e diz o que recebe e o que devolve."],
      ["Get : string -> int option", "recebe o nome da variável e devolve talvez um inteiro (option): Some v se existe, None se não existe."],
      ["Set : string * int -> unit", "recebe nome e valor e não devolve nada útil (unit)."],
      ["Fail : string -> 'a", "recebe a mensagem de erro. O 'a quer dizer que ela nunca volta com um valor, então serve em qualquer lugar."],
      ["Output : int -> unit", "recebe o valor a mostrar."],
      ["perform", "pede uma operação (Get, Set...) e pausa o código até o handler responder."],
      ["Handler", "função que atende os pedidos de perform. Este trecho é do handler de estado, run_state."],
      ["run_state", "função que instala o handler de estado em volta de um trecho de código. Usa match_with, do OCaml."],
      ["Some (fun k -> ...)", "o jeito de o handler dizer: este pedido é meu, e eis o que fazer com ele."],
      ["k (continuação)", "o resto do programa a partir do perform, guardado e parado."],
      ["continue k v", "retoma o programa. O perform que estava esperando devolve v."],
      ["Hashtbl.find_opt tbl x", "procura x na tabela de variáveis (Hashtbl). Devolve Some valor ou None."],
    ]);
}

// Seção 03
secao("03", "Metodologia", "Agora o método: o que foi implementado, como foi verificado e o que foi medido.");

// 7. Visão geral
{
  const s = conteudo("Metodologia", "Quatro versões do mesmo interpretador");
  tabela(s, ["Versão", "Linguagem", "Papel"], [
    [{ t: "Handlers", cor: HEX.marinho }, "OCaml 5.2.1", "mecanismo"],
    ["Imperativa", "OCaml 5.2.1", "base"],
    [{ t: "Mônadas", cor: HEX.rosa }, "GHC 9.4.7", "mecanismo"],
    ["IORef", "GHC 9.4.7", "base"],
  ], { x: MX, y: 1.95, w: 8.0, colW: [2.8, 2.8, 2.4], fontSize: 18 });
  texto(s, runs("Toda comparação é **dentro da mesma linguagem**."), { x: MX, y: 4.6, w: CW, h: 0.5, fontSize: 20 });
  registrar(s, "Quatro versões do mesmo interpretador",
    "Escrevi o mesmo interpretador quatro vezes. Em cada linguagem há a versão com o mecanismo e uma base sem ele. Só comparo código dentro da mesma linguagem, e o desempenho de cada mecanismo é medido contra a sua base. A base do OCaml guarda as variáveis numa Hashtbl e usa exceção nativa. A base do Haskell guarda o mesmo Map dentro de um IORef e também usa exceção nativa.",
    [
      ["Interpretador", "programa que lê uma expressão e calcula o resultado dela."],
      ["Mecanismo", "a forma de tratar efeitos que está sendo estudada: handlers no OCaml, mônadas no Haskell."],
      ["Base", "versão sem o mecanismo, com estado e erro diretos, que serve de régua para medir o custo do mecanismo."],
      ["OCaml 5.2.1 e GHC 9.4.7", "as versões exatas do compilador de cada linguagem (GHC é o compilador do Haskell)."],
      ["Hashtbl", "tabela de dispersão do OCaml, que guarda as variáveis. As duas versões OCaml usam a mesma."],
      ["IORef", "uma variável mutável do Haskell, usada dentro de IO. A base guarda nela o mesmo Map da versão monádica."],
      ["Exceção nativa", "o erro da própria linguagem: raise no OCaml, throwIO no Haskell."],
      ["Por que dentro da mesma linguagem", "comparar OCaml com Haskell mediria também os compiladores e os runtimes, e não só os mecanismos."],
    ]);
}

// 8. Caso de uso
{
  const s = conteudo("Metodologia", "Caso de uso: um interpretador pequeno");
  texto(s, [{ text: "Num  Var  Add  Mul  Div  Let  Seq  Print", options: { fontFace: CODIGO } }], { x: MX, y: 1.9, w: CW, h: 0.5, fontSize: 20 });
  bullets(s, [
    "**Estado:** Var lê, Let guarda",
    "**Exceção:** divisão por zero, variável inexistente",
    "**Saída:** Print",
  ], { x: MX, y: 2.7, w: CW, h: 1.6, fontSize: 20, paraSpaceAfter: 10 });
  s.addShape(pres.shapes.RECTANGLE, { x: MX, y: 4.55, w: CW, h: 1.0, fill: { color: HEX.fundo }, line: { color: HEX.laranja, width: 1.25 }, objectName: "definição" });
  texto(s, runs("**Equivalência:** mesmo valor, mesmo estado final, mesma saída e mesmo erro que a semântica de referência."), { x: MX + 0.3, y: 4.55, w: CW - 0.6, h: 1.0, fontSize: 18, valign: "middle" });
  registrar(s, "Caso de uso: um interpretador pequeno",
    "O caso de uso é um interpretador pequeno, com oito tipos de expressão, que usa os três efeitos. Antes de programar, fixei o que significa duas versões serem equivalentes: dar o mesmo valor, o mesmo estado final, a mesma saída e a mesma mensagem de erro que a semântica de referência. Formalmente, para todo par de expressão e estado inicial no conjunto E64, o resultado da implementação é igual ao da semântica. Simplificações de propósito: variáveis globais, erro sempre aborta e um único programa.",
    [
      ["Construtor", "cada tipo de expressão: Num (número), Var (variável), Add, Mul, Div (soma, multiplicação, divisão), Let (dar valor a uma variável e continuar), Seq (fazer uma coisa e depois outra), Print (mostrar um valor)."],
      ["Semântica de referência", "a definição matemática do resultado de cada expressão, no estilo small-step de Felleisen e Hieb (1992). É a resposta certa contra a qual as versões são testadas."],
      ["Small-step", "estilo de semântica que descreve a execução passo a passo."],
      ["E64", "conjunto dos pares (expressão, estado inicial) em que nenhum valor passa do maior inteiro comum às duas linguagens, que é o de 63 bits do OCaml."],
      ["Fórmula, se perguntarem", "⟦I⟧(e, σ0) = D(e, σ0) para todo (e, σ0) em E64: o que a implementação I produz é igual ao que a semântica D define."],
      ["Mesma saída (traço)", "a lista de valores impressos por Print, na mesma ordem."],
      ["Simplificações", "variáveis são globais (sem escopo), qualquer erro encerra a avaliação e há um único programa de teste. Foram escolhas para manter o caso controlado."],
    ]);
}

// 9. A função eval
{
  const s = conteudo("Metodologia", "A função eval");
  texto(s, "Calcula o valor de cada expressão. Os efeitos acontecem dentro dela.", { x: MX, y: 1.8, w: CW, h: 0.5, fontSize: 20 });
  codigo(s, [
    ["let rec eval = function", ""],
    ["  | Num n -> n", "(* o próprio número *)"],
    ["  | Var x -> (", ""],
    ["      match perform (Get x) with", "(* pede x ao handler *)"],
    ["      | Some v -> v", "(* achou *)"],
    ["      | None -> perform (Fail ...))", "(* não achou: erro *)"],
    ["  | Add (a, b) ->", ""],
    ["      let x = eval a in", "(* esquerda *)"],
    ["      let y = eval b in", "(* direita *)"],
    ["      x + y", "(* soma *)"],
  ], { x: MX, y: 2.5, w: CW, fontSize: 14 });
  fonte(s, "interp_effects.ml", 5.85);
  registrar(s, "A função eval",
    "Esta é a eval da versão com handlers. Ela olha o tipo da expressão e decide o que fazer. Num devolve o número. Var pede o valor ao handler de estado. Add avalia os dois lados, em ordem fixa, e soma. Um exemplo: 2 + n, com n valendo 3. A eval cai no caso Add. O lado esquerdo é o número 2. O lado direito é a variável n: a eval faz perform Get, o handler lê 3 na tabela e retoma a eval com esse valor. No fim, 2 + 3 = 5. Os outros casos, Mul, Div, Let, Seq e Print, seguem a mesma ideia. A legibilidade (QP1) é medida dentro desta função.",
    [
      ["eval", "a função principal do interpretador. A legibilidade (QP1) é medida só dentro dela."],
      ["let rec", "define uma função que pode chamar a si mesma (recursiva)."],
      ["function | ...", "a função escolhe um caso conforme o tipo da expressão recebida."],
      ["match ... with", "examina um valor e escolhe o caso que combina com ele."],
      ["perform (Get x)", "pede ao handler de estado o valor de x. O código para até o handler responder."],
      ["Some v / None", "as duas respostas possíveis de Get: o valor existe (Some v) ou não existe (None)."],
      ["perform (Fail ...)", "pede ao handler de erro que interrompa a avaliação com a mensagem."],
      ["Ordem fixa", "o OCaml não garante em que ordem avalia os argumentos de uma função, por isso cada lado é avaliado num let separado. Isso importa quando os dois lados imprimem."],
      ["Exemplo 2 + n (passo a passo)", "1) eval (Add (Num 2, Var \"n\")) cai no caso Add. 2) eval (Num 2) devolve 2. 3) eval (Var \"n\") faz perform (Get \"n\"), o handler lê 3 e retoma. 4) x + y devolve 5. Está no apêndice A7."],
    ]);
}

// 10. Mesma estrutura
{
  const s = conteudo("Metodologia", "Mesma estrutura, outro mecanismo");
  texto(s, [{ text: "Handlers", options: { bold: true, color: HEX.marinho } }], { x: MX, y: 1.75, w: CW, h: 0.35, fontSize: 16 });
  const h1 = codigo(s, [
    ["| Var x -> (", ""],
    ["    match perform (Get x) with", "(* efeito *)"],
    ["    | Some v -> v", ""],
    ["    | None -> perform (Fail (msg_unbound x)))", "(* efeito *)"],
  ], { x: MX, y: 2.15, w: CW, fontSize: 14 });
  texto(s, [{ text: "Imperativa", options: { bold: true, color: C.text1 } }], { x: MX, y: 2.35 + h1, w: CW, h: 0.35, fontSize: 16 });
  const h2 = codigo(s, [
    ["| Var x -> (", ""],
    ["    match Hashtbl.find_opt env x with", "(* direto *)"],
    ["    | Some v -> v", ""],
    ["    | None -> raise (Runtime_error (msg_unbound x)))", "(* direto *)"],
  ], { x: MX, y: 2.75 + h1, w: CW, fontSize: 14 });
  texto(s, runs("Só **2 linhas** mudam: a diferença medida é o mecanismo."), { x: MX, y: 3.0 + h1 + h2, w: CW, h: 0.5, fontSize: 20 });
  registrar(s, "Mesma estrutura, outro mecanismo",
    "As duas versões OCaml têm a mesma estrutura, linha por linha. Onde a imperativa lê a tabela direto, a de handlers faz perform Get. Onde a imperativa lança raise, a de handlers faz perform Fail. As duas usam a mesma Hashtbl. Por isso a diferença medida é o mecanismo, e não a estrutura.",
    [
      ["Hashtbl.find_opt env x", "lê x direto da tabela de variáveis, sem passar por handler nenhum."],
      ["raise (Runtime_error ...)", "lança a exceção nativa do OCaml, que interrompe a avaliação."],
      ["msg_unbound x", "monta a mensagem de erro de variável não vinculada, com o nome de x. As versões usam a mesma função."],
      ["Arquivos", "interp_effects.ml (handlers) e interp_imp.ml (imperativa)."],
    ]);
}

// 11. Verificação
{
  const s = conteudo("Metodologia", "Verificação antes de medir");
  [["61/61", "testes de oráculo", "as versões são equivalentes"],
   ["8/8", "erros plantados detectados", "os testes pegam erros reais"],
   ["12", "cargas idênticas (hash)", "todas medem a mesma coisa"]].forEach(([num, oque, garante], i) => {
    const x = MX + i * 3.9;
    texto(s, [{ text: num, options: { bold: true, color: HEX.verdeazul } }], { x, y: 2.0, w: 3.6, h: 1.0, fontSize: 48 });
    texto(s, [{ text: oque, options: { bold: true, color: C.text1 } }], { x, y: 3.1, w: 3.6, h: 0.5, fontSize: 18 });
    texto(s, garante, { x, y: 3.6, w: 3.6, h: 0.8, fontSize: 16 });
  });
  registrar(s, "Verificação antes de medir",
    "Antes de qualquer medição, as quatro versões tiveram de passar nos testes. Foram 61 casos de oráculo em cada linguagem. Para saber se os testes pegam erros de verdade, coloquei 8 erros de propósito, e os testes acusaram os 8. E as 12 cargas de medição têm o mesmo hash nas duas linguagens. O código foi gerado com apoio de IA, como declarado no artigo, e revisado por mim. Essa verificação é o que garante que ele faz o que deve.",
    [
      ["Testes de oráculo (61/61)", "61 casos de teste. Cada um compara valor, estado final, saída e erro de cada versão com a semântica de referência (o oráculo, a resposta certa). Todos passaram nas quatro versões."],
      ["Erros plantados, ou mutantes (8/8)", "oito cópias do código, cada uma com uma decisão sutil revertida, por exemplo arredondar a divisão para baixo (div) em vez de truncar (quot) ou inverter a ordem da pilha monádica. A suíte acusou as oito."],
      ["Hash FNV-1a", "algoritmo que transforma um texto num número de 64 bits, uma impressão digital. Se as cargas geradas nas duas linguagens dão o mesmo número, elas são iguais."],
      ["12 cargas", "4 cenários (Arith, State, Exn, Output) vezes 3 sementes do gerador (42, 43 e 44). Cada carga tem 10.000 expressões."],
      ["IA", "o código foi gerado com apoio de IA, declarado no artigo e revisado pelo autor. Detalhes no apêndice A5."],
    ]);
}

// 12. Razão
{
  const s = conteudo("Metodologia", "Desempenho medido por razões");
  const cx = MX + 0.5, bw = 3.3, bh = 0.7;
  [["Handlers", "Imperativa", HEX.marinho, 2.0], ["Mônadas", "IORef", HEX.rosa, 3.0]].forEach(([a, b, cor, y]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y, w: bw, h: bh, fill: { color: HEX.fundo }, line: { color: HEX.corpo, width: 0.75 } });
    texto(s, [{ text: a, options: { bold: true, color: cor } }], { x: cx, y, w: bw, h: bh, align: "center", valign: "middle", fontSize: 20 });
    texto(s, "÷", { x: cx + bw, y, w: 0.8, h: bh, align: "center", valign: "middle", fontSize: 24 });
    s.addShape(pres.shapes.RECTANGLE, { x: cx + bw + 0.8, y, w: bw, h: bh, fill: { color: HEX.fundo }, line: { color: HEX.corpo, width: 0.75 } });
    texto(s, b, { x: cx + bw + 0.8, y, w: bw, h: bh, align: "center", valign: "middle", fontSize: 20 });
  });
  texto(s, [
    { text: "razão = 1 + Δ ÷ T", options: {} }, { text: "base", options: { subscript: true } },
  ], { x: MX, y: 4.2, w: CW, h: 0.7, align: "center", fontSize: 28, color: C.text1 });
  texto(s, runs("Base barata, razão grande: entre linguagens, só **indicativo**."), { x: MX, y: 5.1, w: CW, h: 0.5, fontSize: 18, align: "center" });
  registrar(s, "Desempenho medido por razões",
    "Não dá para comparar o tempo do OCaml com o do Haskell, porque isso mediria também os compiladores. Então cada mecanismo é dividido pela sua base: handlers pela imperativa, mônadas pela IORef. A razão é o tempo do mecanismo dividido pelo da base, que é o mesmo que 1 mais o custo a mais dividido pelo custo da base. Essa fórmula não vem da literatura, é só a definição de razão reescrita, e ela mostra que uma base barata faz qualquer custo a mais parecer grande. Isso volta no slide da memória.",
    [
      ["Razão", "tempo (ou memória) do mecanismo dividido pelo da base. Razão 1 quer dizer custo igual ao da base. Razão 2 quer dizer o dobro."],
      ["Fórmula completa", "razão = T_mec ÷ T_base = (T_base + Δ) ÷ T_base = 1 + Δ ÷ T_base."],
      ["T_mec", "tempo (ou memória) da versão com o mecanismo."],
      ["T_base", "tempo (ou memória) da base da mesma linguagem."],
      ["Δ (delta)", "a diferença T_mec menos T_base: o que o mecanismo gasta a mais, em nanossegundos ou bytes por expressão."],
      ["Indicativo", "serve para ter ideia, mas não para afirmar que um mecanismo é mais rápido que o outro."],
    ]);
}

// Seção 04
secao("04", "Resultados", "Agora os resultados, primeiro do código (QP1 a QP3) e depois do desempenho (QP4).");

// 13. QP1
{
  const s = conteudo("Resultados", "QP1: legibilidade da eval");
  tabela(s, ["Versão", "Linhas", "Operações de efeito", "Aninhamento"], [
    [{ t: "Handlers", cor: HEX.marinho }, "29", "5", "2"],
    ["Imperativa", "29", "5", "2"],
    [{ t: "Mônadas", cor: HEX.rosa }, "27", "18", "1"],
    ["IORef", "27", "18", "1"],
  ], { x: MX, y: 1.95, w: 9.0, colW: [2.6, 1.7, 2.9, 1.8], fontSize: 18, align: ["left", "right", "right", "right"] });
  texto(s, runs("Mecanismo e base **empatam**: a diferença não está na eval."), { x: MX, y: 4.6, w: CW, h: 0.5, fontSize: 20 });
  registrar(s, "QP1: legibilidade da eval",
    "A eval empata. No OCaml, as duas versões têm 29 linhas, 5 operações de efeito e aninhamento 2. No Haskell, 27 linhas, 18 operações e aninhamento 1. O empate vale também construtor por construtor. Então, se existe diferença para escrever, ela está fora da eval.",
    [
      ["Linhas", "linhas de código da eval, sem linhas em branco, depois de formatar com o formatador oficial de cada linguagem."],
      ["Operação de efeito", "cada ponto em que a eval usa um efeito. No OCaml: perform, leitura direta da tabela, raise ou emissão. No Haskell: cada passo monádico (<-) e cada operação sobre estado, erro ou IORef."],
      ["Aninhamento", "profundidade máxima de blocos dentro de blocos, seguindo a Cognitive Complexity (Campbell, 2018), que pune o aninhamento porque código aninhado é mais difícil de entender."],
      ["Empate", "o mecanismo não muda a forma da eval: onde a base faz uma operação direta, o mecanismo faz uma operação de efeito, uma por uma."],
      ["Construtor a construtor", "a contagem também foi feita para cada caso (Num, Var, Add...), e cada caso empata."],
      ["Por que o Haskell tem 18 operações", "porque cada passo monádico (x <- eval a) conta. Não se compara o 18 com o 5: as linguagens são diferentes."],
      ["Contagem automática", "um programa conta as métricas sobre o código formatado, sem contagem à mão."],
    ]);
}

// 14. QP2 handlers
{
  const s = conteudo("Resultados", "QP2: um quarto efeito nos handlers");
  texto(s, "Ler uma entrada (Input) exige instalar mais um handler:", { x: MX, y: 1.8, w: CW, h: 0.5, fontSize: 20 });
  const h = codigo(s, [
    ["  run_state tbl (fun () ->", ""],
    ["- run_output_emit (fun () ->", ""],
    ["-   run_exn (fun () -> eval e)))", ""],
    ["+ run_output_emit (fun () ->", ""],
    ["+   run_input (fun () ->", "(* novo *)", "+"],
    ["+     run_exn (fun () -> eval e))))", ""],
  ].map(([c, m, t]) => [c, m, t || c[0]]), { x: MX, y: 2.5, w: CW, fontSize: 14 });
  tabela(s, ["", "Handlers", "Imperativa"], [["Declarações que mudam", "2", "0"]],
    { x: MX, y: 2.8 + h, w: 7.0, colW: [3.4, 1.8, 1.8], fontSize: 18, align: ["left", "center", "center"] });
  registrar(s, "QP2: um quarto efeito nos handlers",
    "Para testar a composabilidade, acrescentei um quarto efeito: ler valores de uma entrada. Nos handlers, o efeito novo precisa ser instalado onde os outros já são. As linhas em vermelho saem e as em verde entram: o handler novo, run_input, passa a ficar entre o de saída e o de erro. A mesma mudança acontece na composição dos testes, run_acc. Por isso são 2 pontos de modificação. Na imperativa, a leitura é só uma função nova, e nada do que existia muda.",
    [
      ["Quarto efeito (Input)", "ler o próximo valor de um fluxo de entrada. Se a entrada acabar, é erro. Foi escolhido antes de implementar, de propósito, porque interage com o efeito de exceção."],
      ["Linhas com - e +", "- é linha removida (em vermelho), + é linha adicionada (em verde)."],
      ["run", "a composição que instala os handlers em volta da eval, usada na execução normal e nas medições."],
      ["run_acc", "a mesma composição, mas com o handler de saída que acumula os valores, usada nos testes. Também muda."],
      ["Instalar um handler", "colocar o handler em volta de um trecho de código (com match_with). Enquanto o trecho roda, cada perform que ele faz é atendido por esse handler."],
      ["Ordem dos handlers", "um envolve o outro. O de erro fica mais perto da eval, para que um erro interrompa só a avaliação, sem perder o estado e a saída."],
      ["run_input", "o handler novo, que atende Input entregando o próximo valor da entrada."],
      ["Ponto de modificação (declaração que muda)", "declaração que já existia e teve o texto alterado. Adições puras, como a declaração de Input e o próprio run_input, contam à parte. A definição foi fixada antes de implementar."],
    ]);
}

// 15. QP2 mônadas
{
  const s = conteudo("Resultados", "QP2: um quarto efeito nas mônadas");
  texto(s, "O efeito novo entra no tipo da pilha:", { x: MX, y: 1.8, w: CW, h: 0.5, fontSize: 20 });
  const h = codigo(s, [
    ["- ExceptT String (StateT Env IO)", "", "-"],
    ["+ ExceptT String (StateT Env (StateT [Int] IO))", "-- nova camada", "+"],
    ["- run = runStateT (runExceptT ...)", "", "-"],
    ["+ run = runStateT (runStateT ...)", "", "+"],
    ["+ ler = lift (lift (state ...))", "-- função nova", "+"],
  ], { x: MX, y: 2.5, w: CW, fontSize: 14 });
  tabela(s, ["", "Mônadas", "IORef"], [["Declarações que mudam", "2", "0"]],
    { x: MX, y: 2.8 + h, w: 7.0, colW: [3.4, 1.8, 1.8], fontSize: 18, align: ["left", "center", "center"] });
  registrar(s, "QP2: um quarto efeito nas mônadas",
    "No Haskell, o efeito novo vira uma camada a mais na pilha. Então o tipo da pilha muda, e a função run, que executa a pilha, muda junto: também 2 pontos de modificação. A leitura é uma função nova que precisa de dois lift para chegar na camada nova. Na base IORef, como na imperativa, nada do que existia muda. Então handlers e mônadas empatam em 2, e a diferença é onde a mudança cai: nos handlers, nas composições. Nas mônadas, no tipo e no executor.",
    [
      ["StateT [Int]", "camada de estado nova, que guarda a lista de entradas ainda não lidas."],
      ["runStateT, runExceptT", "funções que executam uma camada da pilha e devolvem o resultado. run chama uma para cada camada, de fora para dentro."],
      ["state", "operação que lê e atualiza o estado de uma vez (aqui, tira o primeiro valor da lista)."],
      ["lift", "leva uma operação de uma camada interna da pilha para a camada de fora. Com duas camadas de estado, o get comum só alcança a primeira, então a leitura da segunda precisa de lift duas vezes."],
      ["mtl", "a biblioteca de transformadores usada. Ela resolve automaticamente uma camada de cada tipo, não duas."],
    ]);
}

// 16. QP3
{
  const s = conteudo("Resultados", "QP3: código em volta da eval");
  s.addChart(pres.charts.BAR, [{ name: "linhas", labels: ["IORef", "Mônadas", "Imperativa", "Handlers"], values: [22, 20, 3, 67] }], Object.assign({}, eixo, {
    x: MX, y: 1.75, w: 7.4, h: 4.3, barDir: "bar", valAxisMinVal: 0, valAxisMaxVal: 80, catAxisLabelFontSize: 14,
    chartColors: [HEX.base, HEX.rosa, HEX.base, HEX.marinho], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, showLegend: false,
    barGapWidthPct: 60, showValAxisTitle: true, valAxisTitle: "linhas de infraestrutura", objectName: "gráfico QP3",
  }));
  bullets(s, [
    "**Handlers: 67 contra 3**",
    "**Mônadas: 20 contra 22**",
    "Handlers se recombinam: estado e erro em **run** e **run_acc**",
  ], { x: MX + 7.8, y: 2.2, w: CW - 7.8, h: 2.2, fontSize: 20, paraSpaceAfter: 12 });
  registrar(s, "QP3: código em volta da eval",
    "Fora da eval aparece a diferença. A versão com handlers tem 67 linhas de infraestrutura contra 3 da imperativa, e 18 delas existem só para os testes. No Haskell, mônadas e IORef ficam parecidas: 20 contra 22. Em compensação, esse código é feito de peças que se recombinam. Para os testes, troquei só o handler de saída e reaproveitei os de estado e de erro sem mudar nada: são 2 instâncias de reúso. As outras versões têm zero porque não têm peça para instalar: elas trocam a saída por uma referência a função, colocada de antemão no código. Com um único programa, essa contagem discrimina pouco, e o artigo registra isso. O reúso é a contrapartida do boilerplate.",
    [
      ["Infraestrutura (boilerplate)", "linhas fora da eval que só montam o mecanismo, sem dizer o que o efeito faz. Um programa classifica cada linha sobre os tokens do compilador, e a classificação é auditável em codigo/resultados/boilerplate-regra/."],
      ["67 linhas", "o código dos handlers (run_state, run_exn, run_output_emit, run_output_acc) e das composições run e run_acc."],
      ["18 só para os testes", "o handler de saída que acumula os valores (run_output_acc) e a composição run_acc, usados pela suíte de oráculo para ler o traço."],
      ["3 linhas", "a imperativa só precisa de uma pequena função que executa a eval e captura o erro."],
      ["Reúso (definição do artigo)", "o emprego de um mesmo handler ou camada em mais de um ponto de instalação sem reescrita."],
      ["As 2 instâncias", "run_state (estado) e run_exn (erro) são instalados tanto em run (execução e medições) quanto em run_acc (testes), sem alteração. Só o handler de saída muda: run_output_emit em run, run_output_acc em run_acc."],
      ["Por que 0 nas outras versões", "a saída passa por uma referência a função (emitRef no Haskell, Expr.emit no OCaml) que os testes substituem. Não há handler nem camada sendo reinstalado, então não há o que contar."],
      ["Limite da métrica", "com um único caso de uso, a contagem discrimina pouco (2 contra 0), e o reúso só aparece por causa da suíte de testes. O artigo diz isso na Seção 4.2."],
      ["Contrapartida do boilerplate", "os handlers custam mais linhas, mas essas linhas são peças independentes que se recombinam. As bases conseguiram a mesma flexibilidade com uma indireção planejada antes."],
    ]);
}

// 17. 45 ns
{
  const s = conteudo("Resultados", "QP4: o custo de instalar os handlers");
  texto(s, [{ text: "45 ns", options: { bold: true, color: HEX.marinho } }], { x: MX, y: 1.8, w: CW, h: 1.6, fontSize: 88, align: "center", valign: "middle" });
  texto(s, runs("a mais por expressão, **sem usar nenhum efeito**"), { x: MX, y: 3.45, w: CW, h: 0.6, fontSize: 22, align: "center" });
  texto(s, [{ text: "Haskell: no máximo ", options: {} }, { text: "10 ns", options: { bold: true, color: HEX.rosa } }], { x: MX, y: 4.2, w: CW, h: 0.6, fontSize: 22, align: "center" });
  texto(s, runs("**Instalar** = rodar o código sob o handler, numa pilha própria"), { x: MX, y: 5.3, w: CW, h: 0.5, fontSize: 16, align: "center", color: C.accent6 });
  registrar(s, "QP4: o custo de instalar os handlers",
    "Este é o número que resume o desempenho do OCaml. No cenário Arith, que só faz contas e não usa efeito nenhum, os handlers já custam 45 nanossegundos a mais por expressão. Esse é o custo de instalar os três handlers. Instalar quer dizer rodar o código sob o handler, e o OCaml cria uma pilha própria para isso. No Haskell, a maior diferença em todo o experimento foi de 10 nanossegundos. Os números são a mediana de 3 cargas de 10.000 expressões, numa máquina virtual de nuvem.",
    [
      ["Instalar um handler", "executar o trecho de código sob o handler, com a função match_with do OCaml. Enquanto o trecho roda, cada perform dele é atendido por esse handler. Na composição run, os três handlers (estado, saída e erro) são instalados um dentro do outro em volta da eval."],
      ["Pilha própria (fiber)", "a cada instalação, o OCaml 5 cria um segmento de pilha novo (uma fiber) para o trecho e registra o handler. É trabalho feito antes de qualquer efeito acontecer, e é isso que custa tempo."],
      ["Por expressão", "os handlers são instalados de novo para cada uma das 10.000 expressões da carga. O de erro precisa ser, senão a primeira divisão por zero encerraria a carga inteira. Os outros dois poderiam ser instalados uma vez só, mas foram instalados juntos, o que triplica o custo."],
      ["Sem usar nenhum efeito (Arith)", "cenário só com contas (Num, Add, Mul, Div), sem Var, Let nem Print. Não faz operação de efeito, então mede o custo de estar sob o mecanismo, e não o de usá-lo."],
      ["ns", "nanossegundo, um bilionésimo de segundo."],
      ["10 ns no Haskell", "aparece justamente em Arith, a carga com mais passos monádicos por expressão. É o custo de cada passo (bind) da pilha."],
      ["Mediana de 3 cargas", "cada número é o do meio entre as medições das 3 sementes, o que reduz a influência de uma medição fora da curva."],
      ["Máquina virtual de nuvem", "as medições rodaram numa máquina virtual, como declarado no artigo. Isso é uma ameaça à validade, tratada no protocolo (apêndice A2)."],
    ]);
}

// 18. Tempo
{
  const s = conteudo("Resultados", "QP4: tempo de execução");
  s.addChart(pres.charts.BAR, [
    { name: "mônadas sobre IORef", labels: ["Output", "Exn", "State", "Arith"], values: [-2, 5, -4, 10] },
    { name: "handlers sobre imperativa", labels: ["Output", "Exn", "State", "Arith"], values: [111, 49, 84, 45] },
  ], Object.assign({}, eixo, {
    x: MX, y: 1.7, w: 7.6, h: 4.5, barDir: "bar", catAxisLabelPos: "low", valAxisMinVal: -20, valAxisMaxVal: 130, catAxisLabelFontSize: 14,
    chartColors: [HEX.rosa, HEX.marinho], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, showLegend: true, legendPos: "t",
    legendFontSize: 13, legendColor: HEX.corpo, barGapWidthPct: 50, showValAxisTitle: true, valAxisTitle: "ns a mais por expressão",
    objectName: "gráfico de tempo",
  }));
  bullets(s, [
    "**OCaml:** cresce com o uso",
    "**Haskell:** perto de zero",
  ], { x: MX + 8.0, y: 2.4, w: CW - 8.0, h: 1.6, fontSize: 20, paraSpaceAfter: 12 });
  registrar(s, "QP4: tempo de execução",
    "No OCaml, o custo cresce com o uso: começa em 45 nanossegundos só para instalar e sobe para 84 em State e 111 em Output, porque cada operação de efeito também custa. No Haskell, fica perto de zero em todos os cenários. Em razões, os handlers levaram de 1,59 a 4,26 vezes o tempo da imperativa, e as mônadas de 0,97 a 1,08 vezes o da IORef. Não é uma comparação de qual linguagem é mais rápida: cada barra é o custo a mais sobre a base da própria linguagem.",
    [
      ["Barra azul", "quantos nanossegundos a versão com handlers gasta a mais que a imperativa, por expressão."],
      ["Barra rosa", "quantos nanossegundos a versão com mônadas gasta a mais que a com IORef."],
      ["Arith", "só contas, nenhuma operação de efeito."],
      ["State", "500 variáveis e duas leituras por expressão: muitas operações Get."],
      ["Exn", "20% das expressões têm divisão por zero: muitas operações Fail."],
      ["Output", "cada expressão imprime: muitas operações Output. Os valores são acumulados em vez de escritos, para não medir o sistema de entrada e saída."],
      ["Por que cresce com o uso", "cada perform procura o handler, troca de pilha e volta com continue. Por isso State e Output custam mais que Arith."],
      ["Perto de zero", "o GHC otimiza a pilha de mônadas a ponto de quase não sobrar custo. Três dos quatro intervalos de confiança do Haskell incluem a razão 1."],
      ["Valores negativos", "os valores -4 e -2 são ruído de medição. Não querem dizer que as mônadas são mais rápidas que a base."],
    ]);
}

// 19. Memória
{
  const s = conteudo("Resultados", "QP4: memória alocada");
  s.addChart(pres.charts.BAR, [
    { name: "base", labels: ["Haskell", "OCaml"], values: [127, 16] },
    { name: "a mais nos handlers", labels: ["Haskell", "OCaml"], values: [0, 168] },
    { name: "a mais nas mônadas", labels: ["Haskell", "OCaml"], values: [150, 0] },
  ], Object.assign({}, eixo, {
    x: MX, y: 1.7, w: 7.6, h: 4.0, barDir: "bar", barGrouping: "stacked", valAxisMinVal: 0, valAxisMaxVal: 300, catAxisLabelFontSize: 14,
    chartColors: [HEX.base, HEX.marinho, HEX.rosa], showValue: true, dataLabelPosition: "ctr", dataLabelFormatCode: "#;-#;", dataLabelColor: "FFFFFF", dataLabelFontSize: 13,
    showLegend: true, legendPos: "t", legendFontSize: 13, legendColor: HEX.corpo, barGapWidthPct: 60,
    showValAxisTitle: true, valAxisTitle: "bytes por expressão (Arith)", objectName: "gráfico de memória",
  }));
  bullets(s, [
    "A mais: **parecido**",
    "A base do OCaml quase não aloca",
  ], { x: MX + 8.0, y: 2.4, w: CW - 8.0, h: 1.8, fontSize: 20, paraSpaceAfter: 12 });
  registrar(s, "QP4: memória alocada",
    "Na memória, a razão do OCaml parece dez vezes pior que a do Haskell: 11,5 contra 2,2. Mas a memória a mais é parecida, 168 e 150 bytes por expressão. O que muda é a base: a imperativa do OCaml aloca só 16 bytes. É a fórmula da razão no caso extremo: base barata, razão enorme.",
    [
      ["Bytes por expressão", "quanta memória o programa reserva, em média, para avaliar uma expressão."],
      ["Barra cinza", "a memória da base. Em cima dela, a memória a mais do mecanismo."],
      ["16 B", "a imperativa do OCaml só aloca o próprio resultado."],
      ["127 B", "a base do Haskell aloca mais porque também passa pelo IORef e pelo Map."],
      ["168 B a mais nos handlers", "os fechamentos (funções criadas na hora) e registros de cada instalação. Os segmentos de pilha (fibers) não entram aqui, porque o OCaml 5 os aloca fora da memória contada pelo coletor."],
      ["Razões 11,5 e 2,2", "(16 + 168) ÷ 16 ≈ 11,5 no OCaml e (127 + 150) ÷ 127 ≈ 2,2 no Haskell."],
      ["Como foi contada", "no OCaml, entre duas coletas de lixo chamadas de propósito, para não depender do momento em que o coletor roda."],
    ]);
}

// 20. Achados
{
  const s = conteudo("Resultados", "Dois achados não previstos");
  const box = (x, titulo, numero, cor, txt) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.9, w: 5.55, h: 3.2, fill: { color: HEX.fundo }, line: { color: HEX.texto, width: 0.75 } });
    texto(s, [{ text: titulo, options: { bold: true, color: C.text1 } }], { x: x + 0.3, y: 2.1, w: 4.95, h: 0.5, fontSize: 20 });
    texto(s, [{ text: numero, options: { bold: true, color: cor } }], { x: x + 0.3, y: 2.7, w: 4.95, h: 0.9, fontSize: 36 });
    texto(s, txt, { x: x + 0.3, y: 3.7, w: 4.95, h: 1.2, fontSize: 18 });
  };
  box(MX, "Vazamento no OCaml 5.2", "1,2 GB → 6 MB", HEX.marinho, "com discontinue");
  box(MX + 5.98, "Medição sensível", "até 28%", HEX.laranja, "de mudança, com R² bom");
  registrar(s, "Dois achados não previstos",
    "Dois achados que eu não esperava. Primeiro, um vazamento de memória no OCaml 5.2: se o handler de erro só abandona a computação interrompida, a memória não é liberada. Com 2 milhões de erros, chegou a 1,2 GB. Encerrando com discontinue, ficou em 6 MB, e o código final usa discontinue. O experimento está em codigo/ocaml/experimento/continuacao.ml. Segundo, a medição é sensível à configuração: com uma coleta quatro vezes menor, todas as medições pareciam boas pelo R², acima de 0,95, e mesmo assim as razões mudaram até 28%. Detalhes no apêndice A4.",
    [
      ["Computação interrompida", "a continuação k que o handler de erro recebe quando acontece um Fail: o resto da eval, que não vai mais rodar."],
      ["Abandonar", "simplesmente não usar k. No OCaml 5.2, o segmento de pilha de k fica preso na memória."],
      ["discontinue k e", "retoma k lançando a exceção e dentro dela. A pilha é desmontada normalmente e a memória volta."],
      ["1,2 GB → 6 MB", "memória residente do processo depois de 2 milhões de erros, sem e com discontinue."],
      ["Coleta 4 vezes menor", "corrida curta: cota de 5 segundos e 2.000 amostras, contra 20 segundos na campanha."],
      ["R²", "quanto a reta usada na medição explica os tempos medidos. 1 é perfeito. O critério do protocolo é 0,95 ou mais."],
      ["Lição", "um R² alto sozinho não garante que a configuração de medição foi suficiente."],
    ]);
}

// Seção 05
secao("05", "Conclusões", "Para fechar: como os resultados se comparam com a literatura e o que concluo.");

// 21. Literatura
{
  const s = conteudo("Conclusões", "Comparação com a literatura");
  tabela(s, ["", "Literatura", "Este trabalho"], [
    ["OCaml", "23 ns por fiber", "45 ns para três handlers"],
    ["Haskell", "1,0 a 1,3 vezes", "0,97 a 1,08 vezes"],
    ["TCC I (previsão)", "handlers < 1,5 e mônadas > 2", { t: "o contrário", b: true, cor: HEX.laranja }],
  ], { x: MX, y: 1.95, w: CW, colW: [3.0, 4.4, CW - 7.4], fontSize: 18 });
  texto(s, "Mesma ordem de grandeza.", { x: MX, y: 4.5, w: CW, h: 0.5, fontSize: 20 });
  registrar(s, "Comparação com a literatura",
    "A literatura já tinha medido cada mecanismo separado, mas ninguém tinha comparado os dois no mesmo programa. Os números daqui ficam na mesma ordem de grandeza. Sivaramakrishnan e colegas, em 2021, mediram cerca de 23 nanossegundos para alocar uma fiber e trocar de pilha, da ordem dos 45 que a instalação de três handlers custou aqui. Kammar e colegas, em 2013, e Xie e Leijen, em 2020, mediram mônadas entre 1,0 e 1,3 vezes uma versão sem efeitos, e as daqui ficam no limite de baixo. E a previsão do TCC I não se confirmou: os handlers custaram mais, e as mônadas, menos do que eu esperava. Cada trabalho mede uma situação diferente, então a comparação é de ordem de grandeza.",
    [
      ["Fiber", "o segmento de pilha que o OCaml 5 cria para o trecho de código sob um handler."],
      ["23 ns por fiber", "Sivaramakrishnan et al. (2021) mediram cerca de 23 ns para alocar uma fiber e trocar de pilha. Não é o custo de instalar um handler inteiro."],
      ["1,0 a 1,3 vezes", "Kammar et al. (2013) e Xie e Leijen (2020): a versão com mônadas levou de 1,0 a 1,3 vezes o tempo da versão sem efeitos nos microbenchmarks deles."],
      ["TCC I", "a primeira etapa do trabalho, em que fiz a revisão e a previsão: sobrecusto abaixo de 1,5 vez nos handlers e acima de 2 nas mônadas."],
      ["O contrário", "os handlers passaram de 1,5 vez (1,59 a 4,26) e as mônadas ficaram abaixo de 2 (0,97 a 1,08)."],
      ["Ordem de grandeza", "comparação aproximada, de dezenas de nanossegundos com dezenas de nanossegundos, e não valor exato."],
    ]);
}

// 22. Conclusões
{
  const s = conteudo("Conclusões", "Conclusões");
  [["Escrita", "a eval não muda. O custo está em volta dela."],
   ["Execução", "handlers cobram. Mônadas quase não."],
   ["Na prática", "no OCaml, instale handlers com cuidado."]].forEach(([t, d], i) => {
    const y = 1.95 + i * 0.95;
    texto(s, String(i + 1), { x: MX, y, w: 0.6, h: 0.6, fontSize: 28, color: C.accent4 });
    texto(s, [{ text: t + ": ", options: { bold: true, color: C.text1 } }, { text: d }], { x: MX + 0.7, y, w: CW - 0.7, h: 0.6, fontSize: 22, valign: "middle" });
  });
  texto(s, runs("**Futuro:** os dois mecanismos na mesma linguagem e legibilidade medida com pessoas."), { x: MX, y: 5.0, w: CW, h: 0.7, fontSize: 18 });
  registrar(s, "Conclusões",
    "Três conclusões. Na escrita, a eval não muda, e o custo está no código em volta: nas composições dos handlers e no tipo da pilha de mônadas. Na execução, os handlers cobram para ser instalados e a cada operação, e as mônadas, otimizadas pelo GHC, quase não custam. Na prática, no OCaml vale cuidar de quantas vezes se instala um handler, e no Haskell o custo aparece quando a pilha muda. O trabalho deixa também o desenho da comparação: o argumento de equivalência, a suíte de oráculo, o gerador de cargas igual nas duas linguagens e a medição por razões dentro de cada linguagem. Os limites são um único programa, uma máquina virtual e versões específicas dos compiladores. Os próximos passos são comparar os dois mecanismos na mesma linguagem, testar outros programas e efeitos e medir legibilidade com pessoas.",
    [
      ["Em volta dela", "as composições dos handlers (run e run_acc) e o tipo da pilha de mônadas (type Interp)."],
      ["Contribuições", "argumento de equivalência expressiva, critério de equivalência funcional verificável com a suíte de oráculo, gerador de cargas replicado com teste de conformidade e normalização intralinguagem (medir contra a base da mesma linguagem). Tudo se refaz com make tudo."],
      ["Limites", "um único programa, uma máquina virtual de nuvem e versões específicas do OCaml e do GHC."],
      ["Os dois mecanismos na mesma linguagem", "há bibliotecas de efeitos algébricos para Haskell. Medir nelas eliminaria a diferença de compiladores."],
    ]);
}

// 23. Referências
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
  ], { x: MX, y: 1.7, w: CW, h: 4.9, fontSize: 13, paraSpaceAfter: 5 });
  registrar(s, "Referências", "Slide de consulta, não entra na fala.", []);
}

// 24. Obrigado
{
  const s = pres.addSlide({ masterName: "FINAL", sectionTitle: "Conclusões" });
  s.addText("Obrigado! Dúvidas?", { placeholder: "title" });
  s.addText("github.com/DiegoMarchioni/TCC", { placeholder: "contato" });
  registrar(s, "Obrigado! Dúvidas?", "Obrigado. O código, os dados e o artigo estão no repositório, e tudo se refaz com um comando. Fico à disposição para as perguntas.", []);
}

// Apêndice
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

{
  const s = apendice("A6. Métricas de código");
  tabela(s, ["QP", "Métrica", "Como se mede"], [
    ["QP1", "linhas, operações de efeito, aninhamento", "contagem automática na eval, aninhamento pela Cognitive Complexity"],
    ["QP2", "pontos de modificação", "declarações existentes que mudam ao inserir um quarto efeito"],
    ["QP3", "infraestrutura e reúso", "linhas fora da eval, classificadas por regra mecânica"],
    ["QP4", "razão de tempo e de memória", "mecanismo dividido pela base da mesma linguagem"],
  ], { x: MX, y: 1.85, w: CW, colW: [1.0, 4.2, CW - 5.2], fontSize: 15 });
  registrar(s, "A6. Métricas de código",
    "Se perguntarem como cada QP foi medida: esta tabela resume as métricas.",
    [
      ["Cognitive Complexity", "métrica de Campbell (2018) que pune o aninhamento, porque código aninhado é mais difícil de entender."],
      ["Regra mecânica", "um programa classifica cada linha sobre os tokens do compilador, e não à mão."],
    ]);
}
{
  const s = apendice("A7. Exemplo: avaliando 2 + n, com n = 3");
  tabela(s, ["Passo", "Chamada", "O que acontece", "Resultado"], [
    ["1", { t: 'eval (Add (Num 2, Var "n"))', mono: true }, "caso Add: avalia os dois lados", "–"],
    ["2", { t: "eval (Num 2)", mono: true }, "caso Num: o valor é o próprio número", "2"],
    ["3", { t: 'eval (Var "n")', mono: true }, 'perform (Get "n"): o handler lê n e retoma com o valor', "3"],
    ["4", { t: "x + y", mono: true }, "soma os dois lados", { t: "5", b: true, cor: HEX.verdeazul }],
  ], { x: MX, y: 1.85, w: CW, colW: [1.0, 4.1, 5.1, CW - 10.2], fontSize: 15, align: ["center", "left", "left", "center"] });
  registrar(s, "A7. Exemplo: avaliando 2 + n",
    "Se pedirem para mostrar a eval funcionando: 2 + n, com n valendo 3, passo a passo.",
    [["Retoma", "o handler chama continue k 3, e a eval continua exatamente de onde parou, com 3 como resultado do perform."]]);
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
