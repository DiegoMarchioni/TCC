// Gera apresentacao/defesa.pptx, a versão PowerPoint da defesa.
//
// Segue as skills de .claude/skills/: academic-pptx (conteúdo: títulos de ação,
// um gráfico por slide de resultado, citações no slide, referências, terminar nas
// conclusões) e pptx (técnica: deck estruturado com tema, layouts e seções,
// gráficos nativos, validação). As notas do apresentador vêm do <aside> de cada
// slide em apresentacao/fonte/slides/, o mesmo texto do Guia 06.
//
// Uso, na raiz do repositório (precisa do pptxgenjs: npm install pptxgenjs):
//   NODE_PATH=<pasta node_modules com pptxgenjs> node apresentacao/ferramentas/gerar_pptx.js

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = path.resolve(__dirname, "..", "..");
const FONTE = path.join(RAIZ, "apresentacao", "fonte", "slides");
const SAIDA = path.join(RAIZ, "apresentacao", "defesa.pptx");
const { applyTheme } = require(path.join(RAIZ, ".claude", "skills", "pptx", "scripts", "apply_theme.js"));

// ---- tema --------------------------------------------------------------------
// Academic-pptx: fundo branco, uma fonte, no máximo três cores. Azul marinho nos
// títulos, azul para OCaml (handlers), laranja para Haskell (mônadas), cinza para
// as bases.
const COR = {
  texto: "2D2D2D", fundo: "FFFFFF", marinho: "1F4E79", claro: "F3F5F8",
  ocaml: "2E75B6", haskell: "D9622B", base: "9A9A9A", aviso: "FFF2CC",
  mudo: "6B6B6B", borda: "DDE2E8", menos: "F8E1DA", mais: "DDEFE0",
};
const THEME = {
  name: "Defesa TCC",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: COR.texto, lt1: COR.fundo, dk2: COR.marinho, lt2: COR.claro,
    accent1: COR.ocaml, accent2: COR.haskell, accent3: COR.base, accent4: COR.aviso,
    accent5: COR.marinho, accent6: COR.mudo, hlink: COR.ocaml, folHlink: COR.marinho,
  },
};
const FONTE_CODIGO = "Courier New";
const SECOES = ["Introdução", "Fundamentação", "Metodologia", "Resultados", "Discussão"];

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 polegadas
pres.title = "Mônadas e Efeitos Algébricos em Linguagens Funcionais";
pres.author = "Diego Marchioni";
pres.subject = "Defesa do Trabalho de Conclusão de Curso II";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---- layouts -----------------------------------------------------------------
const rodape = "Diego Marchioni · Mônadas e efeitos algébricos · TCC II";
pres.defineSlideMaster({
  title: "CAPA",
  background: { color: COR.marinho },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.05, w: 8.8, h: 1.5, fontSize: 32, bold: true, color: C.background1, valign: "top", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 2.55, w: 8.8, h: 0.8, fontSize: 18, color: "BFD3EA", valign: "top", align: "left" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTEUDO",
  background: { color: COR.fundo },
  margin: [0.5, 0.5, 0.5, 0.5],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.42, w: 9.0, h: 0.85, fontSize: 24, bold: true, color: C.text2, valign: "top", align: "left" }, text: "" } },
    { text: { text: rodape, options: { x: 0.5, y: 5.2, w: 7.0, h: 0.3, fontSize: 10, color: C.accent6, align: "left" } } },
  ],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: COR.mudo, align: "right" },
});
pres.defineSlideMaster({
  title: "CONCLUSAO",
  background: { color: COR.marinho },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.35, w: 9.0, h: 0.6, fontSize: 24, bold: true, color: C.background1, valign: "top", align: "left" }, text: "" } },
  ],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: "BFD3EA", align: "right" },
});

// ---- notas do apresentador -----------------------------------------------------
function notas(id) {
  const html = fs.readFileSync(path.join(FONTE, `${id}.html`), "utf8");
  const m = html.match(/<aside>([\s\S]*?)<\/aside>/);
  return m ? m[1].trim() : "";
}

// ---- ajudantes -------------------------------------------------------------------
let secaoAtual = null;
function novoSlide(layout, secao, idNotas, extraNotas) {
  if (secao !== secaoAtual) {
    pres.addSection({ title: secao });
    secaoAtual = secao;
  }
  const s = pres.addSlide({ masterName: layout, sectionTitle: secao });
  const n = (idNotas ? notas(idNotas) : "") + (extraNotas ? "\n\n" + extraNotas : "");
  if (n) s.addNotes(n);
  return s;
}

function titulo(s, texto) {
  s.addText(texto, { placeholder: "title" });
}

function trilha(s, ativa) {
  // Academic-pptx: trilha de seções para apresentações com mais de 15 slides.
  const runs = [];
  SECOES.forEach((nome, i) => {
    if (i > 0) runs.push({ text: "   ·   ", options: { color: C.accent6 } });
    runs.push({ text: nome, options: { color: nome === ativa ? C.accent1 : C.accent6, bold: nome === ativa } });
  });
  s.addText(runs, { x: 0.5, y: 0.12, w: 9.0, h: 0.26, fontSize: 10, margin: 0, isTextBox: true, objectName: "trilha" });
}

function citacao(s, texto) {
  s.addText(texto, { x: 0.5, y: 4.88, w: 9.0, h: 0.28, fontSize: 11, color: C.accent6, margin: 0, isTextBox: true, objectName: "citacao" });
}

function texto(s, conteudo, opts) {
  s.addText(conteudo, Object.assign({ fontSize: 20, color: C.text1, valign: "top", margin: 0, isTextBox: true }, opts));
}

function caixa(s, x, y, w, h, nome) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.background2 }, line: { color: COR.borda, width: 0.75 }, rectRadius: 0.08, objectName: nome });
}

