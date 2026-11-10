import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validarCatalogo, chaveAnuncio } from "../src/lib/catalogo.js";

const fixture = () => JSON.parse(readFileSync(new URL("./fixtures/catalogo.json", import.meta.url), "utf8"));

test("fixture válida preserva nulls e mesmo SKU em anúncios distintos", () => {
  const c = validarCatalogo(fixture());
  assert.equal(c.anuncios.length, 4);
  assert.equal(c.anuncios.find((a) => a.marketplace === "magalu").preco, null);
  assert.equal(c.anuncios.filter((a) => a.sku === "PRODUTO-01").length, 3);
  assert.equal(c.fontes.find((f) => f.connection_id === "loja-magalu").completa, false);
});

test("descarta campos fora do contrato", () => {
  const f = fixture();
  f.token = "segredo";
  f.anuncios[0].comprador = "Fulano";
  const c = validarCatalogo(f);
  assert.equal("token" in c, false);
  assert.equal("comprador" in c.anuncios[0], false);
});

test("chave separa empresa, loja e variação", () => {
  const [a, var2] = fixture().anuncios;
  const outraLoja = { ...a, connection_id: "loja-2" };
  assert.notEqual(chaveAnuncio("empresa-a", a), chaveAnuncio("empresa-b", a));
  assert.notEqual(chaveAnuncio("empresa-a", a), chaveAnuncio("empresa-a", outraLoja));
  assert.notEqual(chaveAnuncio("empresa-a", a), chaveAnuncio("empresa-a", var2));
});

test("chave não colide com delimitadores nos IDs", () => {
  const x = { connection_id: "a:b", listing_id: "c", variation_id: null };
  const y = { connection_id: "a", listing_id: "b:c", variation_id: null };
  const z = { connection_id: "a|b", listing_id: "c", variation_id: null };
  const w = { connection_id: "a", listing_id: "b|c", variation_id: null };
  assert.notEqual(chaveAnuncio("e", x), chaveAnuncio("e", y));
  assert.notEqual(chaveAnuncio("e", z), chaveAnuncio("e", w));
});

const rejeita = (nome, mutar, campo) =>
  test(`rejeita ${nome}`, () => {
    const f = fixture();
    mutar(f);
    assert.throws(() => validarCatalogo(f), (e) => e instanceof Error && e.message.includes(campo));
  });

rejeita("versão desconhecida", (f) => { f.versao = 2; }, "versao");
rejeita("não-objeto", (f) => { f.anuncios = "x"; }, "anuncios");
rejeita("workspace vazio", (f) => { f.workspace_id = ""; }, "workspace_id");
rejeita("fonte inexistente", (f) => { f.anuncios[0].connection_id = "nada"; }, "connection_id");
rejeita("fonte duplicada", (f) => { f.fontes.push({ ...f.fontes[0] }); }, "connection_id");
rejeita("marketplace divergente da fonte", (f) => { f.anuncios[0].marketplace = "amazon"; }, "marketplace");
rejeita("identidade repetida", (f) => { f.anuncios.push({ ...f.anuncios[0] }); }, "duplicad");
rejeita("data impossível", (f) => { f.gerado_em = "2026-02-30T10:00:00Z"; }, "gerado_em");
rejeita("data sem fuso", (f) => { f.anuncios[0].observado_em = "2026-11-10T18:00:35"; }, "observado_em");
rejeita("preço como string", (f) => { f.anuncios[0].preco = "100"; }, "preco");
rejeita("preço infinito", (f) => { f.anuncios[0].preco = Infinity; }, "preco");
rejeita("estoque negativo", (f) => { f.anuncios[0].estoque = -1; }, "estoque");
rejeita("completa não booleana", (f) => { f.fontes[0].completa = "sim"; }, "completa");
rejeita("avisos inválidos", (f) => { f.fontes[0].avisos = [1]; }, "avisos");
rejeita("listing_id ausente", (f) => { delete f.anuncios[0].listing_id; }, "listing_id");

test("busca por SKU ou título, sem diferenciar maiúsculas nem acentos", async () => {
  const { buscarAnuncios } = await import("../src/lib/catalogo.js");
  const c = validarCatalogo(fixture());
  assert.deepEqual(buscarAnuncios(c, ""), []);
  assert.equal(buscarAnuncios(c, "produto-01").length, 3);
  assert.equal(buscarAnuncios(c, "EXEMPLO 01 — AZUL").length, 1);
  assert.equal(buscarAnuncios(c, "produto", 2).length, 2);
  const comAcento = { ...c, anuncios: [{ ...c.anuncios[0], titulo: "Escorredor de Louça" }] };
  assert.equal(buscarAnuncios(comAcento, "louca").length, 1);
});

test("preços praticados: todos os anúncios do mesmo SKU, por canal", async () => {
  const { precosPraticados } = await import("../src/lib/catalogo.js");
  const c = validarCatalogo(fixture());
  assert.deepEqual(precosPraticados(c, c.anuncios[0]), {
    shopee: { min: 100, max: 120 },
    magalu: { min: null, max: null },
  });
});

test("preços praticados: anúncio sem SKU só conta ele mesmo", async () => {
  const { precosPraticados } = await import("../src/lib/catalogo.js");
  const c = validarCatalogo(fixture());
  const tiktok = c.anuncios.find((a) => a.sku === null);
  assert.deepEqual(precosPraticados(c, tiktok), { "tiktok-shop": { min: 89.9, max: 89.9 } });
});

test("preços praticados ignoram moeda diferente de BRL", async () => {
  const { precosPraticados } = await import("../src/lib/catalogo.js");
  const f = fixture();
  f.anuncios[1].moeda = "USD";
  const c = validarCatalogo(f);
  assert.deepEqual(precosPraticados(c, c.anuncios[0]).shopee, { min: 100, max: 100 });
});
