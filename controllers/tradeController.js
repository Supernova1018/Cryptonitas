// /controllers/tradeController.js
const TradeService = require('../services/tradeService'); // <-- 1. Importar el servicio

/**
    Implementamos el patron service layer para separar la logica de negocio
    ahora se obtiene una req,res del controlador y se delega todo el trabajo al servicio.
 */
exports.buyCrypto = async (req, res) => {
  try {
    // 2. Obtener datos de la petición
    const userId = req.user.id;
    const { simbolo, cantidad_usd } = req.body;

    // 3. Delegar TODO el trabajo al servicio
    const resultado = await TradeService.buyCrypto(userId, simbolo, cantidad_usd);

    // 4. Enviar la respuesta exitosa
    res.status(201).json(resultado);

  } catch (err) {
    // 5. Si el servicio lanza un error, atraparlo y enviarlo
    console.error(err.message);
    res.status(400).json({ msg: err.message }); // Usamos 400 para errores de negocio
  }
};


/**
 * Controlador para Vender Criptomonedas (RF3)
 */
exports.sellCrypto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { simbolo, cantidad_cripto } = req.body;

    const resultado = await TradeService.sellCrypto(userId, simbolo, cantidad_cripto);

    res.status(201).json(resultado);

  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: err.message });
  }
};

/**
 * Controlador para obtener el historial (RF4)
 */
exports.getTradeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const historial = await TradeService.getHistory(userId);
    
    res.json(historial);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor'); // 500 para errores inesperados
  }
};