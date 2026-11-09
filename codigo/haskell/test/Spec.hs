{-# LANGUAGE OverloadedStrings #-}

-- | Suíte de oráculo e de conformidade (Seções 4.1 e 5.3 do artigo).
--
-- * 28 casos, lidos de @shared/conformance.json@, verificados contra cada uma
--   das duas implementações Haskell: resultado, ambiente final ordenado e
--   traço de saída.
-- * 5 conferências de conformidade: mensagens canônicas, amostra do LCG,
--   primeiras expressões de ARITH, hashes das 12 cargas e integridade da
--   tabela de casos.
--
-- Total: 28 x 2 + 5 = 61 verificações. O traço é observado substituindo
-- temporariamente a referência 'emitRef', sem modificar os avaliadores.
module Main (main) where

import Control.Exception (finally)
import Control.Monad (forM_, unless, when)
import qualified Data.Aeson as A
import qualified Data.Aeson.Key as K
import qualified Data.Aeson.KeyMap as KM
import Data.IORef
import Data.List (isPrefixOf, nub, sort)
import qualified Data.Map.Strict as Map
import qualified Data.Text as T
import qualified Data.Vector as V
import Expr
import qualified Interp.IORefBase as B
import qualified Interp.Monadic as M
import System.Directory (doesFileExist, getCurrentDirectory)
import System.Environment (lookupEnv)
import System.Exit (exitFailure, exitSuccess)
import System.FilePath (takeDirectory, (</>))

-- Acesso ao JSON -----------------------------------------------------------

campo :: String -> A.Value -> A.Value
campo k (A.Object o) = maybe (error ("campo ausente: " ++ k)) id (KM.lookup (K.fromString k) o)
campo k _ = error ("nao e objeto ao buscar " ++ k)

campoTalvez :: String -> A.Value -> Maybe A.Value
campoTalvez k (A.Object o) = KM.lookup (K.fromString k) o
campoTalvez _ _ = Nothing

lista :: A.Value -> [A.Value]
lista (A.Array v) = V.toList v
lista _ = error "nao e lista"

texto :: A.Value -> String
texto (A.String t) = T.unpack t
texto _ = error "nao e texto"

inteiro :: A.Value -> Int
inteiro (A.Number n) = truncate n
inteiro _ = error "nao e numero"

exprDe :: A.Value -> Expr
exprDe v = case lista v of
  [A.String "Num", n] -> Num (inteiro n)
  [A.String "Var", x] -> Var (texto x)
  [A.String "Add", a, b] -> Add (exprDe a) (exprDe b)
  [A.String "Mul", a, b] -> Mul (exprDe a) (exprDe b)
  [A.String "Div", a, b] -> Div (exprDe a) (exprDe b)
  [A.String "Seq", a, b] -> Seq (exprDe a) (exprDe b)
  [A.String "Let", x, e, b] -> Let (texto x) (exprDe e) (exprDe b)
  [A.String "Print", e] -> Print (exprDe e)
  _ -> error ("expressao malformada: " ++ show v)

paresDe :: A.Value -> [(String, Int)]
paresDe v = map par (lista v)
  where
    par p = case lista p of
      [k, x] -> (texto k, inteiro x)
      _ -> error ("par malformado: " ++ show p)

-- Observação ----------------------------------------------------------------

data Observado = Observado
  { resultado :: Either String Int,
    ambiente :: [(String, Int)],
    saida :: [Int]
  }
  deriving (Eq, Show)

esperadoDe :: A.Value -> Observado
esperadoDe v =
  Observado
    { resultado = case campoTalvez "ok" r of
        Just x -> Right (inteiro x)
        Nothing -> Left (texto (campo "erro" r)),
      ambiente = paresDe (campo "env" v),
      saida = map inteiro (lista (campo "saida" v))
    }
  where
    r = campo "resultado" v

comEmissaoCapturada :: IO a -> IO (a, [Int])
comEmissaoCapturada acao = do
  acc <- newIORef []
  anterior <- readIORef emitRef
  writeIORef emitRef (\x -> modifyIORef' acc (x :))
  r <- acao `finally` writeIORef emitRef anterior
  vs <- readIORef acc
  return (r, reverse vs)

observarMonadica :: Expr -> [(String, Int)] -> IO Observado
observarMonadica e env0 = do
  ((r, env'), out) <- comEmissaoCapturada (M.run (Map.fromList env0) e)
  return (Observado r (Map.toAscList env') out)

observarIORef :: Expr -> [(String, Int)] -> IO Observado
observarIORef e env0 = do
  ref <- newIORef (Map.fromList env0)
  (r, out) <- comEmissaoCapturada (B.run ref e)
  env' <- readIORef ref
  return (Observado r (Map.toAscList env') out)

-- Localização do arquivo de conformidade --------------------------------------

localizarConformidade :: IO FilePath
localizarConformidade = do
  definido <- lookupEnv "TCC_CONFORMANCE"
  case definido of
    Just p -> return p
    Nothing -> getCurrentDirectory >>= subir (10 :: Int)
  where
    subir n dir = do
      let cand = dir </> "shared" </> "conformance.json"
      existe <- doesFileExist cand
      if existe
        then return cand
        else
          if n == 0 || takeDirectory dir == dir
            then error "shared/conformance.json nao encontrado; defina TCC_CONFORMANCE"
            else subir (n - 1) (takeDirectory dir)

-- Programa ----------------------------------------------------------------------

substituir :: String -> String -> String -> String
substituir _ _ [] = []
substituir alvo novo s@(c : cs)
  | alvo `isPrefixOf` s = novo ++ drop (length alvo) s
  | otherwise = c : substituir alvo novo cs

main :: IO ()
main = do
  caminho <- localizarConformidade
  bruto <- A.eitherDecodeFileStrict caminho
  doc <- either (\m -> error ("JSON invalido: " ++ m)) return bruto
  putStrLn ("Conformidade: " ++ caminho ++ "\n")
  total <- newIORef (0 :: Int)
  falhas <- newIORef (0 :: Int)
  let verificar rotulo ok detalhe = do
        modifyIORef' total (+ 1)
        if ok
          then putStrLn ("ok     " ++ rotulo)
          else do
            modifyIORef' falhas (+ 1)
            putStrLn ("FALHA  " ++ rotulo ++ "\n       " ++ detalhe)
      casos = lista (campo "casos" doc)

  -- Oráculo: 28 casos x 2 implementações
  forM_ [("monadica", observarMonadica), ("ioref", observarIORef)] $ \(impl, observar) ->
    forM_ casos $ \caso -> do
      let nome = texto (campo "nome" caso)
          esperado = esperadoDe (campo "esperado" caso)
      obtido <- observar (exprDe (campo "expr" caso)) (paresDe (campo "env_inicial" caso))
      verificar
        ("[" ++ impl ++ "] " ++ nome)
        (obtido == esperado)
        ("esperado " ++ show esperado ++ ", obtido " ++ show obtido)

  -- Conformidade entre as réplicas
  let msgs = campo "mensagens" doc
      esperadaUnbound = substituir "{x}" "exemplo" (texto (campo "variavel_nao_vinculada" msgs))
  verificar
    "[conformidade] mensagens canonicas"
    (msgUnbound "exemplo" == esperadaUnbound && msgDivZero == texto (campo "divisao_por_zero" msgs))
    (show (msgUnbound "exemplo", msgDivZero))

  let geracao = campo "geracao" doc
      lcg = campo "lcg" geracao
      esperadosLcg = map inteiro (lista (campo "primeiros_valores" lcg))
      obtidosLcg = lcgSample (inteiro (campo "semente" lcg)) (length esperadosLcg)
  verificar "[conformidade] amostra do LCG" (obtidosLcg == esperadosLcg) (show obtidosLcg)

  let prim = campo "arith_primeiras_expressoes" geracao
      esperadas = map texto (lista (campo "expressoes" prim))
      obtidas = map sexp (take (length esperadas) (workload Arith (inteiro (campo "semente" prim))))
  verificar "[conformidade] primeiras expressoes de ARITH" (obtidas == esperadas) (unlines obtidas)

  let hashes = campo "hashes_cargas" geracao
      divergentes =
        [ scenarioName sc ++ "/" ++ show s ++ ": esperado " ++ esp ++ ", obtido " ++ obt
          | sc <- scenarios,
            s <- seeds,
            let esp = texto (campo (show s) (campo (scenarioName sc) hashes)),
            let obt = hashWorkload sc s,
            obt /= esp
        ]
  verificar
    "[conformidade] hashes das 12 cargas (4 cenarios x 3 sementes)"
    (null divergentes)
    (unlines divergentes)

  let nomes = map (texto . campo "nome") casos
      envsOrdenados = all (\c -> let e = paresDe (campo "env" (campo "esperado" c)) in e == sort e) casos
  verificar
    "[conformidade] tabela de casos (28, nomes unicos, env ordenado)"
    (length casos == 28 && length (nub nomes) == 28 && envsOrdenados)
    (show (length casos, length (nub nomes)))

  t <- readIORef total
  f <- readIORef falhas
  putStrLn ("\n" ++ show (t - f) ++ "/" ++ show t ++ " verificacoes passaram.")
  when (f > 0) exitFailure
  unless (f > 0) exitSuccess
