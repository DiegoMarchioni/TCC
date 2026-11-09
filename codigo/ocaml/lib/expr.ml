(* Núcleo comum: sintaxe, mensagens canônicas, emissão e geração de cargas.

   A geração reproduz exatamente a especificação de referencia/gerador.py; o
   teste de conformidade confere a réplica contra os hashes gravados em
   shared/conformance.json. *)

type expr =
  | Num of int
  | Var of string
  | Add of expr * expr
  | Mul of expr * expr
  | Div of expr * expr
  | Let of string * expr * expr
  | Seq of expr * expr
  | Print of expr

(* ---- Mensagens canônicas (critério (iv) de equivalência) ---- *)

let msg_unbound x = "variavel nao vinculada: " ^ x
let msg_div_zero = "divisao por zero"

(* ---- Emissão --------------------------------------------------------
   Referência a função: a suíte de oráculo e o harness a substituem
   temporariamente. As versões sem handlers emitem por ela; a versão com
   handlers emite por ela no handler run_output_emit. *)

let emit : (int -> unit) ref =
  ref (fun v ->
      print_int v;
      print_newline ())

(* ---- Gerador congruencial linear ------------------------------------
   x_{n+1} = (1103515245 x_n + 12345) mod 2^30. O produto cabe no inteiro
   de 63 bits do OCaml: 1103515245 * (2^30 - 1) < 2^61. As escolhas usam os
   bits altos, (x lsr 15) mod n, porque os bits baixos de um LCG com módulo
   potência de dois têm período curto. *)

module Lcg = struct
  type t = { mutable x : int }

  let make seed = { x = seed }

  let next g =
    (* Parênteses obrigatórios: [land] tem a precedência de [*]. *)
    g.x <- ((1103515245 * g.x) + 12345) land ((1 lsl 30) - 1);
    g.x

  let pick g n = (next g lsr 15) mod n
  let lit g = pick g 101
  let divisor g = 1 + pick g 9
end

(* A ordem de avaliação dos argumentos não é especificada em OCaml: os
   sorteios são feitos em let explícitos para seguir a ordem da
   especificação (subárvore esquerda antes da direita). *)
let rec arith g d =
  if d = 0 then Num (Lcg.lit g)
  else
    match Lcg.pick g 3 with
    | 2 ->
        let l = arith g (d - 1) in
        let r = Num (Lcg.divisor g) in
        Div (l, r)
    | op ->
        let l = arith g (d - 1) in
        let r = arith g (d - 1) in
        if op = 0 then Add (l, r) else Mul (l, r)

type scenario = Arith | State | Exn | Output

let scenarios = [ Arith; State; Exn; Output ]

let scenario_name = function
  | Arith -> "arith"
  | State -> "state"
  | Exn -> "exn"
  | Output -> "output"

let scenario_of_string = function
  | "arith" -> Arith
  | "state" -> State
  | "exn" -> Exn
  | "output" -> Output
  | s -> invalid_arg ("cenario desconhecido: " ^ s)

let seeds = [ 42; 43; 44 ]
let n_expr = 10_000
let n_vars = 500
let var_name i = "v" ^ string_of_int i

(* Array.init aplica a função aos índices em ordem crescente. *)
let workload scenario seed : expr array =
  let g = Lcg.make seed in
  match scenario with
  | Arith -> Array.init n_expr (fun _ -> arith g 3)
  | State ->
      let values = Array.init n_vars (fun _ -> Lcg.lit g) in
      let prefix = ref (Num 0) in
      for i = n_vars - 1 downto 0 do
        prefix := Let (var_name i, Num values.(i), !prefix)
      done;
      let body =
        Array.init n_expr (fun _ ->
            let op = Lcg.pick g 2 in
            let a = Lcg.pick g n_vars in
            let b = Lcg.pick g n_vars in
            let va = Var (var_name a) in
            let vb = Var (var_name b) in
            if op = 0 then Add (va, vb) else Mul (va, vb))
      in
      Array.append [| !prefix |] body
  | Exn ->
      Array.init n_expr (fun i ->
          if i mod 5 = 4 then
            let l = arith g 2 in
            Div (l, Num 0)
          else arith g 3)
  | Output ->
      Array.init n_expr (fun _ ->
          let op = Lcg.pick g 2 in
          let a = Lcg.lit g in
          let b = Lcg.lit g in
          let pa = Print (Num a) in
          let pb = Print (Num b) in
          if op = 0 then Add (pa, pb) else Mul (pa, pb))

(* ---- Serialização canônica e hash FNV-1a de 64 bits ---------------- *)

let rec sexp_to buf = function
  | Num n -> Printf.bprintf buf "(Num %d)" n
  | Var x -> Printf.bprintf buf "(Var %s)" x
  | Add (a, b) -> bin buf "Add" a b
  | Mul (a, b) -> bin buf "Mul" a b
  | Div (a, b) -> bin buf "Div" a b
  | Seq (a, b) -> bin buf "Seq" a b
  | Let (x, e, b) ->
      Printf.bprintf buf "(Let %s " x;
      sexp_to buf e;
      Buffer.add_char buf ' ';
      sexp_to buf b;
      Buffer.add_char buf ')'
  | Print e ->
      Buffer.add_string buf "(Print ";
      sexp_to buf e;
      Buffer.add_char buf ')'

and bin buf tag a b =
  Printf.bprintf buf "(%s " tag;
  sexp_to buf a;
  Buffer.add_char buf ' ';
  sexp_to buf b;
  Buffer.add_char buf ')'

let sexp e =
  let buf = Buffer.create 64 in
  sexp_to buf e;
  Buffer.contents buf

let fnv1a64 (s : string) =
  let h = ref 0xcbf29ce484222325L in
  String.iter
    (fun c ->
      h := Int64.logxor !h (Int64.of_int (Char.code c));
      h := Int64.mul !h 0x100000001b3L)
    s;
  Printf.sprintf "%016Lx" !h

let workload_text scenario seed =
  let buf = Buffer.create (1 lsl 20) in
  Array.iter
    (fun e ->
      sexp_to buf e;
      Buffer.add_char buf '\n')
    (workload scenario seed);
  Buffer.contents buf

let hash_workload scenario seed = fnv1a64 (workload_text scenario seed)
