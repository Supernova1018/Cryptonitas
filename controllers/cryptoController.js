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
