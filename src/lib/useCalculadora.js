import { useMemo, useState } from "react";
import { MARKETPLACES } from "../lib/marketplaces.js";
import { precoParaMeta, calcularLucro } from "../lib/calc.js";

const TODOS = ["mercadolivre", "amazon", "magalu", "shopee", "shein", "tiktok-shop"];

/** Valores de demonstração — a versão clássica abre preenchida. */
export const FORM_DEMO = {
  custo: "45.90",
  custosExtras: "2.50",
  categoria: "casa",
  peso: "0.5",
  tamanho: "pequeno",
  imposto: "6",
  metaValor: "20",
  desconto: "10",
  cupom: "5",
  precoVenda: "99.90",
};

/** Tela limpa — os seletores mantêm a primeira opção, o resto começa vazio. */
export const FORM_VAZIO = {
  ...FORM_DEMO,
  custo: "", custosExtras: "", peso: "", imposto: "",
  metaValor: "", desconto: "", cupom: "", precoVenda: "",
};

const taxa = (v) => {
  if (v == null || v === "") return null;
  const n = parseFloat(v.toString().replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

/**
 * Resultado de um canal, com as taxas manuais de "Ajustar taxas" (ov).
 */
export function resultadoDoCanal(id, paramsBase, ov = {}, modo) {
  const mp = MARKETPLACES[id];
  const comissao = taxa(ov.comissao);
  const taxaFixa = taxa(ov.taxaFixa);
  const frete = taxa(ov.frete);
  const p = { ...paramsBase };
  if (comissao !== null) p.overrideComissao = comissao / 100;
  if (taxaFixa !== null) p.overrideTaxaFixa = taxaFixa;
  if (frete !== null) p.overrideFrete = frete;
  return modo === "reverso" ? precoParaMeta(mp, p) : calcularLucro(mp, p);
}

/**
 * Menor preço ao comprador em que o canal não dá prejuízo (lucro zero),
 * com as mesmas taxas manuais. Busca por bisseção sobre o modo direto,
 * que aguenta as faixas de preço com saltos (TikTok, Shopee). null se
 * nenhum preço razoável cobre os custos.
 */
export function precoSemLucro(id, paramsBase, ov = {}) {
  const lucro = (preco) => resultadoDoCanal(id, { ...paramsBase, precoVenda: preco }, ov, "direto").lucro;
  let hi = Math.max(1, (paramsBase.custo || 0) + (paramsBase.custosExtras || 0));
  while (!(lucro(hi) >= 0)) {
    hi *= 2;
    if (hi > 1e6) return null;
  }
  let lo = 0;
  for (let i = 0; i < 50 && hi - lo > 0.001; i++) {
    const meio = (lo + hi) / 2;
    if (lucro(meio) >= 0) hi = meio; else lo = meio;
  }
  return Math.ceil(hi * 100) / 100;
}

// Estado + cálculo da calculadora, isolado da apresentação.
export function useCalculadora(valoresIniciais = FORM_DEMO) {
  const [modo, setModo] = useState("reverso"); // reverso | direto
  const [metaTipo, setMetaTipo] = useState("margem"); // margem | lucro
  const [tipoAnuncio, setTipoAnuncio] = useState("classico"); // ML
  const [shopeeConta, setShopeeConta] = useState("cnpj"); // cnpj | cpf
  const [shopeeCpfAlto, setShopeeCpfAlto] = useState(false);
  const [tiktokSfp, setTiktokSfp] = useState(true); // Programa de Taxas de Envio do TikTok Shop
  const [selecionados, setSelecionados] = useState(new Set(TODOS));
  const [overrides, setOverrides] = useState({}); // { mpId: { comissao, taxaFixa, frete } }

  const [ordenarPor, setOrdenarPor] = useState("lucro"); // lucro | margem

  const [form, setForm] = useState(valoresIniciais);

  const setCampo = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  // Zera os valores numéricos e mantém as escolhas estruturais (categoria,
  // tamanho, marketplaces), que não são "campos preenchidos".
  const limparCampos = () => setForm((f) => ({ ...f, ...FORM_VAZIO, categoria: f.categoria, tamanho: f.tamanho }));

  const toggleMarketplace = (id) =>
    setSelecionados((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const setOverride = (id, campo, valor) => setOverrides((o) => ({
    ...o,
    [id]: { ...(o[id] || {}), [campo]: valor },
  }));

  const num = (v) => {
    const n = parseFloat((v || "").toString().replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  };

  const acrescimoTamanho = useMemo(() => {
    const map = { pequeno: 0, medio: 5, grande: 15, extragrande: 35 };
    return map[form.tamanho] ?? 0;
  }, [form.tamanho]);

  const paramsBase = useMemo(() => ({
    custo: num(form.custo),
    custosExtras: num(form.custosExtras),
    categoria: form.categoria,
    pesoKg: num(form.peso),
    acrescimoTamanho,
    impostoRate: num(form.imposto) / 100,
    tipoAnuncio,
    shopeeCpfAlto: shopeeConta === "cpf" && shopeeCpfAlto,
    tiktokSfp,
    metaTipo,
    metaValor: metaTipo === "margem" ? num(form.metaValor) / 100 : num(form.metaValor),
    desconto: num(form.desconto) / 100,
    cupom: num(form.cupom) / 100,
    precoVenda: num(form.precoVenda),
  }), [form, acrescimoTamanho, tipoAnuncio, shopeeConta, shopeeCpfAlto, tiktokSfp, metaTipo]);

  // Sem custo (ou sem preço, no modo direto) não há o que comparar: os
  // resultados sairiam só com taxa fixa e frete, o que confunde mais que ajuda.
  const temDados = modo === "direto" ? num(form.precoVenda) > 0 : num(form.custo) > 0;

  const resultados = useMemo(() => {
    const arr = [...selecionados].map((id) => ({
      marketplace: MARKETPLACES[id],
      resultado: resultadoDoCanal(id, paramsBase, overrides[id], modo),
    }));
    const chave = ordenarPor === "margem" ? "margem" : "lucro";
    arr.sort((a, b) => (b.resultado[chave] ?? -Infinity) - (a.resultado[chave] ?? -Infinity));
    return arr;
  }, [selecionados, paramsBase, overrides, modo, ordenarPor]);

  return {
    modo, setModo, metaTipo, setMetaTipo, tipoAnuncio, setTipoAnuncio,
    shopeeConta, setShopeeConta, shopeeCpfAlto, setShopeeCpfAlto, tiktokSfp, setTiktokSfp,
    selecionados, setSelecionados, toggleMarketplace, overrides, setOverride,
    form, setCampo, limparCampos, resultados, paramsBase, temDados,
    ordenarPor, setOrdenarPor,
  };
}
