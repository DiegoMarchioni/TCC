-- | Linha de base quase imperativa em Haskell (Seção 5.1).
--
-- Realiza os três efeitos pelos meios diretos de IO: o ambiente é um 'IORef'
-- contendo o MESMO @Map String Int@ da versão monádica (e não uma tabela de
-- espalhamento), de modo que a razão entre as duas isole o mecanismo, e não a
-- representação do ambiente; erros por 'throwIO'; saída pela referência
-- 'emitRef'. Cada braço usa as mesmas construções da versão monádica
-- ('maybe', 'when', @$!@): a diferença reduz-se às operações de efeito.
module Interp.IORefBase
  ( Env,
    RuntimeError (..),
    eval,
    emit,
    run,
  )
where

import Control.Exception (Exception, throwIO, try)
import Control.Monad (when)
import Data.IORef (IORef, modifyIORef', readIORef)
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map
import Expr

type Env = Map String Int

newtype RuntimeError = RuntimeError String
  deriving (Show)

instance Exception RuntimeError

-- | Emissão pela referência 'emitRef', substituída pela suíte e pelo harness.
emit :: Int -> IO ()
emit v = readIORef emitRef >>= \f -> f v

eval :: IORef Env -> Expr -> IO Int
eval _ (Num n) = return n
eval ref (Var x) = do
  env <- readIORef ref
  maybe (throwIO (RuntimeError (msgUnbound x))) return (Map.lookup x env)
eval ref (Add a b) = do
  x <- eval ref a
  y <- eval ref b
  return $! x + y
eval ref (Mul a b) = do
  x <- eval ref a
  y <- eval ref b
  return $! x * y
eval ref (Div a b) = do
  x <- eval ref a
  y <- eval ref b
  when (y == 0) (throwIO (RuntimeError msgDivZero))
  return $! x `quot` y
eval ref (Let x e b) = do
  v <- eval ref e
  modifyIORef' ref (Map.insert x v)
  eval ref b
eval ref (Seq a b) = eval ref a >> eval ref b
eval ref (Print e) = do
  v <- eval ref e
  emit v
  return v

-- | Tratamento de erro por expressão avaliada.
run :: IORef Env -> Expr -> IO (Either String Int)
run ref e = do
  r <- try (eval ref e)
  return $ case r of
    Left (RuntimeError m) -> Left m
    Right v -> Right v
