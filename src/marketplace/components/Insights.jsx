import { fmtBRL, fmtPct, markRgb } from "../../lib/format";
import { faixaMargem } from "./Calculadora";
import {
  MarketplaceMark, IconSparkles, IconTrendUp, IconTrendDown, IconChart,
} from "./icons";

/**
 * Leitura do resultado: melhor canal, pior canal e a diferença entre eles,
 * mais o gráfico de margem por marketplace. Tudo derivado de `resultados` —
 * não busca nada e não guarda estado.
 */
export default function Insights({ resultados }) {
  const validos = resultados.filter((r) => !r.resultado.erro);

  if (validos.length === 0) {
    return (
      <section className="card panel-bloco">
        <div className="bloco-head">
          <span className="icon-box"><IconSparkles size={16} /></span>
          <div><h2>Insights da sua análise</h2><p>Resumo para decidir mais rápido</p></div>
        </div>
        <p className="empty-state"><IconChart size={22} />Sem canais para comparar</p>
      </section>
    );
  }

  // `resultados` já vem ordenado pelo critério escolhido.
  const melhor = validos[0];
  const pior = validos[validos.length - 1];
  const diferenca = (melhor.resultado.lucro ?? 0) - (pior.resultado.lucro ?? 0);
  const ganhoPct =
    pior.resultado.lucro > 0
      ? Math.round(((melhor.resultado.lucro - pior.resultado.lucro) / pior.resultado.lucro) * 100)
      : null;
  const maxMargem = Math.max(...validos.map((r) => r.resultado.margem ?? 0), 0.0001);
  const temComparacao = validos.length > 1;

  return (
    <>
      <section className="card panel-bloco" data-tour="insights">
        <div className="bloco-head">
          <span className="icon-box"><IconSparkles size={16} /></span>
          <div>
            <h2>Insights da sua análise</h2>
            <p>Resumo para decidir mais rápido</p>
          </div>
        </div>

        {temComparacao && ganhoPct != null && (
          <div className="insight-destaque">
            <span className="insight-destaque-icon"><IconTrendUp size={17} /></span>
            <p>
              {melhor.marketplace.nome} oferece um lucro <b>{ganhoPct}% maior</b> que
              o pior canal ({pior.marketplace.nome}).
            </p>
          </div>
        )}

        <div className="insight-row" style={{ "--mp": markRgb(melhor.marketplace.cor) }}>
          <span className="mp-mark"><MarketplaceMark id={melhor.marketplace.id} size={14} /></span>
          <div>
            <span className="insight-k">Melhor canal</span>
            <b>{melhor.marketplace.nome}</b>
            <span className="insight-v pos">{fmtBRL(melhor.resultado.lucro)} de lucro</span>
            <span className={"insight-v " + faixaMargem(melhor.resultado.margem)}>
              {fmtPct(melhor.resultado.margem)} de margem
            </span>
          </div>
        </div>

        {temComparacao && (
          <>
            <div className="insight-row" style={{ "--mp": markRgb(pior.marketplace.cor) }}>
              <span className="mp-mark"><MarketplaceMark id={pior.marketplace.id} size={14} /></span>
              <div>
                <span className="insight-k">Pior canal</span>
                <b>{pior.marketplace.nome}</b>
                <span className="insight-v neg">{fmtBRL(pior.resultado.lucro)} de lucro</span>
                <span className={"insight-v " + faixaMargem(pior.resultado.margem)}>
                  {fmtPct(pior.resultado.margem)} de margem
                </span>
              </div>
            </div>

            <div className="insight-row">
              <span className="mp-mark neutro"><IconTrendDown size={14} /></span>
              <div>
                <span className="insight-k">Diferença de lucro</span>
                <b className="insight-big">{fmtBRL(diferenca)}</b>
                <span className="insight-v">entre o melhor e o pior canal</span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="card panel-bloco">
        <div className="bloco-head">
          <span className="icon-box"><IconChart size={16} /></span>
          <div>
            <h2>Margem por marketplace</h2>
          </div>
        </div>

        <div className="grafico">
          {validos.map(({ marketplace: mp, resultado: r }) => {
            const faixa = faixaMargem(r.margem);
            const altura = Math.max(6, Math.min(100, ((r.margem ?? 0) / maxMargem) * 100));
            return (
              <div className="grafico-col" key={mp.id} style={{ "--mp": markRgb(mp.cor) }}>
                <span className={"grafico-val " + faixa}>{fmtPct(r.margem)}</span>
                <span className="grafico-trilho">
                  <span className={"grafico-barra " + faixa} style={{ height: `${altura}%` }} />
                </span>
                <span className="mp-mark sm" title={mp.nome}>
                  <MarketplaceMark id={mp.id} size={11} />
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
