import { useEffect, useState } from "react";
import { validarCatalogo, buscarAnuncios, precosPraticados, nomeCanal, chaveAnuncio } from "../../lib/catalogo.js";
import { fmtBRL } from "../../lib/format.js";

// Arquivo gerado pelo Claude/Codex do usuário (ver docs/mcpseller.md).
const ARQUIVO = `${import.meta.env.BASE_URL}dados/mcpseller-produtos.json`;

async function carregar() {
  const r = await fetch(ARQUIVO, { cache: "no-store" });
  // Sem arquivo, o Vite devolve o index.html: tratamos como "ainda não gerado".
  if (!r.ok || !/json/.test(r.headers.get("content-type") || "")) return null;
  return validarCatalogo(await r.json());
}

const fmtData = (iso) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const precoTexto = (a) => (a.preco === null ? "sem preço" : a.moeda === "BRL" ? fmtBRL(a.preco) : `${a.preco} ${a.moeda ?? ""}`);

export function praticadoTexto(p) {
  if (!p) return "—";
  if (p.min === null) return "sem preço";
  return p.min === p.max ? fmtBRL(p.min) : `${fmtBRL(p.min)} – ${fmtBRL(p.max)}`;
}

/** Busca um produto do MCPSeller e devolve (anúncio, preços praticados por canal) a quem chamou. */
export default function ProdutoMcp({ onEscolher }) {
  const [catalogo, setCatalogo] = useState(null);
  const [erro, setErro] = useState(null);
  const [termo, setTermo] = useState("");
  const [escolhido, setEscolhido] = useState(null);

  useEffect(() => {
    carregar().then(setCatalogo, (e) => setErro(e.message));
  }, []);

  if (erro) return <p className="mcp-msg mcp-msg--erro">Arquivo do MCPSeller inválido: {erro}</p>;
  if (!catalogo) {
    return (
      <p className="mcp-msg">
        Quer puxar um produto seu? Peça ao seu Claude ou Codex: <strong>“atualize meus produtos”</strong> e recarregue a página.
      </p>
    );
  }

  const parcial = catalogo.fontes.some((f) => !f.completa);
  const rodape = (
    <small className="mcp-msg">
      Dados do MCPSeller de {fmtData(catalogo.gerado_em)} · {catalogo.anuncios.length} anúncios{parcial ? " · leitura parcial" : ""}
    </small>
  );

  if (escolhido) {
    const { anuncio, praticados } = escolhido;
    return (
      <div className="mcp mcp--escolhido">
        <span className="label">Produto do MCPSeller</span>
        <strong className="mcp-titulo">{anuncio.titulo}</strong>
        <small className="mcp-msg">
          {anuncio.sku ? `SKU ${anuncio.sku}` : "sem SKU"} · anunciado em{" "}
          {Object.entries(praticados).map(([canal, p]) => `${nomeCanal(canal)} (${praticadoTexto(p)})`).join(", ")}
        </small>
        {anuncio.preco === null && <small className="mcp-msg mcp-msg--erro">Este anúncio veio sem preço: informe o preço abaixo.</small>}
        <button type="button" className="mcp-trocar" onClick={() => { setEscolhido(null); onEscolher(null, null); }}>
          Trocar produto
        </button>
        {rodape}
      </div>
    );
  }

  const achados = buscarAnuncios(catalogo, termo);
  const escolher = (a) => {
    const praticados = precosPraticados(catalogo, a);
    setEscolhido({ anuncio: a, praticados });
    setTermo("");
    onEscolher(a, praticados);
  };

  return (
    <div className="field mcp">
      <label htmlFor="mcp-busca">Puxar produto do MCPSeller</label>
      <input id="mcp-busca" type="search" placeholder="SKU ou nome do produto" value={termo} onChange={(e) => setTermo(e.target.value)} />
      {termo.trim() &&
        (achados.length ? (
          <ul className="mcp-lista">
            {achados.map((a) => (
              <li key={chaveAnuncio(catalogo.workspace_id, a)}>
                <button type="button" onClick={() => escolher(a)}>
                  <span>{a.titulo}</span>
                  <small>
                    {nomeCanal(a.marketplace)} · {a.sku ?? "sem SKU"} · {precoTexto(a)}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <small className="mcp-msg">Nenhum produto encontrado.</small>
        ))}
      {rodape}
    </div>
  );
}
