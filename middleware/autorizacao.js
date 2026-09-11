const somenteAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.perfil !== "Administrador") {
    return res.status(403).json({ mensagem: "Acesso restrito a administradores" });
  }
  next();
};

module.exports = { somenteAdmin };