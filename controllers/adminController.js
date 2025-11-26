const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const SALDO_INICIAL = 100000.00;

// Listar todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, rol, saldo_virtual FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener usuarios' });
  }
};

// Crear un usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, saldo } = req.body;
    if (!nombre || !correo || !contrasena || !rol) return res.status(400).json({ msg: 'Faltan campos' });

    const userExists = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) return res.status(400).json({ msg: 'Correo ya registrado' });

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const userSaldo = saldo || SALDO_INICIAL;

    const newUser = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol, saldo_virtual) VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, correo, rol, saldo_virtual',
      [nombre, correo, hashedPassword, rol, userSaldo]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al crear usuario' });
  }
};


// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, saldo } = req.body;

    if (!nombre || !correo || !rol)
      return res.status(400).json({ msg: "Faltan campos obligatorios" });

    // Actualizar datos
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, correo = $2, rol = $3, saldo_virtual = $4
       WHERE id = $5
       RETURNING id, nombre, correo, rol, saldo_virtual`,
      [nombre, correo, rol, saldo, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error al actualizar usuario" });
  }
};


// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id=$1', [id]);
    res.json({ msg: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al eliminar usuario' });
  }
};
