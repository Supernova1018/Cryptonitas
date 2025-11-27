const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/adminController');
const {
  getAllCryptos,
  createCrypto,
  updateCrypto,
  deleteCrypto
} = require('../controllers/cryptoController');

// Todas requieren token + rol admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Listar usuarios
router.get('/users', getUsers);

// Crear usuario
router.post('/users', createUser);

// Editar usuario
router.put('/users/:id', updateUser);

// Eliminar usuario
router.delete('/users/:id', deleteUser);

// --- CRUD Criptomonedas (solo admin) ---
// Listar criptos
router.get('/cryptos', getAllCryptos);

// Crear cripto
router.post('/cryptos', createCrypto);

// Editar cripto
router.put('/cryptos/:id', updateCrypto);

// Eliminar cripto
router.delete('/cryptos/:id', deleteCrypto);

module.exports = router;
