#!/bin/zsh
# Encerra o servidor local iniciado por ./iniciar.sh

DIR="$(cd "$(dirname "${0:A}")" && pwd)"
PID_FILE="$DIR/.tools/server.pid"
PORT=4173

stopped=0

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    # encerra também os processos filhos (o "npm run preview" gera um
    # processo vite separado, que precisa ser encerrado à parte)
    pkill -P "$PID" 2>/dev/null || true
    kill "$PID" 2>/dev/null || true
    for i in $(seq 1 10); do
      kill -0 "$PID" 2>/dev/null || break
      sleep 0.3
    done
    kill -9 "$PID" 2>/dev/null || true
    stopped=1
  fi
  rm -f "$PID_FILE"
fi

# Garantia extra: encerra qualquer processo ainda escutando na porta usada.
LEFTOVER_PIDS="$(lsof -ti tcp:$PORT -sTCP:LISTEN 2>/dev/null || true)"
if [ -n "$LEFTOVER_PIDS" ]; then
  echo "$LEFTOVER_PIDS" | xargs kill -9 2>/dev/null || true
  stopped=1
fi

if [ "$stopped" = "1" ]; then
  echo "Calculadora encerrada."
else
  echo "A calculadora já não estava em execução."
fi
