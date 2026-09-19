/*
 * calc.js
 * --------
 * Motor de cálculo puro (sem DOM). Pode ser testado isoladamente em Node.
 *
 * Conceitos:
 *  - precoVenda (P): valor efetivamente cobrado do comprador (já com descontos/cupons).
 *  - precoAnunciado: preço "cheio" exibido antes de desconto e cupom.
 *  - Sobre P incidem: comissão (%), taxa fixa do marketplace, imposto (%),
 *    frete (quando pago pelo seller), custo do produto e custos extras.
 *
 * Relação anúncio -> venda:
 *    precoVenda = precoAnunciado * (1 - desconto) * (1 - cupom)
 *
 * Atenção: na Shopee (modelo "faixaPreco") a comissão % e a taxa fixa MUDAM
 * conforme a faixa de preço. No Mercado Livre a comissão depende do tipo de
 * anúncio (clássico/premium) e há custo fixo por faixa para itens < R$ 79.
 * Por isso o modo reverso resolve por iteração (ponto fixo).
 */

function freteParaPeso(tabela, pesoKg) {
  for (const faixa of tabela) {
    if (pesoKg <= faixa.ateKg) return faixa.valor;
  }
  return tabela[tabela.length - 1].valor;
}

/** Localiza a faixa (de comissão ou custo) a que pertence um preço. */
function faixaPara(tabela, preco) {
  if (!tabela) return null;
  for (const faixa of tabela) {
    if (preco <= faixa.ateValor) return faixa;
  }
  return tabela[tabela.length - 1];
}

/**
 * Comissão (em VALOR R$) e taxa fixa do marketplace para um dado preço.
 * Centraliza os 3 modelos de comissão num só lugar.
 * Retorna { comissaoRate, comissaoValor, taxaFixa }.
 */
function tarifasMarketplace(mp, params, precoVenda) {
  // Override manual de comissão (campo "Regras avançadas") tem prioridade.
  if (params.overrideComissao != null && !Number.isNaN(params.overrideComissao)) {
    return {
      comissaoRate: params.overrideComissao,
      comissaoValor: precoVenda * params.overrideComissao,
      taxaFixa: taxaFixaBase(mp, params, precoVenda),
    };
  }

  if (mp.modeloComissao === "faixaPreco") {
    const faixa = faixaPara(mp.faixasComissao, precoVenda);
    let taxaFixa = faixa.taxaFixa || 0;
    // Adicional para vendedor CPF de alto volume (>450 pedidos/90 dias).
    if (params.shopeeCpfAlto && mp.adicionalCpfAlto) taxaFixa += mp.adicionalCpfAlto;
    return {
      comissaoRate: faixa.comissao,
      comissaoValor: precoVenda * faixa.comissao,
      taxaFixa,
    };
  }

  let rate;
  if (mp.modeloComissao === "categoriaTipoAnuncio") {
    const cat = mp.categorias[params.categoria] || mp.categorias.outros;
    const tipo = params.tipoAnuncio === "premium" ? "premium" : "classico";
    rate = cat[tipo];
  } else {
    // modelo "categoria"
    const cat = mp.categorias[params.categoria] || mp.categorias.outros;
    rate = cat ? cat.comissao : 0;
  }
  if (mp.taxaPercentualAdicional && precoVenda >= mp.taxaPercentualAdicional.aPartirDe) {
    rate += mp.taxaPercentualAdicional.valor;
  }
  return {
    comissaoRate: rate,
    comissaoValor: precoVenda * rate,
    taxaFixa: taxaFixaBase(mp, params, precoVenda),
  };
}

/** Taxa fixa / custo fixo para marketplaces que NÃO usam faixaPreco. */
function taxaFixaBase(mp, params, precoVenda) {
  if (params.overrideTaxaFixa != null && !Number.isNaN(params.overrideTaxaFixa)) {
    return params.overrideTaxaFixa;
  }
  let total = mp.taxaFixa || 0;
  // Mercado Livre: custo fixo por unidade para itens < R$ 79.
  if (mp.custoFixo) {
    const faixa = faixaPara(mp.custoFixo, precoVenda);
    if (faixa) {
      total += faixa.tipo === "pct" ? precoVenda * faixa.valor : faixa.valor;
    }
  }
  return total;
}

