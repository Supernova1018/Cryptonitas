// /services/aiAdapters/ollamaAdapter.js
const axios = require('axios'); // Usamos axios para hacer peticiones HTTP

// URL directa de la API de Ollama
const OLLAMA_API_URL = 'http://localhost:11434/v1/chat/completions';

class OllamaAdapter {
  constructor() {
    //url de conexión 
    console.log("Ollama Adapter: Conectando a http://localhost:11434");
  }

  /**
   * Implementación de la interfaz genérica para Ollama usando axios
   * @param {Array} messages - El historial de chat (prompt de sistema y usuario)
   */
  async generarRespuesta(messages) {
    try {
      //Creamos el "payload" que Ollama espera
      const payload = {
        model: "gemma3:4b", // <-- modelo descargado localmente
        messages: messages,
        max_tokens: 300,
        stream: false
      };

      //Hacemos la petición POST con axios
      const response = await axios.post(OLLAMA_API_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      //Devolvemos la respuesta
      return response.data.choices[0].message.content;

    } catch (err) {
      //Manejamos los errores
      if (err.code === 'ECONNREFUSED') {
        throw new Error('Error de conexión con Ollama. ¿Estás seguro de que está corriendo?');
      }
      if (err.response && err.response.data.error && err.response.data.error.includes('model not found')) {
         throw new Error('El modelo "gemma3:4b" no se encuentra en Ollama.');
      }
      // Imprimir un error más detallado
      console.error("Error completo de Axios:", err.response ? err.response.data : err.message);
      throw new Error('Error al contactar la API de Ollama');
    }
  }
}

module.exports = OllamaAdapter;