(* Métricas de código sobre a árvore sintática (compiler-libs), para os
   avaliadores OCaml. As definições operacionais estão em
   docs/protocolo-metricas.md; aqui elas são aplicadas mecanicamente.

   Uso: metricas_ocaml.exe ARQUIVO.ml      -> JSON na saída padrão

   - LOC efetiva: linhas que contêm ao menos um token (o léxico do compilador
     descarta comentários; linhas em branco não têm token).
   - eval: a ligação [let rec eval]; o despacho por construtor é o nível 1 de
     aninhamento. Cada braço é atribuído ao construtor do seu padrão.
   - Operações de efeito: aplicações de perform/Effect.perform, de funções
     Hashtbl.*, de raise/raise_notrace, e a desreferência da emissão (!emit).
   - Aninhamento: incrementam o nível os match, try, if e as funções
     (function, fun); let ... in e sequência (;) não incrementam.
   - Declarações: cada item de topo, com o texto normalizado como sequência de
     tokens (insensível a espaços e comentários), para a contagem de pontos
     de modificação; braços de eval e construtores de tipos variantes também
     são listados separadamente. *)

open Parsetree

let ler arquivo = In_channel.with_open_bin arquivo In_channel.input_all

(* ---- Léxico: linhas efetivas e texto normalizado ---------------------- *)

let tokens_de (src : string) : (string * int * int) list =
  Lexer.init ();
  Lexer.handle_docstrings := false;
  let lexbuf = Lexing.from_string src in
  let rec loop acc =
    match Lexer.token lexbuf with
    | Parser.EOF -> List.rev acc
    | _ ->
        let ini = (Lexing.lexeme_start_p lexbuf).pos_lnum in
        let fim = (Lexing.lexeme_end_p lexbuf).pos_lnum in
        loop ((Lexing.lexeme lexbuf, ini, fim) :: acc)
  in
  loop []

let linhas_efetivas src =
  let tbl = Hashtbl.create 256 in
  List.iter
    (fun (_, ini, fim) ->
      for l = ini to fim do
        Hashtbl.replace tbl l ()
      done)
    (tokens_de src);
  tbl

let normalizar src (loc : Location.t) =
  let a = loc.loc_start.pos_cnum and b = loc.loc_end.pos_cnum in
  String.concat " "
    (List.map (fun (t, _, _) -> t) (tokens_de (String.sub src a (b - a))))

let contar_linhas efetivas ini fim =
  let n = ref 0 in
  for l = ini to fim do
    if Hashtbl.mem efetivas l then incr n
  done;
  !n

let linha_ini (loc : Location.t) = loc.loc_start.pos_lnum
let linha_fim (loc : Location.t) = loc.loc_end.pos_lnum

(* ---- Operações de efeito ---------------------------------------------- *)

let nome_ident e =
  match e.pexp_desc with
  | Pexp_ident { txt; _ } -> Some (String.concat "." (Longident.flatten txt))
  | _ -> None

let termina_com sufixo s =
  let n = String.length s and m = String.length sufixo in
  n >= m && String.sub s (n - m) m = sufixo

let eh_operacao e =
  match e.pexp_desc with
  | Pexp_apply (cabeca, args) -> (
      match nome_ident cabeca with
      | Some ("perform" | "Effect.perform" | "raise" | "raise_notrace") -> true
      | Some n when String.length n > 8 && String.sub n 0 8 = "Hashtbl." -> true
      | Some "!" -> (
          match args with
          | [ (_, a) ] -> (
              match nome_ident a with
              | Some n -> termina_com "emit" n
              | None -> false)
          | _ -> false)
      | _ -> false)
  | _ -> false

let contar_operacoes (visitar : Ast_iterator.iterator -> unit) =
  let n = ref 0 in
  let it =
    {
      Ast_iterator.default_iterator with
      expr =
        (fun self e ->
          if eh_operacao e then incr n;
          Ast_iterator.default_iterator.expr self e);
    }
  in
  visitar it;
  !n

(* ---- Aninhamento ------------------------------------------------------ *)

