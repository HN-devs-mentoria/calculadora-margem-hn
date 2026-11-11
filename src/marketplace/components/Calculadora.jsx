import { useEffect, useRef, useState } from "react";
import ProdutoMcp, { praticadoTexto } from "./ProdutoMcp.jsx";
import { precoSemLucro } from "../../lib/useCalculadora";
import { MARKETPLACES, CATEGORIAS_GLOBAIS, TAMANHOS } from "../../lib/marketplaces";
import { fmtBRL, fmtPct, nomeFaixa, fatiasDoPreco, noCanal } from "../../lib/format";
import {
  MarketplaceMark, IconStore, IconAlert, IconGlobe, IconBulb, IconChart, IconEraser, IconPackage,
  IconCalculator, IconTarget, IconArrowRight, IconSettings, IconX,
} from "./icons";

/** Faixa de cor da margem — usada na barra e no número. */
export function faixaMargem(m) {
  if (m == null || Number.isNaN(m)) return "bad";
  if (m >= 0.1) return "good";
  if (m >= 0.06) return "warn";
  if (m >= 0.03) return "low";
  return "bad";
}

export default function Calculadora({ calc, produto, onProduto, etapa, setEtapa, onTutorial }) {
  const {
    modo, setModo, metaTipo, setMetaTipo, tipoAnuncio, setTipoAnuncio,
    shopeeConta, setShopeeConta, shopeeCpfAlto, setShopeeCpfAlto, tiktokSfp, setTiktokSfp,
    selecionados, setSelecionados, toggleMarketplace, overrides, setOverride,
    form, setCampo, limparCampos, resultados, ordenarPor, setOrdenarPor, temDados, paramsBase,
  } = calc;

  const praticados = produto?.praticados ?? null;
  const melhor = resultados[0];
  const validos = resultados.filter((r) => !r.resultado.erro);
  const maxMargem = Math.max(...validos.map((r) => r.resultado.margem ?? 0), 0.0001);

  // Categoria, peso e tamanho definem comissão e frete, e o MCPSeller não os
  // informa: o usuário confere antes de sair do passo 1. Mudou, confere de novo.
  const [detalhesOk, setDetalhesOk] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [avisoDetalhes, setAvisoDetalhes] = useState(false);
  const setDetalhe = (campo, v) => { setCampo(campo, v); setDetalhesOk(false); };
  const pesoOk = parseFloat(String(form.peso ?? "").replace(",", ".")) > 0;
  const confirmarDetalhes = () => { setDetalhesOk(true); setAvisoDetalhes(false); setDetalhesAbertos(false); };

  const escolherProduto = (p) => {
    onProduto(p);
    setDetalhesOk(false);
    if (p?.anuncio.preco != null && p.anuncio.moeda === "BRL") {
      setModo("direto");
      setCampo("precoVenda", String(p.anuncio.preco));
    }
  };

  // Multistepper: um passo por vez, com atalhos no topo da coluna.
  const num = (v) => parseFloat(String(v ?? "").replace(",", ".")) > 0;
  const irPara = (n) => {
    if (n > 1 && !detalhesOk) {
      setEtapa(1);
      setDetalhesAbertos(true);
      setAvisoDetalhes(true);
      return;
    }
    setEtapa(n);
  };
  const [taxasAbertas, setTaxasAbertas] = useState(false);
  const temTaxaManual = Object.values(overrides).some((o) => Object.values(o).some((v) => v !== "" && v != null));
  const ETAPAS = [
    { n: 1, rotulo: "Produto", feito: num(form.custo) && detalhesOk },
    { n: 2, rotulo: modo === "reverso" ? "Ganho" : "Preço", feito: modo === "reverso" ? num(form.metaValor) : num(form.precoVenda) },
    { n: 3, rotulo: "Canais", feito: selecionados.size > 0 },
  ];
  const corpo = useRef(null);
  useEffect(() => { corpo.current?.scrollTo({ top: 0 }); }, [etapa]);

  return (
    <>
      {/* ==================== COLUNA 1 — ENTRADA ==================== */}
      <section className="card panel painel-escuro">
        <div className="panel-head">
          <div className="panel-marca">
            <span className="icon-box"><IconChart size={16} /></span>
            <span className="panel-nome">
              Calculadora de Margem
              <small>por Henrique Niada</small>
            </span>
            <button type="button" className="btn-secondary btn-icone" onClick={onTutorial} title="Rever o tutorial" aria-label="Rever o tutorial">
              <IconBulb size={15} />
            </button>
            <button
              type="button" className={"btn-secondary btn-icone" + (temTaxaManual ? " com-ajuste" : "")} data-tour="avancadas"
              onClick={() => setTaxasAbertas(true)} title="Taxas por marketplace" aria-label="Ajustar taxas por marketplace"
            >
              <IconSettings size={15} />
            </button>
          </div>

          <div className="seg seg--modo" data-tour="modo" role="group" aria-label="Modo de cálculo">
            <button type="button" className={modo === "direto" ? "active" : ""} onClick={() => setModo("direto")}>
              <IconCalculator size={14} /> Já tenho preço
            </button>
            <button type="button" className={modo === "reverso" ? "active" : ""} onClick={() => setModo("reverso")}>
              <IconTarget size={14} /> Quanto anunciar
            </button>
          </div>

          <nav className="etapas" aria-label="Passos">
            {ETAPAS.map((e) => (
              <button
                key={e.n} type="button" onClick={() => irPara(e.n)}
                className={"etapa" + (etapa === e.n ? " atual" : "") + (e.feito ? " feito" : "")}
                aria-current={etapa === e.n ? "step" : undefined}
              >
                <span className="etapa-num" aria-hidden="true">
                  {e.feito && etapa !== e.n ? (
                    <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : e.n}
                </span>
                {e.rotulo}
                {e.feito && <span className="sr-only"> (preenchido)</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="panel-body" ref={corpo}>
          {etapa === 1 && <section data-tour="produto">
            <Passo
              n="1" titulo="Produto e custos" sub="O que você gasta para vender cada unidade"
              acao={produto && <button type="button" className="tag-trocar" onClick={() => escolherProduto(null)}>Trocar produto</button>}
            />

            <ProdutoMcp produto={produto} onEscolher={escolherProduto} />

            <div className="frow">
              <Campo label="Custo do produto" prefixo="R$" val={form.custo} on={(v) => setCampo("custo", v)} ajuda="Quanto você paga por unidade." />
              <Campo label="Custos extras" prefixo="R$" val={form.custosExtras} on={(v) => setCampo("custosExtras", v)} ajuda="Embalagem, brinde, etiqueta." />
            </div>
            <Campo label="Imposto sobre a venda" sufixo="%" val={form.imposto} on={(v) => setCampo("imposto", v)} ajuda="A alíquota do seu regime tributário." />

            <details
              className={"mais" + (detalhesOk ? " ok" : " pendente") + (avisoDetalhes ? " alerta" : "")}
              open={detalhesAbertos} onToggle={(e) => setDetalhesAbertos(e.currentTarget.open)}
            >
              <summary>
                <span>
                  Detalhes de frete e categoria
                  <em className="mais-estado">{detalhesOk ? "✓ Conferido" : "Conferir"}</em>
                </span>
                <small>{resumoDetalhes(form)}</small>
              </summary>
              <div className="mais-corpo">
                <p className="mais-nota">
                  {produto
                    ? "O MCPSeller não informa categoria, peso nem tamanho. Confira antes de continuar."
                    : "Categoria, peso e tamanho mudam a comissão e o frete. Confira antes de continuar."}
                </p>
                <div className="field">
                  <label htmlFor="categoria">Categoria</label>
                  <select id="categoria" value={form.categoria} onChange={(e) => setDetalhe("categoria", e.target.value)}>
                    {CATEGORIAS_GLOBAIS.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </select>
                </div>
                <div className="frow">
                  <Campo label="Peso" sufixo="kg" val={form.peso} on={(v) => setDetalhe("peso", v)} />
                  <div className="field">
                    <label htmlFor="tamanho">Tamanho da caixa</label>
                    <select id="tamanho" value={form.tamanho} onChange={(e) => setDetalhe("tamanho", e.target.value)}>
                      {TAMANHOS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" className="btn-primary mais-confirmar" disabled={!pesoOk} onClick={confirmarDetalhes}>
                  {pesoOk ? "Confirmar detalhes" : "Informe o peso para confirmar"}
                </button>
              </div>
            </details>
            {avisoDetalhes && !detalhesOk && (
              <p className="mais-aviso" role="alert">Confira e confirme os detalhes de frete e categoria para seguir.</p>
            )}
          </section>}

          {etapa === 2 && <section data-tour="meta">
            <Passo
              n="2"
              titulo={modo === "reverso" ? "Quanto você quer ganhar?" : "Preço de venda"}
              sub={modo === "reverso" ? "A calculadora acha o preço de cada canal" : "Por quanto o produto é vendido"}
            />

            {modo === "reverso" ? (
              <>
                <div className="seg">
                  <button type="button" className={metaTipo === "margem" ? "active" : ""} onClick={() => setMetaTipo("margem")}>Margem (%)</button>
                  <button type="button" className={metaTipo === "lucro" ? "active" : ""} onClick={() => setMetaTipo("lucro")}>Lucro (R$)</button>
                </div>
                <Campo
                  label={metaTipo === "margem" ? "Margem desejada" : "Lucro desejado por venda"}
                  prefixo={metaTipo === "lucro" ? "R$" : undefined}
                  sufixo={metaTipo === "margem" ? "%" : undefined}
                  passo={1}
                  val={form.metaValor} on={(v) => setCampo("metaValor", v)}
                />
                <div className="frow">
                  <Campo label="Desconto da oferta" sufixo="%" val={form.desconto} on={(v) => setCampo("desconto", v)} />
                  <Campo label="Cupom" sufixo="%" val={form.cupom} on={(v) => setCampo("cupom", v)} />
                </div>
              </>
            ) : (
              <Campo label="Preço ao comprador" prefixo="R$" val={form.precoVenda} on={(v) => setCampo("precoVenda", v)} ajuda="Use o valor que o comprador realmente paga." />
            )}
          </section>}

          {etapa === 3 && <>
          <section data-tour="marketplaces">
            <Passo n="3" titulo="Onde vender" sub="Toque nas logos para incluir na comparação" />

            <div className="canais-acoes">
              <button type="button" className="link-btn" onClick={() => setSelecionados(new Set(Object.keys(MARKETPLACES)))}>Selecionar todos</button>
              <button type="button" className="link-btn" onClick={() => setSelecionados(new Set())}>Limpar</button>
            </div>
            <div className="canais" role="group" aria-label="Marketplaces na comparação">
              {Object.values(MARKETPLACES).map((mp) => {
                const on = selecionados.has(mp.id);
                return (
                  <button
                    key={mp.id} type="button" aria-pressed={on} aria-label={mp.nome} title={mp.nome}
                    className={"canal" + (on ? " on" : "")}
                    onClick={() => toggleMarketplace(mp.id)}
                  >
                    <MarketplaceMark id={mp.id} size={30} />
                    {on && (
                      <span className="canal-check" aria-hidden="true">
                        <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selecionados.has("mercadolivre") && (
              <Regra id="mercadolivre" titulo="Mercado Livre">
                <div className="seg">
                  <button type="button" className={tipoAnuncio === "classico" ? "active" : ""} onClick={() => setTipoAnuncio("classico")}>Clássico</button>
                  <button type="button" className={tipoAnuncio === "premium" ? "active" : ""} onClick={() => setTipoAnuncio("premium")}>Premium</button>
                </div>
              </Regra>
            )}

            {selecionados.has("shopee") && (
              <Regra id="shopee" titulo="Shopee">
                <div className="seg">
                  <button type="button" className={shopeeConta === "cnpj" ? "active" : ""} onClick={() => setShopeeConta("cnpj")}>CNPJ</button>
                  <button type="button" className={shopeeConta === "cpf" ? "active" : ""} onClick={() => setShopeeConta("cpf")}>CPF</button>
                </div>
                {shopeeConta === "cpf" && (
                  <label className="chk">
                    <input type="checkbox" checked={shopeeCpfAlto} onChange={(e) => setShopeeCpfAlto(e.target.checked)} />
                    Mais de 450 pedidos em 90 dias (+R$ 3,00 por item)
                  </label>
                )}
              </Regra>
            )}

            {selecionados.has("tiktok-shop") && (
              <Regra id="tiktok-shop" titulo="TikTok Shop">
                <label className="chk">
                  <input type="checkbox" checked={tiktokSfp} onChange={(e) => setTiktokSfp(e.target.checked)} />
                  Programa de Taxas de Envio (6%, até R$ 50)
                </label>
                <p className="regra-ajuda">
                  10% + R$ 4 abaixo de R$ 50; 6% + R$ 6 a partir de R$ 50.
                  {!tiktokSfp && " Informe seu frete na engrenagem."}
                </p>
              </Regra>
            )}
          </section>

          </>}
        </div>

        <div className="panel-foot panel-foot--passos">
          <button type="button" className="link-btn" onClick={() => { limparCampos(); setDetalhesOk(false); setEtapa(1); }}>
            <IconEraser size={13} /> Limpar tudo
          </button>
          {etapa > 1 && (
            <button type="button" className="btn-secondary passo-btn" onClick={() => setEtapa(etapa - 1)}>
              <IconArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Voltar
            </button>
          )}
          {etapa < 3 ? (
            <button type="button" className="btn-primary passo-btn" onClick={() => irPara(etapa + 1)}>
              Próximo <IconArrowRight size={14} />
            </button>
          ) : (
            <span className="passo-fim">Resultado ao lado</span>
          )}
        </div>

        <TaxasModal aberto={taxasAbertas} onFechar={() => setTaxasAbertas(false)} overrides={overrides} setOverride={setOverride} />
      </section>

      {/* ==================== COLUNA 2 — RESULTADOS ==================== */}
      <div className="col-centro">
        {!temDados ? (
          <div className="hero hero--vazio hero--aguardando">
            <span className="icon-box lg"><IconPackage size={22} /></span>
            <p className="aguardando-titulo">Preencha os dados do produto</p>
            <p className="aguardando-sub">
              {modo === "reverso"
                ? "Informe ao menos o custo do produto para descobrir por quanto anunciar em cada canal."
                : "Informe o preço de venda para ver quanto sobra em cada canal."}
            </p>
          </div>
        ) : melhor && !melhor.resultado.erro ? (
          <div className="hero" data-tour="vencedor">
            <h2 className="hero-title">{melhor.marketplace.nome} é o seu melhor canal</h2>
            <p className="hero-sub">
              {ordenarPor === "margem" ? "Maior margem" : "Maior lucro por venda"} entre os canais que você está comparando.
            </p>

            <ParaOndeVai r={melhor.resultado} mp={melhor.marketplace} modo={modo} />

            {modo === "direto" && (
              <SimularPreco
                valor={form.precoVenda} onMudar={(v) => setCampo("precoVenda", v)} mp={melhor.marketplace}
                semLucro={precoSemLucro(melhor.marketplace.id, paramsBase, overrides[melhor.marketplace.id])}
              />
            )}
          </div>
        ) : (
          <div className="hero hero--vazio">
            <IconStore size={22} /> Selecione ao menos um marketplace para comparar
          </div>
        )}

        {temDados && <section className="card cmp" data-tour="comparativo">
          <div className="cmp-head">
            <span className="icon-box"><IconGlobe size={16} /></span>
            <div className="cmp-head-txt">
              <h2>Comparativo entre marketplaces</h2>
              <p>Veja como seu produto se sai em cada canal de venda</p>
            </div>
            <div className="cmp-sort" data-tour="ordenar">
              <span id="ordenar-rotulo">Ordenar por</span>
              <div className="periodo-sel" role="radiogroup" aria-labelledby="ordenar-rotulo">
                {[["lucro", "Lucro líquido"], ["margem", "Margem"]].map(([v, t]) => (
                  <button key={v} type="button" role="radio" aria-checked={ordenarPor === v} onClick={() => setOrdenarPor(v)}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="cmp-scroll">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th className="col-mp">Marketplace</th>
                  {modo === "reverso" ? (
                    <><th>Anunciar</th><th>À venda</th><th><Dica texto={DICAS.taxas}>Taxas + frete</Dica></th></>
                  ) : (
                    <>
                      <th><Dica texto={DICAS.comissao}>Comissão</Dica></th>
                      <th><Dica texto={DICAS.taxa}>Taxa fixa</Dica></th>
                      <th><Dica texto={DICAS.frete}><span className="th-2l">Frete<br />estimado</span></Dica></th>
                    </>
                  )}
                  <th className="col-margem"><Dica texto={DICAS.margem}>Margem</Dica></th>
                  <th className="col-lucro"><Dica texto={DICAS.lucro}>Lucro líquido</Dica></th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(({ marketplace: mp, resultado: r }, i) => {
                  const top = i === 0 && !r.erro;
                  return (
                    <tr key={mp.id} className={top ? "is-top" : undefined}>
                      <td className="col-rank"><span className="rank">{i + 1}</span></td>
                      <td className="col-mp">
                        <div className="mp-ident">
                          <span className="mp-mark"><MarketplaceMark id={mp.id} size={14} /></span>
                          <span>
                            {mp.nome}
                            {praticados?.[mp.id] && (
                              <span className="mp-pratica">Você vende<br />{praticadoTexto(praticados[mp.id])}</span>
                            )}
                            {top && <span className="mp-flag" title="Melhor resultado">Melhor</span>}
                          </span>
                        </div>
                      </td>
                      {r.erro ? (
                        <td colSpan={5} className="err"><IconAlert size={13} /> {r.erro}</td>
                      ) : modo === "reverso" ? (
                        <>
                          <td data-rotulo="Anunciar">{fmtBRL(r.precoAnunciado)}</td>
                          <td data-rotulo="À venda">{fmtBRL(r.precoVenda)}</td>
                          <td data-rotulo="Taxas + frete">{fmtBRL(r.comissaoValor + r.taxaFixaMp + r.frete)}</td>
                          <TdMargem r={r} max={maxMargem} />
                          <td className="col-lucro" data-rotulo="Lucro líquido"><b className={r.lucro >= 0 ? "pos" : "neg"}>{fmtBRL(r.lucro)}</b></td>
                        </>
                      ) : (
                        <>
                          <td data-rotulo="Comissão">{fmtBRL(r.comissaoValor)} <span className="sub">({fmtPct(r.comissaoRate)})</span></td>
                          <td data-rotulo="Taxa fixa">{fmtBRL(r.taxaFixaMp)}</td>
                          <td data-rotulo="Frete">{fmtBRL(r.frete)}</td>
                          <TdMargem r={r} max={maxMargem} />
                          <td className="col-lucro" data-rotulo="Lucro líquido"><b className={r.lucro >= 0 ? "pos" : "neg"}>{fmtBRL(r.lucro)}</b></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cmp-tip">
            <span className="tip-icon"><IconBulb size={14} /></span>
            <p>
              <b>Estimativas:</b> frete e comissão variam por região, categoria e conta. Ajuste na engrenagem da coluna.
            </p>
          </div>
        </section>}

      </div>
    </>
  );
}

const DICAS = {
  comissao: "Percentual que o marketplace cobra sobre o preço de venda. Muda por categoria e tipo de anúncio.",
  taxa: "Valor fixo cobrado por unidade vendida, comum em produtos mais baratos.",
  frete: "Parte do frete que você paga ao vender, estimada pelo peso e pelo tamanho.",
  taxas: "Comissão, taxa fixa e frete somados.",
  margem: "Quanto do preço de venda sobra como lucro, depois de todos os custos.",
  lucro: "O que sobra por unidade depois de custo, taxas, frete e imposto.",
};

/** Explicação curta no mouse e no foco do teclado; leitores de tela recebem o texto junto. */
function Dica({ texto, children }) {
  return (
    <span className="dica" tabIndex={0} data-dica={texto}>
      {children}
      <span className="sr-only">: {texto}</span>
    </span>
  );
}

/** Para onde vai cada real do preço de venda no canal vencedor. */
function ParaOndeVai({ r, mp, modo }) {
  const { fatias, total } = fatiasDoPreco(r);
  const descricao = fatias.map((f) => `${f.rotulo} ${fmtBRL(f.valor)}`).join(", ");
  return (
    <div className="gasto">
      <p className="gasto-frase">
        {modo === "reverso" && r.precoAnunciado !== r.precoVenda ? (
          <>Anunciando a <b>{fmtBRL(r.precoAnunciado)}</b>, o comprador paga <b>{fmtBRL(r.precoVenda)}</b> {noCanal(mp)}</>
        ) : (
          <>Em cada venda de <b>{fmtBRL(r.precoVenda)}</b> {noCanal(mp)}</>
        )}
        {r.lucro < 0 ? (
          <>, você perde <b className="neg">{fmtBRL(-r.lucro)}</b>.</>
        ) : (
          <>, sobram <b className="pos">{fmtBRL(r.lucro)}</b> para você.</>
        )}
      </p>
      <div className="gasto-barra" role="img" aria-label={`Divisão do preço: ${descricao}`}>
        {fatias.map((f) => (
          <span key={f.id} className={"c-" + f.id} style={{ flexGrow: f.valor / total }} />
        ))}
      </div>
      <ul className="gasto-legenda" aria-hidden="true">
        {fatias.map((f) => (
          <li key={f.id}>
            <i className={"c-" + f.id} /> {f.rotulo} <b>{fmtBRL(f.valor)}</b>
          </li>
        ))}
      </ul>
      <p className="gasto-resumo">
        Margem de {fmtPct(r.margem)} ({nomeFaixa(r.margem)}) e markup de {fmtPct(r.markup)}. {" "}
        <Dica texto="Margem é o lucro dividido pelo preço de venda. Markup é o lucro dividido pelo custo do produto. A base muda: 30% de margem não equivale a 30% de markup."><span className="ajuda-margem" aria-label="Diferença entre margem e markup">?</span></Dica>
      </p>
    </div>
  );
}

/**
 * "E se eu mudar o preço?": o controle desliza de 50% a 150% do preço digitado
 * e escreve no próprio campo, então tabela, insights e gráfico mudam juntos.
 * O ponto de partida só muda quando o usuário digita outro preço.
 */
function SimularPreco({ valor, onMudar, mp, semLucro }) {
  const atual = Number(valor);
  const base = useRef(atual);
  const emitido = useRef(null);
  if (valor !== emitido.current) base.current = atual;
  if (!(base.current > 0)) return null;

  const mudar = (v) => {
    emitido.current = v;
    onMudar(v);
  };
  const delta = atual / base.current - 1;
  const mudou = Math.abs(delta) >= 0.0005;
  const min = Math.round(base.current * 50) / 100;
  const max = Math.round(base.current * 150) / 100;
  // Posição no trilho (0 a 1), presa às pontas.
  const pos = (v) => Math.max(0, Math.min(1, (v - min) / (max - min)));

  return (
    <div className="simular">
      <div className="simular-topo">
        <label htmlFor="simular-preco">E se eu mudar o preço?</label>
        <span className="simular-valor">
          <b>{fmtBRL(atual)}</b>
          {mudou && ` (${delta > 0 ? "+" : "−"}${fmtPct(Math.abs(delta))} do original)`}
        </span>
        {mudou && (
          <button type="button" className="simular-voltar" onClick={() => mudar(String(base.current))}>
            Voltar para {fmtBRL(base.current)}
          </button>
        )}
      </div>
      <div className="simular-trilho">
        {semLucro != null && semLucro > min && (
          <span className="simular-prejuizo" style={{ "--p": pos(semLucro) }} aria-hidden="true" />
        )}
        <span className="simular-original" style={{ "--p": pos(base.current) }} aria-hidden="true" />
        <input
          id="simular-preco" type="range" step="0.01" min={min} max={max}
          value={atual} onChange={(e) => mudar(Number(e.target.value).toFixed(2))}
          aria-describedby="simular-legenda"
        />
      </div>
      <ul className="simular-legenda" id="simular-legenda">
        <li><i className="leg-original" aria-hidden="true" /> Preço original: {fmtBRL(base.current)}</li>
        {semLucro != null && (
          <li><i className="leg-prejuizo" aria-hidden="true" /> Lucro zero {noCanal(mp)}: {fmtBRL(semLucro)}{semLucro <= min ? " (abaixo da faixa)" : semLucro > max ? " (acima da faixa)" : ""}</li>
        )}
      </ul>
    </div>
  );
}

function TdMargem({ r, max }) {
  const faixa = faixaMargem(r.margem);
  const largura = Math.max(4, Math.min(100, ((r.margem ?? 0) / max) * 100));
  return (
    <td className="col-margem" data-rotulo="Margem">
      <span className={"margem-val " + faixa}>
        {fmtPct(r.margem)}
        <span className="margem-faixa">{nomeFaixa(r.margem)}</span>
      </span>
      <span className="mbar"><span className={"mbar-fill " + faixa} style={{ width: `${largura}%` }} /></span>
    </td>
  );
}

function Passo({ n, titulo, sub, acao }) {
  return (
    <div className="step" data-passo={n}>
      <div>
        <h2>{titulo}{acao}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}

/** Resumo dos detalhes recolhidos: categoria, peso e tamanho. */
function resumoDetalhes(form) {
  const categoria = CATEGORIAS_GLOBAIS.find((c) => c.id === form.categoria)?.nome ?? "Sem categoria";
  const tamanho = TAMANHOS.find((t) => t.id === form.tamanho)?.nome.split(" (")[0].toLowerCase() ?? "";
  const peso = form.peso ? `${form.peso.replace(".", ",")} kg` : "peso não informado";
  return `${categoria} — ${peso}, ${tamanho}`;
}

/** Opções de um canal, mostradas só quando ele está selecionado. */
function Regra({ id, titulo, children }) {
  return (
    <div className="mp-opt">
      <div className="mp-opt-head">
        <span className="mp-mark sm">
          <MarketplaceMark id={id} size={12} />
        </span>
        {titulo}
      </div>
      {children}
    </div>
  );
}

/** Mini modal da engrenagem: comissão, taxa fixa e frete à mão, por canal. */
function TaxasModal({ aberto, onFechar, overrides, setOverride }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog
      ref={ref} className="taxas-modal" aria-labelledby="taxas-titulo" onClose={onFechar}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div className="taxas-head">
        <span className="icon-box"><IconSettings size={15} /></span>
        <div>
          <h2 id="taxas-titulo">Taxas por marketplace</h2>
          <p>Em branco, vale a estimativa da calculadora.</p>
        </div>
        <button type="button" className="btn-secondary btn-icone" onClick={onFechar} aria-label="Fechar"><IconX size={15} /></button>
      </div>
      <div className="taxas-grade">
        <span /><span>Comissão (%)</span><span>Taxa fixa (R$)</span><span>Frete (R$)</span>
        {Object.values(MARKETPLACES).map((mp) => (
          <TaxasManuais key={mp.id} mp={mp} overrides={overrides} setOverride={setOverride} />
        ))}
      </div>
      <div className="taxas-foot">
        <button type="button" className="btn-primary passo-btn" onClick={onFechar}>Pronto</button>
      </div>
    </dialog>
  );
}

/** Comissão, taxa fixa e frete informados à mão para um canal. */
function TaxasManuais({ mp, overrides, setOverride }) {
  const campos = [["comissao", "Comissão", "0.1"], ["taxaFixa", "Taxa fixa", "0.01"], ["frete", "Frete", "0.01"]];
  return (
    <>
      <span className="taxas-mp"><span className="mp-mark sm"><MarketplaceMark id={mp.id} size={12} /></span>{mp.nome}</span>
      {campos.map(([campo, rotulo, step]) => (
        <input
          key={campo} type="number" inputMode="decimal" min="0" step={step} placeholder="auto"
          aria-label={`${rotulo} — ${mp.nome}`}
          value={overrides[mp.id]?.[campo] ?? ""} onChange={(e) => setOverride(mp.id, campo, e.target.value)}
        />
      ))}
    </>
  );
}

/**
 * Campo numérico com a unidade visível (R$, %, kg) e, opcionalmente,
 * botões − e + que andam de `passo` em `passo` sem ficar negativo.
 */
function Campo({ label, val, on, prefixo, sufixo, ajuda, passo }) {
  const id = "f-" + label.replace(/\W+/g, "-").toLowerCase();
  const andar = (d) => on(String(Math.max(0, Math.round(((parseFloat(val) || 0) + d) * 100) / 100)));
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={"field-wrap" + (passo ? " field-wrap--passo" : "")}>
        {passo && <button type="button" className="field-passo" aria-label={`Diminuir ${label.toLowerCase()}`} onClick={() => andar(-passo)}>−</button>}
        {prefixo && <span className="field-un" aria-hidden="true">{prefixo}</span>}
        <input
          id={id} type="number" inputMode="decimal" min="0" step="0.01" value={val}
          onChange={(e) => on(e.target.value)} aria-describedby={ajuda ? `${id}-ajuda` : undefined}
        />
        {sufixo && <span className="field-un" aria-hidden="true">{sufixo}</span>}
        {passo && <button type="button" className="field-passo" aria-label={`Aumentar ${label.toLowerCase()}`} onClick={() => andar(passo)}>+</button>}
      </div>
      {ajuda && <small id={`${id}-ajuda`} className="field-ajuda">{ajuda}</small>}
    </div>
  );
}
