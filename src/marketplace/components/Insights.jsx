import { fmtBRL, fmtPct } from "../../lib/format";
import { faixaMargem } from "./Calculadora";
import { MarketplaceMark, IconSparkles } from "./icons";
import { compararCanais, nomeCanal } from "../../lib/catalogo";

function Linha({ rotulo, item: { marketplace: mp, resultado: r }, children }) {
  return (
    <div className="insight-row">
      <span className="mp-mark"><MarketplaceMark id={mp.id} size={14} /></span>
      <div className="insight-conteudo">
        <span className="insight-k">{rotulo}</span>
        <b>{mp.nome}</b>
        <div className="insight-numeros">
          <span className={r.lucro < 0 ? "neg" : "pos"}>{fmtBRL(r.lucro)}<small> / unidade</small></span>
          <span className={faixaMargem(r.margem)}>{fmtPct(r.margem)}<small> margem</small></span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Insights({ resultados, praticados }) {
  const validos = resultados.filter((r) => !r.resultado.erro);
  const c = validos.length ? compararCanais(validos, praticados) : null;
  const atual = c?.praticados[0];
  return (
    <section className="card panel-bloco insights" data-tour="insights">
      <div className="bloco-head">
        <span className="icon-box"><IconSparkles size={16} /></span>
        <div><h2>Sua melhor opção</h2><p>Lucro por unidade, sem rodeios</p></div>
      </div>
      {!c ? <p className="insight-nota">Preencha o produto e escolha os canais para comparar.</p> : <>
        <Linha rotulo="Maior lucro" item={c.melhorLucro} />
        {c.melhorMargem !== c.melhorLucro && <Linha rotulo="Maior margem" item={c.melhorMargem} />}
        {praticados && atual && (
          <div className="insight-destaque"><p>
            {c.jaNoMelhorLucro ? "Você já vende no canal de maior lucro." : <>
              <b>+{fmtBRL(atual.faltaLucro)} por unidade</b>
              <span> em relação a {atual.item.marketplace.nome}, seu melhor canal atual.</span>
            </>}
          </p></div>
        )}
        {c.praticados.map(({ item, faltaLucro }) => (
          <Linha key={item.marketplace.id} rotulo="Seu canal atual" item={item}>
            {faltaLucro > 0 && <span className="insight-v">{fmtBRL(faltaLucro)} abaixo da melhor opção</span>}
          </Linha>
        ))}
        {c.semSimulacao.length > 0 && <p className="insight-nota">Sem simulação: {c.semSimulacao.map(nomeCanal).join(", ")}.</p>}
        {!praticados && <p className="insight-conectar">Selecione um produto do MCPSeller para comparar com seus canais atuais.</p>}
        <p className="insight-rodape">Estimativa com os custos e taxas informados.</p>
      </>}
    </section>
  );
}
