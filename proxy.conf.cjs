const { existsSync } = require('node:fs');
const { join } = require('node:path');

// Node 22: sin dependencias adicionales. Las variables de la terminal tienen prioridad.
const envFile = join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

function destino(variable) {
  const value = process.env[variable];
  if (!value) throw new Error(`Falta ${variable}. Copia .env.example a .env y configura las direcciones.`);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${variable} debe ser una URL HTTP(S) válida.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${variable} debe contener solo protocolo, host y puerto, sin rutas ni credenciales.`);
  }
  return url.origin;
}

module.exports = {
  '^/api/(habitaciones|huespedes|reservas)(?:/|\\?|$)': {
    target: destino('GATEWAY_URL'),
    changeOrigin: true
    // Se conserva /api/recurso: el gateway aplica StripPrefix=2.
  },
  '^/auth-api(?:/|\\?|$)': {
    target: destino('AUTH_URL'),
    changeOrigin: true,
    pathRewrite: { '^/auth-api(?=/|\\?|$)': '' }
  }
};
