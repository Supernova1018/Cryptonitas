// /routes/ai.js
const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware'); // <-- El vigilante

// RF6 - Endpoint para hacer preguntas a la IA (Ruta Protegida)
router.post('/ask', auth, askAI);

module.exports = router;