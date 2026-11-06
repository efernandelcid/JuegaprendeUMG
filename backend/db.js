
const mysql = require('mysql2/promise');
require('dotenv').config();

const esProduccion = process.env.NODE_ENV === 'production';

const configuracion = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'juegaprendeumg',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Activar SSL únicamente cuando se configure.
if (process.env.DB_SSL === 'true') {
  configuracion.ssl = {
    rejectUnauthorized: true
  };
}

if (esProduccion) {
  const variablesRequeridas = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
  ];

  for (const variable of variablesRequeridas) {
    if (!process.env[variable]) {
      throw new Error(
        `Falta configurar ${variable} en producción.`
      );
    }
  }
}

const pool = mysql.createPool(configuracion);

module.exports = pool;
