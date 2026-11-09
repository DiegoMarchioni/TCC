(* Linha de base imperativa em OCaml (Seção 5.1).

   Realiza os três efeitos pelos meios diretos da linguagem: estado em uma
   Hashtbl recebida como parâmetro (mesmo padrão de acesso da versão com
   handlers), erro por exceção nativa e saída pela referência [Expr.emit].
   Mesmas mensagens canônicas e mesma fixação da ordem de avaliação da versão
   com efeitos: a diferença entre as duas reduz-se à substituição de acessos
   diretos e de [raise] por operações de efeito. *)

open Expr

exception Runtime_error of string

let rec eval (env : (string, int) Hashtbl.t) : expr -> int = function
  | Num n -> n
  | Var x -> (
      match Hashtbl.find_opt env x with
      | Some v -> v
      | None -> raise (Runtime_error (msg_unbound x)))
  | Add (a, b) ->
      let x = eval env a in
      let y = eval env b in
      x + y
  | Mul (a, b) ->
      let x = eval env a in
      let y = eval env b in
      x * y
  | Div (a, b) ->
      let x = eval env a in
      let y = eval env b in
      if y = 0 then raise (Runtime_error msg_div_zero) else x / y
  | Let (x, e, b) ->
      let v = eval env e in
      Hashtbl.replace env x v;
      eval env b
  | Seq (a, b) ->
      ignore (eval env a);
      eval env b
  | Print e ->
      let v = eval env e in
      !emit v;
      v

(* Tratamento de erro por expressão avaliada, como na versão com handlers. *)
let run (env : (string, int) Hashtbl.t) (e : expr) : (int, string) result =
  match eval env e with v -> Ok v | exception Runtime_error m -> Error m
