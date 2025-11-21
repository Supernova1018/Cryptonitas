// /services/aiAdapters/lmStudioAdapter.js
const axios = require('axios');

/**
 * Adaptador para conectarse a LM Studio (API local compatible con OpenAI)
 * Compatible con modelos tipo "chat", como:
 *   - gpt-oss-20B
 *   - Meta-Llama-3-8B-Instruct
 *   - Mistral-7B-Instruct
 */
class LMStudioAdapter {
  constructor() {
    // Usa las variables de entorno si existen, o valores por defecto
    this.apiUrl = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1/chat/completions';
    this.model = process.env.LMSTUDIO_MODEL || 'deepseek-r1-distill-qwen-1.5b';
    console.log(`🧠 LM Studio Adapter conectado a ${this.apiUrl} | Modelo: ${this.model}`);
  }

  /**
   * Envía los mensajes al modelo cargado en LM Studio y obtiene una respuesta
   * @param {Array} messages - [{role: "system"|"user"|"assistant", content: "texto"}]
   */
  async generarRespuesta(messages) {
    try {
      const payload = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // LM Studio devuelve una estructura similar a OpenAI
      const content = response.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Respuesta vacía o sin contenido. ¿Está cargado el modelo en LM Studio?');
      }

      return content.trim();

    } catch (error) {
      // Registro de error más descriptivo
      console.error('❌ Error al conectar con LM Studio:', error.message);

      // Caso: LM Studio no está activo o el puerto está cerrado
      if (error.code === 'ECONNREFUSED') {
        throw new Error('No se pudo conectar a LM Studio. ¿Está corriendo el servidor en http://localhost:1234?');
      }

      // Caso: modelo no cargado
      if (error.response?.data?.error?.includes('No models loaded')) {
        throw new Error('No hay ningún modelo cargado en LM Studio. Abre la app y selecciona un modelo (por ejemplo, gpt-oss-20B).');
      }

      // Caso: modelo no existe
      if (error.response?.data?.error?.includes('model not found')) {
        throw new Error(`El modelo "${this.model}" no se encuentra en LM Studio. Cárgalo manualmente.`);
      }

      // Respuesta general
      throw new Error(`Error al comunicarse con LM Studio: ${error.response?.data?.error || error.message}`);
    }
  }
}

module.exports = LMStudioAdapter;