let profundidade (e : expression) =
  let nivel = ref 0 and maximo = ref 0 in
  let dentro f =
    incr nivel;
    if !nivel > !maximo then maximo := !nivel;
    f ();
    decr nivel
  in
  let it =
    {
      Ast_iterator.default_iterator with
      expr =
        (fun self e ->
          match e.pexp_desc with
          | Pexp_match (s, cases) ->
              self.expr self s;
              dentro (fun () -> List.iter (self.case self) cases)
          | Pexp_try (b, cases) ->
              dentro (fun () ->
                  self.expr self b;
                  List.iter (self.case self) cases)
          | Pexp_ifthenelse (c, a, b) ->
              self.expr self c;
              dentro (fun () ->
                  self.expr self a;
                  Option.iter (self.expr self) b)
          | Pexp_function _ ->
              dentro (fun () -> Ast_iterator.default_iterator.expr self e)
          | _ -> Ast_iterator.default_iterator.expr self e);
    }
  in
  it.expr it e;
  !maximo

(* ---- Localização de eval e do despacho -------------------------------- *)

let nome_padrao p =
  let rec go p =
    match p.ppat_desc with
    | Ppat_var { txt; _ } -> Some txt
    | Ppat_constraint (p, _) -> go p
    | _ -> None
  in
  go p

(* Remove os parâmetros da própria definição de eval (env, na imperativa) e
   devolve a expressão do despacho por construtor, que é o nível 1. *)
let rec despacho e =
  match e.pexp_desc with
  | Pexp_constraint (e, _) | Pexp_newtype (_, e) -> despacho e
  | Pexp_function (_, _, Pfunction_cases _) -> Some e
  | Pexp_function (_ :: _, _, Pfunction_body b) -> despacho b
  | Pexp_match _ -> Some e
  | _ -> None

let bracos_de e =
  match e.pexp_desc with
  | Pexp_function (_, _, Pfunction_cases (cases, _, _)) -> cases
  | Pexp_match (_, cases) -> cases
  | _ -> []

let construtor_do_braco c =
  let rec go p =
    match p.ppat_desc with
    | Ppat_construct ({ txt; _ }, _) -> Longident.last txt
    | Ppat_alias (p, _) | Ppat_constraint (p, _) -> go p
    | Ppat_or (p, _) -> go p
    | _ -> "_"
  in
  go c.pc_lhs

let loc_braco c =
  { c.pc_lhs.ppat_loc with Location.loc_end = c.pc_rhs.pexp_loc.loc_end }

(* ---- Declarações de topo ---------------------------------------------- *)

let nome_item item =
  match item.pstr_desc with
  | Pstr_value (_, vbs) ->
      String.concat "," (List.filter_map (fun vb -> nome_padrao vb.pvb_pat) vbs)
  | Pstr_type (_, ds) ->
      "type " ^ String.concat "," (List.map (fun d -> d.ptype_name.txt) ds)
  | Pstr_typext te ->
      (* Sem a lista de construtores: acrescentar um construtor a uma
         extensão existente é modificação dela, não remoção + adição. *)
      "type+= " ^ String.concat "." (Longident.flatten te.ptyext_path.txt)
  | Pstr_exception te -> "exception " ^ te.ptyexn_constructor.pext_name.txt
  | Pstr_open od -> (
      match od.popen_expr.pmod_desc with
      | Pmod_ident { txt; _ } ->
          "open " ^ String.concat "." (Longident.flatten txt)
      | _ -> "open")
  | Pstr_module mb -> "module " ^ Option.value ~default:"_" mb.pmb_name.txt
  | _ -> Printf.sprintf "item@%d" (linha_ini item.pstr_loc)

(* ---- Programa --------------------------------------------------------- *)

