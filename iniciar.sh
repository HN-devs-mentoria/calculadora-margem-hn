#!/bin/zsh
# Inicia a Calculadora de Margem localmente, sem internet e sem downloads
# adicionais. Usa o Node.js que já foi baixado em .tools/node durante a
# instalação inicial e serve a pasta dist/ com "vite preview", restrito a
# localhost (não expõe a aplicação para a rede).

set -e

DIR="$(cd "$(dirname "${0:A}")" && pwd)"
cd "$DIR"

NODE_BIN="$DIR/.tools/node/bin"
if [ ! -x "$NODE_BIN/node" ]; then
  echo "Node.js local não encontrado em .tools/node. Rode a instalação novamente (precisa de internet uma única vez)." >&2
  exit 1
fi
export PATH="$NODE_BIN:$PATH"

PORT=4173
PID_FILE="$DIR/.tools/server.pid"
LOG_FILE="$DIR/.tools/server.log"

# Já está rodando?
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "A calculadora já está rodando em http://localhost:$PORT"
  exit 0
fi

if [ ! -d "$DIR/node_modules" ]; then
  echo "Instalando dependências (só funciona com internet)..."
  npm ci
fi

if [ ! -f "$DIR/dist/index.html" ]; then
  echo "Gerando a versão de produção (npm run build)..."
  npm run build
fi

echo "Iniciando servidor local..."
nohup npm run preview -- --port "$PORT" --strictPort > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

# Espera o servidor responder antes de abrir o navegador
for i in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:$PORT"; then
    break
  fi
  sleep 0.3
done

echo ""
echo "Calculadora de Margem rodando em: http://localhost:$PORT"
echo "Acesso restrito a este computador (não é exposta na rede)."
echo "Para encerrar, rode: ./parar.sh"
echo ""

open "http://localhost:$PORT" 2>/dev/null || true
