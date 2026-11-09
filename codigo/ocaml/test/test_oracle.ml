(* Suíte de oráculo e de conformidade (Seções 4.1 e 5.3 do artigo).

   - 28 casos, lidos de shared/conformance.json, verificados contra cada uma
     das duas implementações OCaml: resultado, ambiente final ordenado e traço
     de saída (critérios (i) a (iv) de equivalência funcional).
   - 5 conferências de conformidade entre as réplicas: mensagens canônicas,
     amostra do LCG, primeiras expressões de ARITH, hashes de todas as cargas
     (4 cenários x 3 sementes) e integridade da tabela de casos.
   Total: 28 x 2 + 5 = 61 verificações.

   A observação do traço não modifica os avaliadores: na versão com handlers,
   por um handler alternativo de Output; na imperativa, substituindo
   temporariamente a referência [Expr.emit]. *)

open Yojson.Safe.Util

let localizar_conformidade () =
  match Sys.getenv_opt "TCC_CONFORMANCE" with
  | Some p -> p
  | None ->
      let rec subir dir n =
        let cand =
          Filename.concat (Filename.concat dir "shared") "conformance.json"
        in
        if Sys.file_exists cand then cand
        else if n = 0 || Filename.dirname dir = dir then
          failwith
            "shared/conformance.json nao encontrado; defina TCC_CONFORMANCE"
        else subir (Filename.dirname dir) (n - 1)
      in
      subir (Sys.getcwd ()) 10

let rec expr_of_json (j : Yojson.Safe.t) : Expr.expr =
  match to_list j with
  | [ `String "Num"; n ] -> Num (to_int n)
  | [ `String "Var"; x ] -> Var (to_string x)
  | [ `String "Add"; a; b ] -> Add (expr_of_json a, expr_of_json b)
  | [ `String "Mul"; a; b ] -> Mul (expr_of_json a, expr_of_json b)
  | [ `String "Div"; a; b ] -> Div (expr_of_json a, expr_of_json b)
  | [ `String "Seq"; a; b ] -> Seq (expr_of_json a, expr_of_json b)
  | [ `String "Let"; x; e; b ] ->
      Let (to_string x, expr_of_json e, expr_of_json b)
  | [ `String "Print"; e ] -> Print (expr_of_json e)
  | _ -> failwith ("expressao malformada: " ^ Yojson.Safe.to_string j)

type observado = {
  resultado : (int, string) result;
  env : (string * int) list;
  saida : int list;
}

let pares_of_json j =
  List.map
    (fun p ->
      match to_list p with
      | [ k; v ] -> (to_string k, to_int v)
      | _ -> failwith "par malformado")
    (to_list j)

