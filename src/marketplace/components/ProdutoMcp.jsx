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

/** Iniciais do título, mostradas quando o anúncio não tem imagem. */
const iniciais = (t) => t.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Miniatura({ src, titulo }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <span className="mcp-thumb" aria-hidden="true">
      {src && !falhou
        ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFalhou(true)} />
        : iniciais(titulo)}
    </span>
  );
}

/**
 * Busca um produto do MCPSeller. Controlado por quem chama: `produto` é
 * { anuncio, praticados } ou null, e sobrevive à troca de passo da coluna.
 */
export default function ProdutoMcp({ produto, onEscolher }) {
  const [catalogo, setCatalogo] = useState(null);
  const [erro, setErro] = useState(null);
  const [termo, setTermo] = useState("");

  useEffect(() => {
    carregar().then(setCatalogo, (e) => setErro(e.message));
  }, []);

  if (produto) {
    const { anuncio, praticados } = produto;
    const canais = Object.entries(praticados).map(([canal, p]) => `${nomeCanal(canal)} ${praticadoTexto(p)}`).join(" · ");
    return (
      <div className="mcp-produto">
        <Miniatura key={anuncio.imagem} src={anuncio.imagem} titulo={anuncio.titulo} />
        <div className="mcp-produto-txt">
          <strong title={anuncio.titulo}>{anuncio.titulo}</strong>
          <small>{anuncio.sku ? `SKU ${anuncio.sku}` : "sem SKU"} · {canais}</small>
          {anuncio.preco === null && <small className="mcp-msg--erro">Anúncio sem preço: informe o preço no passo 2.</small>}
        </div>
      </div>
    );
  }

  if (erro) return <p className="mcp-msg mcp-msg--erro">Arquivo do MCPSeller inválido: {erro}</p>;
  if (!catalogo) {
    return (
      <p className="mcp-msg">
        Quer puxar um produto seu? Peça ao seu Claude ou Codex: <strong>“atualize meus produtos”</strong> e recarregue a página.
      </p>
    );
  }

  const parcial = catalogo.fontes.some((f) => !f.completa);
  const achados = buscarAnuncios(catalogo, termo);
  const escolher = (a) => {
    setTermo("");
    onEscolher({ anuncio: a, praticados: precosPraticados(catalogo, a) });
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
      <small className="mcp-msg">
        Dados de {fmtData(catalogo.gerado_em)} · {catalogo.anuncios.length} anúncios{parcial ? " · leitura parcial" : ""}
      </small>
    </div>
  );
}
