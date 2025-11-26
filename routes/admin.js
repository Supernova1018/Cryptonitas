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

module.exports = router;
