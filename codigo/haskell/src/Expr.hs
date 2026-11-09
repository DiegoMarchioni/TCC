-- | Núcleo comum: sintaxe, mensagens canônicas, emissão e geração de cargas.
--
-- A geração reproduz exatamente a especificação de @referencia/gerador.py@;
-- o teste de conformidade confere a réplica contra os hashes gravados em
-- @shared/conformance.json@.
module Expr
  ( Expr (..),
    msgUnbound,
    msgDivZero,
    emitRef,
    Scenario (..),
    scenarios,
    scenarioName,
    scenarioFromString,
    seeds,
    nExpr,
    nVars,
    lcgSample,
    workload,
    sexp,
    workloadText,
    fnv1a64,
    hashWorkload,
  )
where

import Control.DeepSeq (NFData (..))
import Control.Monad (replicateM)
import Control.Monad.State.Strict (State, evalState, get, put)
import Data.Bits (shiftR, xor, (.&.))
import Data.Char (ord)
import Data.IORef (IORef, newIORef)
import Data.List (foldl')
import Data.Word (Word64)
import Numeric (showHex)
import System.IO.Unsafe (unsafePerformIO)

data Expr
  = Num Int
  | Var String
  | Add Expr Expr
  | Mul Expr Expr
  | Div Expr Expr
  | Let String Expr Expr
  | Seq Expr Expr
  | Print Expr
  deriving (Eq, Show)

instance NFData Expr where
  rnf (Num n) = rnf n
  rnf (Var x) = rnf x
  rnf (Add a b) = rnf a `seq` rnf b
  rnf (Mul a b) = rnf a `seq` rnf b
  rnf (Div a b) = rnf a `seq` rnf b
  rnf (Let x e b) = rnf x `seq` rnf e `seq` rnf b
  rnf (Seq a b) = rnf a `seq` rnf b
  rnf (Print e) = rnf e

-- Mensagens canônicas (critério (iv) de equivalência) -------------------

msgUnbound :: String -> String
msgUnbound x = "variavel nao vinculada: " ++ x

msgDivZero :: String
msgDivZero = "divisao por zero"

-- Emissão ----------------------------------------------------------------

-- | Referência a função pela qual as duas versões Haskell emitem. A suíte de
-- oráculo e o harness a substituem temporariamente.
emitRef :: IORef (Int -> IO ())
emitRef = unsafePerformIO (newIORef print)
{-# NOINLINE emitRef #-}

-- Gerador congruencial linear ---------------------------------------------
--
-- x_{n+1} = (1103515245 x_n + 12345) mod 2^30. O produto cabe em Int de 64
-- bits. As escolhas usam os bits altos, (x `shiftR` 15) `mod` n.

type Gen = State Int

proximo :: Gen Int
proximo = do
  x <- get
  let x' = (1103515245 * x + 12345) .&. (2 ^ (30 :: Int) - 1)
  put x'
  return x'

pick :: Int -> Gen Int
pick n = do
  x <- proximo
  return ((x `shiftR` 15) `mod` n)

lit :: Gen Int
lit = pick 101

divisor :: Gen Int
divisor = (1 +) <$> pick 9

-- | Primeiros @n@ valores do LCG a partir de uma semente (conformidade).
lcgSample :: Int -> Int -> [Int]
lcgSample semente n = evalState (replicateM n proximo) semente

-- A notação do sequencia os sorteios na ordem da especificação: subárvore
-- esquerda antes da direita.
arith :: Int -> Gen Expr
arith 0 = Num <$> lit
arith d = do
  op <- pick 3
  case op of
    2 -> do
      l <- arith (d - 1)
      r <- divisor
      return (Div l (Num r))
    _ -> do
      l <- arith (d - 1)
      r <- arith (d - 1)
      return (if op == 0 then Add l r else Mul l r)

data Scenario = Arith | State | Exn | Output
  deriving (Eq, Show, Enum, Bounded)

scenarios :: [Scenario]
scenarios = [minBound .. maxBound]

scenarioName :: Scenario -> String
scenarioName Arith = "arith"
scenarioName State = "state"
scenarioName Exn = "exn"
scenarioName Output = "output"

scenarioFromString :: String -> Scenario
scenarioFromString "arith" = Arith
scenarioFromString "state" = State
scenarioFromString "exn" = Exn
scenarioFromString "output" = Output
scenarioFromString s = error ("cenario desconhecido: " ++ s)

seeds :: [Int]
seeds = [42, 43, 44]

nExpr, nVars :: Int
nExpr = 10000
nVars = 500

varName :: Int -> String
varName i = 'v' : show i

workload :: Scenario -> Int -> [Expr]
workload sc semente = evalState (gerar sc) semente
  where
    gerar Arith = replicateM nExpr (arith 3)
    gerar State = do
      valores <- replicateM nVars lit
      let prefixo =
            foldr
              (\(i, v) corpo -> Let (varName i) (Num v) corpo)
              (Num 0)
              (zip [0 ..] valores)
      corpo <- replicateM nExpr $ do
        op <- pick 2
        a <- pick nVars
        b <- pick nVars
        let va = Var (varName a)
            vb = Var (varName b)
        return (if op == 0 then Add va vb else Mul va vb)
      return (prefixo : corpo)
    gerar Exn =
      mapM
        ( \i ->
            if i `mod` 5 == 4
              then do
                l <- arith 2
                return (Div l (Num 0))
              else arith 3
        )
        [0 .. nExpr - 1]
    gerar Output = replicateM nExpr $ do
      op <- pick 2
      a <- lit
      b <- lit
      let pa = Print (Num a)
          pb = Print (Num b)
      return (if op == 0 then Add pa pb else Mul pa pb)

-- Serialização canônica e FNV-1a de 64 bits --------------------------------

sexpS :: Expr -> ShowS
sexpS (Num n) = showString "(Num " . shows n . showChar ')'
sexpS (Var x) = showString "(Var " . showString x . showChar ')'
sexpS (Add a b) = bin "Add" a b
sexpS (Mul a b) = bin "Mul" a b
sexpS (Div a b) = bin "Div" a b
sexpS (Seq a b) = bin "Seq" a b
sexpS (Let x e b) =
  showString "(Let " . showString x . showChar ' ' . sexpS e . showChar ' ' . sexpS b . showChar ')'
sexpS (Print e) = showString "(Print " . sexpS e . showChar ')'

bin :: String -> Expr -> Expr -> ShowS
bin tag a b = showChar '(' . showString tag . showChar ' ' . sexpS a . showChar ' ' . sexpS b . showChar ')'

sexp :: Expr -> String
sexp e = sexpS e ""

workloadText :: Scenario -> Int -> String
workloadText sc semente = concatMap (\e -> sexpS e "\n") (workload sc semente)

-- | FNV-1a de 64 bits. As cadeias são ASCII, de modo que caractere = byte.
fnv1a64 :: String -> String
fnv1a64 s = pad (showHex h "")
  where
    h = foldl' (\acc c -> (acc `xor` fromIntegral (ord c)) * 0x100000001b3) (0xcbf29ce484222325 :: Word64) s
    pad t = replicate (16 - length t) '0' ++ t

hashWorkload :: Scenario -> Int -> String
hashWorkload sc semente = fnv1a64 (workloadText sc semente)
