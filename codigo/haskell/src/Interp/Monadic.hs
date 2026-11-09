-- | Interpretador com monad transformers, no estilo mtl (Seção 5.1).
--
-- A pilha é @ExceptT String (StateT Env IO)@: com ExceptT externo, o estado
-- sobrevive ao lançamento da exceção, como exige o critério (ii) de
-- equivalência. A pilha inversa, @StateT Env (ExceptT String IO)@, descartaria
-- o estado no erro; o caso "estado e saida sobrevivem ao erro" da suíte de
-- oráculo falha nela.
--
-- A divisão usa 'quot' (trunca em direção a zero, como o @/@ do OCaml), e não
-- 'div' (arredonda para baixo). 'Control.Monad.State.Strict', 'Data.Map.Strict',
-- 'modify'' e @$!@ dão a mesma disciplina de strictness da linha de base.
module Interp.Monadic
  ( Env,
    Interp,
    eval,
    emit,
    run,
  )
where

import Control.Monad (when)
import Control.Monad.Except (ExceptT, runExceptT, throwError)
import Control.Monad.IO.Class (liftIO)
import Control.Monad.State.Strict (StateT, get, modify', runStateT)
import Data.IORef (readIORef)
import Data.Map.Strict (Map)
import qualified Data.Map.Strict as Map
import Expr

type Env = Map String Int

type Interp a = ExceptT String (StateT Env IO) a

-- | Emissão pela referência 'emitRef', substituída pela suíte e pelo harness.
emit :: Int -> Interp ()
emit v = liftIO (readIORef emitRef >>= \f -> f v)

eval :: Expr -> Interp Int
eval (Num n) = return n
eval (Var x) = do
  env <- get
  maybe (throwError (msgUnbound x)) return (Map.lookup x env)
eval (Add a b) = do
  x <- eval a
  y <- eval b
  return $! x + y
eval (Mul a b) = do
  x <- eval a
  y <- eval b
  return $! x * y
eval (Div a b) = do
  x <- eval a
  y <- eval b
  when (y == 0) (throwError msgDivZero)
  return $! x `quot` y
eval (Let x e b) = do
  v <- eval e
  modify' (Map.insert x v)
  eval b
eval (Seq a b) = eval a >> eval b
eval (Print e) = do
  v <- eval e
  emit v
  return v

-- | Executa a pilha sobre uma expressão, a partir de um ambiente. O
-- tratamento de erro é por expressão avaliada, como na versão com handlers.
run :: Env -> Expr -> IO (Either String Int, Env)
run env e = runStateT (runExceptT (eval e)) env
