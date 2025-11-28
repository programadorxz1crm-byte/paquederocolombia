# Instalación automática en Termux (Android)

Esta guía te permite levantar el backend en un teléfono Android usando Termux, y opcionalmente exponerlo públicamente.

## Requisitos
- Termux instalado
- Internet móvil o Wi‑Fi

## Pasos rápidos
1. Abrir Termux y actualizar paquetes:
   ```bash
   pkg update -y && pkg upgrade -y
   pkg install -y git nodejs-lts openssh curl
   ```
2. Clonar el repositorio y entrar (reemplaza `<REPO_URL>` si ya lo subiste a GitHub):
   ```bash
   REPO_URL="<REPO_URL>"
   APP_DIR="$HOME/pawacell"
   if [ -n "$REPO_URL" ]; then git clone "$REPO_URL" "$APP_DIR"; else APP_DIR="$(pwd)"; fi
   cd "$APP_DIR"
   ```
3. Instalar dependencias del backend:
   ```bash
   npm --prefix server ci
   ```
4. Configurar `.env` rápido:
   ```bash
   cat > server/.env <<EOF
   PORT=3000
   BRIDGE_KEY=
   LLM_PROVIDER=openai
   OPENAI_API_KEY=
   OPENAI_MODEL=gpt-4o-mini
   GOOGLE_API_KEY=
   GEMINI_MODEL=gemini-1.5-flash
   LLM_TEMPERATURE=0.7
   AUTOREPLY_ENABLED=false
   SYSTEM_PROMPT=
   EOF
   ```
5. Arrancar el backend:
   ```bash
   npm --prefix server run start
   ```
6. Probar que está vivo:
   ```bash
   curl -s http://127.0.0.1:3000/status
   ```

## Script automático
Puedes usar el script `scripts/install-termux.sh` (incluido en este repo) para hacer todo en un comando:

```bash
bash scripts/install-termux.sh
```

Variables opcionales (antes del comando):
```bash
export REPO_URL="https://github.com/tu_usuario/tu_repo.git"
export PORT=3000
export BRIDGE_KEY="TuClaveSegura"
export LLM_PROVIDER=openai # o gemini
export OPENAI_API_KEY="sk-..."
export GOOGLE_API_KEY="AIza..."
export AUTOREPLY_ENABLED=false
```

## Exponer públicamente (opcional)
- Usar túnel SSH temporal:
  ```bash
  pkg install -y openssh
  ssh -R 80:localhost:3000 localhost.run
  ```
  Obtendrás una URL HTTPS pública que apunta a tu Termux.

## Conectar desde la app Android
- En la app PawaCell, establece la `API URL` a `http://127.0.0.1:3000` si el backend corre en el mismo teléfono.
- Si usas túnel, usa la URL pública del túnel en lugar de `localhost`.

## Integración con AutoResponderWA / Tasker
- Configura las peticiones HTTP a `http://127.0.0.1:3000/bridge/...` (o a tu URL pública si usas túnel).
- Puedes omitir `to` en los endpoints y se enviará al último remitente entrante.
- Activa `BRIDGE_KEY` y envíalo como `x-bridge-key` o `?key=` si deseas seguridad.

## Arranque en segundo plano
- Termux no usa `systemd`. Opciones:
  - `nohup npm --prefix server run start &` mantiene el proceso aun al cerrar la sesión.
  - `tmux` o `screen` para sesiones persistentes.
  - `pm2` funciona (instala con `npm i -g pm2`), pero no hay `pm2 startup` en Android; sí puedes usar `pm2 save` y reiniciar manualmente.

## Troubleshooting
- Puerto ocupado: cambia `PORT` en `.env`.
- QR no aparece: revisa conexión a Internet.
- 401 en Bridge: confirma `BRIDGE_KEY` correcto.
- Adjuntos fallan: verifica que las URLs sean accesibles desde el teléfono.