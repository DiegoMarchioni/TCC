(* Interpretador com efeitos algébricos e handlers do OCaml 5 (Seção 5.2).

   Decisões registradas no artigo:
   - Get devolve [int option]: a política de erro para variável não
     vinculada é decidida no avaliador, e o handler de estado não conhece a
     semântica de erro.
   - A ordem de avaliação dos operandos é fixada com let explícitos, porque
     o OCaml não especifica a ordem de avaliação dos argumentos.
   - O handler de exceção descarta a continuação; o de estado a retoma.
   - O estado vive em uma Hashtbl externa ao handler, de modo que abortar não
     o perde, como na pilha ExceptT-sobre-StateT do Haskell. *)

open Effect
open Effect.Deep
open Expr

type _ Effect.t +=
  | Get : string -> int option Effect.t
  | Set : string * int -> unit Effect.t
  | Fail : string -> 'a Effect.t
  | Output : int -> unit Effect.t

let rec eval : expr -> int = function
  | Num n -> n
  | Var x -> (
      match perform (Get x) with
      | Some v -> v
      | None -> perform (Fail (msg_unbound x)))
  | Add (a, b) ->
      let x = eval a in
      let y = eval b in
      x + y
  | Mul (a, b) ->
      let x = eval a in
      let y = eval b in
      x * y
  | Div (a, b) ->
      let x = eval a in
      let y = eval b in
      if y = 0 then perform (Fail msg_div_zero) else x / y
  | Let (x, e, b) ->
      let v = eval e in
      perform (Set (x, v));
      eval b
  | Seq (a, b) ->
      ignore (eval a);
      eval b
  | Print e ->
      let v = eval e in
      perform (Output v);
      v

(* Estado: retoma a continuação com o valor lido ou após escrever. *)
let run_state (tbl : (string, int) Hashtbl.t) (main : unit -> 'a) : 'a =
  match_with main ()
    {
      retc = (fun v -> v);
      exnc = raise;
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Get x ->
              Some
                (fun (k : (a, _) continuation) ->
                  continue k (Hashtbl.find_opt tbl x))
          | Set (x, v) ->
              Some
                (fun (k : (a, _) continuation) ->
                  Hashtbl.replace tbl x v;
                  continue k ())
          | _ -> None);
    }

(* Exceção: a continuação não é retomada. Ela é encerrada com [discontinue],
   que desenrola a computação interrompida e libera o seu segmento de pilha;
   o erro chega a [exnc] pela exceção local [Abortar]. Apenas abandonar a
   continuação (devolver [Error msg] sem tocá-la) vaza o segmento no OCaml
   5.2: ver experimento/continuacao.ml, em que 2 milhões de erros levam a
   memória residente a ~1,2 GB contra ~6 MB com [discontinue]. *)
exception Abortar of string

let run_exn (main : unit -> int) : (int, string) result =
  match_with main ()
    {
      retc = (fun v -> Ok v);
      exnc = (function Abortar msg -> Error msg | e -> raise e);
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Fail msg ->
              Some
                (fun (k : (a, _) continuation) -> discontinue k (Abortar msg))
          | _ -> None);
    }

(* Saída, versão que emite pela referência [Expr.emit]: execução normal e
   campanha de medição (as quatro versões emitem pela mesma referência). *)
let run_output_emit (main : unit -> 'a) : 'a =
  match_with main ()
    {
      retc = (fun v -> v);
      exnc = raise;
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Output v ->
              Some
                (fun (k : (a, _) continuation) ->
                  !emit v;
                  continue k ())
          | _ -> None);
    }

(* Saída, versão que acumula os valores emitidos: suíte de oráculo. Trocar a
   interpretação do efeito exigiu outro handler, sem alterar o avaliador. *)
let run_output_acc (acc : int list ref) (main : unit -> 'a) : 'a =
  match_with main ()
    {
      retc = (fun v -> v);
      exnc = raise;
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Output v ->
              Some
                (fun (k : (a, _) continuation) ->
                  acc := v :: !acc;
                  continue k ())
          | _ -> None);
    }

(* Composição usada na execução e nos benchmarks: os três handlers são
   instalados por expressão avaliada (Seção 4.3). *)
let run (tbl : (string, int) Hashtbl.t) (e : expr) : (int, string) result =
  run_state tbl (fun () ->
      run_output_emit (fun () -> run_exn (fun () -> eval e)))

(* Composição usada pela suíte de oráculo: troca apenas o handler de saída. *)
let run_acc (tbl : (string, int) Hashtbl.t) (acc : int list ref) (e : expr) :
    (int, string) result =
  run_state tbl (fun () ->
      run_output_acc acc (fun () -> run_exn (fun () -> eval e)))
