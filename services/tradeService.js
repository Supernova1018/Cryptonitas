// /services/tradeService.js
const pool = require('../config/db');

class TradeService {

  /**
   * RF3 - Comprar criptomonedas
   */
  static async buyCrypto(userId, simbolo, cantidad_usd) {
    const montoCompra = parseFloat(cantidad_usd);

    if (!simbolo || !montoCompra || montoCompra <= 0) {
      throw new Error('Datos de compra inválidos');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1️⃣ Obtener precio actual de la criptomoneda
      const cryptoResult = await client.query(
        'SELECT id_criptomoneda, precio_actual FROM criptomoneda WHERE simbolo = $1',
        [simbolo]
      );

      if (cryptoResult.rows.length === 0) {
        throw new Error('Criptomoneda no encontrada');
      }

      const precioUnitario = parseFloat(cryptoResult.rows[0].precio_actual);

      // 2️⃣ Obtener saldo actual del usuario
      const userResult = await client.query(
        'SELECT saldo_virtual FROM usuarios WHERE id = $1 FOR UPDATE',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const saldoActual = parseFloat(userResult.rows[0].saldo_virtual);
      if (saldoActual < montoCompra) {
        throw new Error('Fondos insuficientes');
      }

      // 3️⃣ Calcular cantidad de criptomonedas que se compran
      const cantidadCripto = montoCompra / precioUnitario;

      // 4️⃣ Registrar la transacción
      await client.query(
        `INSERT INTO transacciones (fecha, cantidad, precio, user_id, crypto, tipo)
         VALUES (NOW(), $1, $2, $3, $4, 'compra')`,
        [cantidadCripto, precioUnitario, userId, simbolo]
      );

      // 5️⃣ Actualizar saldo
      const nuevoSaldo = saldoActual - montoCompra;
      await client.query(
        'UPDATE usuarios SET saldo_virtual = $1 WHERE id = $2',
        [nuevoSaldo, userId]
      );

      await client.query('COMMIT');

      return {
        msg: 'Compra exitosa',
        simbolo,
        cantidad_comprada: cantidadCripto.toFixed(8),
        gastado_usd: montoCompra.toFixed(2),
        nuevo_saldo_usd: nuevoSaldo.toFixed(2),
        precio_unitario: precioUnitario.toFixed(2)
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * RF3 - Vender criptomonedas
   */
  static async sellCrypto(userId, simbolo, cantidad_cripto) {
    const cantidadVenta = parseFloat(cantidad_cripto);
    if (!simbolo || !cantidadVenta || cantidadVenta <= 0) {
      throw new Error('Datos de venta inválidos');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1️⃣ Verificar tenencia actual
      const tenenciaResult = await client.query(
        `SELECT SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE -cantidad END) AS tenencia
         FROM transacciones
         WHERE user_id = $1 AND crypto = $2`,
        [userId, simbolo]
      );

      const tenenciaActual = parseFloat(tenenciaResult.rows[0].tenencia) || 0;
      if (tenenciaActual < cantidadVenta) {
        throw new Error('Tenencia insuficiente para vender');
      }

      // 2️⃣ Obtener precio actual de la cripto
      const cryptoResult = await client.query(
        'SELECT precio_actual FROM criptomoneda WHERE simbolo = $1',
        [simbolo]
      );

      if (cryptoResult.rows.length === 0) {
        throw new Error('Criptomoneda no encontrada');
      }

      const precioUnitario = parseFloat(cryptoResult.rows[0].precio_actual);
      const totalVentaUSD = cantidadVenta * precioUnitario;

      // 3️⃣ Obtener saldo actual del usuario
      const userResult = await client.query(
        'SELECT saldo_virtual FROM usuarios WHERE id = $1 FOR UPDATE',
        [userId]
      );
      const saldoActual = parseFloat(userResult.rows[0].saldo_virtual);

      // 4️⃣ Actualizar saldo
      const nuevoSaldo = saldoActual + totalVentaUSD;
      await client.query(
        'UPDATE usuarios SET saldo_virtual = $1 WHERE id = $2',
        [nuevoSaldo, userId]
      );

      // 5️⃣ Registrar transacción de venta
      await client.query(
        `INSERT INTO transacciones (fecha, cantidad, precio, user_id, crypto, tipo)
         VALUES (NOW(), $1, $2, $3, $4, 'venta')`,
        [cantidadVenta, precioUnitario, userId, simbolo]
      );

      await client.query('COMMIT');

      return {
        msg: 'Venta exitosa',
        simbolo,
        cantidad_vendida: cantidadVenta.toFixed(8),
        recibido_usd: totalVentaUSD.toFixed(2),
        nuevo_saldo_usd: nuevoSaldo.toFixed(2),
        precio_unitario: precioUnitario.toFixed(2)
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * RF4 - Historial de transacciones
   */
  static async getHistory(userId) {
    try {
      const history = await pool.query(
        `SELECT tipo, crypto, cantidad, precio, fecha
         FROM transacciones
         WHERE user_id = $1
         ORDER BY fecha DESC`,
        [userId]
      );

      return history.rows;
    } catch (err) {
      throw new Error('Error al obtener el historial de transacciones: ' + err.message);
    }
  }
}

module.exports = TradeService;
