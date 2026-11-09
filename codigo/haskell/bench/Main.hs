{-# LANGUAGE BangPatterns #-}

-- | Harness Criterion (Seção 4.3 do artigo).
--
-- Para cada cenário, mede a versão monádica (mecanismo) e a linha de base com
-- IORef sobre a MESMA carga, gerada e forçada à forma normal uma única vez
-- fora da região medida, e grava uma linha CSV por versão, no mesmo formato
-- do harness OCaml, com tempo e alocação absolutos por execução da carga,
-- IC de 95% por bootstrap (do próprio Criterion) e R².
--
-- Variáveis de ambiente (todas opcionais):
--   TCC_SEED      semente do gerador                    (padrão 42)
--   TCC_QUOTA     limite de tempo por teste, em segundos (padrão 20)
--   TCC_RESAMPLES reamostragens do bootstrap             (padrão 1000)
--   TCC_CENARIOS  lista separada por vírgulas            (padrão todos)
--   TCC_SAIDA     arquivo CSV de saída                   (padrão stdout)
--
-- Decisões de medição:
-- * O ambiente é recriado a cada execução na preparação de 'perRunEnv', que
--   o Criterion mantém fora da medição, para as DUAS versões: Map vazio na
--   monádica, IORef novo com Map vazio na linha de base.
-- * As duas versões emitem pela mesma referência 'emitRef', aqui um
--   acumulador zerado na preparação.
-- * O tratamento de erro é por expressão: a pilha é executada uma vez por
--   expressão (runStateT/runExceptT), e a linha de base captura a exceção uma
--   vez por expressão ('B.run').
-- * A alocação vem da regressão allocated:iters, que exige +RTS -T (já
--   embutido no executável por -with-rtsopts).
-- * A ordem alterna entre cenários, como no harness OCaml.
-- * Antes de medir, confere-se que as duas versões produzem a mesma soma, o
--   mesmo número de erros e o mesmo traço.
module Main (main) where

import Control.DeepSeq (NFData (..), force)
import Control.Exception (evaluate)
import Control.Monad (forM_, when)
import Criterion.IO (readJSONReports)
import Criterion.Main (Benchmarkable, bench, defaultConfig, defaultMainWith, perRunEnv)
import Criterion.Types
  ( Config (..),
    Regression (..),
    Report (..),
    SampleAnalysis (..),
    Verbosity (..),
  )
import Data.IORef
import Data.List (find)
import qualified Data.Map.Strict as Map
import Data.Maybe (fromMaybe)
import Expr
import qualified Interp.IORefBase as B
import qualified Interp.Monadic as M
import Statistics.Types (ConfInt (..), Estimate (..))
import System.Directory (getTemporaryDirectory, removeFile)
import System.Environment (lookupEnv, withArgs)
import System.Exit (exitFailure)
import System.FilePath ((</>))
import System.IO
import Text.Printf (hPrintf)

data Desfecho = Desfecho !Int !Int
  deriving (Eq, Show)

instance NFData Desfecho where
  rnf (Desfecho a b) = a `seq` b `seq` ()

envLeitura :: (Read a) => String -> a -> IO a
envLeitura nome padrao = maybe padrao read <$> lookupEnv nome

-- Execução de uma carga ---------------------------------------------------------

executarMonadica :: [Expr] -> M.Env -> IO Desfecho
executarMonadica exprs env0 = go env0 exprs 0 0
  where
    go _ [] !soma !erros = return (Desfecho soma erros)
    go env (e : es) !soma !erros = do
      (r, env') <- M.run env e
      case r of
        Right v -> go env' es (soma + v) erros
        Left _ -> go env' es soma (erros + 1)

executarIORef :: [Expr] -> IORef B.Env -> IO Desfecho
executarIORef exprs ref = go exprs 0 0
  where
    go [] !soma !erros = return (Desfecho soma erros)
    go (e : es) !soma !erros = do
      r <- B.run ref e
      case r of
        Right v -> go es (soma + v) erros
        Left _ -> go es soma (erros + 1)

-- Medição e extração do relatório ---------------------------------------------------

data Estimativa = Estimativa {valor :: Double, icInf :: Double, icSup :: Double, r2 :: Double}

estimativa :: Double -> Regression -> Estimativa
estimativa escala reg =
  let coef = fromMaybe (error "regressao sem coeficiente iters") (Map.lookup "iters" (regCoeffs reg))
      p = estPoint coef
      ci = estError coef
   in Estimativa
        { valor = p * escala,
          icInf = (p - confIntLDX ci) * escala,
          icSup = (p + confIntUDX ci) * escala,
          r2 = estPoint (regRSquare reg)
        }

medir :: Config -> String -> Benchmarkable -> IO (Int, Estimativa, Estimativa)
medir cfg nome benchmarkavel = do
  tmp <- getTemporaryDirectory
  let arquivo = tmp </> ("tcc-criterion-" ++ map (\c -> if c == '/' then '-' else c) nome ++ ".json")
  withArgs [] $ defaultMainWith cfg {jsonFile = Just arquivo} [bench nome benchmarkavel]
  lido <- readJSONReports arquivo
  removeFile arquivo
  (_, _, relatorios) <- either (\m -> error ("relatorio JSON invalido: " ++ m)) return lido
  rel <- maybe (error "relatorio vazio") return (find ((== nome) . reportName) relatorios)
  let regs = anRegress (reportAnalysis rel)
      achar resp = fromMaybe (error ("regressao ausente: " ++ resp)) (find ((== resp) . regResponder) regs)
  return
    ( length (reportMeasured rel),
      estimativa 1e9 (achar "time"),
      estimativa 1 (achar "allocated")
    )

cabecalho :: String
cabecalho =
  "linguagem,cenario,implementacao,papel,semente,n_expressoes,amostras,\
  \tempo_ns,tempo_ic_inf,tempo_ic_sup,tempo_r2,alocacao,alocacao_ic_inf,\
  \alocacao_ic_sup,alocacao_r2,unidade_alocacao"

main :: IO ()
main = do
  semente <- envLeitura "TCC_SEED" (42 :: Int)
  quota <- envLeitura "TCC_QUOTA" (20 :: Double)
  reamostras <- envLeitura "TCC_RESAMPLES" (1000 :: Int)
  cenariosEnv <- lookupEnv "TCC_CENARIOS"
  saidaEnv <- lookupEnv "TCC_SAIDA"
  let cens = case cenariosEnv of
        Nothing -> scenarios
        Just "" -> scenarios
        Just s -> map scenarioFromString (separar s)
      cfg =
        defaultConfig
          { resamples = reamostras,
            timeLimit = quota,
            regressions = [(["iters"], "allocated")],
            verbosity = Quiet
          }
  hSaida <- case saidaEnv of
    Just p | not (null p) -> openFile p WriteMode
    _ -> return stdout
  hPutStrLn hSaida cabecalho
  acc <- newIORef ([] :: [Int])
  writeIORef emitRef (\v -> modifyIORef' acc (v :))
  forM_ (zip [0 :: Int ..] cens) $ \(idx, sc) -> do
    exprs <- evaluate (force (workload sc semente))
    let nomeSc = scenarioName sc
    -- Pré-condição: mesmo desfecho e mesmo traço nas duas versões.
    writeIORef acc []
    dM <- executarMonadica exprs Map.empty
    trM <- readIORef acc
    writeIORef acc []
    dB <- newIORef Map.empty >>= executarIORef exprs
    trB <- readIORef acc
    when (dM /= dB || trM /= trB) $ do
      hPrintf stderr "ERRO: versoes divergem em %s/%d: %s vs %s\n" nomeSc semente (show dM) (show dB)
      exitFailure
    let versoes =
          [ ( "ioref",
              "base",
              perRunEnv (writeIORef acc [] >> newIORef Map.empty) (executarIORef exprs)
            ),
            ( "monadica",
              "mecanismo",
              perRunEnv (writeIORef acc [] >> return Map.empty) (executarMonadica exprs)
            )
          ]
        ordenadas = if even idx then versoes else reverse versoes
    forM_ ordenadas $ \(impl, papel, benchmarkavel) -> do
      hPrintf stderr "[haskell] %s/%d %s ..." nomeSc semente impl
      hFlush stderr
      (amostras, t, a) <- medir cfg (nomeSc ++ "/" ++ impl) benchmarkavel
      hPrintf stderr " %.0f ns, %.0f bytes, R2=%.4f (%d amostras)\n" (valor t) (valor a) (r2 t) amostras
      hPrintf
        hSaida
        "haskell,%s,%s,%s,%d,%d,%d,%.1f,%.1f,%.1f,%.5f,%.2f,%.2f,%.2f,%.5f,bytes\n"
        nomeSc
        impl
        (papel :: String)
        semente
        (length exprs)
        amostras
        (valor t)
        (icInf t)
        (icSup t)
        (r2 t)
        (valor a)
        (icInf a)
        (icSup a)
        (r2 a)
      hFlush hSaida
  when (hSaida /= stdout) (hClose hSaida)
  where
    separar s = case break (== ',') s of
      (a, []) -> [a]
      (a, _ : resto) -> a : separar resto
