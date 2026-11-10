# Métricas de código (gerado por scripts/metricas.py tabela)

Comparação vertical: dentro de cada linguagem.

| Implementação | LOC eval | Operações | Aninhamento | LOC fora de eval | Boilerplate (regra) | Reutilização | LOC arquivo |
|---|---:|---:|---:|---:|---:|---:|---:|
| handlers | 29 | 5 | 2 | 78 | 67 | 2 | 107 |
| imperativa | 29 | 5 | 2 | 4 | 3 | 0 | 33 |
| monadas | 27 | 18 | 1 | 22 | 20 | 0 | 49 |
| ioref | 27 | 18 | 1 | 26 | 22 | 0 | 53 |

## Operações de efeito por construtor

| Implementação | Num | Var | Add | Mul | Div | Let | Seq | Print |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| handlers | 0 | 2 | 0 | 0 | 1 | 1 | 0 | 1 |
| imperativa | 0 | 2 | 0 | 0 | 1 | 1 | 0 | 1 |
| monadas | 0 | 3 | 2 | 2 | 4 | 3 | 1 | 3 |
| ioref | 0 | 3 | 2 | 2 | 4 | 3 | 1 | 3 |

## Reutilização (pontos de instalação por handler ou camada)

- handlers: {'run_state': 2, 'run_exn': 2, 'run_output_emit': 1, 'run_output_acc': 1} -> 2 instância(s)
- imperativa: nenhum -> 0 instância(s)
- monadas: {'runStateT': 1, 'runExceptT': 1} -> 0 instância(s)
- ioref: nenhum -> 0 instância(s)

Boilerplate (regra): linhas fora de eval sem marcador semântico, pela regra da seção 4 de docs/protocolo-metricas.md; a classificação de cada linha, com o motivo, está em resultados/boilerplate-regra/<impl>.csv. As planilhas em resultados/boilerplate/ servem à validação humana independente (comando concordancia).