// Bloco de código: cada linha é [texto] ou [[trecho, {opções}], ...]; fundo opcional por linha.
function codigo(s, linhas, x, y, w, h, nome, tamanho) {
  caixa(s, x, y, w, h, nome + "-fundo");
  const runs = [];
  linhas.forEach((linha, i) => {
    const partes = typeof linha === "string" ? [[linha, {}]] : linha.partes || linha;
    const realce = linha.realce;
    partes.forEach(([t, o], j) => {
      const op = Object.assign({}, o);
      if (realce) op.highlight = realce;
      if (j === partes.length - 1 && i < linhas.length - 1) op.breakLine = true;
      runs.push({ text: t.length ? t : " ", options: op });
    });
  });
  s.addText(runs, { x: x + 0.12, y: y + 0.1, w: w - 0.24, h: h - 0.2, fontFace: FONTE_CODIGO, fontSize: tamanho || 12, color: C.text1, valign: "top", margin: 0, isTextBox: true, objectName: nome });
}

function rotulo(s, txt, cor, x, y, w) {
  s.addText(txt, { x, y, w, h: 0.32, fontSize: 14, bold: true, color: cor, margin: 0, isTextBox: true });
}

const az = (t) => [t, { color: C.accent1, bold: true }];
const lj = (t) => [t, { color: C.accent2, bold: true }];
const ng = (t) => [t, { bold: true }];
const cz = (t) => [t, { color: C.accent6 }];

// =============================================================================
// 1. Capa
let s = novoSlide("CAPA", "Abertura", "cover");
titulo(s, "Mônadas e Efeitos Algébricos em Linguagens Funcionais");
s.addText("Uma análise comparativa em legibilidade, composabilidade, poder de abstração e desempenho", { placeholder: "body" });
texto(s, [
  { text: "Diego Marchioni", options: { bold: true, breakLine: true } },
  { text: "Orientador: Prof. Marco Rodrigo" },
], { x: 0.6, y: 3.55, w: 8.8, h: 0.7, fontSize: 16, color: C.background1 });
texto(s, "Trabalho de Conclusão de Curso II · Ciência da Computação · PUC Minas · dezembro de 2026", { x: 0.6, y: 4.55, w: 8.8, h: 0.35, fontSize: 12, color: "BFD3EA" });

// 2. Sumário
s = novoSlide("CONTEUDO", "Abertura", "sumario");
titulo(s, "A apresentação segue a ordem do artigo, do problema às conclusões");
const itens = [
  ["Introdução", "o problema e as quatro questões de pesquisa"],
  ["Fundamentação", "mônadas e efeitos algébricos, no código do trabalho"],
  ["Metodologia e implementação", "comparação por razões, caso de uso e as quatro versões"],
  ["Resultados", "legibilidade, composabilidade, abstração e desempenho"],
  ["Discussão e conclusões", "literatura, achados não previstos e trabalhos futuros"],
];
itens.forEach(([a, b], i) => {
  const y = 1.45 + i * 0.66;
  s.addText(String(i + 1), { x: 0.5, y, w: 0.5, h: 0.5, fontSize: 26, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  texto(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { fontSize: 16, color: C.accent6 } }], { x: 1.1, y, w: 8.2, h: 0.62 });
});

// 3. Problema
s = novoSlide("CONTEUDO", "Introdução", "problema");
trilha(s, "Introdução");
titulo(s, "Os dois mecanismos expressam os mesmos efeitos, mas falta medir quanto custa usar cada um");
[["Mônadas · Haskell", C.accent2, "Cada efeito é uma camada de uma pilha, e o efeito aparece no tipo da função"],
 ["Efeitos algébricos · OCaml 5 (2022)", C.accent1, "O código pede a operação, e um handler decide o que ela faz"]].forEach(([r, cor, t], i) => {
  const x = 0.5 + i * 4.6;
  caixa(s, x, 1.5, 4.4, 1.75, "mecanismo-" + i);
  rotulo(s, r, cor, x + 0.2, 1.65, 4.0);
  texto(s, t, { x: x + 0.2, y: 2.05, w: 4.0, h: 1.1 });
});
texto(s, [ng("Lacuna: "), ["nenhum estudo mediu, no mesmo programa, o custo de escrever e o de executar com cada um", {}]].map(([t, o]) => ({ text: t, options: o })), { x: 0.5, y: 3.5, w: 9.0, h: 0.9 });
citacao(s, "Expressividade equivalente: Forster et al. (2017), Schrijvers et al. (2019)");

// 4. Questões de pesquisa
s = novoSlide("CONTEUDO", "Introdução", "qps");
trilha(s, "Introdução");
titulo(s, "O trabalho responde a quatro questões de pesquisa, uma por dimensão");
[["QP1 · Legibilidade", "linhas, operações de efeito e aninhamento da eval"],
 ["QP2 · Composabilidade", "código existente que muda ao inserir um quarto efeito"],
 ["QP3 · Abstração", "código em volta da eval e o quanto dele é reaproveitado"],
 ["QP4 · Desempenho", "tempo e memória contra a base da mesma linguagem"]].forEach(([a, b], i) => {
  const x = 0.5 + (i % 2) * 4.6, y = 1.45 + Math.floor(i / 2) * 1.55;
  caixa(s, x, y, 4.4, 1.35, "qp-" + i);
  rotulo(s, a, C.text2, x + 0.2, y + 0.15, 4.0);
  texto(s, b, { x: x + 0.2, y: y + 0.55, w: 4.0, h: 0.75, fontSize: 18 });
});
citacao(s, "Métricas de código só comparam versões da mesma linguagem: handlers × imperativa, mônadas × IORef");

