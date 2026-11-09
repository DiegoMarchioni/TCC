(* Harness Bechamel (Seção 4.3 do artigo).

   Para cada cenário, mede a versão com handlers (mecanismo) e a linha de
   base imperativa sobre a MESMA carga, gerada uma única vez fora da região
   medida, e grava uma linha CSV por versão com tempo e alocação absolutos por
   execução da carga, IC de 95% por bootstrap e R².

   Variáveis de ambiente (todas opcionais):
     TCC_SEED       semente do gerador                     (padrão 42)
     TCC_QUOTA      cota de tempo por teste, em segundos   (padrão 20)
     TCC_LIMIT      limite de amostras do Bechamel         (padrão 5000)
     TCC_BOOTSTRAP  reamostragens para o IC                (padrão 1000)
     TCC_CENARIOS   lista separada por vírgulas            (padrão todos)
     TCC_SAIDA      arquivo CSV de saída                   (padrão stdout)

   Decisões de medição:
   - O ambiente (Hashtbl) é criado vazio uma única vez por versão e cenário,
     antes da bateria: STATE é idempotente quanto ao ambiente (o prefixo de
     Let revincula as 500 variáveis a cada execução) e os demais cenários
     não leem variável alguma.
   - As duas versões emitem pela mesma referência [Expr.emit], aqui um
     acumulador zerado no início de cada execução, nas duas.
   - O resultado é passado por [Sys.opaque_identity] nas duas versões, para
     que o flambda não elimine trabalho de forma assimétrica.
   - A ordem alterna entre cenários (base primeiro nos de índice par,
     mecanismo primeiro nos ímpares), para não favorecer sistematicamente
     um lado com a deriva térmica da máquina.
   - Antes de medir, confere-se que mecanismo e base produzem a mesma soma,
     o mesmo número de erros e o mesmo traço sobre a carga. *)

open Bechamel
open Toolkit

let env_int nome padrao =
  match Sys.getenv_opt nome with Some s -> int_of_string s | None -> padrao

let env_float nome padrao =
  match Sys.getenv_opt nome with Some s -> float_of_string s | None -> padrao

let seed = env_int "TCC_SEED" 42
let quota = env_float "TCC_QUOTA" 20.0
let limit = env_int "TCC_LIMIT" 5000
let n_bootstrap = env_int "TCC_BOOTSTRAP" 1000

let cenarios =
  match Sys.getenv_opt "TCC_CENARIOS" with
  | None | Some "" -> Expr.scenarios
  | Some s -> List.map Expr.scenario_of_string (String.split_on_char ',' s)

(* ---- Execução de uma carga ------------------------------------------- *)

let acc : int list ref = ref []
let () = Expr.emit := fun v -> acc := v :: !acc

type desfecho = { soma : int; erros : int }

let executar_efeitos tbl exprs () =
  acc := [];
  let soma = ref 0 and erros = ref 0 in
  for i = 0 to Array.length exprs - 1 do
    match Interp_effects.run tbl exprs.(i) with
    | Ok v -> soma := !soma + v
    | Error _ -> incr erros
  done;
  Sys.opaque_identity { soma = !soma; erros = !erros }

let executar_imperativa tbl exprs () =
  acc := [];
  let soma = ref 0 and erros = ref 0 in
  for i = 0 to Array.length exprs - 1 do
    match Interp_imp.run tbl exprs.(i) with
    | Ok v -> soma := !soma + v
    | Error _ -> incr erros
  done;
  Sys.opaque_identity { soma = !soma; erros = !erros }

(* ---- Análise: OLS pela origem e IC por bootstrap ---------------------- *)

let ols_origem xs ys idx =
  let sxy = ref 0.0 and sxx = ref 0.0 in
  Array.iter
    (fun i ->
      sxy := !sxy +. (xs.(i) *. ys.(i));
      sxx := !sxx +. (xs.(i) *. xs.(i)))
    idx;
  !sxy /. !sxx

let ic95_bootstrap xs ys =
  let n = Array.length xs in
  let rng = Random.State.make [| 20261109; seed |] in
  let betas =
    Array.init n_bootstrap (fun _ ->
        ols_origem xs ys (Array.init n (fun _ -> Random.State.int rng n)))
  in
  Array.sort compare betas;
  let q p =
    betas.(max 0 (min (n_bootstrap - 1) (int_of_float (p *. float n_bootstrap))))
  in
  (q 0.025, q 0.975)

type estimativa = { valor : float; ic : float * float; r2 : float }

