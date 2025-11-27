// routes/adminCoins.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const ensureAdmin = require('../middleware/adminMiddleware');

// Ajusta la ruta del archivo de almacenamiento si decides usar JSON local
const DATA_DIR = path.join(__dirname, '..', 'data');
const COINS_FILE = path.join(DATA_DIR, 'coins.json');

// Asegura que exista el directorio data y el archivo
async function ensureStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(COINS_FILE);
  } catch (err) {
    // crear archivo vacío si no existe
    await fs.writeFile(COINS_FILE, JSON.stringify([] , null, 2), 'utf8');
  }
}

// GET: listar monedas (para frontend de compra)
router.get('/list', async (req, res) => {
  try {
    await ensureStorage();
    const raw = await fs.readFile(COINS_FILE, 'utf8');
    const coins = JSON.parse(raw || '[]');
    res.json({ ok: true, coins });
  } catch (err) {
    console.error('GET /api/admin/coins/list error:', err);
    res.status(500).json({ ok: false, error: 'Error leyendo lista de monedas' });
  }
});

// POST: crear moneda (solo admin)
router.post('/', ensureAdmin, async (req, res) => {
  const { name, symbol, price, imageUrl, description } = req.body || {};
  if (!name || !symbol || typeof price === 'undefined') {
    return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios (name, symbol, price)' });
  }
  try {
    await ensureStorage();
    const raw = await fs.readFile(COINS_FILE, 'utf8');
    const coins = JSON.parse(raw || '[]');

    // comprobar duplicados por símbolo
    if (coins.some(c => c.symbol.toLowerCase() === symbol.toLowerCase())) {
      return res.status(409).json({ ok: false, error: 'Ya existe una moneda con ese símbolo' });
    }

    const newCoin = {
      id: Date.now().toString(), // id simple
      name,
      symbol,
      price: Number(price),
      imageUrl: imageUrl || null,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    coins.push(newCoin);
    await fs.writeFile(COINS_FILE, JSON.stringify(coins, null, 2), 'utf8');

    res.status(201).json({ ok: true, coin: newCoin });
  } catch (err) {
    console.error('POST /api/admin/coins error:', err);
    res.status(500).json({ ok: false, error: 'Error creando moneda' });
  }
});

module.exports = router;
