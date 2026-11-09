(* Abandonar a continuação do efeito de exceção, sem retomá-la, vaza o
   segmento de pilha da fiber no OCaml 5.2; encerrá-la com [discontinue] não.

   Uso: continuacao.exe abandonar|discontinue [n]

   O mesmo avaliador (Interp_effects.eval) é executado n vezes (padrão: 2
   milhões) sobre uma expressão que termina em divisão por zero, sob um
   handler de exceção que (a) apenas abandona a continuação ou (b) a encerra
   com [discontinue]. Imprime a memória residente (VmRSS) antes e depois. Na
   máquina da revisão: (a) ~1,2 GB e ~0,7 s; (b) ~6 MB e ~0,1 s. As fibers
   são alocadas com malloc fora do heap do coletor (Sivaramakrishnan et al.
   2021, Seção 5.2), por isso o vazamento não aparece em Gc.minor_words, só
   na memória residente. Requer Linux (/proc/self/status). *)

open Effect.Deep

let rss () =
  let ic = open_in "/proc/self/status" in
  let rec loop () =
    match input_line ic with
    | l when String.length l > 6 && String.sub l 0 6 = "VmRSS:" ->
        close_in ic;
        String.trim (String.sub l 6 (String.length l - 6))
    | _ -> loop ()
    | exception End_of_file ->
        close_in ic;
        "?"
  in
  loop ()

exception Abortar of string

let run_exn_abandonando main =
  match_with main ()
    {
      retc = (fun v -> Ok v);
      exnc = raise;
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Interp_effects.Fail msg ->
              Some (fun (_ : (a, _) continuation) -> Error msg)
          | _ -> None);
    }

let run_exn_discontinue main =
  match_with main ()
    {
      retc = (fun v -> Ok v);
      exnc = (function Abortar m -> Error m | e -> raise e);
      effc =
        (fun (type a) (eff : a Effect.t) ->
          match eff with
          | Interp_effects.Fail msg ->
              Some
                (fun (k : (a, _) continuation) -> discontinue k (Abortar msg))
          | _ -> None);
    }

let () =
  let modo = if Array.length Sys.argv > 1 then Sys.argv.(1) else "" in
  let n =
    if Array.length Sys.argv > 2 then int_of_string Sys.argv.(2) else 2_000_000
  in
  let run =
    match modo with
    | "abandonar" -> run_exn_abandonando
    | "discontinue" -> run_exn_discontinue
    | _ ->
        prerr_endline "uso: continuacao.exe abandonar|discontinue [n]";
        exit 2
  in
  let e = Expr.Div (Expr.Add (Expr.Num 1, Expr.Num 2), Expr.Num 0) in
  let antes = rss () in
  let t0 = Unix.gettimeofday () in
  let erros = ref 0 in
  for _ = 1 to n do
    match run (fun () -> Interp_effects.eval e) with
    | Error _ -> incr erros
    | Ok _ -> ()
  done;
  let t1 = Unix.gettimeofday () in
  Gc.full_major ();
  Printf.printf "%s: n=%d erros=%d RSS antes=%s depois=%s tempo=%.2fs\n" modo n
    !erros antes (rss ()) (t1 -. t0)
