{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

-- | Métricas de código sobre a árvore sintática (ghc-lib-parser 9.4), para os
-- avaliadores Haskell. As definições operacionais estão em
-- @docs/protocolo-metricas.md@ e são as mesmas da ferramenta OCaml.
--
-- Uso: metricas-hs ARQUIVO.hs      -> JSON na saída padrão
--
-- * LOC efetiva: linhas com ao menos um token do léxico do GHC (comentários
--   e tokens virtuais de layout descartados).
-- * eval: assinatura de tipo + todas as equações; o despacho por construtor
--   (as equações) é o nível 1 de aninhamento. Cada equação é atribuída ao
--   construtor do primeiro padrão de construtor dos seus argumentos.
-- * Operações de efeito: cada vinculação monádica (cada comando de um bloco
--   do exceto o último, e cada aplicação de >>=, >> ou =<<) e cada uso de uma
--   operação sobre o estado, o erro, o IORef ou a emissão (lista
--   'operacoesNomeadas').
-- * Aninhamento: incrementam o nível case, if, multi-way if, \case e
--   lambdas; let e do não incrementam.
-- * Declarações: itens de topo com texto normalizado (tokens separados por
--   espaço); assinatura e equações de um mesmo nome formam uma declaração.
module Main (main) where

import Data.Aeson (Value, object, toJSON, (.=))
import qualified Data.Aeson as A
import qualified Data.Aeson.Key as K
import qualified Data.Aeson.KeyMap as KM
import qualified Data.ByteString.Lazy.Char8 as BL
import Data.Data (Data, cast, gmapQ)
import Data.List (foldl', isPrefixOf, sortOn)
import Data.Maybe (listToMaybe, mapMaybe)
import qualified Data.Set as Set
import GHC.Data.FastString (mkFastString)
import GHC.Data.StringBuffer (stringToStringBuffer)
import GHC.Driver.Config.Parser (initParserOpts)
import GHC.Driver.Session (DynFlags, defaultDynFlags)
import GHC.Hs
import GHC.Parser.Lexer (ParseResult (..), Token, lexTokenStream)
import GHC.Types.Name.Occurrence (occNameString)
import GHC.Types.Name.Reader (RdrName, rdrNameOcc)
import GHC.Types.SrcLoc
import GHC.Unit.Module.Name (moduleNameString)
import Language.Haskell.GhclibParserEx.GHC.Parser (parseFile)
import Language.Haskell.GhclibParserEx.GHC.Settings.Config (fakeLlvmConfig, fakeSettings)
import System.Environment (getArgs)
import System.Exit (ExitCode (..), exitWith)
import System.IO (IOMode (..), hGetContents, hPutStrLn, hSetEncoding, openFile, stderr, utf8)

dflags :: DynFlags
dflags = defaultDynFlags fakeSettings fakeLlvmConfig

-- Léxico ------------------------------------------------------------------------

-- | (linha inicial, linha final, coluna inicial, coluna final) de cada token
-- real (não comentário, não virtual).
tokens :: FilePath -> String -> [(Int, Int, Int, Int)]
tokens arquivo src =
  case lexTokenStream (initParserOpts dflags) (stringToStringBuffer src) (mkRealSrcLoc (mkFastString arquivo) 1 1) of
    PFailed _ -> error "falha no lexico"
    POk _ ts -> mapMaybe real ts
  where
    real :: Located Token -> Maybe (Int, Int, Int, Int)
    real (L (RealSrcSpan r _) t)
      | comentario t = Nothing
      | srcSpanStartLine r == srcSpanEndLine r && srcSpanStartCol r == srcSpanEndCol r = Nothing
      | otherwise = Just (srcSpanStartLine r, srcSpanEndLine r, srcSpanStartCol r, srcSpanEndCol r)
    real _ = Nothing
    comentario t = any (`isPrefixOf` show t) ["ITlineComment", "ITblockComment", "ITdocComment", "ITdocOptions"]

linhasEfetivas :: [(Int, Int, Int, Int)] -> Set.Set Int
linhasEfetivas ts = Set.fromList (concat [[a .. b] | (a, b, _, _) <- ts])

contarLinhas :: Set.Set Int -> (Int, Int) -> Int
contarLinhas efetivas (a, b) = Set.size (Set.filter (\l -> l >= a && l <= b) efetivas)

faixa :: SrcSpan -> (Int, Int)
faixa (RealSrcSpan r _) = (srcSpanStartLine r, srcSpanEndLine r)
faixa _ = (0, -1)

-- | Texto normalizado de um trecho: os tokens reais dentro do span, separados
-- por um espaço (insensível a espaços, quebras de linha e comentários).
normalizar :: [String] -> [(Int, Int, Int, Int)] -> SrcSpan -> String
normalizar linhas ts (RealSrcSpan r _) =
  unwords
    [ textoToken t
      | t@(a, _, c, _) <- ts,
        (a, c) >= (srcSpanStartLine r, srcSpanStartCol r),
        dentroFim t
    ]
  where
    dentroFim (_, b, _, d) = (b, d) <= (srcSpanEndLine r, srcSpanEndCol r)
    textoToken (a, b, c, d)
      | a == b = take (d - c) (drop (c - 1) (linhas !! (a - 1)))
      | otherwise = unwords (map (linhas !!) [a - 1 .. b - 1])
normalizar _ _ _ = ""

-- Operações de efeito e aninhamento -----------------------------------------------

operacoesNomeadas :: [String]
operacoesNomeadas =
  [ "get",
    "put",
    "gets",
    "modify",
    "modify'",
    "state",
    "throwError",
    "catchError",
    "readIORef",
    "writeIORef",
    "modifyIORef",
    "modifyIORef'",
    "atomicModifyIORef'",
    "throwIO",
    "throw",
    "emit",
    "liftIO",
    "lift"
  ]

nomeDe :: RdrName -> String
nomeDe = occNameString . rdrNameOcc

contarOperacoes :: forall a. (Data a) => a -> Int
contarOperacoes x = proprio + sum (gmapQ contarOperacoes x)
  where
    proprio = case cast x :: Maybe (HsExpr GhcPs) of
      Just (HsVar _ (L _ n)) | nomeDe n `elem` operacoesNomeadas -> 1
      Just (OpApp _ _ (L _ (HsVar _ (L _ op))) _) | nomeDe op `elem` [">>=", ">>", "=<<"] -> 1
      Just (HsDo _ _ (L _ comandos)) -> max 0 (length comandos - 1)
      _ -> 0

profundidade :: forall a. (Data a) => a -> Int
profundidade x = case cast x :: Maybe (HsExpr GhcPs) of
  Just (HsCase _ escrutinio mg) -> max (profundidade escrutinio) (1 + profundidade mg)
  Just (HsIf _ c t e) -> max (profundidade c) (1 + max (profundidade t) (profundidade e))
  Just e@HsMultiIf {} -> 1 + filhos e
  Just e@HsLam {} -> 1 + filhos e
  Just e@HsLamCase {} -> 1 + filhos e
  _ -> filhos x
  where
    filhos :: forall b. (Data b) => b -> Int
    filhos y = maximum (0 : gmapQ profundidade y)

-- | Construtor do primeiro padrão de construtor encontrado nos argumentos.
construtorDoPadrao :: forall a. (Data a) => a -> Maybe String
construtorDoPadrao x = case cast x :: Maybe (Pat GhcPs) of
  Just (ConPat _ (L _ n) _) -> Just (nomeDe n)
  _ -> listToMaybe (mapMaybe id (gmapQ construtorDoPadrao x))

-- Declarações -------------------------------------------------------------------

data Item = Item {itemNome :: String, itemSpans :: [SrcSpan], itemSub :: [(String, SrcSpan)]}

itensDe :: HsModule -> [Item]
itensDe m = importacoes ++ juntar (concatMap item (hsmodDecls m))
  where
    importacoes =
      [ Item ("import " ++ moduleNameString (unLoc (ideclName i))) [getLocA li] []
        | li@(L _ i) <- hsmodImports m
      ]
    item :: LHsDecl GhcPs -> [Item]
    item ld@(L _ d) = case d of
      SigD _ (TypeSig _ nomes _) -> [Item (nomeDe (unLoc n)) [getLocA ld] [] | n <- nomes]
      ValD _ fb@FunBind {} ->
        let MG _ (L _ eqs) _ = fun_matches fb
         in [ Item
                (nomeDe (unLoc (fun_id fb)))
                [getLocA ld]
                [ (maybe "_" id (construtorDoPadrao (m_pats eq)), getLocA le)
                  | le@(L _ eq) <- eqs
                ]
            ]
      TyClD _ dd@DataDecl {} ->
        [ Item
            ("data " ++ nomeDe (unLoc (tcdLName dd)))
            [getLocA ld]
            [ (nomeDe (unLoc n), getLocA lc)
              | lc@(L _ c@ConDeclH98 {}) <- dd_cons (tcdDataDefn dd),
                let n = con_name c
            ]
        ]
      TyClD _ sd@SynDecl {} -> [Item ("type " ++ nomeDe (unLoc (tcdLName sd))) [getLocA ld] []]
      InstD _ _ -> [Item ("instance@" ++ show (fst (faixa (getLocA ld)))) [getLocA ld] []]
      _ -> [Item ("decl@" ++ show (fst (faixa (getLocA ld)))) [getLocA ld] []]
    -- assinatura e equações de um mesmo nome formam uma declaração
    juntar = foldr inserir []
    inserir it acc = case break ((== itemNome it) . itemNome) acc of
      (antes, outro : depois) -> antes ++ [Item (itemNome it) (itemSpans it ++ itemSpans outro) (itemSub it ++ itemSub outro)] ++ depois
      _ -> it : acc

-- Programa ----------------------------------------------------------------------------

main :: IO ()
main = do
  args <- getArgs
  arquivo <- case args of
    [a] -> return a
    _ -> hPutStrLn stderr "uso: metricas-hs ARQUIVO.hs" >> exitWith (ExitFailure 2)
  h <- openFile arquivo ReadMode
  hSetEncoding h utf8
  src <- hGetContents h
  length src `seq` return ()
  modulo <- case parseFile arquivo dflags src of
    POk _ (L _ m) -> return m
    PFailed _ -> hPutStrLn stderr ("falha ao analisar " ++ arquivo) >> exitWith (ExitFailure 1)
  let ts = tokens arquivo src
      efetivas = linhasEfetivas ts
      linhas = lines src
      itens = itensDe modulo
      evalItem = listToMaybe [i | i <- itens, itemNome i == "eval"]
      decls = [d | L _ d <- hsmodDecls modulo]
      equacoes =
        [ le
          | ValD _ fb@FunBind {} <- decls,
            nomeDe (unLoc (fun_id fb)) == "eval",
            let MG _ (L _ eqs) _ = fun_matches fb,
            le <- eqs
        ]
      faixasEval = maybe [] (map faixa . itemSpans) evalItem
      dentroEval l = any (\(a, b) -> l >= a && l <= b) faixasEval
      locEval = Set.size (Set.filter dentroEval efetivas)
      porConstrutor =
        [ ( maybe "_" id (construtorDoPadrao (m_pats eq)),
            object
              [ "loc" .= contarLinhas efetivas (faixa (getLocA le)),
                "operacoes" .= contarOperacoes eq,
                "profundidade" .= (1 + profundidade (m_grhss eq))
              ]
          )
          | le@(L _ eq) <- equacoes
        ]
      fora = sortOn id (filter (not . dentroEval) (Set.toList efetivas))
      jsonDecl it =
        object
          ( [ "nome" .= itemNome it,
              "texto" .= unwords (map (normalizar linhas ts) (itemSpans it))
            ]
              ++ [ "subitens" .= objetoDe [(k, toJSON (normalizar linhas ts s)) | (k, s) <- itemSub it]
                   | not (null (itemSub it)),
                     not ("eval" == itemNome it)
                 ]
          )
      bracos = maybe [] itemSub evalItem
      json =
        object
          [ "arquivo" .= arquivo,
            "linguagem" .= ("haskell" :: String),
            "loc_arquivo" .= Set.size efetivas,
            "eval"
              .= object
                [ "loc" .= locEval,
                  "operacoes" .= sum (map (\(L _ eq) -> contarOperacoes eq) equacoes),
                  "profundidade" .= (1 + foldl' max 0 (map (\(L _ eq) -> profundidade (m_grhss eq)) equacoes)),
                  "por_construtor" .= objetoDe porConstrutor,
                  "bracos" .= objetoDe [(k, toJSON (normalizar linhas ts s)) | (k, s) <- bracos]
                ],
            "loc_fora_de_eval" .= length fora,
            "linhas_fora_de_eval" .= [object ["linha" .= l, "texto" .= (linhas !! (l - 1))] | l <- fora],
            "declaracoes" .= map jsonDecl itens
          ]
  BL.putStrLn (A.encode json)
  where
    objetoDe :: [(String, Value)] -> Value
    objetoDe kvs = A.Object (KM.fromList [(K.fromString k, v) | (k, v) <- kvs])
