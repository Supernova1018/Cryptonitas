// /routes/portfolio.js
const express = require('express');
const router = express.Router();
const { getPortafolio } = require('../controllers/portafolioController');
const auth = require('../middleware/authMiddleware'); // <-- Importar el vigilante

// RF5 - Obtener el portafolio personal (Ruta Protegida)
router.get('/', auth, getPortafolio);

module.exports = router;