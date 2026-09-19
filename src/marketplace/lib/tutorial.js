/*
 * Roteiro do tour guiado.
 *
 * O roteiro segue as três decisões que realmente mudam o resultado: o MODO DE
 * CÁLCULO (troca a incógnita), o TIPO DE META (troca a equação) e o ORDENAR
 * POR (troca só a leitura, sem recalcular nada).
 *
 * `alvo` é o data-tour do elemento a destacar. `precisaResultados` marca os
 * passos que só existem depois que há dados preenchidos.
 */

export const CHAVE_TUTORIAL = "calc-mkt:tutorial";

export function tutorialVisto() {
  try {
    return localStorage.getItem(CHAVE_TUTORIAL) === "1";
  } catch {
    return true; // sem storage, não insiste
  }
}

export function marcarTutorialVisto() {
  try {
    localStorage.setItem(CHAVE_TUTORIAL, "1");
  } catch {
    /* ignora */
  }
}

export const PASSOS = [
  {
    alvo: "modo",
    titulo: "Comece pela pergunta certa",
    texto:
      "Este seletor troca o que a calculadora procura. “Já tenho preço” responde quanto sobra daquele valor. “Quanto anunciar” faz o contrário: você diz o lucro que quer e ela descobre o preço. É a decisão que mais muda o resultado.",
  },
  {
    alvo: "produto",
    titulo: "O que entra no custo",
    texto:
      "Custo e custos extras são a base. A categoria define a comissão de cada canal, e peso e tamanho definem o frete — por isso dois produtos do mesmo preço podem ter margens bem diferentes.",
  },
  {
    alvo: "meta",
    titulo: "Margem ou lucro fixo?",
    texto:
      "Margem (%) é autoescalável: se o custo dobrar, o preço acompanha e a fatia continua a mesma. Lucro fixo (R$) trava os reais por venda — o preço sobe menos e a margem encolhe. Use margem para política de preço, lucro fixo quando um valor por unidade precisa aparecer.",
  },
  {
    alvo: "marketplaces",
    titulo: "Quem entra na comparação",
    texto:
      "Escolha os canais. Quando o Mercado Livre ou a Shopee estão ligados, aparecem opções que mudam a conta: tipo de anúncio (clássico ou premium) e conta CPF ou CNPJ.",
  },
  {
    alvo: "vencedor",
    titulo: "O melhor canal para este produto",
    precisaResultados: true,
    texto:
      "O card mostra quem venceu pelo critério escolhido, com o preço a anunciar, o que fica à venda depois do desconto, o lucro e a margem.",
  },
  {
    alvo: "comparativo",
    titulo: "Onde o dinheiro vai embora",
    precisaResultados: true,
    texto:
      "Cada linha abre comissão, taxa fixa e frete separadamente. A barra de margem colore por faixa: verde acima de 10%, amarelo entre 6% e 10%, laranja entre 3% e 6%, vermelho abaixo disso.",
  },
  {
    alvo: "ordenar",
    titulo: "Duas lentes sobre o mesmo cálculo",
    precisaResultados: true,
    texto:
      "Trocar entre lucro líquido e margem não recalcula nada — muda quem aparece em primeiro lugar. Lucro responde “onde vender este item”; margem responde “onde vale colocar meu estoque”. Os dois podem apontar canais diferentes.",
  },
  {
    alvo: "insights",
    titulo: "A leitura pronta",
    precisaResultados: true,
    texto:
      "Melhor canal, pior canal e quanto dinheiro separa um do outro. É o atalho quando você só quer a conclusão.",
  },
  {
    alvo: "avancadas",
    titulo: "De estimativa para número real",
    texto:
      "As taxas padrão vêm de tabelas públicas e variam por contrato, reputação e campanha. Aqui você sobrescreve comissão, taxa fixa e frete com os números que a sua conta realmente paga — é o que separa uma simulação de uma decisão.",
  },
  {
    alvo: "autor",
    titulo: "Esta calculadora é do Henrique Niada",
    texto:
      "Ela é sua, de graça, e roda inteira na sua máquina — nada do que você digita sai daqui. Para conteúdo sobre marketplace, precificação e operação no dia a dia, siga o Henrique no Instagram.",
  },
];

/* ------------------------------------------------------------------ */

const prender = (v, min, max) => Math.max(min, Math.min(v, max));

/**
 * Onde colocar o cartão do tour, dado o recorte destacado (`area`), o tamanho
 * medido do cartão e a viewport. Função pura — sem DOM — para poder ser
 * conferida isoladamente.
 *
 * Tenta abaixo, acima, à direita e à esquerda; aceita a primeira posição que
 * caiba inteira na tela E não cubra o recorte. Se o alvo for grande demais
 * para sobrar espaço ao lado, encosta o cartão na borda oposta ao centro do
 * alvo — nesse caso alguma sobreposição é inevitável, mas o cartão nunca sai
 * da tela.
 */
export function posicionarCartao(area, cartao, viewport, opcoes = {}) {
  const { vao = 14, borda = 14 } = opcoes;
  const { largura: w, altura: h } = cartao;
  const { largura: vw, altura: vh } = viewport;

  if (!area) return { top: (vh - h) / 2, left: (vw - w) / 2, ancora: "centro" };

  // Celular: não há espaço lateral para negociar. O cartão vai para a base
  // (ou para o topo, se o alvo estiver embaixo) ocupando a largura toda.
  if (vw <= 760) {
    const alvoEmbaixo = area.top + area.height / 2 > vh / 2;
    return {
      top: alvoEmbaixo ? borda : vh - h - borda,
      left: prender((vw - w) / 2, borda, vw - w - borda),
      ancora: alvoEmbaixo ? "topo-mobile" : "base-mobile",
    };
  }

  const cx = area.left + area.width / 2 - w / 2;
  const cy = area.top + area.height / 2 - h / 2;

  const candidatos = [
    { ancora: "abaixo",  top: area.top + area.height + vao, left: cx },
    { ancora: "acima",   top: area.top - vao - h,           left: cx },
    { ancora: "direita", top: cy, left: area.left + area.width + vao },
    { ancora: "esquerda",top: cy, left: area.left - vao - w },
  ];

  const dentro = (t, l) => t >= borda && t + h <= vh - borda && l >= borda && l + w <= vw - borda;
  const colide = (t, l) =>
    !(t + h < area.top || t > area.top + area.height ||
      l + w < area.left || l > area.left + area.width);

  for (const c of candidatos) {
    const top = prender(c.top, borda, vh - h - borda);
    const left = prender(c.left, borda, vw - w - borda);
    if (dentro(top, left) && !colide(top, left)) return { top, left, ancora: c.ancora };
  }

  const centroAlvo = area.top + area.height / 2;
  return {
    top: centroAlvo > vh / 2 ? borda : vh - h - borda,
    left: prender(cx, borda, vw - w - borda),
    ancora: "encostado",
  };
}
