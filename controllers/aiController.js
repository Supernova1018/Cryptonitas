// /controllers/aiController.js
const AIService = require('../services/aiService');

exports.askAI = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. Obtenemos 'tipo' del body
    const { pregunta, tipo } = req.body; 

    if (!pregunta) {
      return res.status(400).json({ msg: 'No se proporcionó ninguna pregunta' });
    }

    // 2. Pasamos 'tipo' al servicio
    const respuesta = await AIService.askAI(userId, pregunta, tipo); 

    res.json({ respuesta: respuesta });

  } catch (err) {
    console.error(err.message);
    // Verificamos si el error viene de la estrategia de portafolio
    if (err.message === 'No se pudo obtener el portafolio') {
        return res.status(500).json({ msg: err.message });
    }
    res.status(500).json({ msg: err.message });
  }
};