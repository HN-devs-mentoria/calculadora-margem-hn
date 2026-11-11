import { useState, useCallback, useRef } from "react";
import { useCalculadora, FORM_VAZIO, FORM_DEMO } from "../../lib/useCalculadora";
import Tutorial from "../components/Tutorial";
import { tutorialVisto, marcarTutorialVisto } from "../lib/tutorial";
import Calculadora from "../components/Calculadora";
import Insights from "../components/Insights";
import { IconInstagram, IconArrowRight } from "../components/icons";

import mcpSimbolo from "../assets/mcp-simbolo.png";
import mcpTexto from "../assets/mcp-texto.png";

const INSTAGRAM = "henriqueniada";

export default function Dashboard() {
  const calc = useCalculadora(FORM_VAZIO);
  const [produto, setProduto] = useState(null); // { anuncio, praticados } escolhido no MCPSeller
  const praticados = produto?.praticados ?? null;
  const [tour, setTour] = useState(() => !tutorialVisto());
  const [etapa, setEtapa] = useState(1); // passo aberto na coluna da esquerda

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
      {/* Espaço do antigo banner do topo, vazio por enquanto. */}
      <div className="topo-vazio" aria-hidden="true" />

      <div className="workspace">
        <Calculadora
          calc={calc} produto={produto} onProduto={setProduto}
          etapa={etapa} setEtapa={setEtapa}
          onTutorial={() => setTour(true)}
        />

        <aside className="col-lateral">
          <Insights resultados={calc.temDados ? calc.resultados : []} praticados={praticados} />

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

          <div className="mcp-fundo" role="img" aria-label="MCP Seller">
            <span className="mcp-onda" /><span className="mcp-onda" /><span className="mcp-onda" />
            <div className="mcp-marca" style={{ "--u-simbolo": `url(${mcpSimbolo})`, "--u-texto": `url(${mcpTexto})` }}>
              <span className="mcp-simbolo"><img src={mcpSimbolo} alt="" width="66" height="62" /><i className="mcp-glare" /></span>
              <i className="mcp-texto" />
            </div>
          </div>
        </aside>
      </div>

      {tour && <Tutorial onFechar={fecharTour} garantirExemplo={garantirExemplo} irParaEtapa={setEtapa} />}
    </div>
  );
}