let () =
  let arquivo =
    match Sys.argv with
    | [| _; a |] -> a
    | _ ->
        prerr_endline "uso: metricas_ocaml.exe ARQUIVO.ml";
        exit 2
  in
  let src = ler arquivo in
  let lexbuf = Lexing.from_string src in
  Location.init lexbuf arquivo;
  Lexer.init ();
  let estrutura = Parse.implementation lexbuf in
  let efetivas = linhas_efetivas src in
  let linhas_texto = Array.of_list (String.split_on_char '\n' src) in
  let loc_arquivo = Hashtbl.length efetivas in
  let eval_vb =
    List.find_map
      (fun item ->
        match item.pstr_desc with
        | Pstr_value (_, vbs) ->
            List.find_opt (fun vb -> nome_padrao vb.pvb_pat = Some "eval") vbs
        | _ -> None)
      estrutura
  in
  let `Assoc campos_eval, ini_eval, fim_eval =
    match eval_vb with
    | None -> (`Assoc [], 0, -1)
    | Some vb ->
        let ini = linha_ini vb.pvb_loc and fim = linha_fim vb.pvb_loc in
        let desp =
          match despacho vb.pvb_expr with
          | Some d -> d
          | None -> failwith "eval sem despacho por construtor"
        in
        let bracos = bracos_de desp in
        let por_construtor =
          List.map
            (fun c ->
              let l = loc_braco c in
              ( construtor_do_braco c,
                `Assoc
                  [
                    ( "loc",
                      `Int (contar_linhas efetivas (linha_ini l) (linha_fim l))
                    );
                    ( "operacoes",
                      `Int (contar_operacoes (fun it -> it.case it c)) );
                    ("profundidade", `Int (1 + profundidade c.pc_rhs));
                  ] ))
            bracos
        in
        let textos =
          List.map
            (fun c ->
              (construtor_do_braco c, `String (normalizar src (loc_braco c))))
            bracos
        in
        ( `Assoc
            [
              ("loc", `Int (contar_linhas efetivas ini fim));
              ( "operacoes",
                `Int (contar_operacoes (fun it -> it.value_binding it vb)) );
              ("profundidade", `Int (profundidade desp));
              ("por_construtor", `Assoc por_construtor);
              ("bracos", `Assoc textos);
            ],
          ini,
          fim )
  in
  let fora =
    Hashtbl.fold
      (fun l () acc -> if l < ini_eval || l > fim_eval then l :: acc else acc)
      efetivas []
    |> List.sort compare
  in
  (* Tokens de cada linha (atribuídos à linha em que começam) e a declaração
     de topo que contém a linha: insumos da classificação mecânica de
     boilerplate (docs/protocolo-metricas.md, seção 4). *)
  let tokens_por_linha = Hashtbl.create 256 in
  List.iter
    (fun (t, ini, _) ->
      let atuais =
        Option.value ~default:[] (Hashtbl.find_opt tokens_por_linha ini)
      in
      Hashtbl.replace tokens_por_linha ini (t :: atuais))
    (tokens_de src);
  let tokens_da_linha l =
    List.rev (Option.value ~default:[] (Hashtbl.find_opt tokens_por_linha l))
  in
  let declaracao_da_linha l =
    List.find_map
      (fun item ->
        if linha_ini item.pstr_loc <= l && l <= linha_fim item.pstr_loc then
          Some (nome_item item)
        else None)
      estrutura
    |> Option.value ~default:""
  in
  let declaracoes =
    List.map
      (fun item ->
        let subitens =
          match item.pstr_desc with
          | Pstr_type (_, ds) ->
              List.concat_map
                (fun d ->
                  match d.ptype_kind with
                  | Ptype_variant cds ->
                      List.map
                        (fun cd ->
                          (cd.pcd_name.txt, `String (normalizar src cd.pcd_loc)))
                        cds
                  | _ -> [])
                ds
          | Pstr_typext te ->
              List.map
                (fun c ->
                  (c.pext_name.txt, `String (normalizar src c.pext_loc)))
                te.ptyext_constructors
          | _ -> []
        in
        `Assoc
          ([
             ("nome", `String (nome_item item));
             ("texto", `String (normalizar src item.pstr_loc));
           ]
          @ if subitens = [] then [] else [ ("subitens", `Assoc subitens) ]))
      estrutura
  in
  let json =
    `Assoc
      [
        ("arquivo", `String arquivo);
        ("linguagem", `String "ocaml");
        ("loc_arquivo", `Int loc_arquivo);
        ("eval", `Assoc campos_eval);
        ("loc_fora_de_eval", `Int (List.length fora));
        ( "linhas_fora_de_eval",
          `List
            (List.map
               (fun l ->
                 `Assoc
                   [
                     ("linha", `Int l);
                     ("texto", `String linhas_texto.(l - 1));
                     ( "tokens",
                       `List (List.map (fun t -> `String t) (tokens_da_linha l))
                     );
                     ("declaracao", `String (declaracao_da_linha l));
                   ])
               fora) );
        ("declaracoes", `List declaracoes);
      ]
  in
  print_endline (Yojson.Safe.pretty_to_string json)