// 5. Mecanismos no código
s = novoSlide("CONTEUDO", "Fundamentação", "mecanismos");
trilha(s, "Fundamentação");
titulo(s, "No Haskell o efeito está no tipo, no OCaml numa operação que o handler interpreta");
rotulo(s, "Mônadas · Monadic.hs", C.accent2, 0.5, 1.4, 4.4);
codigo(s, [
  "type Env = Map String Int",
  "type Interp a =",
  [["  ", {}], lj("ExceptT String (StateT Env IO)"), [" a", {}]],
  "",
  "eval (Var x) = do",
  [["  env <- ", {}], lj("get")],
  [["  maybe (", {}], lj("throwError"), [" (msgUnbound x))", {}]],
  "        return (Map.lookup x env)",
], 0.5, 1.75, 4.4, 2.35, "codigo-haskell", 12);
texto(s, "get lê o estado, throwError lança o erro", { x: 0.5, y: 4.2, w: 4.4, h: 0.3, fontSize: 14, color: C.accent6 });
rotulo(s, "Efeitos algébricos · interp_effects.ml", C.accent1, 5.1, 1.4, 4.4);
codigo(s, [
  "type _ Effect.t +=",
  [["  | ", {}], az("Get"), [" : string -> int option Effect.t", {}]],
  [["  | ", {}], az("Set"), [" : string * int -> unit Effect.t", {}]],
  [["  | ", {}], az("Fail"), [" : string -> 'a Effect.t", {}]],
  [["  | ", {}], az("Output"), [" : int -> unit Effect.t", {}]],
  [cz("(* handler de estado *)")],
  "| Get x -> Some (fun k ->",
  [["    ", {}], az("continue"), [" k (Hashtbl.find_opt tbl x))", {}]],
], 5.1, 1.75, 4.4, 2.35, "codigo-ocaml", 12);
texto(s, "o handler responde e retoma com continue", { x: 5.1, y: 4.2, w: 4.4, h: 0.3, fontSize: 14, color: C.accent6 });
citacao(s, "Trechos de codigo/haskell/src/Interp/Monadic.hs e codigo/ocaml/effects/interp_effects.ml, sem as anotações de tipo");

// 6. Método
s = novoSlide("CONTEUDO", "Metodologia", "metodo");
trilha(s, "Metodologia");
titulo(s, "Cada mecanismo é medido contra uma base na própria linguagem, e a razão depende dessa base");
[["Handlers (OCaml)", "Imperativa (OCaml)", "razão do OCaml", C.accent1],
 ["Mônadas (Haskell)", "IORef (Haskell)", "razão do Haskell", C.accent2]].forEach(([a, b, r, cor], i) => {
  const y = 1.5 + i * 0.75;
  caixa(s, 0.5, y, 2.6, 0.55, "mec-" + i);
  texto(s, a, { x: 0.6, y: y + 0.1, w: 2.4, h: 0.4, fontSize: 16, bold: true, color: cor });
  texto(s, "÷", { x: 3.2, y: y + 0.08, w: 0.3, h: 0.4, fontSize: 20, color: C.accent6, align: "center" });
  caixa(s, 3.6, y, 2.6, 0.55, "base-" + i);
  texto(s, b, { x: 3.7, y: y + 0.1, w: 2.4, h: 0.4, fontSize: 16, color: C.text1 });
  texto(s, "=", { x: 6.3, y: y + 0.08, w: 0.3, h: 0.4, fontSize: 20, color: C.accent6, align: "center" });
  texto(s, r, { x: 6.7, y: y + 0.1, w: 2.8, h: 0.4, fontSize: 16, bold: true, color: cor });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 3.15, w: 9.0, h: 1.45, fill: { color: C.accent4 }, line: { color: "E6C800", width: 0.75 }, rectRadius: 0.08, objectName: "formula-fundo" });
texto(s, "razão = 1 + Δ / base", { x: 0.75, y: 3.35, w: 3.6, h: 0.6, fontSize: 26, bold: true, color: C.text2 });
texto(s, [
  { text: "Δ é o custo a mais do mecanismo.", options: { breakLine: true } },
  { text: "Base barata deixa a razão grande, por isso a comparação entre linguagens é só indicativa." },
], { x: 4.5, y: 3.3, w: 4.8, h: 1.2, fontSize: 16 });
citacao(s, "Mecanismo e base usam a mesma estrutura de dados: Hashtbl no OCaml, Map no Haskell");

