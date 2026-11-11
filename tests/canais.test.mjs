import { test } from "node:test";
import assert from "node:assert/strict";
import { resultadoDoCanal, precoSemLucro } from "../src/lib/useCalculadora.js";
import { MARKETPLACES } from "../src/lib/marketplaces.js";
import { calcularLucro } from "../src/lib/calc.js";
import { noCanal } from "../src/lib/format.js";

// Regras do guia oficial "Guia 2026 | Comissões e taxas do TikTok Shop" (vigência 15/07/2026).
const tt = MARKETPLACES["tiktok-shop"];
const P = (extra) => ({ custo: 40, custosExtras: 0, categoria: "casa", pesoKg: 0.5, acrescimoTamanho: 0, impostoRate: 0.04, tiktokSfp: true, ...extra });

test("exemplo oficial de R$ 100: comissão 6, taxa por item 6, programa de envio 6", () => {
  const r = calcularLucro(tt, P({ precoVenda: 100 }));
  assert.equal(r.comissaoValor, 6);
  assert.equal(r.taxaFixaMp, 6);
  assert.equal(r.frete, 6);
  // O guia chega a R$ 28 descontando também afiliado (R$ 5) e anúncios (R$ 5).
  assert.equal(Math.round(r.lucro * 100) / 100, 38);
});

// Página oficial "Tarifa de Comissão da Plataforma": a base é o preço já com o desconto do vendedor.
test("exemplos oficiais: camisa R$ 45 paga R$ 8,50; calça R$ 85 com R$ 10 de desconto paga R$ 10,50", () => {
  const tarifa = (preco) => { const r = calcularLucro(tt, P({ precoVenda: preco })); return r.comissaoValor + r.taxaFixaMp; };
  assert.ok(Math.abs(tarifa(45) - 8.5) < 1e-9);
  assert.ok(Math.abs(tarifa(85 - 10) - 10.5) < 1e-9);
});

test("abaixo de R$ 50: 10% + R$ 4; a partir de R$ 50: 6% + R$ 6", () => {
  const baixo = calcularLucro(tt, P({ precoVenda: 49.99 }));
  assert.equal(baixo.comissaoRate, 0.1);
  assert.equal(baixo.taxaFixaMp, 4);
  const limite = calcularLucro(tt, P({ precoVenda: 50 }));
  assert.equal(limite.comissaoRate, 0.06);
  assert.equal(limite.taxaFixaMp, 6);
});

test("programa de envio cobra 6% com teto de R$ 50 por produto", () => {
  assert.equal(calcularLucro(tt, P({ precoVenda: 1000 })).frete, 50);
  assert.ok(Math.abs(calcularLucro(tt, P({ precoVenda: 40 })).frete - 2.4) < 1e-9);
});

test("fora do programa de envio não há taxa de serviço", () => {
  assert.equal(calcularLucro(tt, P({ precoVenda: 100, tiktokSfp: false })).frete, 0);
});

test("TikTok Shop entra na tela como os demais canais e calcula sem taxas manuais", () => {
  const r = resultadoDoCanal("tiktok-shop", P({ precoVenda: 100 }), {}, "direto");
  assert.equal(r.erro, undefined);
  assert.equal(r.taxaFixaMp, 6);
});

test("reverso no TikTok atinge a margem-alvo, inclusive perto de R$ 50", () => {
  for (const custo of [10, 25, 30, 40, 200]) {
    const r = resultadoDoCanal("tiktok-shop", P({ custo, metaTipo: "margem", metaValor: 0.2, desconto: 0, cupom: 0 }), {}, "reverso");
    assert.equal(r.erro, undefined, `custo ${custo}`);
    assert.ok(r.margem >= 0.2 - 0.007, `custo ${custo}: ${r.margem}`);
  }
});

test("taxas manuais continuam valendo e aceitam vírgula", () => {
  const r = resultadoDoCanal("amazon", P({ precoVenda: 100 }), { comissao: "12,5" }, "direto");
  assert.equal(r.comissaoValor, 12.5);
});

test("preposição do TikTok Shop", () => {
  assert.equal(noCanal(tt), "no TikTok Shop");
});

test("preço de lucro zero: logo acima dele há lucro, um centavo abaixo há prejuízo", () => {
  const lucro = (id, preco, ov) => resultadoDoCanal(id, P({ precoVenda: preco }), ov, "direto").lucro;
  for (const id of Object.keys(MARKETPLACES)) {
    const p = precoSemLucro(id, P({}));
    assert.ok(p > 40, `${id}: ${p}`);
    assert.ok(lucro(id, p) >= 0, `${id} em ${p}`);
    assert.ok(lucro(id, p - 0.01) < 0, `${id} em ${p - 0.01}`);
  }
  // TikTok com custo 40 e imposto 4%: 0,84 × preço = 46 → R$ 54,77.
  assert.equal(precoSemLucro("tiktok-shop", P({})), 54.77);
  // Taxas manuais entram na conta.
  assert.ok(precoSemLucro("tiktok-shop", P({}), { frete: "20" }) > 54.77);
});
