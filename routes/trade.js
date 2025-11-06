// /routes/trade.js
const express = require('express');
const router = express.Router();
// Importar las 3 funciones
const { getTradeHistory, buyCrypto, sellCrypto } = require('../controllers/tradeController');
const auth = require('../middleware/authMiddleware'); // <-- Importar el vigilante

// RF4 - Obtener historial de transacciones (Ruta Protegida)
router.get('/history', auth, getTradeHistory);

// RF3 - Comprar Criptomoneda (Ruta Protegida)
router.post('/buy', auth, buyCrypto);

// RF3 - Vender Criptomoneda (Ruta Protegida)
router.post('/sell', auth, sellCrypto);

module.exports = router;