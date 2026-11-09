(* Imprime uma carga na serialização canônica, ou o seu hash.

   Uso: cargas.exe CENARIO SEMENTE [--hash]
   Útil para localizar a primeira expressão em que as réplicas divergem:
     diff <(cargas.exe exn 43) <(cabal run -v0 cargas -- exn 43) | head *)

let () =
  match Array.to_list Sys.argv with
  | [ _; sc; seed ] ->
      print_string
        (Expr.workload_text (Expr.scenario_of_string sc) (int_of_string seed))
  | [ _; sc; seed; "--hash" ] ->
      print_endline
        (Expr.hash_workload (Expr.scenario_of_string sc) (int_of_string seed))
  | _ ->
      prerr_endline "uso: cargas.exe arith|state|exn|output SEMENTE [--hash]";
      exit 2
