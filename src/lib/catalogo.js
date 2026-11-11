/*
 * catalogo.js — contrato do arquivo gerado pelo agente a partir do MCPSeller.
 * Valida na fronteira e devolve só os campos conhecidos. Dado de marketplace
 * é tratado como dado: nada aqui interpreta texto como instrução ou HTML.
 */

const ISO_COM_FUSO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function falha(campo, motivo) {
  throw new Error(`Catálogo inválido: ${campo} ${motivo}.`);
}

function texto(v, campo) {
  if (typeof v !== "string" || v.trim() === "") falha(campo, "deve ser texto não vazio");
  return v;
}

function textoOuNull(v, campo) {
  return v === null || v === undefined ? null : texto(v, campo);
}

function data(v, campo) {
  if (typeof v !== "string") falha(campo, "deve ser data ISO 8601 com fuso");
  const m = ISO_COM_FUSO.exec(v);
  if (!m) falha(campo, "deve ser data ISO 8601 com fuso");
  const [, a, mes, d, h, min, s] = m.map(Number);
  const dia = new Date(Date.UTC(a, mes - 1, d));
  if (dia.getUTCMonth() !== mes - 1 || dia.getUTCDate() !== d || h > 23 || min > 59 || s > 59) {
    falha(campo, "não é uma data válida");
  }
  return v;
}

function dataOuNull(v, campo) {
  return v === null || v === undefined ? null : data(v, campo);
}

function numeroOuNull(v, campo) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) falha(campo, "deve ser número finito não negativo");
  return v;
}

/** Endereço de imagem: só https, para a miniatura nunca carregar outro protocolo. */
function imagemOuNull(v, campo) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string" || !/^https:\/\/[^\s"'<>]+$/.test(v)) falha(campo, "deve ser um endereço https");
  return v;
}

function lista(v, campo) {
  if (!Array.isArray(v)) falha(campo, "deve ser uma lista");
  return v;
}

function objeto(v, campo) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) falha(campo, "deve ser um objeto");
  return v;
}

const NOMES_CANAL = {
  mercadolivre: "Mercado Livre",
  amazon: "Amazon",
  magalu: "Magalu",
  shopee: "Shopee",
  shein: "SHEIN",
  "tiktok-shop": "TikTok Shop",
};
export const nomeCanal = (id) => NOMES_CANAL[id] || id;

/** Chave estável por empresa, loja, anúncio e variação. SKU não é identidade. */
export function chaveAnuncio(workspaceId, anuncio) {
  return JSON.stringify([workspaceId, anuncio.connection_id, anuncio.listing_id, anuncio.variation_id ?? null]);
}

const normalizar = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Anúncios cujo SKU ou título contém o termo (sem acentos, sem maiúsculas). */
export function buscarAnuncios(catalogo, termo, limite = 8) {
  const q = normalizar(termo.trim());
  if (!q) return [];
  return catalogo.anuncios.filter((a) => [a.sku, a.titulo].some((t) => t && normalizar(t).includes(q))).slice(0, limite);
}

/**
 * Preço praticado em cada canal onde o produto já está anunciado: mesmo SKU
 * (ou só o próprio anúncio, se não tiver SKU). Só preços em BRL; sem preço → null.
 * ponytail: ignora status do anúncio (pausado conta); filtrar quando os status forem padronizados.
 */
export function precosPraticados(catalogo, anuncio) {
  const mesmos = anuncio.sku === null ? [anuncio] : catalogo.anuncios.filter((a) => a.sku === anuncio.sku);
  const porCanal = {};
  for (const a of mesmos) {
    const p = (porCanal[a.marketplace] ??= { min: null, max: null });
    if (a.preco === null || a.moeda !== "BRL") continue;
    p.min = p.min === null ? a.preco : Math.min(p.min, a.preco);
    p.max = p.max === null ? a.preco : Math.max(p.max, a.preco);
  }
  return porCanal;
}

