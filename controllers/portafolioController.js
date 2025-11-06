const pool = require('../config/db');

exports.getPortafolio = async (req, res) => {
  try {
    const userId = req.user.id; // ID del usuario logueado

    // 1️⃣ Obtener saldo virtual del usuario
    const saldoResult = await pool.query(
      'SELECT saldo_virtual FROM usuarios WHERE id = $1',
      [userId]
    );

    if (saldoResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const saldo_usd = parseFloat(saldoResult.rows[0].saldo_virtual);

    // 2️⃣ Obtener todas las criptomonedas y sus cantidades netas
    const tenenciasResult = await pool.query(
      `SELECT 
          crypto,
          SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE -cantidad END) AS tenencia_total,
          AVG(precio) AS precio_promedio
       FROM transacciones
       WHERE user_id = $1
       GROUP BY crypto
       HAVING SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE -cantidad END) > 0`,
      [userId]
    );

    // 3️⃣ Calcular el valor total del portafolio
    // (si tuvieras una tabla de precios, aquí podrías multiplicar por precio_actual)
    let valor_total_criptos = 0;
    const criptomonedas = tenenciasResult.rows.map(cripto => {
      const valor_actual = parseFloat(cripto.tenencia_total) * parseFloat(cripto.precio_promedio);
      valor_total_criptos += valor_actual;
      return {
        ...cripto,
        valor_actual: valor_actual.toFixed(2)
      };
    });

    const valor_total_portafolio = valor_total_criptos + saldo_usd;

    // 4️⃣ Enviar respuesta
    res.json({
      saldo_virtual_usd: saldo_usd.toFixed(2),
      criptomonedas,
      valor_total_criptos: valor_total_criptos.toFixed(2),
      valor_total_portafolio: valor_total_portafolio.toFixed(2)
    });

  } catch (err) {
    console.error('❌ Error en getPortafolio:', err.message);
    res.status(500).send('Error del servidor');
  }
};
