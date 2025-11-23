// /routes/auth.js
const express = require('express');
const router = express.Router();

// Importamos el controlador
const { registerUser, loginUser } = require('../controllers/authController');

// Definimos la ruta POST para /api/auth/register
// RF1 - Registro de usuario
router.post('/register', registerUser);

// RF1 - Login de usuario
router.post('/login', loginUser);

module.exports = router;