let estimar (b : Benchmark.t) instancia =
  let ols =
    Analyze.ols ~r_square:true ~bootstrap:0 ~predictors:[| Measure.run |]
  in
  let r = Analyze.one ols instancia b in
  let valor =
    match Analyze.OLS.estimates r with
    | Some (v :: _) -> v
    | _ -> failwith "OLS sem estimativa"
  in
  let r2 = Option.value ~default:nan (Analyze.OLS.r_square r) in
  let rotulo = Measure.label instancia in
  let xs = Array.map Measurement_raw.run b.lr in
  let ys = Array.map (fun m -> Measurement_raw.get ~label:rotulo m) b.lr in
  (* Conferência: o OLS do Bechamel com o preditor run é pela origem. *)
  let proprio = ols_origem xs ys (Array.init (Array.length xs) Fun.id) in
  if Float.abs (proprio -. valor) > 1e-6 *. Float.max 1.0 (Float.abs valor) then
    Printf.eprintf "AVISO: OLS proprio %.6g difere do Bechamel %.6g (%s)\n%!"
      proprio valor rotulo;
  { valor; ic = ic95_bootstrap xs ys; r2 }

let instancias = Instance.[ monotonic_clock; minor_allocated ]

let medir nome f =
  let cfg =
    Benchmark.cfg ~limit ~quota:(Time.second quota) ~stabilize:true ~kde:None ()
  in
  let test = Test.make ~name:nome (Staged.stage f) in
  let resultados = Benchmark.all cfg instancias test in
  let b = Hashtbl.fold (fun _ b _ -> Some b) resultados None |> Option.get in
  let tempo = estimar b Instance.monotonic_clock in
  let aloc = estimar b Instance.minor_allocated in
  (Array.length b.lr, tempo, aloc)

(* ---- Programa principal ----------------------------------------------- *)

let cabecalho =
  "linguagem,cenario,implementacao,papel,semente,n_expressoes,amostras,tempo_ns,tempo_ic_inf,tempo_ic_sup,tempo_r2,alocacao,alocacao_ic_inf,alocacao_ic_sup,alocacao_r2,unidade_alocacao"

let () =
  let saida =
    match Sys.getenv_opt "TCC_SAIDA" with
    | Some p when p <> "" -> open_out p
    | _ -> stdout
  in
  output_string saida (cabecalho ^ "\n");
  List.iteri
    (fun idx sc ->
      let nome_sc = Expr.scenario_name sc in
      let exprs = Expr.workload sc seed in
      let tbl_ef = Hashtbl.create 1024 and tbl_imp = Hashtbl.create 1024 in
      (* Pré-condição: mesmo desfecho e mesmo traço nas duas versões. *)
      let d_ef = executar_efeitos tbl_ef exprs () in
      let tr_ef = !acc in
      let d_imp = executar_imperativa tbl_imp exprs () in
      let tr_imp = !acc in
      if d_ef <> d_imp || tr_ef <> tr_imp then (
        Printf.eprintf
          "ERRO: versoes divergem em %s/%d: efeitos soma=%d erros=%d traco=%d; \
           imperativa soma=%d erros=%d traco=%d\n"
          nome_sc seed d_ef.soma d_ef.erros (List.length tr_ef) d_imp.soma
          d_imp.erros (List.length tr_imp);
        exit 1);
      Hashtbl.reset tbl_ef;
      Hashtbl.reset tbl_imp;
      let versoes =
        [
          ("imperativa", "base", executar_imperativa tbl_imp exprs);
          ("efeitos", "mecanismo", executar_efeitos tbl_ef exprs);
        ]
      in
      let versoes = if idx mod 2 = 0 then versoes else List.rev versoes in
      List.iter
        (fun (impl, papel, f) ->
          Printf.eprintf "[ocaml] %s/%d %s ...%!" nome_sc seed impl;
          let amostras, t, a = medir (nome_sc ^ "/" ^ impl) f in
          Printf.eprintf " %.0f ns, %.0f palavras, R2=%.4f (%d amostras)\n%!"
            t.valor a.valor t.r2 amostras;
          Printf.fprintf saida
            "ocaml,%s,%s,%s,%d,%d,%d,%.1f,%.1f,%.1f,%.5f,%.2f,%.2f,%.2f,%.5f,palavras\n\
             %!"
            nome_sc impl papel seed (Array.length exprs) amostras t.valor
            (fst t.ic) (snd t.ic) t.r2 a.valor (fst a.ic) (snd a.ic) a.r2)
        versoes)
    cenarios;
  if saida != stdout then close_out saida
