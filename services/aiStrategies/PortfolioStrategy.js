// /services/aiStrategies/PortfolioStrategy.js
const pool = require('../../config/db'); // <-- Ojo: subimos dos niveles (../..)

/**
 * Función helper movida aquí. Solo esta estrategia la necesita.
 */
async function getPortafolioData(userId) {
  try {
    const saldoResult = await pool.query(
      'SELECT saldo_virtual_usd FROM usuario WHERE id_usuario = $1',
      [userId]
    );
    const saldo_usd = parseFloat(saldoResult.rows[0].saldo_virtual_usd);

    const tenenciasResult = await pool.query(
      `SELECT 
         c.simbolo, c.precio_actual,
         SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad ELSE -t.cantidad END) as tenencia_total
       FROM transaccion t
       JOIN criptomoneda c ON t.criptomoneda_id = c.id_criptomoneda
       WHERE t.usuario_id = $1
       GROUP BY c.id_criptomoneda, c.simbolo, c.precio_actual
       HAVING SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad ELSE -t.cantidad END) > 0.000001`,
      [userId]
    );

    let valor_total_criptos = 0;
    const criptomonedas = tenenciasResult.rows.map(cripto => {
      const valor_actual = parseFloat(cripto.tenencia_total) * parseFloat(cripto.precio_actual);
      valor_total_criptos += valor_actual;
      return {
        simbolo: cripto.simbolo,
        cantidad: parseFloat(cripto.tenencia_total).toFixed(8),
        valor_usd: valor_actual.toFixed(2)
      };
    });

    return {
      saldo_usd: saldo_usd.toFixed(2),
      criptomonedas: criptomonedas,
      valor_total_portafolio: (valor_total_criptos + saldo_usd).toFixed(2)
    };
  } catch (err) {
    console.error("Error al obtener portafolio para IA:", err);
    throw new Error('Error interno al obtener el portafolio');
  }
}


class PortfolioStrategy {
  /**
   * Construye un prompt complejo CON datos del portafolio.
   * @param {string} pregunta - La pregunta del usuario.
   * @param {string} userId - El ID del usuario.
   */
  async buildPrompts(pregunta, userId) {
    console.log("Ejecutando Estrategia de Portafolio (con consulta a BD)");

    // 1. Obtener el portafolio (lógica clave)
    const portafolio = await getPortafolioData(userId);
    if (!portafolio) {
      throw new Error('No se pudo obtener el portafolio');
    }
    const contextoPortafolio = JSON.stringify(portafolio, null, 2);

    // 2. Construir el prompt
    const systemPrompt = `
      Eres "CryptoAsesor", un asistente financiero experto...
      Tu propósito es analizar el portafolio de simulación del usuario y responder su pregunta.
    `;
    const userPrompt = `
      Este es mi portafolio de simulación actual:
      ${contextoPortafolio}

      Mi pregunta es:
      "${pregunta}"
    `;

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  }
}

module.exports = PortfolioStrategy;