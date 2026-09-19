import { useMemo, useState } from "react";
import { MARKETPLACES } from "../lib/marketplaces";
import { precoParaMeta, calcularLucro } from "../lib/calc";

const TODOS = ["mercadolivre", "amazon", "magalu", "shopee", "shein"];

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

// Estado + cálculo da calculadora, isolado da apresentação.
export function useCalculadora(valoresIniciais = FORM_DEMO) {
  const [modo, setModo] = useState("reverso"); // reverso | direto
  const [metaTipo, setMetaTipo] = useState("margem"); // margem | lucro
  const [tipoAnuncio, setTipoAnuncio] = useState("classico"); // ML
  const [shopeeConta, setShopeeConta] = useState("cnpj"); // cnpj | cpf
  const [shopeeCpfAlto, setShopeeCpfAlto] = useState(false);
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
    metaTipo,
    metaValor: metaTipo === "margem" ? num(form.metaValor) / 100 : num(form.metaValor),
    desconto: num(form.desconto) / 100,
    cupom: num(form.cupom) / 100,
    precoVenda: num(form.precoVenda),
  }), [form, acrescimoTamanho, tipoAnuncio, shopeeConta, shopeeCpfAlto, metaTipo]);

  // Sem custo (ou sem preço, no modo direto) não há o que comparar: os
  // resultados sairiam só com taxa fixa e frete, o que confunde mais que ajuda.
  const temDados = modo === "direto" ? num(form.precoVenda) > 0 : num(form.custo) > 0;

  const resultados = useMemo(() => {
    const arr = [...selecionados].map((id) => {
      const mp = MARKETPLACES[id];
      const p = { ...paramsBase };
      const ov = overrides[id] || {};
      if (ov.comissao != null && ov.comissao !== "") {
        const v = parseFloat(ov.comissao.toString().replace(",", "."));
        if (!Number.isNaN(v)) p.overrideComissao = v / 100;
      }
      if (ov.taxaFixa != null && ov.taxaFixa !== "") {
        const v = parseFloat(ov.taxaFixa.toString().replace(",", "."));
        if (!Number.isNaN(v)) p.overrideTaxaFixa = v;
      }
      if (ov.frete != null && ov.frete !== "") {
        const v = parseFloat(ov.frete.toString().replace(",", "."));
        if (!Number.isNaN(v)) p.overrideFrete = v;
      }
      const r = modo === "reverso" ? precoParaMeta(mp, p) : calcularLucro(mp, p);
      return { marketplace: mp, resultado: r };
    });
    const chave = ordenarPor === "margem" ? "margem" : "lucro";
    arr.sort((a, b) => (b.resultado[chave] ?? -Infinity) - (a.resultado[chave] ?? -Infinity));
    return arr;
  }, [selecionados, paramsBase, overrides, modo, ordenarPor]);

  return {
    modo, setModo, metaTipo, setMetaTipo, tipoAnuncio, setTipoAnuncio,
    shopeeConta, setShopeeConta, shopeeCpfAlto, setShopeeCpfAlto,
    selecionados, toggleMarketplace, overrides, setOverride,
    form, setCampo, limparCampos, resultados, paramsBase, temDados,
    ordenarPor, setOrdenarPor,
  };
}
