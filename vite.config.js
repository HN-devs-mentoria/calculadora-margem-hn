import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },

  // Caminhos relativos no build: a pasta dist/ abre com duplo clique no
  // index.html, sem precisar de servidor. Com o padrão ("/"), o navegador
  // procuraria os arquivos na raiz do disco e a tela viria em branco.
  base: "./",

  build: {
    // Sem isto o compilador de CSS reescreve `max-width: 760px` como
    // `(width <= 760px)` — sintaxe que o Safari só entende a partir do 16.4.
    // Num iPhone mais antigo, o layout mobile inteiro seria ignorado.
    cssTarget: ["safari14", "chrome90", "firefox90", "edge90"],
  },
});
