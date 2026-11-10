#!/usr/bin/env node
/*
 * Publica o catálogo gerado pelo agente (Claude/Codex) a partir do MCPSeller.
 * Valida antes de gravar e substitui o arquivo de forma atômica: se algo
 * falhar, o arquivo anterior fica intacto. Sem rede, sem credenciais.
 *
 * Uso: node scripts/publicar-catalogo.mjs <entrada.json> [destino]
 */
import { readFileSync, writeFileSync, renameSync, rmSync, mkdirSync } from "node:fs";
import { dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validarCatalogo } from "../src/lib/catalogo.js";

const PADRAO = fileURLToPath(new URL("../public/dados/mcpseller-produtos.json", import.meta.url));
const [entrada, destino = PADRAO] = process.argv.slice(2);

function sair(msg) {
  console.error(msg);
  process.exit(1);
}

if (!entrada) sair("Uso: node scripts/publicar-catalogo.mjs <entrada.json> [destino]");

let catalogo;
try {
  catalogo = validarCatalogo(JSON.parse(readFileSync(entrada, "utf8")));
} catch (e) {
  sair(e instanceof SyntaxError ? `JSON inválido em ${entrada}: ${e.message}` : e.message);
}

const temporario = join(dirname(destino), `.${basename(destino)}.${process.pid}.tmp`);
try {
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(temporario, JSON.stringify(catalogo, null, 2) + "\n");
  renameSync(temporario, destino);
} catch (e) {
  rmSync(temporario, { force: true });
  sair(`Não foi possível gravar ${destino}: ${e.message}`);
}

const incompletas = catalogo.fontes.filter((f) => !f.completa).length;
console.log(
  `Catálogo publicado: ${catalogo.anuncios.length} anúncios de ${catalogo.fontes.length} loja(s)` +
    (incompletas ? `, ${incompletas} incompleta(s)` : "") +
    `. Recarregue a tela "Meus produtos".`,
);
