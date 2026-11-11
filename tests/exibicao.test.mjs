import { test } from "node:test";
import assert from "node:assert/strict";
import { fatiasDoPreco, nomeFaixa } from "../src/lib/format.js";

const r = (extra) => ({ precoVenda: 100, custo: 40, extras: 0, comissaoValor: 14, taxaFixaMp: 6, frete: 0, imposto: 5, lucro: 35, ...extra });

test("divide o preço em custos não nulos e lucro, somando o preço", () => {
  const { fatias, total } = fatiasDoPreco(r());
  assert.equal(total, 100);
  assert.deepEqual(fatias.map((f) => f.id), ["custo", "comissao", "taxa", "imposto", "lucro"]);
  assert.equal(fatias.reduce((s, f) => s + f.valor, 0), 100);
});

test("prejuízo: barra só com custos (soma passa do preço) e sem fatia de lucro", () => {
  const { fatias, total } = fatiasDoPreco(r({ custo: 90, lucro: -15 }));
  assert.equal(total, 115);
  assert.ok(!fatias.some((f) => f.id === "lucro"));
});

test("lucro zero não vira fatia", () => {
  const { fatias } = fatiasDoPreco(r({ custo: 75, lucro: 0 }));
  assert.ok(!fatias.some((f) => f.id === "lucro"));
});

test("nomes das faixas de margem", () => {
  assert.equal(nomeFaixa(-0.01), "no prejuízo");
  assert.equal(nomeFaixa(0.02), "apertada");
  assert.equal(nomeFaixa(0.07), "razoável");
  assert.equal(nomeFaixa(0.25), "saudável");
  assert.equal(nomeFaixa(null), "");
});

test("preposição certa antes do nome do canal", async () => {
  const { noCanal } = await import("../src/lib/format.js");
  assert.equal(noCanal({ id: "mercadolivre", nome: "Mercado Livre" }), "no Mercado Livre");
  assert.equal(noCanal({ id: "amazon", nome: "Amazon" }), "na Amazon");
  assert.equal(noCanal({ id: "shein", nome: "Shein" }), "na Shein");
});
