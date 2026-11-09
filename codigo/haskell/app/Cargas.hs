-- | Imprime uma carga na serialização canônica, ou o seu hash.
--
-- Uso: cabal run -v0 cargas -- CENARIO SEMENTE [--hash]
module Main (main) where

import Expr
import System.Environment (getArgs)
import System.Exit (ExitCode (..), exitWith)
import System.IO (hPutStrLn, stderr)

main :: IO ()
main = do
  args <- getArgs
  case args of
    [sc, s] -> putStr (workloadText (scenarioFromString sc) (read s))
    [sc, s, "--hash"] -> putStrLn (hashWorkload (scenarioFromString sc) (read s))
    _ -> do
      hPutStrLn stderr "uso: cargas arith|state|exn|output SEMENTE [--hash]"
      exitWith (ExitFailure 2)