let esperado_of_json j =
  let r = member "resultado" j in
  let resultado =
    match member "ok" r with
    | `Null -> Error (to_string (member "erro" r))
    | v -> Ok (to_int v)
  in
  {
    resultado;
    env = pares_of_json (member "env" j);
    saida = List.map to_int (to_list (member "saida" j));
  }

let mostrar o =
  let r =
    match o.resultado with
    | Ok v -> Printf.sprintf "Ok %d" v
    | Error m -> Printf.sprintf "Erro %S" m
  in
  let env =
    String.concat "; "
      (List.map (fun (k, v) -> Printf.sprintf "%s=%d" k v) o.env)
  in
  let saida = String.concat "; " (List.map string_of_int o.saida) in
  Printf.sprintf "{%s; env=[%s]; saida=[%s]}" r env saida

let tabela_inicial pares =
  let t = Hashtbl.create 16 in
  List.iter (fun (k, v) -> Hashtbl.replace t k v) pares;
  t

let ambiente_ordenado tbl =
  List.sort compare (Hashtbl.fold (fun k v acc -> (k, v) :: acc) tbl [])

let observar_efeitos e env0 =
  let tbl = tabela_inicial env0 in
  let acc = ref [] in
  let resultado = Interp_effects.run_acc tbl acc e in
  { resultado; env = ambiente_ordenado tbl; saida = List.rev !acc }

let observar_imperativa e env0 =
  let tbl = tabela_inicial env0 in
  let acc = ref [] in
  let anterior = !Expr.emit in
  (Expr.emit := fun v -> acc := v :: !acc);
  let resultado =
    Fun.protect
      ~finally:(fun () -> Expr.emit := anterior)
      (fun () -> Interp_imp.run tbl e)
  in
  { resultado; env = ambiente_ordenado tbl; saida = List.rev !acc }

let total = ref 0
let falhas = ref 0

let verificar rotulo cond detalhe =
  incr total;
  if cond then Printf.printf "ok     %s\n" rotulo
  else (
    incr falhas;
    Printf.printf "FALHA  %s\n       %s\n" rotulo (Lazy.force detalhe))

let () =
  let caminho = localizar_conformidade () in
  let doc = Yojson.Safe.from_file caminho in
  Printf.printf "Conformidade: %s\n\n" caminho;
  let casos = to_list (member "casos" doc) in

  (* ---- Oráculo: 28 casos x 2 implementações ---- *)
  List.iter
    (fun (impl, observar) ->
      List.iter
        (fun caso ->
          let nome = to_string (member "nome" caso) in
          let e = expr_of_json (member "expr" caso) in
          let env0 = pares_of_json (member "env_inicial" caso) in
          let esperado = esperado_of_json (member "esperado" caso) in
          let obtido = observar e env0 in
          verificar
            (Printf.sprintf "[%s] %s" impl nome)
            (obtido = esperado)
            (lazy
              (Printf.sprintf "esperado %s, obtido %s" (mostrar esperado)
                 (mostrar obtido))))
        casos)
    [ ("efeitos", observar_efeitos); ("imperativa", observar_imperativa) ];

  (* ---- Conformidade entre as réplicas ---- *)
  let msgs = member "mensagens" doc in
  let modelo = to_string (member "variavel_nao_vinculada" msgs) in
  let esperada_unbound =
    let n = String.length modelo in
    let rec indice i =
      if i + 3 > n then failwith "modelo sem {x}"
      else if String.sub modelo i 3 = "{x}" then i
      else indice (i + 1)
    in
    let i = indice 0 in
    String.sub modelo 0 i ^ "exemplo" ^ String.sub modelo (i + 3) (n - i - 3)
  in
  verificar "[conformidade] mensagens canonicas"
    (Expr.msg_unbound "exemplo" = esperada_unbound
    && Expr.msg_div_zero = to_string (member "divisao_por_zero" msgs))
    (lazy
      (Printf.sprintf "%S / %S" (Expr.msg_unbound "exemplo") Expr.msg_div_zero));

  let geracao = member "geracao" doc in
  let lcg = member "lcg" geracao in
  let esperados = List.map to_int (to_list (member "primeiros_valores" lcg)) in
  let g = Expr.Lcg.make (to_int (member "semente" lcg)) in
  let obtidos = List.map (fun _ -> Expr.Lcg.next g) esperados in
  verificar "[conformidade] amostra do LCG" (obtidos = esperados)
    (lazy (String.concat ", " (List.map string_of_int obtidos)));

  let prim = member "arith_primeiras_expressoes" geracao in
  let esperadas = List.map to_string (to_list (member "expressoes" prim)) in
  let carga = Expr.workload Arith (to_int (member "semente" prim)) in
  let obtidas = List.mapi (fun i _ -> Expr.sexp carga.(i)) esperadas in
  verificar "[conformidade] primeiras expressoes de ARITH" (obtidas = esperadas)
    (lazy (String.concat "\n       " obtidas));

  let hashes = member "hashes_cargas" geracao in
  let divergentes =
    List.concat_map
      (fun sc ->
        List.filter_map
          (fun seed ->
            let esperado =
              to_string
                (member (string_of_int seed)
                   (member (Expr.scenario_name sc) hashes))
            in
            let obtido = Expr.hash_workload sc seed in
            if obtido = esperado then None
            else
              Some
                (Printf.sprintf "%s/%d: esperado %s, obtido %s"
                   (Expr.scenario_name sc) seed esperado obtido))
          Expr.seeds)
      Expr.scenarios
  in
  verificar "[conformidade] hashes das 12 cargas (4 cenarios x 3 sementes)"
    (divergentes = [])
    (lazy (String.concat "\n       " divergentes));

  let nomes = List.map (fun c -> to_string (member "nome" c)) casos in
  let unicos = List.sort_uniq compare nomes in
  let envs_ordenados =
    List.for_all
      (fun c ->
        let env = pares_of_json (member "env" (member "esperado" c)) in
        env = List.sort compare env)
      casos
  in
  verificar "[conformidade] tabela de casos (28, nomes unicos, env ordenado)"
    (List.length casos = 28 && List.length unicos = 28 && envs_ordenados)
    (lazy
      (Printf.sprintf "%d casos, %d nomes unicos" (List.length casos)
         (List.length unicos)));

  Printf.printf "\n%d/%d verificacoes passaram.\n" (!total - !falhas) !total;
  exit (if !falhas = 0 then 0 else 1)
