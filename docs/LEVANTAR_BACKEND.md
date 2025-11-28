# Levantar el Backend (PawaCell)

Guía práctica para instalar, configurar y publicar el backend Node.js (Express + Baileys) del proyecto.

## Requisitos
- Node.js 18 o superior y `npm` instalado
- Acceso a Internet y permisos para abrir puertos
- Opcional: `pm2` para producción, `cloudflared` para exponer localmente

## Estructura relevante
- `server/` — código del backend
- `server/.env.example` — variables de entorno de ejemplo
- `server/auth/` — credenciales de sesión de WhatsApp (persistentes)
- `server/data/` — archivos persistentes para reglas y memoria

## Variables de entorno (crear `server/.env`)
Copiar ejemplo y editar:

```bash
cd server
cp .env.example .env
```

Variables más usadas:
- `PORT` — puerto HTTP del backend (`3000` por defecto)
- `BRIDGE_KEY` — clave opcional para asegurar los endpoints de Bridge
- `AUTOREPLY_ENABLED` — `true|false` para respuesta automática con IA
- `LLM_PROVIDER` — `openai|gemini`
- `OPENAI_API_KEY`, `OPENAI_MODEL` — API Key y modelo OpenAI (por defecto `gpt-4o-mini`)
- `GOOGLE_API_KEY`, `GEMINI_MODEL` — API Key y modelo Gemini (por defecto `gemini-1.5-flash`)
- `LLM_TEMPERATURE` — float (0–1) para creatividad
- `SYSTEM_PROMPT` — prompt del sistema (o usa `SYSTEM_PROMPT_FILE` apuntando a archivo)
- `N8N_WEBHOOK_URL` — URL a la que se envían eventos entrantes (opcional)

## Instalación local (Windows / Linux / Mac)
```bash
# Instalar dependencias
npm --prefix server install

# Ejecutar en modo normal
npm --prefix server run start

# (Opcional) Ejecutar y ver logs detallados
node server/index.js
```

Si configuraste `PORT`, el backend escuchará en `http://localhost:<PORT>`. Sin `PORT`, usa `http://localhost:3000`.

### Verificación rápida
- Estado:
  - Windows (PowerShell): `Invoke-RestMethod http://localhost:3000/status`
  - Linux/Mac: `curl http://localhost:3000/status`
- Debe responder: `{ ok: true, ready: <true|false>, qrAvailable: <true|false> }`

### Emparejamiento de WhatsApp
- WebSocket para eventos: conecta a `ws://<HOST>:<PORT>/`
- QR actual: `GET /session/qr` (devuelve `dataUrl` PNG)
- Código de emparejamiento (multi-device): `POST /session/pairing { phone }`

### Mensajería
- Texto: `POST /messages/text { to, text }`
- Media: `POST /messages/media (multipart/form-data: file) { to, type, caption }` (`type: image|video|audio|document`)
- Contacto: `POST /messages/contact { to, name, phone }`
- Ubicación: `POST /messages/location { to, lat, lng, name }`

### Reglas y IA
- Reglas: `GET /rules`, `POST /rules/add`, `POST /rules/update`, `DELETE /rules/:id`, `POST /rules/test { text }`
- IA Config: `GET /ai/config`, `POST /ai/config`
- Memoria: `GET /ai/memory`, `POST /ai/memory/add { text }`
- Respuesta IA directa: `POST /ai/reply { to, text }`

### Bridge (AutoResponderWA / Tasker)
- Ping: `GET /bridge/:client/ping?key=...`
- Texto: `ALL /bridge/:client/send-text { to?, text, key? }`
- Media: `ALL /bridge/:client/send-media { to?, type, url|urls, caption?, key? }`
- Si omites `to`, se usa el último remitente entrante (`lastIncomingJid`). Configura `BRIDGE_KEY` para seguridad.

## Producción con PM2 (recomendado)
```bash
# Instalar pm2
npm i -g pm2

# Iniciar servicio
pm2 start server/index.js --name pawacell

# (Opcional) registrar arranque automático
pm2 save
pm2 startup

# Logs y estado
pm2 logs pawacell
pm2 status
```

### Persistencia de sesión
- La carpeta `server/auth/` contiene credenciales de la sesión. No la borres entre reinicios.
- En VPS/contenerizador, monta `server/auth/` y `server/data/` en volúmenes persistentes.

## Exponer el backend públicamente

### Opción rápida: Cloudflare Tunnel (gratis)
```bash
# Instalar cloudflared y loguearte
cloudflared tunnel --url http://localhost:3000
```
- Te dará una URL pública HTTPS. Usa esa URL en la app y en AutoResponderWA/Tasker.

### Opción VPS: Oracle Cloud Always Free
1) Crear VM (Ubuntu/Debian), abrir puerto (`PORT`) en reglas de seguridad
2) Instalar Node.js LTS:
   ```bash
   sudo apt update && sudo apt install -y curl
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3) Clonar proyecto y configurar `.env`
4) Instalar dependencias y PM2:
   ```bash
   npm --prefix server install
   npm i -g pm2
   pm2 start server/index.js --name pawacell
   pm2 save && pm2 startup
   ```
5) Apunta tu dominio (A/AAAA) a la IP y configura HTTPS (Cloudflare o Caddy/NGINX)

### Opción gestionada: Fly.io (contenedor)
- Prepara un `Dockerfile` (ejemplo):
  ```Dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY server/package*.json ./server/
  RUN cd server && npm ci
  COPY server ./server
  ENV PORT=3000
  EXPOSE 3000
  CMD ["node", "server/index.js"]
  ```
- Despliegue:
  ```bash
  flyctl launch
  flyctl deploy
  ```
- Usa `fly volumes` para persistir `server/auth/` y `server/data/`.

## Seguridad y buenas prácticas
- Establece `BRIDGE_KEY` y envíala en `x-bridge-key` o `?key=`
- Restringe CORS a tu dominio en producción
- Usa HTTPS público para AutoResponderWA/Tasker
- No expongas `server/auth/` ni tus API Keys

## Solución de problemas
- Puerto en uso: cambia `PORT` o libera el puerto
- Conexión WhatsApp cierra: revisa red, vuelve a emparejar
- Adjuntos no envían: verifica `type` y URL accesible
- 401 en Bridge: confirma `BRIDGE_KEY` correcto

---
Si prefieres, puedo preparar comandos específicos para tu hosting elegido (Oracle, Fly.io, Railway) y dejar scripts en `package.json` para automatizar despliegues.