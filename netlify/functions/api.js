const serverless = require('serverless-http');
const path = require('path');

// Importa la app Express reusable
const { createApp, ensureInit } = require(path.join('..', '..', 'parqueadero-server', 'server'));

const app = createApp();
const handler = serverless(app);

exports.handler = async (event, context) => {
  // Ejecuta migraciones y seed una vez por cold start
  await ensureInit();
  return handler(event, context);
};