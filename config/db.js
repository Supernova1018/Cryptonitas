// /config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // ← ¡clave para Render!
});

pool.connect()
  .then(() => console.log('🟢 Conectado a PostgreSQL en Render'))
  .catch(err => console.error('🔴 Error de conexión a PostgreSQL:', err));

module.exports = pool;
