# Despliegue en Netlify (con GitHub)

Este proyecto está listo para desplegarse en Netlify con backend serverless y frontend web exportado de Expo.

## Requisitos
- Repositorio en GitHub: `programadorxz1crm-byte/paquederocolombia` (ya empujado en `main`).
- Base de datos PostgreSQL accesible desde Netlify (Neon/Render/Railway).
- Variables de entorno de producción.

## Conectar Netlify con GitHub
1. Inicia sesión en Netlify y elige "Add new site" → "Import from Git".
2. Selecciona GitHub y el repositorio `paquederocolombia`.
3. Netlify detectará `netlify.toml` automáticamente.

## Configurar variables de entorno
En Netlify → Site settings → Environment variables, añade:
- `JWT_SECRET`: secreto para firmar JWT.
- `DATABASE_URL`: cadena de conexión PostgreSQL.
- `EXPO_PUBLIC_API_URL=/.netlify/functions/api`
- `VITE_API_BASE=/.netlify/functions/api`

## Configuración de build
El archivo `netlify.toml` contiene:
```
[build]
  command = "cd deportiva-app && npx expo export:web"
  publish = "deportiva-app/web-build"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Qué se despliega
- Frontend: build estático de Expo en `deportiva-app/web-build`.
- Backend: función serverless `/.netlify/functions/api` basada en Express.

## Verificación post-despliegue
Una vez terminado el deploy en Netlify:
- Prueba el login: `POST https://<tu-sitio>.netlify.app/.netlify/functions/api/auth/login`
- Lista usuarios (admin): `GET https://<tu-sitio>.netlify.app/.netlify/functions/api/admin/users` con token Bearer.
- Buscar vehículos: `GET https://<tu-sitio>.netlify.app/.netlify/functions/api/vehicles?plate=ABC123`
- Configuración: `GET/POST https://<tu-sitio>.netlify.app/.netlify/functions/api/config`

## Notas importantes
- Las migraciones y seeding del admin se ejecutan una vez por cold start de la función.
- Asegúrate que `DATABASE_URL` tenga IP allowlist adecuada si tu provider exige.
- Si usas dominios personalizados, actualiza `EXPO_PUBLIC_API_URL` y `VITE_API_BASE` en Netlify para seguir apuntando a `/.netlify/functions/api`.

## Solución de problemas
- Error 500 en función: revisa logs en Netlify Functions y la conectividad a PostgreSQL.
- 404 en rutas front: asegúrate que el fallback SPA (`/* → /index.html`) esté activo.
- CORS: La app Express tiene `cors()` habilitado; si requieres restricciones, ajusta en `parqueadero-server/server.js`.