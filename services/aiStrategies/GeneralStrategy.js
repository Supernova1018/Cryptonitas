// /services/aiStrategies/GeneralStrategy.js

class GeneralStrategy {
  /**
   * Construye un prompt simple sin datos del portafolio.
   * @param {string} pregunta - La pregunta del usuario.
   * @param {string} [userId] - El ID del usuario (ignorado en esta estrategia).
   */
  async buildPrompts(pregunta, userId) {
    console.log("Ejecutando Estrategia General (sin consulta a BD)");

    const systemPrompt = `
      Eres "CryptoAsesor", un asistente financiero experto en criptomonedas.
      Tu propósito es educar y asistir a un usuario en una plataforma de simulación.
      Tus respuestas deben ser educativas y neutrales.
      NO tienes acceso al portafolio del usuario, así que solo responde a su pregunta general.
    `;

    const userPrompt = `Mi pregunta es: "${pregunta}"`;

    // Devolvemos el array de mensajes que espera el adaptador
    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
  }
}

module.exports = GeneralStrategy;