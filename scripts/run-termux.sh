#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
PORT="${PORT:-}"
if [ -z "$PORT" ]; then
  if [ -f server/.env ]; then
    PORT=$(grep -m1 '^PORT=' server/.env | cut -d= -f2)
  else
    PORT=3000
  fi
fi

nohup npm --prefix server run start >/dev/null 2>&1 &
sleep 2
curl -s "http://127.0.0.1:$PORT/status" || true
echo "Backend corriendo en http://127.0.0.1:$PORT"