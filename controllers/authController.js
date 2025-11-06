// /controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROL_USUARIO = 'usuario'; // Cambié a texto, tu columna es VARCHAR
const SALDO_INICIAL = 100000.00;

// ---------------------------
// Registro de usuario
// ---------------------------
exports.registerUser = async (req, res) => {
  const { nombre, correo_electronico, contrasena } = req.body;

  if (!nombre || !correo_electronico || !contrasena) {
    return res.status(400).json({ msg: 'Por favor, ingrese todos los campos' });
  }

  try {
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo_electronico]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const newUser = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password, rol, saldo_virtual)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, correo, saldo_virtual, rol`,
      [nombre, correo_electronico, hashedPassword, ROL_USUARIO, SALDO_INICIAL]
    );

    res.status(201).json({
      msg: 'Usuario registrado exitosamente',
      usuario: newUser.rows[0],
    });
  } catch (err) {
    console.error('❌ Error en registerUser:', err);
    res.status(500).json({
      error: 'Error del servidor',
      detalle: err.message,
    });
  }
};

// ---------------------------
// Inicio de sesión
// ---------------------------
exports.loginUser = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ msg: 'Por favor, ingrese todos los campos' });
  }

  try {
    const user = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo_electronico]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const dbUser = user.rows[0];
    // ✅ La columna en tu base es "password"
    const isMatch = await bcrypt.compare(contrasena, dbUser.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = {
      user: {
        id: dbUser.id,
        rol: dbUser.rol,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      msg: 'Login exitoso',
      token,
    });
  } catch (err) {
    console.error('❌ Error en loginUser:', err);
    res.status(500).send('Error del servidor');
  }
};
