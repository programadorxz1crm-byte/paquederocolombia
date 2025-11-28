#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Variables configurables vía entorno
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-$HOME/pawacell}"

PORT="${PORT:-3000}"
BRIDGE_KEY="${BRIDGE_KEY:-}"
LLM_PROVIDER="${LLM_PROVIDER:-openai}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
OPENAI_MODEL="${OPENAI_MODEL:-gpt-4o-mini}"
GOOGLE_API_KEY="${GOOGLE_API_KEY:-}"
GEMINI_MODEL="${GEMINI_MODEL:-gemini-1.5-flash}"
LLM_TEMPERATURE="${LLM_TEMPERATURE:-0.7}"
AUTOREPLY_ENABLED="${AUTOREPLY_ENABLED:-false}"
SYSTEM_PROMPT="${SYSTEM_PROMPT:-}"

echo "[1/5] Instalando dependencias de Termux..."
pkg update -y >/dev/null
pkg install -y git nodejs-lts openssh curl jq >/dev/null

if [ -n "$REPO_URL" ]; then
  echo "[2/5] Clonando repo: $REPO_URL (branch $BRANCH)"
  rm -rf "$APP_DIR"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  echo "[2/5] Usando carpeta actual (no se proporcionó REPO_URL)"
  APP_DIR="$(pwd)"
fi

cd "$APP_DIR"

echo "[3/5] Instalando dependencias del backend..."
npm --prefix server ci

echo "[4/5] Escribiendo server/.env"
cat > server/.env <<EOF
PORT=$PORT
BRIDGE_KEY=$BRIDGE_KEY
LLM_PROVIDER=$LLM_PROVIDER
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_MODEL=$OPENAI_MODEL
GOOGLE_API_KEY=$GOOGLE_API_KEY
GEMINI_MODEL=$GEMINI_MODEL
LLM_TEMPERATURE=$LLM_TEMPERATURE
AUTOREPLY_ENABLED=$AUTOREPLY_ENABLED
SYSTEM_PROMPT=$SYSTEM_PROMPT
EOF

echo "[5/5] Arrancando backend en segundo plano..."
nohup npm --prefix server run start >/dev/null 2>&1 &
sleep 2
STATUS=$(curl -s "http://127.0.0.1:$PORT/status" || true)
echo "Estado: $STATUS"

echo "Listo. Backend escuchando en http://127.0.0.1:$PORT"
echo "Configura la API URL en la app a http://127.0.0.1:$PORT"
echo "Para exponer públicamente: ssh -R 80:localhost:$PORT localhost.run"