export const fmtBRL = (v) =>
  v == null || Number.isNaN(v)
    ? "—"
    : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtPct = (v) =>
  v == null || Number.isNaN(v)
    ? "—"
    : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";

// Converte texto de input ("1.234,56" ou "45.9") em número.
export const parseNum = (v) => {
  if (v == null || v === "") return 0;
  const n = parseFloat(v.toString().replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

// Hex da plataforma -> "r g b" (sem vírgula), formato das custom properties
// do design system, que compõem com alpha: rgb(var(--mp) / 0.14).
export const hexToRgb = (hex) => {
  const h = (hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

// Cor da marca ajustada ao fundo escuro. Marcas quase pretas (Shein) ficariam
// invisíveis sobre o tema dark, então sobem para um tom claro neutro.
export const markRgb = (hex) => {
  const [r, g, b] = hexToRgb(hex).split(" ").map(Number);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.25 ? "214 214 224" : `${r} ${g} ${b}`;
};
