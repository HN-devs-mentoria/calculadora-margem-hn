# Design — produto do MCPSeller no modo manual

2026-11-10 · Branch `feat/mcpseller-product-analysis` · aprovado pelo usuário.

Substitui a primeira proposta (tela separada com lista de anúncios, confirmação de preço,
ajustes por canal e custos salvos), rejeitada por ser complexa demais.

## Intenção

O seller quer saber se precificou certo e se outro marketplace daria mais margem,
**sem sair do modo manual que já conhece**. O MCPSeller entra só para poupar digitação
e mostrar o preço que ele já pratica.

## Como funciona

1. O Claude ou Codex do usuário segue [docs/mcpseller.md](../../mcpseller.md): lê os
   anúncios no MCPSeller (somente leitura, conexão do próprio usuário) e publica
   `public/dados/mcpseller-produtos.json` com `scripts/publicar-catalogo.mjs`.
2. No passo 1 da calculadora aparece **Puxar produto do MCPSeller**: busca por SKU ou nome.
3. Ao escolher um anúncio, a calculadora muda para **Já tenho preço** e preenche o
   preço ao comprador com o preço do anúncio (se houver preço em BRL).
4. A comparação ganha a coluna **Você pratica**: preço (ou faixa) dos anúncios com o
   mesmo SKU em cada canal; “—” onde não está anunciado; “sem preço” se o canal não informou.
5. Todo o resto é o modo manual: custo, imposto, frete e categoria digitados pelo usuário.

## Regras

- Sem arquivo, o bloco só orienta a pedir “atualize meus produtos”; a calculadora segue igual.
- Arquivo inválido mostra o erro e não preenche nada.
- O bloco mostra a data dos dados e avisa “leitura parcial” se alguma loja veio incompleta.
- Anúncio sem SKU conta só ele mesmo; preços em outra moeda são ignorados.
- Nenhum custo é inventado; nada é escrito no marketplace; nenhuma credencial na calculadora.

## Fora do escopo

Custos salvos por produto, ajustes de tarifa por canal, atualização automática,
TikTok Shop na simulação (aparece só como canal onde está anunciado) e abertura por
`file://` (o build atual não carrega no Chrome por duplo clique — limitação anterior).
