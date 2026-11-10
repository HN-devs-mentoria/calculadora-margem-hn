import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, chmodSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../scripts/publicar-catalogo.mjs", import.meta.url));
const FIXTURE = fileURLToPath(new URL("./fixtures/catalogo.json", import.meta.url));
const rodar = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
const pasta = () => mkdtempSync(join(tmpdir(), "publicar-"));

test("arquivo válido é publicado e o resumo não lista produtos", () => {
  const d = pasta();
  const destino = join(d, "dados", "mcpseller-produtos.json");
  const r = rodar(FIXTURE, destino);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(readFileSync(destino, "utf8")).anuncios.length, 4);
  assert.match(r.stdout, /4 anúncios/);
  assert.doesNotMatch(r.stdout, /Produto de exemplo/);
  assert.deepEqual(readdirSync(join(d, "dados")), ["mcpseller-produtos.json"]);
});

test("arquivo inválido falha e mantém o anterior byte a byte", () => {
  const d = pasta();
  const destino = join(d, "atual.json");
  writeFileSync(destino, "ANTERIOR");
  const ruim = join(d, "ruim.json");
  writeFileSync(ruim, JSON.stringify({ versao: 2 }));
  const r = rodar(ruim, destino);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /versao/);
  assert.equal(readFileSync(destino, "utf8"), "ANTERIOR");
  assert.deepEqual(readdirSync(d).sort(), ["atual.json", "ruim.json"]);
});

test("JSON quebrado falha sem tocar no destino", () => {
  const d = pasta();
  const destino = join(d, "atual.json");
  writeFileSync(destino, "ANTERIOR");
  const ruim = join(d, "ruim.json");
  writeFileSync(ruim, "{");
  const r = rodar(ruim, destino);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /JSON inválido/);
  assert.equal(readFileSync(destino, "utf8"), "ANTERIOR");
});

test("destino sem permissão de escrita falha sem anunciar sucesso", { skip: process.getuid?.() === 0 }, () => {
  const d = pasta();
  const bloqueada = join(d, "bloqueada");
  mkdirSync(bloqueada);
  chmodSync(bloqueada, 0o500);
  const r = rodar(FIXTURE, join(bloqueada, "x.json"));
  chmodSync(bloqueada, 0o700);
  assert.notEqual(r.status, 0);
  assert.doesNotMatch(r.stdout, /publicado/i);
  assert.match(r.stderr, /Não foi possível gravar/);
});

test("sem argumentos mostra o uso", () => {
  const r = rodar();
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /uso/i);
});