/** Frete que o seller paga para um marketplace. */
function calcularFrete(mp, params, precoVenda) {
  if (params.overrideFrete != null && !Number.isNaN(params.overrideFrete)) {
    return params.overrideFrete;
  }
  if (!mp.fretePagoPeloSeller) return 0;
  // Abaixo do limiar de frete grátis, normalmente o comprador paga o frete.
  if (mp.freteGratisAcimaDe && precoVenda < mp.freteGratisAcimaDe) return 0;
  const base = freteParaPeso(mp.freteTabela, params.pesoKg);
  return base + (params.acrescimoTamanho || 0);
}

/** Decompõe todos os custos para um dado preço de venda P. */
function decompor(mp, params, precoVenda) {
  const { comissaoRate, comissaoValor, taxaFixa } = tarifasMarketplace(mp, params, precoVenda);
  const imposto = precoVenda * (params.impostoRate || 0);
  const frete = calcularFrete(mp, params, precoVenda);
  const custo = params.custo || 0;
  const extras = params.custosExtras || 0;

  const totalCustos = custo + comissaoValor + imposto + taxaFixa + frete + extras;
  const lucro = precoVenda - totalCustos;
  const margem = precoVenda > 0 ? lucro / precoVenda : 0;
  const markup = custo > 0 ? lucro / custo : 0;

  return {
    precoVenda,
    comissaoRate,
    comissaoValor,
    imposto,
    impostoRate: params.impostoRate || 0,
    taxaFixaMp: taxaFixa,
    frete,
    custo,
    extras,
    totalCustos,
    lucro,
    margem,
    markup,
  };
}

/** MODO DIRETO: dado o preço de venda, calcula o que sobra. */
function calcularLucro(mp, params) {
  return decompor(mp, params, params.precoVenda);
}

/**
 * MODO REVERSO: descobre o preço de VENDA necessário para atingir uma meta
 * (margem % sobre o preço de venda, ou lucro fixo R$).
 *
 * Como comissão %, taxa fixa, custo fixo e frete podem mudar por faixa de
 * preço/peso, resolve por iteração de ponto fixo. A cada passo recalcula as
 * tarifas no preço corrente e fecha a equação linearmente.
 */
function precoParaMeta(mp, params) {
  const impostoRate = params.impostoRate || 0;
  const custo = params.custo || 0;
  const extras = params.custosExtras || 0;

  let precoVenda = custo > 0 ? custo * 2 : 100;

  for (let i = 0; i < 80; i++) {
    const { comissaoRate, taxaFixa } = tarifasMarketplace(mp, params, precoVenda);
    const frete = calcularFrete(mp, params, precoVenda);
    const custosFixos = custo + extras + taxaFixa + frete;

    let novoPreco;
    if (params.metaTipo === "margem") {
      const m = params.metaValor; // fração
      const denom = 1 - comissaoRate - impostoRate - m;
      if (denom <= 0) return { erro: "Meta inviável: comissão + imposto + margem ≥ 100%." };
      novoPreco = custosFixos / denom;
    } else {
      const lucro = params.metaValor; // R$
      const denom = 1 - comissaoRate - impostoRate;
      if (denom <= 0) return { erro: "Comissão + imposto ≥ 100%; impossível ter lucro." };
      novoPreco = (custosFixos + lucro) / denom;
    }

    if (Math.abs(novoPreco - precoVenda) < 0.005) {
      precoVenda = novoPreco;
      break;
    }
    precoVenda = novoPreco;
  }

  const detalhe = decompor(mp, params, precoVenda);

  const desconto = params.desconto || 0;
  const cupom = params.cupom || 0;
  const fator = (1 - desconto) * (1 - cupom);
  const precoAnunciado = fator > 0 ? precoVenda / fator : precoVenda;

  return {
    ...detalhe,
    precoAnunciado,
    precoVenda,
    desconto,
    cupom,
    fatorDesconto: fator,
  };
}

/** Calcula para todos os marketplaces selecionados e ordena por lucro. */
function calcularTodos(marketplaces, idsSelecionados, params, modo) {
  const resultados = [];
  for (const id of idsSelecionados) {
    const mp = marketplaces[id];
    if (!mp) continue;
    const r = modo === "reverso" ? precoParaMeta(mp, params) : calcularLucro(mp, params);
    resultados.push({ marketplace: mp, resultado: r });
  }
  resultados.sort((a, b) => {
    const la = a.resultado.lucro ?? -Infinity;
    const lb = b.resultado.lucro ?? -Infinity;
    return lb - la;
  });
  return resultados;
}

export {
  freteParaPeso, faixaPara, tarifasMarketplace, calcularFrete,
  decompor, calcularLucro, precoParaMeta, calcularTodos,
};
