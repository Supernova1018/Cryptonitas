// /routes/crypto.js
const express = require('express');
const router = express.Router();
const { getPrices, updatePricesFromApi } = require('../controllers/cryptoController');

// RF2 - Endpoint público para que el frontend vea los precios
router.get('/prices', getPrices);

// Endpoint "oculto" para forzar la actualización de precios desde la API externa
// se actualiza cada hora automáticamente, pero este endpoint permite forzar una actualización manual con la ayuda de coingecko
router.put('/update-prices', updatePricesFromApi);

module.exports = router;