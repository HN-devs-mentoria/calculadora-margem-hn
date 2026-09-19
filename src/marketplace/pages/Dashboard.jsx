import { useState, useCallback, useRef } from "react";
import { useCalculadora, FORM_VAZIO, FORM_DEMO } from "../../lib/useCalculadora";
import Tutorial from "../components/Tutorial";
import { tutorialVisto, marcarTutorialVisto } from "../lib/tutorial";
import Calculadora from "../components/Calculadora";
import Insights from "../components/Insights";
import {
  IconChart, IconTarget, IconCalculator, IconBulb, IconInstagram, IconArrowRight,
} from "../components/icons";

const INSTAGRAM = "henriqueniada";

export default function Dashboard() {
  const calc = useCalculadora(FORM_VAZIO);
  const [tour, setTour] = useState(() => !tutorialVisto());

  function fecharTour() {
    marcarTutorialVisto();
    setTour(false);
  }

  // Os passos sobre resultados só existem com dados na tela; a calculadora
  // abre vazia, então o tour preenche um exemplo antes de chegar neles.
  // O ref mantém a função com identidade estável: ela entra nas dependências
  // de um efeito do tour, e recriá-la a cada render provocaria um laço.
  const calcRef = useRef(calc);
  calcRef.current = calc;
  const garantirExemplo = useCallback(() => {
    const atual = calcRef.current;
    if (!atual.temDados) {
      Object.entries(FORM_DEMO).forEach(([campo, valor]) => atual.setCampo(campo, valor));
    }
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">
            <span className="icon-box lg"><IconChart size={19} /></span>
            <span>
              Calculadora de Margem
              <span className="brand-sub">Multi-marketplace</span>
            </span>
          </span>

          <p className="tagline">Mais dados. Melhores decisões. Mais vendas.</p>

          <div className="modo-switch" data-tour="modo">
            <span className="modo-label">Modo de cálculo</span>
            <div className="seg seg--topbar">
              <button
                type="button"
                className={calc.modo === "direto" ? "active" : ""}
                onClick={() => calc.setModo("direto")}
              >
                <IconCalculator size={14} /> Já tenho preço
              </button>
              <button
                type="button"
                className={calc.modo === "reverso" ? "active" : ""}
                onClick={() => calc.setModo("reverso")}
              >
                <IconTarget size={14} /> Quanto anunciar
              </button>
            </div>
          </div>

          <div className="tb-user">
            <span className="tb-autor">
              por <b>Henrique Niada</b>
            </span>
            <button
              className="btn-secondary btn-icone"
              onClick={() => setTour(true)}
              title="Rever o tutorial"
              aria-label="Rever o tutorial"
            >
              <IconBulb size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <Calculadora calc={calc} />

        <aside className="col-lateral">
          <Insights resultados={calc.temDados ? calc.resultados : []} />

          <section className="card panel-bloco panel-hn" data-tour="autor">
            <div className="bloco-head">
              <span className="icon-box"><IconInstagram size={16} /></span>
              <div>
                <h2>Henrique Niada</h2>
                <p>Quem fez esta calculadora</p>
              </div>
            </div>

            <p className="hn-texto">
              Conteúdo sobre marketplace, precificação e operação de e-commerce
              todo dia — de graça, no Instagram.
            </p>

            <a
              className="insta hn-insta"
              href={`https://instagram.com/${INSTAGRAM}`}
              target="_blank"
              rel="noreferrer"
            >
              @{INSTAGRAM} <IconArrowRight size={15} />
            </a>
          </section>
        </aside>
      </div>

      {tour && <Tutorial onFechar={fecharTour} garantirExemplo={garantirExemplo} />}
    </div>
  );
}
