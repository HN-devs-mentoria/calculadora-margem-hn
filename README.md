# Calculadora de Margem · Multi-Marketplace

Calculadora de preço, lucro e margem para **Amazon, Mercado Livre, Magalu, Shopee e SHEIN**,
criada por **[Henrique Niada](https://instagram.com/henriqueniada)**.

Esta é a versão **local**: roda na sua máquina, não tem cadastro, não tem senha e não manda
nada para lugar nenhum. O que você digita fica no seu computador.

## Para que serve

Duas perguntas, dois modos:

| Modo | Você informa | Ela responde |
|---|---|---|
| **Já tenho preço** | o preço que você pratica | quanto sobra em cada canal |
| **Quanto anunciar** | a margem ou o lucro que você quer | por quanto anunciar em cada canal |

Em cima disso ela abre comissão, taxa fixa, imposto e frete linha a linha, ordena os canais
por lucro ou por margem e diz qual ganha para aquele produto.

## Como rodar

Precisa do [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente <http://localhost:5173>).

### Sem depender do terminal toda vez

```bash
npm run build
```

Isso gera a pasta `dist/`. Dentro dela, o `index.html` abre com **duplo clique** — dá para
mandar a pasta inteira para outro computador ou deixar um atalho na área de trabalho.

## Tutorial

Na primeira vez a calculadora abre um **tour guiado** explicando cada decisão da tela. Para
rever depois, clique na lâmpada 💡 no canto superior direito.

## Taxas

As taxas que vêm preenchidas são **estimativas** baseadas em tabelas públicas e mudam por
categoria, contrato, reputação, logística e campanha. Em **"Regras avançadas"** você
sobrescreve comissão, taxa fixa e frete com os números que a **sua** conta realmente paga —
é o que separa uma simulação de uma decisão.

## O que esta versão não faz

- não conecta nas APIs dos marketplaces e não importa anúncios;
- não tem login, conta nem banco de dados;
- não salva histórico — cada sessão é um cálculo novo.

## Conferir

```bash
npm test     # 73 testes do motor de cálculo
npm run build
```

## Stack

React + Vite, sem backend. O motor de cálculo puro fica em `src/lib/calc.js` e as regras de
cada marketplace em `src/lib/marketplaces.js`.

---

Conteúdo sobre marketplace, precificação e operação de e-commerce todo dia:
**[@henriqueniada](https://instagram.com/henriqueniada)**