export function validarCatalogo(valor) {
  const raiz = objeto(valor, "arquivo");
  if (raiz.versao !== 1) falha("versao", "não suportada (esperado 1)");

  const workspace_id = texto(raiz.workspace_id, "workspace_id");

  const fontes = lista(raiz.fontes, "fontes").map((f, i) => {
    const p = `fontes[${i}]`;
    objeto(f, p);
    if (typeof f.completa !== "boolean") falha(`${p}.completa`, "deve ser verdadeiro ou falso");
    const avisos = lista(f.avisos, `${p}.avisos`).map((a, j) => texto(a, `${p}.avisos[${j}]`));
    return {
      connection_id: texto(f.connection_id, `${p}.connection_id`),
      loja: texto(f.loja, `${p}.loja`),
      marketplace: texto(f.marketplace, `${p}.marketplace`),
      completa: f.completa,
      observado_em: dataOuNull(f.observado_em, `${p}.observado_em`),
      avisos,
    };
  });

  const porConexao = new Map();
  for (const f of fontes) {
    if (porConexao.has(f.connection_id)) falha("fontes.connection_id", `duplicado (${f.connection_id})`);
    porConexao.set(f.connection_id, f);
  }

  const vistos = new Set();
  const anuncios = lista(raiz.anuncios, "anuncios").map((a, i) => {
    const p = `anuncios[${i}]`;
    objeto(a, p);
    const anuncio = {
      connection_id: texto(a.connection_id, `${p}.connection_id`),
      marketplace: texto(a.marketplace, `${p}.marketplace`),
      listing_id: texto(a.listing_id, `${p}.listing_id`),
      variation_id: textoOuNull(a.variation_id, `${p}.variation_id`),
      sku: textoOuNull(a.sku, `${p}.sku`),
      titulo: texto(a.titulo, `${p}.titulo`),
      imagem: imagemOuNull(a.imagem, `${p}.imagem`),
      status: textoOuNull(a.status, `${p}.status`),
      preco: numeroOuNull(a.preco, `${p}.preco`),
      moeda: textoOuNull(a.moeda, `${p}.moeda`),
      estoque: numeroOuNull(a.estoque, `${p}.estoque`),
      atualizado_em: dataOuNull(a.atualizado_em, `${p}.atualizado_em`),
      observado_em: dataOuNull(a.observado_em, `${p}.observado_em`),
    };
    const fonte = porConexao.get(anuncio.connection_id);
    if (!fonte) falha(`${p}.connection_id`, "não corresponde a nenhuma fonte");
    if (fonte.marketplace !== anuncio.marketplace) falha(`${p}.marketplace`, "diverge da fonte");
    const chave = chaveAnuncio(workspace_id, anuncio);
    if (vistos.has(chave)) falha(p, "é um anúncio duplicado");
    vistos.add(chave);
    return anuncio;
  });

  return {
    versao: 1,
    workspace_id,
    conta: texto(raiz.conta, "conta"),
    gerado_em: data(raiz.gerado_em, "gerado_em"),
    fontes,
    anuncios,
  };
}

/**
 * Compara os canais onde o produto já é vendido com o de maior lucro e o de maior
 * margem, entre os simulados (validos = [{ marketplace, resultado }] sem erro).
 * Canais praticados sem simulação (ex.: TikTok Shop) vão em semSimulacao.
 */
export function compararCanais(validos, praticados) {
  const maior = (campo) => validos.reduce((m, v) => (m === null || v.resultado[campo] > m.resultado[campo] ? v : m), null);
  const melhorLucro = maior("lucro");
  const melhorMargem = maior("margem");
  const ids = Object.keys(praticados ?? {});
  const lista = validos
    .filter((v) => ids.includes(v.marketplace.id))
    .sort((a, b) => b.resultado.lucro - a.resultado.lucro)
    .map((item) => ({
      item,
      faltaLucro: melhorLucro.resultado.lucro - item.resultado.lucro,
      faltaPontos: (melhorMargem.resultado.margem - item.resultado.margem) * 100,
    }));
  return {
    melhorLucro,
    melhorMargem,
    praticados: lista,
    semSimulacao: ids.filter((id) => !validos.some((v) => v.marketplace.id === id)),
    jaNoMelhorLucro: lista.some((p) => p.item === melhorLucro),
  };
}
