// /services/aiService.js
const pool = require('../config/db');
const LMStudioAdapter = require('./aiAdapters/lmStudioAdapter');

/**
 * Obtiene los datos del portafolio del usuario (saldo + tenencias)
 */
async function getPortafolioData(userId) {
  try {
    // 1️⃣ Obtener saldo actual
    const saldoResult = await pool.query(
      'SELECT saldo_virtual FROM usuarios WHERE id = $1',
      [userId]
    );

    if (saldoResult.rows.length === 0) {
      throw new Error('Usuario no encontrado.');
    }

    const saldo_usd = parseFloat(saldoResult.rows[0].saldo_virtual);

    // 2️⃣ Calcular tenencias de criptomonedas basadas en transacciones
    const tenenciasResult = await pool.query(
  `SELECT 
     t.crypto AS simbolo,
     c.nombre,
     c.precio_actual,
     SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad ELSE -t.cantidad END) AS tenencia_total
   FROM transacciones t
   JOIN criptomoneda c ON UPPER(t.crypto) = UPPER(c.simbolo)
   WHERE t.user_id = $1
   GROUP BY t.crypto, c.id_criptomoneda, c.nombre, c.simbolo, c.precio_actual
   HAVING SUM(CASE WHEN t.tipo = 'compra' THEN t.cantidad ELSE -t.cantidad END) > 0`,
  [userId]
);


    // 3️⃣ Calcular valores totales
    let valor_total_criptos = 0;
    const criptomonedas = tenenciasResult.rows.map(cripto => {
      const valor_actual = parseFloat(cripto.tenencia_total) * parseFloat(cripto.precio_actual);
      valor_total_criptos += valor_actual;
      return {
        simbolo: cripto.simbolo,
        nombre: cripto.nombre,
        cantidad: parseFloat(cripto.tenencia_total).toFixed(8),
        valor_usd: valor_actual.toFixed(2)
      };
    });

    return {
      saldo_usd: saldo_usd.toFixed(2),
      criptomonedas,
      valor_total_portafolio: (valor_total_criptos + saldo_usd).toFixed(2)
    };

  } catch (err) {
    console.error("❌ Error al obtener portafolio para IA:", err);
    throw new Error('Error interno al obtener el portafolio');
  }
}


/**
 * Servicio de IA principal (usa LM Studio)
 */
class AIService {
  constructor() {
    this.adapter = new LMStudioAdapter();
    console.log('🤖 Servicio de IA inicializado con: LM Studio (Local)');
  }

  /**
   * Genera una respuesta de IA en base a la pregunta del usuario y su portafolio
   */
  async askAI(userId, pregunta) {
    const portafolio = await getPortafolioData(userId);
    if (!portafolio) {
      throw new Error('No se pudo obtener el portafolio');
    }

    const contextoPortafolio = JSON.stringify(portafolio, null, 2);

    const systemPrompt = `
      Eres "CryptoAsesor", un asistente financiero experto en criptomonedas.
      Tu propósito es educar y asistir a un usuario en una plataforma de simulación.
      Tus respuestas deben ser educativas, neutrales y siempre recordar al usuario que esto es una simulación.
      Si te preguntan por tu nombre, eres "CryptoAsesor".
    `;

    const userPrompt = `
      Este es mi portafolio de simulación actual:
      ${contextoPortafolio}

      Mi pregunta es:
      "${pregunta}"
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    return this.adapter.generarRespuesta(messages);
  }
}

module.exports = new AIService();
