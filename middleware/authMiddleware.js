// /middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // 1. Obtener el token del header
  const token = req.header('Authorization');

  // 2. Verificar si no hay token
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  }

  // 3. Verificar si el token es válido
  try {
    // 'Bearer TOKEN_AQUI'
    // Quitamos 'Bearer ' para quedarnos solo con el token
    const bareToken = token.split(' ')[1]; 
    
    if (!bareToken) {
       return res.status(401).json({ msg: 'Token malformado' });
    }

    const decoded = jwt.verify(bareToken, process.env.JWT_SECRET);

    // 4. Si es válido, añadimos el payload del usuario (user.id, user.rol)
    //    al objeto 'req' para que los controladores puedan usarlo.
    req.user = decoded.user;
    next(); // Permite que la petición continúe
  } catch (err) {
    res.status(401).json({ msg: 'Token no es válido' });
  }
};