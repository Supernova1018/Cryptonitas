function ensureAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
  }
  next();
}

module.exports = ensureAdmin;
