# Semântica operacional da linguagem do caso de uso

Este documento é a especificação formal a que o artigo remete ("O domínio e as
regras acompanham o repositório", Seção 4.1). A implementação executável, regra
por regra, está em [`../referencia/semantica.py`](../referencia/semantica.py).

## Sintaxe

| Expressão | Notação | Significado |
|---|---|---|
| Literal | `Num n` | inteiro *n* |
| Variável | `Var x` | leitura do ambiente |
| Adição | `Add e₁ e₂` | soma |
| Multiplicação | `Mul e₁ e₂` | produto |
| Divisão | `Div e₁ e₂` | divisão inteira truncada em direção a zero; erro se o divisor é 0 |
| Ligação | `Let x e b` | avalia *e*, vincula (ou revincula) *x* no ambiente **global** e avalia *b*; o vínculo persiste após *b* |
| Sequência | `Seq e₁ e₂` | avalia *e₁*, descarta o valor, avalia *e₂* |
| Impressão | `Print e` | emite o valor de *e* e o devolve |

## Domínio

- 𝓔: expressões; *Var*: identificadores; ℤ: inteiros.
- Estado (ambiente) σ : *Var* ⇀ ℤ, função parcial finita; Σ é o conjunto de estados.
- Traço de saída ω ∈ ℤ\*.
- *Msg* = { msg_unbound(x) | x ∈ *Var* } ∪ { msg_div_zero }, com as cadeias
  canônicas de [`../shared/conformance.json`](../shared/conformance.json).
- Valores: identifica-se o inteiro *n* com `Num n`.
- Configurações: 𝓒 = (𝓔 × Σ × ℤ\*) ∪ ({⊥err} × *Msg* × Σ × ℤ\*). As do segundo
  tipo (de erro) são terminais.
- Resultados 𝓡 ⊆ 𝓒: ⟨v, σ, ω⟩ com v ∈ ℤ, e ⟨⊥err, m, σ, ω⟩.

## Contextos de avaliação

```
E ::= □ | Add E e | Add v E | Mul E e | Mul v E | Div E e | Div v E
    | Let x E b | Seq E e | Print E
```

A forma dos contextos fixa a ordem de avaliação à esquerda: o operando direito
só é reduzido depois que o esquerdo se torna valor. A decomposição de uma
configuração em contexto e redex é única, e daí vem o determinismo de ⇒.

## Regras

```
(Var)       x ∈ dom(σ)  ⟹  ⟨Var x, σ, ω⟩ ⇒ ⟨σ(x), σ, ω⟩
(Var-err)   x ∉ dom(σ)  ⟹  ⟨Var x, σ, ω⟩ ⇒ ⟨⊥err, msg_unbound(x), σ, ω⟩
(Add)       ⟨Add n₁ n₂, σ, ω⟩ ⇒ ⟨n₁ + n₂, σ, ω⟩
(Mul)       ⟨Mul n₁ n₂, σ, ω⟩ ⇒ ⟨n₁ × n₂, σ, ω⟩
(Div)       n₂ ≠ 0  ⟹  ⟨Div n₁ n₂, σ, ω⟩ ⇒ ⟨n₁ ÷ n₂, σ, ω⟩
(Div-zero)  ⟨Div n₁ 0, σ, ω⟩ ⇒ ⟨⊥err, msg_div_zero, σ, ω⟩
(Let)       ⟨Let x n b, σ, ω⟩ ⇒ ⟨b, σ[x ↦ n], ω⟩
(Seq)       ⟨Seq n e₂, σ, ω⟩ ⇒ ⟨e₂, σ, ω⟩
(Print)     ⟨Print n, σ, ω⟩ ⇒ ⟨n, σ, ω · n⟩
(Cong)      ⟨e, σ, ω⟩ ⇒ ⟨e′, σ′, ω′⟩  ⟹  ⟨E[e], σ, ω⟩ ⇒ ⟨E[e′], σ′, ω′⟩
(Err-prop)  ⟨e, σ, ω⟩ ⇒ ⟨⊥err, m, σ′, ω′⟩  ⟹  ⟨E[e], σ, ω⟩ ⇒ ⟨⊥err, m, σ′, ω′⟩
```

÷ é a divisão inteira com truncamento em direção a zero (`/` do OCaml, `quot`
do Haskell; **não** `div`, que arredonda para baixo). ω · n é a concatenação à
direita. ⇒\* é o fecho reflexivo-transitivo de ⇒.

## Propriedades

- **Determinismo**: decorre da decomposição única em contexto e redex.
- **Progresso**: por indução na estrutura de *e*, toda configuração que não está
  em 𝓡 admite transição; não há estados travados.
- **Terminação**: cada passo reduz estritamente o número de nós que não são
  literais (`Var x → n`, `Op n₁ n₂ → n`, `Let x n b → b`, `Seq n e → e`,
  `Print n → n`, ou vai a erro, que é terminal). A linguagem não tem laços nem
  recursão.
- Logo a função semântica 𝒟 : 𝓔 × Σ → 𝓡, com 𝒟(e, σ) = o resultado de
  ⟨e, σ, ε⟩ ⇒\* r ∈ 𝓡, é total e bem definida.

## Equivalência funcional

Seja 𝓔₆₄ ⊆ 𝓔 × Σ o conjunto dos pares (e, σ₀) cuja redução não produz valor fora
da faixa comum às duas linguagens, a do inteiro de 63 bits do OCaml
([−2⁶², 2⁶² − 1]). O par inclui σ₀ porque `Var` lê valores do estado inicial.

Uma implementação *I* é **funcionalmente equivalente** a 𝒟 se, para todo
(e, σ₀) ∈ 𝓔₆₄, ⟦I⟧(e, σ₀) = 𝒟(e, σ₀), isto é:

1. o mesmo inteiro nos casos de sucesso;
2. o mesmo estado final σ′;
3. o mesmo traço de saída ω, na mesma ordem;
4. a mesma mensagem de erro, por igualdade de cadeias.

A suíte de oráculo **testa** esse critério sobre 28 casos; não o demonstra.