// 7. Caso de uso
s = novoSlide("CONTEUDO", "Metodologia", "caso-de-uso");
trilha(s, "Metodologia");
titulo(s, "Um interpretador pequeno exercita estado, exceção e saída, com equivalência fixada antes do código");
["Num", "Var", "Add", "Mul", "Div", "Let", "Seq", "Print"].forEach((c, i) => {
  const x = 0.5 + (i % 4) * 1.05, y = 1.6 + Math.floor(i / 4) * 0.7;
  caixa(s, x, y, 0.95, 0.5, "construtor-" + c);
  s.addText(c, { x, y, w: 0.95, h: 0.5, fontFace: FONTE_CODIGO, fontSize: 16, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
});
texto(s, [
  { text: "Estado: ", options: { bold: true } }, { text: "Var lê, Let guarda", options: { breakLine: true } },
  { text: "Exceção: ", options: { bold: true } }, { text: "divisão por zero, variável inexistente", options: { breakLine: true } },
  { text: "Saída: ", options: { bold: true } }, { text: "Print mostra um valor" },
], { x: 4.9, y: 1.55, w: 4.6, h: 1.5, fontSize: 18, paraSpaceAfter: 6 });
texto(s, [
  { text: "Equivalência: ", options: { bold: true } },
  { text: "mesmo valor, mesmo estado, mesma saída e mesmo erro que a semântica formal" },
], { x: 0.5, y: 3.35, w: 9.0, h: 0.75 });
citacao(s, "Semântica small-step no estilo de Felleisen e Hieb (1992). Simplificações: variáveis globais, erro sempre aborta, um único programa");

// 8. eval
s = novoSlide("CONTEUDO", "Metodologia", "eval");
trilha(s, "Metodologia");
titulo(s, "A eval calcula o valor de cada expressão, e os efeitos acontecem dentro dela");
codigo(s, [
  "let rec eval = function",
  [["  | ", {}], ng("Num"), [" n -> n", {}]],
  [["  | ", {}], ng("Var"), [" x -> (", {}]],
  [["      match ", {}], az("perform (Get x)"), [" with", {}]],
  "      | Some v -> v",
  [["      | None -> ", {}], az("perform (Fail ...)"), [")", {}]],
  [["  | ", {}], ng("Add"), [" (a, b) ->", {}]],
  "      let x = eval a in",
  "      let y = eval b in",
  "      x + y",
], 0.5, 1.4, 4.6, 3.3, "codigo-eval", 13);
const passos = [
  ["eval (Add (Num 2, Var \"n\"))", "caso Add: avalia os dois lados"],
  ["eval (Num 2)", "caso Num: devolve 2"],
  ["eval (Var \"n\")", "caso Var: pede n, o handler devolve 3"],
  ["x + y", "volta ao caso Add: 2 + 3 = 5"],
];
texto(s, "Rodando 2 + n, com n = 3", { x: 5.35, y: 1.4, w: 4.15, h: 0.32, fontSize: 14, bold: true, color: C.accent6 });
passos.forEach(([c, d], i) => {
  const y = 1.8 + i * 0.73;
  s.addShape(pres.shapes.OVAL, { x: 5.35, y: y + 0.02, w: 0.32, h: 0.32, fill: { color: i === 2 ? C.accent1 : C.text2 }, line: { color: i === 2 ? COR.ocaml : COR.marinho }, objectName: "passo-" + i });
  s.addText(String(i + 1), { x: 5.35, y: y + 0.02, w: 0.32, h: 0.32, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  texto(s, [{ text: c, options: { fontFace: FONTE_CODIGO, fontSize: 12, breakLine: true } }, { text: d, options: { fontSize: 13, color: i === 2 ? C.accent1 : C.accent6, bold: i === 2 } }], { x: 5.8, y, w: 3.7, h: 0.66 });
});
citacao(s, "Trecho de codigo/ocaml/effects/interp_effects.ml. Os outros cinco casos seguem a mesma ideia");

// 9. Verificação
s = novoSlide("CONTEUDO", "Metodologia", "implementacoes");
trilha(s, "Metodologia");
titulo(s, "Nada foi medido antes de as quatro versões passarem nos testes de equivalência");
texto(s, [
  { text: "OCaml: ", options: { bold: true, color: C.accent1 } }, { text: "handlers e base imperativa   " },
  { text: "Haskell: ", options: { bold: true, color: C.accent2 } }, { text: "mônadas e base com IORef" },
], { x: 0.5, y: 1.45, w: 9.0, h: 0.45, fontSize: 18 });
[["61/61", "testes passando em cada linguagem"], ["8/8", "erros colocados de propósito, todos detectados"], ["12", "cargas de expressões idênticas nas duas linguagens"]].forEach(([n, d], i) => {
  const x = 0.5 + i * 3.07;
  caixa(s, x, 2.15, 2.86, 2.2, "estatistica-" + i);
  s.addText(n, { x: x + 0.2, y: 2.3, w: 2.5, h: 0.95, fontSize: 44, bold: true, color: C.text2, margin: 0, isTextBox: true });
  texto(s, d, { x: x + 0.2, y: 3.3, w: 2.5, h: 0.9, fontSize: 16 });
});
citacao(s, "Testes: codigo/ocaml/test/test_oracle.ml e codigo/haskell/test/Spec.hs. Mutações: codigo/scripts/mutantes.py");

// 10. Mesmo trecho com e sem handlers
s = novoSlide("CONTEUDO", "Metodologia", "codigo");
trilha(s, "Metodologia");
titulo(s, "Com handlers, cada operação direta da base vira exatamente uma operação de efeito");
rotulo(s, "Handlers · interp_effects.ml", C.accent1, 0.5, 1.45, 4.4);
codigo(s, [
  "| Var x -> (",
  [["    match ", {}], az("perform (Get x)"), [" with", {}]],
  "    | Some v -> v",
  [["    | None -> ", {}], az("perform (Fail")],
  [["        ", {}], az("(msg_unbound x))"), [")", {}]],
], 0.5, 1.8, 4.4, 1.9, "codigo-handlers", 13);
rotulo(s, "Imperativa · interp_imp.ml", C.accent6, 5.1, 1.45, 4.4);
codigo(s, [
  "| Var x -> (",
  [["    match ", {}], ng("Hashtbl.find_opt env x"), [" with", {}]],
  "    | Some v -> v",
  [["    | None -> ", {}], ng("raise (Runtime_error")],
  [["        ", {}], ng("(msg_unbound x))"), [")", {}]],
], 5.1, 1.8, 4.4, 1.9, "codigo-imperativa", 13);
texto(s, "A estrutura é a mesma, linha por linha: a diferença medida é só o mecanismo", { x: 0.5, y: 3.95, w: 9.0, h: 0.7 });
citacao(s, "Código completo, testes e scripts: github.com/DiegoMarchioni/TCC, pasta codigo/");

// 11. QP1
s = novoSlide("CONTEUDO", "Resultados", "qp1");
trilha(s, "Resultados");
titulo(s, "QP1: o mecanismo não muda o tamanho, as operações nem o aninhamento da eval");
const cab = (t, al) => ({ text: t, options: { bold: true, color: C.accent6, align: al || "right", fill: { color: C.background2 } } });
const cel = (t, o) => ({ text: t, options: Object.assign({ align: "right" }, o || {}) });
s.addTable([
  [cab("Versão", "left"), cab("Linhas"), cab("Operações"), cab("Aninhamento")],
  [cel("Handlers (OCaml)", { align: "left", color: C.accent1, bold: true }), cel("29"), cel("5"), cel("2")],
  [cel("Imperativa (OCaml)", { align: "left" }), cel("29"), cel("5"), cel("2")],
  [cel("Mônadas (Haskell)", { align: "left", color: C.accent2, bold: true }), cel("27"), cel("18"), cel("1")],
  [cel("IORef (Haskell)", { align: "left" }), cel("27"), cel("18"), cel("1")],
], { x: 0.5, y: 1.45, w: 9.0, colW: [3.3, 1.5, 2.4, 1.8], fontSize: 18, color: C.text1, border: { type: "solid", pt: 0.75, color: COR.borda }, rowH: 0.48, margin: 0.08, objectName: "tabela-qp1" });
texto(s, "O empate vale também construtor a construtor. Se há diferença ao escrever, ela está fora da eval", { x: 0.5, y: 4.15, w: 9.0, h: 0.65, fontSize: 17 });
citacao(s, "Contagem automática sobre o código formatado. Aninhamento segundo a Cognitive Complexity (Campbell, 2018)");

// 12. QP3 (código em volta da eval)
s = novoSlide("CONTEUDO", "Resultados", "qp2-qp3");
trilha(s, "Resultados");
titulo(s, "QP3: o custo de escrita está no código em volta da eval, sobretudo nos handlers");
const versoes = ["Handlers (OCaml)", "Imperativa (OCaml)", "Mônadas (Haskell)", "IORef (Haskell)"];
s.addChart(pres.charts.BAR, [
  { name: "Handlers", labels: versoes, values: [67, 0, 0, 0] },
  { name: "Mônadas", labels: versoes, values: [0, 0, 20, 0] },
  { name: "Bases", labels: versoes, values: [0, 3, 0, 22] },
], {
  x: 0.5, y: 1.35, w: 5.6, h: 3.45, barDir: "bar", barGrouping: "stacked", barGapWidthPct: 45,
  chartColors: [COR.ocaml, COR.haskell, COR.base], catAxisOrientation: "maxMin",
  showValue: true, dataLabelPosition: "inEnd", dataLabelFormatCode: "0;-0;;", dataLabelColor: "FFFFFF", dataLabelFontSize: 12, dataLabelFontBold: true,
  catAxisLabelFontSize: 12, catAxisLabelColor: COR.texto, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
  showLegend: false, showTitle: true, title: "Linhas de infraestrutura fora da eval", titleFontSize: 13, titleColor: COR.mudo,
  catAxisLabelFontFace: "Arial", dataLabelFontFace: "Arial", titleFontFace: "Arial", objectName: "grafico-qp3",
});
texto(s, [
  { text: "Handlers: 67 linhas contra 3, ", options: { bold: true } }, { text: "18 delas só para os testes", options: { breakLine: true } },
  { text: "Haskell: 20 contra 22", options: { bold: true, breakLine: true } },
  { text: "Reaproveitamento só nos handlers: ", options: { bold: true } }, { text: "2 handlers usados em dois lugares" },
], { x: 6.35, y: 1.5, w: 3.15, h: 3.2, fontSize: 16, paraSpaceAfter: 10 });
citacao(s, "Classificação de cada linha por regra mecânica, auditável em codigo/resultados/boilerplate-regra/");

// 13. QP2 (quarto efeito no código)
s = novoSlide("CONTEUDO", "Resultados", "acoplamento");
trilha(s, "Resultados");
titulo(s, "QP2: para um quarto efeito, só os mecanismos mudam código existente, dois pontos em cada");
rotulo(s, "Handlers · composição run (e run_acc)", C.accent1, 0.5, 1.4, 4.5);
codigo(s, [
  "  run_state tbl (fun () ->",
  { partes: [["- run_output_emit (fun () ->", {}]], realce: COR.menos },
  { partes: [["-   run_exn (fun () -> eval e)))", {}]], realce: COR.menos },
  { partes: [["+ run_output_emit (fun () ->", {}]], realce: COR.mais },
  { partes: [["+   ", {}], ng("run_input"), [" (fun () ->", {}]], realce: COR.mais },
  { partes: [["+     run_exn (fun () -> eval e))))", {}]], realce: COR.mais },
], 0.5, 1.75, 4.5, 1.85, "diff-handlers", 12);
rotulo(s, "Mônadas · tipo da pilha e run", C.accent2, 5.15, 1.4, 4.35);
codigo(s, [
  { partes: [["- ExceptT String (StateT Env IO)", {}]], realce: COR.menos },
  { partes: [["+ ExceptT String (StateT Env", {}]], realce: COR.mais },
  { partes: [["+   (", {}], ng("StateT [Int]"), [" IO))", {}]], realce: COR.mais },
  { partes: [["- run: runStateT (runExceptT ...)", {}]], realce: COR.menos },
  { partes: [["+ run: runStateT (runStateT ...)", {}]], realce: COR.mais },
  [["  ler = ", {}], ng("lift (lift"), [" (state ...))", {}]],
], 5.15, 1.75, 4.35, 1.85, "diff-monadas", 12);
texto(s, [
  { text: "Pontos de modificação: ", options: { bold: true } },
  { text: "handlers 2, imperativa 0, mônadas 2, IORef 0. Nas bases, entra só uma função nova de leitura" },
], { x: 0.5, y: 3.85, w: 9.0, h: 0.75, fontSize: 17 });
citacao(s, "Diff completo em codigo/quarto-efeito/input.patch. O handler run_input e a função ler são adições");

// 14. Destaque
s = novoSlide("CONTEUDO", "Resultados", "destaque");
trilha(s, "Resultados");
titulo(s, "Sem nenhum efeito, os handlers do OCaml já custam 45 ns a mais por expressão");
s.addText("45 ns", { x: 0.5, y: 1.55, w: 4.2, h: 1.6, fontSize: 80, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: "estatistica-45" });
texto(s, "por expressão no cenário Arith, que só faz contas: é o custo de instalar os três handlers", { x: 4.9, y: 1.75, w: 4.6, h: 1.3 });
s.addText("10 ns", { x: 0.5, y: 3.3, w: 4.2, h: 0.9, fontSize: 44, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: "estatistica-10" });
texto(s, "é a maior diferença das mônadas sobre a base em todo o experimento", { x: 4.9, y: 3.35, w: 4.6, h: 0.9 });
citacao(s, "Mediana de 3 cargas de 10.000 expressões, em máquina virtual de nuvem (Tabela 2 do artigo)");

// 15. Tempo
s = novoSlide("CONTEUDO", "Resultados", "tempo");
trilha(s, "Resultados");
titulo(s, "QP4: no OCaml o custo cresce com as operações de efeito, no Haskell fica perto de zero");
const cenarios = ["Arith", "State", "Exn", "Output"];
s.addChart(pres.charts.BAR, [
  { name: "Handlers sobre imperativa (OCaml)", labels: cenarios, values: [45, 84, 49, 111] },
  { name: "Mônadas sobre IORef (Haskell)", labels: cenarios, values: [10, -4, 5, -2] },
], {
  x: 0.5, y: 1.3, w: 5.7, h: 3.5, barDir: "col", barGrouping: "clustered", barGapWidthPct: 60,
  chartColors: [COR.ocaml, COR.haskell], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: COR.texto,
  catAxisLabelFontSize: 13, catAxisLabelColor: COR.texto, valAxisLabelFontSize: 10, valAxisLabelColor: COR.mudo,
  valAxisTitle: "ns a mais por expressão", showValAxisTitle: true, valAxisTitleFontSize: 11, valAxisTitleColor: COR.mudo,
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: COR.texto,
  catAxisLabelFontFace: "Arial", valAxisLabelFontFace: "Arial", dataLabelFontFace: "Arial", legendFontFace: "Arial", valAxisTitleFontFace: "Arial",
  objectName: "grafico-tempo",
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.42, y: 2.3, w: 1.22, h: 0.3, fill: { color: C.accent4 }, line: { color: "E6C800", width: 0.75 }, rectRadius: 0.06, objectName: "anotacao-fundo" });
s.addText("Arith: só instalar", { x: 1.42, y: 2.3, w: 1.22, h: 0.3, fontSize: 11, bold: true, color: "7A5200", align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: "anotacao" });
texto(s, [
  { text: "OCaml: ", options: { bold: true, color: C.accent1 } }, { text: "custo de instalar mais o de cada operação", options: { breakLine: true } },
  { text: "Haskell: ", options: { bold: true, color: C.accent2 } }, { text: "o compilador apaga quase tudo", options: { breakLine: true } },
  { text: "Razões: ", options: { bold: true } }, { text: "1,59 a 4,26 e 0,97 a 1,08" },
], { x: 6.45, y: 1.5, w: 3.05, h: 3.2, fontSize: 16, paraSpaceAfter: 10 });
citacao(s, "Excedente sobre a base da mesma linguagem, mediana de 3 cargas, máquina virtual de nuvem");

// 16. Memória
s = novoSlide("CONTEUDO", "Resultados", "alocacao");
trilha(s, "Resultados");
titulo(s, "A razão de memória do OCaml é alta porque a base quase não aloca");
s.addChart(pres.charts.BAR, [
  { name: "Base", labels: ["OCaml", "Haskell"], values: [16, 127] },
  { name: "A mais nos handlers", labels: ["OCaml", "Haskell"], values: [168, 0] },
  { name: "A mais nas mônadas", labels: ["OCaml", "Haskell"], values: [0, 150] },
], {
  x: 0.5, y: 1.35, w: 5.7, h: 3.0, barDir: "bar", barGrouping: "stacked", barGapWidthPct: 50,
  chartColors: [COR.base, COR.ocaml, COR.haskell], catAxisOrientation: "maxMin",
  showValue: true, dataLabelPosition: "ctr", dataLabelFormatCode: "0;-0;;", dataLabelColor: "FFFFFF", dataLabelFontSize: 12, dataLabelFontBold: true,
  catAxisLabelFontSize: 14, catAxisLabelColor: COR.texto, valAxisHidden: true,
  showTitle: true, title: "Bytes por expressão, cenário Arith", titleFontSize: 13, titleColor: COR.mudo, titleFontFace: "Arial",
  valGridLine: { style: "none" }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: COR.texto,
  catAxisLabelFontFace: "Arial", valAxisLabelFontFace: "Arial", dataLabelFontFace: "Arial", legendFontFace: "Arial", valAxisTitleFontFace: "Arial",
  objectName: "grafico-memoria",
});
texto(s, [
  { text: "A mais: ", options: { bold: true } }, { text: "168 B e 150 B, parecidos", options: { breakLine: true } },
  { text: "Base: ", options: { bold: true } }, { text: "16 B no OCaml, 127 B no Haskell", options: { breakLine: true } },
  { text: "Razões: ", options: { bold: true } }, { text: "11,5 e 2,2, efeito da fórmula 1 + Δ / base" },
], { x: 6.45, y: 1.5, w: 3.05, h: 3.2, fontSize: 16, paraSpaceAfter: 10 });
citacao(s, "No OCaml, alocação contada diretamente entre duas coletas forçadas");

// 17. Achados
s = novoSlide("CONTEUDO", "Resultados", "achados");
trilha(s, "Resultados");
titulo(s, "Dois achados não previstos: um vazamento de memória e uma medição sensível à configuração");
[["1,2 GB → 6 MB", "Abandonar a computação interrompida vaza memória no OCaml 5.2. Encerrá-la com discontinue resolve (2 milhões de erros)", C.accent1],
 ["até 28%", "Com coleta 4 vezes menor, todos os R² passam de 0,95 e mesmo assim as razões mudam", C.text2]].forEach(([n, d, cor], i) => {
  const x = 0.5 + i * 4.6;
  caixa(s, x, 1.45, 4.4, 3.2, "achado-" + i);
  s.addText(n, { x: x + 0.25, y: 1.65, w: 3.9, h: 0.9, fontSize: 36, bold: true, color: cor, margin: 0, isTextBox: true });
  texto(s, d, { x: x + 0.25, y: 2.7, w: 3.9, h: 1.8, fontSize: 17 });
});
citacao(s, "Experimento em codigo/ocaml/experimento/continuacao.ml. Sensibilidade no Apêndice A4");

// 18. Literatura
s = novoSlide("CONTEUDO", "Discussão", "literatura");
trilha(s, "Discussão");
titulo(s, "Os resultados ficam na ordem de grandeza da literatura, mas contrariam a previsão do TCC I");
s.addTable([
  [cab("Fonte", "left"), cab("O que a fonte mede", "left"), cab("Neste trabalho", "left")],
  [cel("Sivaramakrishnan et al. (2021)", { align: "left" }), cel("cerca de 23 ns para instalar um handler", { align: "left" }), cel("45 ns para três handlers", { align: "left" })],
  [cel("Kammar et al. (2013), Xie e Leijen (2020)", { align: "left" }), cel("mônadas a 1,0 a 1,3× uma versão sem efeitos", { align: "left" }), cel("0,97 a 1,08×", { align: "left" })],
  [cel("TCC I (previsão)", { align: "left", bold: true }), cel("handlers abaixo de 1,5× e mônadas acima de 2×", { align: "left" }), cel("o contrário nos dois casos", { align: "left", bold: true, color: C.accent2 })],
], { x: 0.5, y: 1.45, w: 9.0, colW: [3.0, 3.5, 2.5], fontSize: 15, color: C.text1, border: { type: "solid", pt: 0.75, color: COR.borda }, margin: 0.08, objectName: "tabela-literatura" });
citacao(s, "Cada trabalho mede uma situação diferente, então a comparação é de ordem de grandeza");

// 19. Conclusões (último slide principal, fica na tela durante a arguição)
s = novoSlide("CONCLUSAO", "Discussão", "conclusoes", notas("perguntas").replace(/^\([^)]*\)[^\n]*\n\n/, ""));
titulo(s, "Conclusões");
texto(s, [
  { text: "1. Escrita: ", options: { bold: true } }, { text: "a eval não muda. O custo está no código em volta, nas composições dos handlers e no tipo da pilha de mônadas", options: { breakLine: true } },
  { text: "2. Execução: ", options: { bold: true } }, { text: "handlers cobram ao ser instalados e a cada operação. As mônadas, otimizadas pelo GHC, quase não custam", options: { breakLine: true } },
  { text: "3. Na prática: ", options: { bold: true } }, { text: "no OCaml, cuidado com quantas vezes se instala um handler. No Haskell, o custo aparece quando a pilha muda" },
], { x: 0.5, y: 1.05, w: 9.0, h: 2.75, fontSize: 18, color: C.background1, paraSpaceAfter: 12 });
texto(s, [
  { text: "Limites: ", options: { bold: true } }, { text: "um programa, uma máquina virtual, versões específicas.  ", options: {} },
  { text: "Futuro: ", options: { bold: true } }, { text: "os dois numa mesma linguagem, outros programas, legibilidade com pessoas" },
], { x: 0.5, y: 3.9, w: 9.0, h: 0.7, fontSize: 13, color: "BFD3EA" });
texto(s, "Código, dados e artigo: github.com/DiegoMarchioni/TCC · make tudo refaz cada número", { x: 0.5, y: 4.75, w: 8.3, h: 0.35, fontSize: 13, color: C.background1 });

// 20. Referências
s = novoSlide("CONTEUDO", "Referências", null, "Slide de consulta, não entra na fala.");
titulo(s, "Referências");
const refs = [
  "Campbell, G. A. (2018). Cognitive complexity: an overview and evaluation. TechDebt '18, ACM, 57–58.",
  "Felleisen, M. e Hieb, R. (1992). The revised report on the syntactic theories of sequential control and state. Theoretical Computer Science, 103(2), 235–271.",
  "Forster, Y., Kammar, O., Lindley, S. e Pretnar, M. (2017). On the expressive power of user-defined effects. PACMPL, 1(ICFP), 13:1–13:29.",
  "Kammar, O., Lindley, S. e Oury, N. (2013). Handlers in action. ICFP '13, ACM, 145–158.",
  "Marchioni, D. (2026). Mônadas e efeitos algébricos em linguagens funcionais. Relatório do TCC I, PUC Minas.",
  "Schrijvers, T., Piróg, M., Wu, N. e Jaskelioff, M. (2019). Monad transformers and modular algebraic effects: what binds them together. Haskell 2019, ACM, 98–113.",
  "Sivaramakrishnan, K. C. et al. (2021). Retrofitting effect handlers onto OCaml. PLDI 2021, ACM, 206–221.",
  "Xie, N. e Leijen, D. (2020). Effect handlers in Haskell, evidently. Haskell 2020, ACM, 95–108.",
];
texto(s, refs.map((r, i) => ({ text: r, options: { breakLine: i < refs.length - 1 } })), { x: 0.5, y: 1.25, w: 9.0, h: 3.8, fontSize: 12, paraSpaceAfter: 6 });

// ---- Apêndice --------------------------------------------------------------------
function apendice(id, rotuloAp, tit) {
  const sl = novoSlide("CONTEUDO", "Apêndice", id);
  sl.addText(rotuloAp, { x: 0.5, y: 0.12, w: 9.0, h: 0.26, fontSize: 10, italic: true, color: C.accent6, margin: 0, isTextBox: true, objectName: "rotulo-apendice" });
  titulo(sl, tit);
  return sl;
}

// A1
s = apendice("ap-tabela2", "Apêndice A1 · Tabela 2 completa", "Todos os números de tempo e memória");
const lin = (c, v) => [cel(c, { align: "left" })].concat(v.map((x) => cel(x)));
s.addTable([
  [cab("Cenário", "left"), cab("base"), cab("Δ"), cab("razão"), cab("base"), cab("Δ"), cab("razão")],
  lin("Arith", ["77", "45", "1,59", "96", "10", "1,08"]),
  lin("State", ["87", "84", "1,98", "346", "−4", "0,99"]),
  lin("Exn", ["77", "49", "1,63", "95", "5", "1,05"]),
  lin("Output", ["34", "111", "4,26", "41", "−2", "0,97"]),
], { x: 0.5, y: 1.75, w: 4.4, colW: [1.0, 0.55, 0.55, 0.65, 0.55, 0.5, 0.6], fontSize: 12, color: C.text1, border: { type: "solid", pt: 0.5, color: COR.borda }, margin: 0.04, objectName: "tabela-tempo" });
s.addTable([
  [cab("Cenário", "left"), cab("base"), cab("Δ"), cab("razão"), cab("base"), cab("Δ"), cab("razão")],
  lin("Arith", ["16", "168", "11,5", "127", "150", "2,2"]),
  lin("State", ["48", "382", "9,0", "117", "9", "1,1"]),
  lin("Exn", ["16", "187", "12,7", "119", "136", "2,1"]),
  lin("Output", ["64", "360", "6,6", "104", "8", "1,1"]),
], { x: 5.1, y: 1.75, w: 4.4, colW: [1.0, 0.55, 0.55, 0.65, 0.55, 0.5, 0.6], fontSize: 12, color: C.text1, border: { type: "solid", pt: 0.5, color: COR.borda }, margin: 0.04, objectName: "tabela-memoria" });
texto(s, "Tempo, ns por expressão (OCaml | Haskell)", { x: 0.5, y: 1.4, w: 4.4, h: 0.28, fontSize: 12, bold: true });
texto(s, "Memória, bytes por expressão (OCaml | Haskell)", { x: 5.1, y: 1.4, w: 4.4, h: 0.28, fontSize: 12, bold: true });
texto(s, "IC de 95% da razão de tempo: nenhum inclui 1 no OCaml, e no Haskell só o de Arith o exclui ([1,04; 1,18]). Dispersão entre sementes de até 18,3% no tempo. Menor R²: 0,954 (Bechamel) e 0,973 (Criterion)", { x: 0.5, y: 3.75, w: 9.0, h: 0.9, fontSize: 13 });

// A2
s = apendice("ap-protocolo", "Apêndice A2 · Protocolo de medição", "O protocolo fixa máquina, compilação, cargas e critérios de qualidade");
const prot = [
  ["Máquina", "Intel Xeon @ 2,10 GHz, 4 vCPU, máquina virtual de nuvem, Ubuntu 24.04.5, afinidade fixa num núcleo"],
  ["Compilação", "OCaml 5.2.1 + flambda com -O3 e GHC 9.4.7 com -O2, iguais para mecanismo e base"],
  ["Harnesses", "Bechamel 0.5.0 (cota de 20 s, limit 5000) e Criterion 1.6.1.0 (1.000 reamostragens)"],
  ["Cargas", "4 cenários × 10.000 expressões × 3 sementes (42, 43, 44), geradas fora da região medida"],
  ["Regras", "oráculo como pré-condição, ordem alternada, R² ≥ 0,95 (um par com 0,949 foi remedido: 0,962)"],
  ["Execução", "pela ferramenta de IA, em sessão na nuvem, como declara o artigo. make tudo refaz tudo"],
];
s.addTable([[cab("Item", "left"), cab("Configuração", "left")]].concat(prot.map(([a, b]) => [cel(a, { align: "left", bold: true }), cel(b, { align: "left" })])),
  { x: 0.5, y: 1.4, w: 9.0, colW: [1.6, 7.4], fontSize: 13, color: C.text1, border: { type: "solid", pt: 0.5, color: COR.borda }, margin: 0.06, objectName: "tabela-protocolo" });

// A3
s = apendice("ap-quarto-efeito", "Apêndice A3 · O quarto efeito em cada versão", "O quarto efeito muda declarações existentes só nos mecanismos");
s.addTable([
  [cab("Versão", "left"), cab("O que mudou em declarações existentes", "left"), cab("Pontos"), cab("Adições")],
  [cel("Handlers", { align: "left", bold: true, color: C.accent1 }), cel("run e run_acc passam a instalar o handler de Input", { align: "left" }), cel("2"), cel("2")],
  [cel("Imperativa", { align: "left" }), cel("nada, a leitura é uma função nova", { align: "left" }), cel("0"), cel("1")],
  [cel("Mônadas", { align: "left", bold: true, color: C.accent2 }), cel("o tipo da pilha ganha StateT [Int] e run passa a executá-la", { align: "left" }), cel("2"), cel("1")],
  [cel("IORef", { align: "left" }), cel("nada, a leitura é uma função nova", { align: "left" }), cel("0"), cel("1")],
], { x: 0.5, y: 1.4, w: 9.0, colW: [1.6, 5.4, 1.0, 1.0], fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.5, color: COR.borda }, margin: 0.06, objectName: "tabela-quarto-efeito" });
texto(s, "Ponto de modificação: declaração preexistente cujo texto mudou, definida antes de implementar. Com o efeito, a suíte passa com 73/73 em cada linguagem", { x: 0.5, y: 3.9, w: 9.0, h: 0.8, fontSize: 13 });

// A4
s = apendice("ap-sensibilidade", "Apêndice A4 · Sensibilidade à configuração", "Com coleta 4 vezes menor, todos os R² passam e as razões mudam até 28%");
const sens = ["OCaml Arith", "OCaml State", "OCaml Exn", "OCaml Output", "Haskell Arith", "Haskell State", "Haskell Exn", "Haskell Output"];
s.addChart(pres.charts.BAR, [
  { name: "OCaml", labels: sens, values: [14, 28, 11, 5, 0, 0, 0, 0] },
  { name: "Haskell", labels: sens, values: [0, 0, 0, 0, 2, -8, -9, -1] },
], {
  x: 0.5, y: 1.35, w: 9.0, h: 3.3, barDir: "bar", barGrouping: "stacked", barGapWidthPct: 40, catAxisOrientation: "maxMin",
  chartColors: [COR.ocaml, COR.haskell], showValue: true, dataLabelPosition: "inEnd", dataLabelFormatCode: "+0\"%\";-0\"%\";;", dataLabelColor: "FFFFFF", dataLabelFontSize: 11, dataLabelFontBold: true,
  catAxisLabelFontSize: 11, catAxisLabelColor: COR.texto, catAxisLabelPos: "low", valAxisLabelFontSize: 10, valAxisLabelColor: COR.mudo, valAxisLabelFormatCode: "0\"%\"",
  valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" }, showLegend: false,
  catAxisLabelFontFace: "Arial", valAxisLabelFontFace: "Arial", dataLabelFontFace: "Arial",
  objectName: "grafico-sensibilidade",
});
citacao(s, "Desvio da razão de tempo: cota de 5 s e 2.000 amostras contra a campanha (cota de 20 s), mesma semente (42)");

// A5
s = apendice("ap-ia", "Apêndice A5 · Uso de IA, conforme o Regulamento", "O uso de IA está declarado no artigo, como exige o Regulamento");
texto(s, [
  { text: "Ferramenta: Claude (Anthropic), versão informada na declaração do artigo", options: { bold: true, breakLine: true } },
  { text: "revisão crítica de todas as seções", options: { bullet: true, breakLine: true } },
  { text: "edição de estilo, exceto resumos e primeiro parágrafo da introdução", options: { bullet: true, breakLine: true } },
  { text: "redação preliminar dos trechos de resultados, revisada pelo autor", options: { bullet: true, breakLine: true } },
  { text: "geração do código-fonte, revisado pelo autor", options: { bullet: true, breakLine: true } },
  { text: "execução da campanha de medição, em máquina virtual de nuvem", options: { bullet: true } },
], { x: 0.5, y: 1.4, w: 9.0, h: 2.9, fontSize: 16, paraSpaceAfter: 6 });
citacao(s, "O conteúdo técnico, os resultados e a redação final são de responsabilidade do autor (Arts. 6º a 9º do Regulamento)");

// ---- gravar e aplicar o tema -------------------------------------------------------
(async () => {
  await pres.writeFile({ fileName: SAIDA });
  await applyTheme(SAIDA, THEME);
  console.log("gravado:", path.relative(RAIZ, SAIDA));
})();
