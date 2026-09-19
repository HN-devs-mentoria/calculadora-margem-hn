import { MARKETPLACES, CATEGORIAS_GLOBAIS, TAMANHOS } from "../../lib/marketplaces";
import { fmtBRL, fmtPct, markRgb } from "../../lib/format";
import {
  MarketplaceMark, IconTag, IconCoins, IconStore, IconSliders, IconTrophy, IconAlert, IconGlobe, IconBulb, IconCrown, IconPercent, IconWeight, IconRuler, IconEraser, IconLayers, IconPackage,
} from "./icons";

/** Faixa de cor da margem — usada na barra e no número. */
export function faixaMargem(m) {
  if (m == null || Number.isNaN(m)) return "bad";
  if (m >= 0.1) return "good";
  if (m >= 0.06) return "warn";
  if (m >= 0.03) return "low";
  return "bad";
}

export default function Calculadora({ calc }) {
  const {
    modo, metaTipo, setMetaTipo, tipoAnuncio, setTipoAnuncio,
    shopeeConta, setShopeeConta, shopeeCpfAlto, setShopeeCpfAlto,
    selecionados, toggleMarketplace, overrides, setOverride,
    form, setCampo, limparCampos, resultados, ordenarPor, setOrdenarPor, temDados,
  } = calc;

  const melhor = resultados[0];
  const validos = resultados.filter((r) => !r.resultado.erro);
  const maxMargem = Math.max(...validos.map((r) => r.resultado.margem ?? 0), 0.0001);

  return (
    <>
      {/* ==================== COLUNA 1 — ENTRADA ==================== */}
      <section className="card panel">
        <div className="panel-body">
          <section data-tour="produto">
          <div className="step">
            <span className="step-num">1</span>
            <div>
              <h2>Dados do produto</h2>
              <p>Informe os dados para comparar os marketplaces</p>
            </div>
          </div>

          <div className="frow">
            <Campo label="Custo do produto (R$)" icon={<IconCoins size={15} />} val={form.custo} on={(v) => setCampo("custo", v)} />
            <Campo label="Custos extras (R$)" icon={<IconLayers size={15} />} val={form.custosExtras} on={(v) => setCampo("custosExtras", v)} />
          </div>

          <div className="field">
            <label htmlFor="categoria">Categoria</label>
            <div className="field-wrap">
              <span className="field-icon"><IconTag size={15} /></span>
              <select id="categoria" value={form.categoria} onChange={(e) => setCampo("categoria", e.target.value)}>
                {CATEGORIAS_GLOBAIS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="frow">
            <Campo label="Peso (kg)" icon={<IconWeight size={15} />} val={form.peso} on={(v) => setCampo("peso", v)} />
            <div className="field">
              <label htmlFor="tamanho">Tamanho</label>
              <div className="field-wrap">
                <span className="field-icon"><IconRuler size={15} /></span>
                <select id="tamanho" value={form.tamanho} onChange={(e) => setCampo("tamanho", e.target.value)}>
                  {TAMANHOS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>
          </div>

          <Campo label="Imposto sobre a venda (%)" icon={<IconPercent size={15} />} val={form.imposto} on={(v) => setCampo("imposto", v)} />
          </section>

          <section data-tour="meta">
          <div className="step">
            <span className="step-num">2</span>
            <div>
              <h2>{modo === "reverso" ? "Meta de lucro" : "Preço de venda"}</h2>
              <p>{modo === "reverso" ? "Quanto você quer ganhar?" : "Qual será o preço anunciado?"}</p>
            </div>
          </div>

          {modo === "reverso" ? (
            <>
              <div className="seg">
                <button type="button" className={metaTipo === "margem" ? "active" : ""} onClick={() => setMetaTipo("margem")}>Margem (%)</button>
                <button type="button" className={metaTipo === "lucro" ? "active" : ""} onClick={() => setMetaTipo("lucro")}>Lucro (R$)</button>
              </div>
              <Campo
                label={metaTipo === "margem" ? "Margem líquida desejada (%)" : "Lucro líquido desejado (R$)"}
                icon={metaTipo === "margem" ? <IconPercent size={15} /> : <IconCoins size={15} />}
                val={form.metaValor} on={(v) => setCampo("metaValor", v)}
              />
              <div className="frow">
                <Campo label="Desconto da oferta (%)" icon={<IconTag size={15} />} val={form.desconto} on={(v) => setCampo("desconto", v)} />
                <Campo label="Cupom adicional (%)" icon={<IconTag size={15} />} val={form.cupom} on={(v) => setCampo("cupom", v)} />
              </div>
            </>
          ) : (
            <Campo label="Preço ao comprador (R$)" icon={<IconTag size={15} />} val={form.precoVenda} on={(v) => setCampo("precoVenda", v)} />
          )}

          </section>

          <section data-tour="marketplaces">
          <div className="step">
            <span className="step-num">3</span>
            <div>
              <h2>Marketplaces</h2>
              <p>Escolha os canais que entram na comparação</p>
            </div>
          </div>

          <div className="mp-pills">
            {Object.values(MARKETPLACES).map((mp) => (
              <button
                key={mp.id}
                type="button"
                aria-pressed={selecionados.has(mp.id)}
                style={{ "--mp": markRgb(mp.cor) }}
                className={"mp-pill " + (selecionados.has(mp.id) ? "on" : "")}
                onClick={() => toggleMarketplace(mp.id)}
              >
                <span className="mp-mark sm"><MarketplaceMark id={mp.id} size={13} /></span>
                <span>{mp.nome}</span>
              </button>
            ))}
          </div>

          {selecionados.has("mercadolivre") && (
            <div className="mp-opt">
              <div className="mp-opt-head">
                <span className="mp-mark sm" style={{ "--mp": markRgb(MARKETPLACES.mercadolivre.cor) }}>
                  <MarketplaceMark id="mercadolivre" size={12} />
                </span>
                Mercado Livre — tipo de anúncio
              </div>
              <div className="seg" style={{ marginBottom: 0 }}>
                <button type="button" className={tipoAnuncio === "classico" ? "active" : ""} onClick={() => setTipoAnuncio("classico")}>Clássico</button>
                <button type="button" className={tipoAnuncio === "premium" ? "active" : ""} onClick={() => setTipoAnuncio("premium")}>Premium</button>
              </div>
            </div>
          )}

          {selecionados.has("shopee") && (
            <div className="mp-opt">
              <div className="mp-opt-head">
                <span className="mp-mark sm" style={{ "--mp": markRgb(MARKETPLACES.shopee.cor) }}>
                  <MarketplaceMark id="shopee" size={12} />
                </span>
                Shopee <span className="tag-novo">regras 2026</span>
              </div>
              <div className="seg" style={{ marginBottom: shopeeConta === "cpf" ? 10 : 0 }}>
                <button type="button" className={shopeeConta === "cnpj" ? "active" : ""} onClick={() => setShopeeConta("cnpj")}>CNPJ</button>
                <button type="button" className={shopeeConta === "cpf" ? "active" : ""} onClick={() => setShopeeConta("cpf")}>CPF</button>
              </div>
              {shopeeConta === "cpf" && (
                <label className="chk">
                  <input type="checkbox" checked={shopeeCpfAlto} onChange={(e) => setShopeeCpfAlto(e.target.checked)} />
                  Mais de 450 pedidos em 90 dias (+R$ 3,00/item)
                </label>
              )}
            </div>
          )}

          </section>

          <details className="adv" data-tour="avancadas">
            <summary><IconSliders size={13} /> Regras avançadas por marketplace</summary>
            {Object.values(MARKETPLACES).map((mp) => (
              <div className="adv-rule" key={mp.id}>
                <div className="adv-rule-head">
                  <span className="mp-mark sm" style={{ "--mp": markRgb(mp.cor) }}>
                    <MarketplaceMark id={mp.id} size={12} />
                  </span>
                  {mp.nome}
                </div>
                <div className="adv-rule-grid">
                  <div>
                    <label htmlFor={`c-${mp.id}`}>Comissão (%)</label>
                    <input id={`c-${mp.id}`} type="number" step="0.1" placeholder="auto"
                      value={overrides[mp.id]?.comissao ?? ""} onChange={(e) => setOverride(mp.id, "comissao", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`t-${mp.id}`}>Taxa fixa (R$)</label>
                    <input id={`t-${mp.id}`} type="number" step="0.01" placeholder="auto"
                      value={overrides[mp.id]?.taxaFixa ?? ""} onChange={(e) => setOverride(mp.id, "taxaFixa", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor={`f-${mp.id}`}>Frete (R$)</label>
                    <input id={`f-${mp.id}`} type="number" step="0.01" placeholder="auto"
                      value={overrides[mp.id]?.frete ?? ""} onChange={(e) => setOverride(mp.id, "frete", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </details>
        </div>

        <div className="panel-foot">
          <button type="button" className="cta-secondary" onClick={limparCampos}>
            <IconEraser size={15} /> Limpar campos
          </button>
        </div>
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
          <div className="hero" data-tour="vencedor" style={{ "--mp": markRgb(melhor.marketplace.cor) }}>
            <div className="hero-top">
              <span className="hero-eyebrow"><IconTrophy size={15} /> Melhor resultado</span>
              <span className="hero-rank"><IconCrown size={13} /> 1º lugar</span>
            </div>

            <h2 className="hero-title">
              <span className="hero-brand">{melhor.marketplace.nome}</span> é o seu melhor canal!
            </h2>
            <p className="hero-sub">
              {ordenarPor === "margem" ? "Maior margem" : "Maior lucro líquido"} e melhor retorno para o seu produto.
            </p>

            <div className="hero-metrics">
              {modo === "reverso" ? (
                <>
                  <Tile k="Anunciar por" v={fmtBRL(melhor.resultado.precoAnunciado)} />
                  <Tile k="Fica à venda por" v={fmtBRL(melhor.resultado.precoVenda)} />
                  <Tile k="Lucro líquido" v={fmtBRL(melhor.resultado.lucro)} destaque />
                  <Tile k="Margem" v={fmtPct(melhor.resultado.margem)} destaque />
                </>
              ) : (
                <>
                  <Tile k="Lucro líquido" v={fmtBRL(melhor.resultado.lucro)} destaque />
                  <Tile k="Margem" v={fmtPct(melhor.resultado.margem)} destaque />
                  <Tile k="Markup" v={fmtPct(melhor.resultado.markup)} />
                  <Tile k="Preço de venda" v={fmtBRL(melhor.resultado.precoVenda)} />
                </>
              )}
            </div>

            <span className="hero-mark" aria-hidden="true">
              <MarketplaceMark id={melhor.marketplace.id} size={110} />
            </span>
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
            <label className="cmp-sort" data-tour="ordenar">
              <span>Ordenar por</span>
              <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)}>
                <option value="lucro">Lucro líquido</option>
                <option value="margem">Margem</option>
              </select>
            </label>
          </div>

          <div className="cmp-scroll">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th className="col-rank">#</th>
                  <th>Marketplace</th>
                  {modo === "reverso" ? (
                    <><th>Anunciar</th><th>À venda</th><th>Taxas + frete</th></>
                  ) : (
                    <><th>Comissão</th><th>Taxa fixa</th><th>Frete (estimado)</th></>
                  )}
                  <th className="col-margem">Margem</th>
                  <th className="col-lucro">Lucro líquido</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map(({ marketplace: mp, resultado: r }, i) => {
                  const top = i === 0 && !r.erro;
                  return (
                    <tr key={mp.id} className={top ? "is-top" : undefined} style={{ "--mp": markRgb(mp.cor) }}>
                      <td className="col-rank"><span className="rank">{i + 1}</span></td>
                      <td>
                        <div className="mp-ident">
                          <span className="mp-mark"><MarketplaceMark id={mp.id} size={14} /></span>
                          <span>
                            {mp.nome}
                            {top && <span className="mp-flag">Melhor resultado</span>}
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
              <b>Dica:</b> os valores de frete e comissão são estimativas e variam por região,
              categoria, contrato e nível da sua conta. Ajuste em “Regras avançadas”.
            </p>
          </div>
        </section>}
      </div>
    </>
  );
}

function TdMargem({ r, max }) {
  const faixa = faixaMargem(r.margem);
  const largura = Math.max(4, Math.min(100, ((r.margem ?? 0) / max) * 100));
  return (
    <td className="col-margem" data-rotulo="Margem">
      <span className={"margem-val " + faixa}>{fmtPct(r.margem)}</span>
      <span className="mbar"><span className={"mbar-fill " + faixa} style={{ width: `${largura}%` }} /></span>
    </td>
  );
}

function Campo({ label, val, on, icon }) {
  const id = "f-" + label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input id={id} type="number" inputMode="decimal" step="0.01" value={val} onChange={(e) => on(e.target.value)} />
      </div>
    </div>
  );
}

function Tile({ k, v, destaque }) {
  return (
    <div className={"hero-tile" + (destaque ? " destaque" : "")}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}
