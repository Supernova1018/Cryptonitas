// /controllers/cryptoController.js
const pool = require('../config/db');
const axios = require('axios');

// (RF2) Obtener precios actuales desde tu base de datos
exports.getPrices = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT simbolo, nombre, precio_actual FROM criptomoneda ORDER BY id_criptomoneda ASC'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'No hay criptomonedas registradas en la base de datos' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error en getPrices:', err.message);
    res.status(500).send('Error del servidor al obtener precios');
  }
};

// (RNF2) Actualizar precios desde CoinGecko
exports.updatePricesFromApi = async (req, res) => {
  try {
    const cryptoIds = 'bitcoin,ethereum';
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`
    );

    const prices = response.data;
    const btcPrice = prices.bitcoin.usd;
    const ethPrice = prices.ethereum.usd;

    // Actualizamos los precios en tu base de datos
    const resultBTC = await pool.query(
      'UPDATE criptomoneda SET precio_actual = $1 WHERE simbolo = $2 RETURNING nombre, precio_actual',
      [btcPrice, 'BTC']
    );

    const resultETH = await pool.query(
      'UPDATE criptomoneda SET precio_actual = $1 WHERE simbolo = $2 RETURNING nombre, precio_actual',
      [ethPrice, 'ETH']
    );

    // Verificamos si se actualizaron filas
    if (resultBTC.rowCount === 0 || resultETH.rowCount === 0) {
      console.warn('⚠️ No se actualizaron todas las criptomonedas. Verifica que existan BTC y ETH en la tabla.');
    }

    res.json({
      msg: '✅ Precios actualizados correctamente',
      precios_actualizados: [
        resultBTC.rows[0] || { simbolo: 'BTC', estado: 'no encontrado' },
        resultETH.rows[0] || { simbolo: 'ETH', estado: 'no encontrado' }
      ]
    });
  } catch (err) {
    console.error('❌ Error en updatePricesFromApi:', err.message);
    res.status(500).send('Error del servidor al actualizar precios');
  }
};

// ADMIN: Listar todas las criptomonedas (meta: mostrar más campos)
exports.getAllCryptos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_criptomoneda AS id, nombre, simbolo, precio_actual FROM criptomoneda ORDER BY id_criptomoneda ASC'
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error en getAllCryptos:', err.message);
    res.status(500).json({ msg: 'Error al obtener criptomonedas' });
  }
};

// ADMIN: Crear criptomoneda
exports.createCrypto = async (req, res) => {
  try {
    const { nombre, simbolo, precio_actual } = req.body;
    if (!nombre || !simbolo) return res.status(400).json({ msg: 'Faltan campos' });

    // Verificar existencia por símbolo
    const exists = await pool.query('SELECT id_criptomoneda FROM criptomoneda WHERE simbolo = $1', [simbolo]);
    if (exists.rows.length > 0) return res.status(400).json({ msg: 'El símbolo ya existe' });

    const price = precio_actual || 0.0;
    const result = await pool.query(
      'INSERT INTO criptomoneda (nombre, simbolo, precio_actual) VALUES ($1, $2, $3) RETURNING id_criptomoneda AS id, nombre, simbolo, precio_actual',
      [nombre, simbolo, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error en createCrypto:', err.message);
    res.status(500).json({ msg: 'Error al crear criptomoneda' });
  }
};

// ADMIN: Actualizar criptomoneda
exports.updateCrypto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, simbolo, precio_actual } = req.body;
    if (!nombre || !simbolo) return res.status(400).json({ msg: 'Faltan campos' });

    const result = await pool.query(
      'UPDATE criptomoneda SET nombre=$1, simbolo=$2, precio_actual=$3 WHERE id_criptomoneda=$4 RETURNING id_criptomoneda AS id, nombre, simbolo, precio_actual',
      [nombre, simbolo, precio_actual || 0.0, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ msg: 'Criptomoneda no encontrada' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en updateCrypto:', err.message);
    res.status(500).json({ msg: 'Error al actualizar criptomoneda' });
  }
};

// ADMIN: Eliminar criptomoneda
exports.deleteCrypto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM criptomoneda WHERE id_criptomoneda = $1', [id]);
    res.json({ msg: 'Criptomoneda eliminada' });
  } catch (err) {
    console.error('Error en deleteCrypto:', err.message);
    res.status(500).json({ msg: 'Error al eliminar criptomoneda' });
  }
};
