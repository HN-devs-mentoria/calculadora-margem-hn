import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PASSOS, posicionarCartao } from "../lib/tutorial";
import { IconArrowRight, IconSparkles } from "./icons";

const RESPIRO = 8;   // folga entre o recorte e o elemento
const VAO = 14;      // distância entre o recorte e o cartão
const BORDA = 14;    // margem mínima até a borda da tela

/**
 * Tour guiado com efeito de holofote: quatro painéis desfocados cercam o
 * elemento da vez, deixando só ele nítido. Sem biblioteca.
 *
 * O cartão é posicionado a partir do tamanho REAL medido depois da
 * renderização — textos de tamanhos diferentes mudam a altura, e chutar um
 * valor fixo fazia o cartão sair da tela ou cobrir o próprio alvo.
 */
export default function Tutorial({ onFechar, garantirExemplo }) {
  const [i, setI] = useState(0);
  const [area, setArea] = useState(null);
  const [pos, setPos] = useState(null);
  const cartaoRef = useRef(null);

  const passo = PASSOS[i];

  const medir = useCallback(() => {
    const el = document.querySelector(`[data-tour="${passo.alvo}"]`);
    if (!el) return setArea(null);
    const r = el.getBoundingClientRect();
    setArea({
      top: Math.max(0, r.top - RESPIRO),
      left: Math.max(0, r.left - RESPIRO),
      width: Math.min(window.innerWidth, r.width + RESPIRO * 2),
      height: Math.min(window.innerHeight, r.height + RESPIRO * 2),
    });
  }, [passo.alvo]);

  // Prepara o passo: garante os dados, rola o alvo até a vista e mede.
  useEffect(() => {
    if (passo.precisaResultados) garantirExemplo();
    setPos(null);
    const el = document.querySelector(`[data-tour="${passo.alvo}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const t = setTimeout(medir, 240);
    return () => clearTimeout(t);
  }, [i, passo, medir, garantirExemplo]);

  useEffect(() => {
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, true);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir, true);
    };
  }, [medir]);

  // Posiciona o cartão com o tamanho medido, antes da pintura.
  useLayoutEffect(() => {
    const el = cartaoRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setPos(posicionarCartao(
      area,
      { largura: width, altura: height },
      { largura: window.innerWidth, altura: window.innerHeight },
      { vao: VAO, borda: BORDA },
    ));
  }, [area, i]);

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === "Escape") onFechar();
      else if (e.key === "ArrowRight" || e.key === "Enter") avancar();
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  function avancar() {
    if (i >= PASSOS.length - 1) onFechar();
    else setI(i + 1);
  }

  return (
    <div className="tour" role="dialog" aria-label={`Tutorial, passo ${i + 1} de ${PASSOS.length}`}>
      {area ? (
        <>
          <div className="tour-veu" style={{ top: 0, left: 0, right: 0, height: area.top }} />
          <div className="tour-veu" style={{ top: area.top + area.height, left: 0, right: 0, bottom: 0 }} />
          <div className="tour-veu" style={{ top: area.top, left: 0, width: area.left, height: area.height }} />
          <div className="tour-veu" style={{ top: area.top, left: area.left + area.width, right: 0, height: area.height }} />
          <div className="tour-foco" style={{ top: area.top, left: area.left, width: area.width, height: area.height }} />
        </>
      ) : (
        <div className="tour-veu" style={{ inset: 0 }} />
      )}

      <div
        ref={cartaoRef}
        className="tour-cartao"
        style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}
      >
        <div className="tour-cartao-topo">
          <span className="tour-icone"><IconSparkles size={15} /></span>
          <span className="tour-contador">{i + 1} de {PASSOS.length}</span>
          <button type="button" className="tour-pular" onClick={onFechar}>Pular</button>
        </div>

        <h3 className="tour-titulo">{passo.titulo}</h3>
        <p className="tour-texto">{passo.texto}</p>

        <div className="tour-pontos" aria-hidden="true">
          {PASSOS.map((_, n) => <span key={n} className={"tour-ponto " + (n === i ? "on" : n < i ? "feito" : "")} />)}
        </div>

        <div className="tour-acoes">
          <button type="button" className="btn-ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
            Voltar
          </button>
          <button type="button" className="cta-primary cta-modal" onClick={avancar}>
            {i === PASSOS.length - 1 ? "Começar a usar" : "Próximo"} <IconArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
