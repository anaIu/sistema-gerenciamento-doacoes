const jwt = require("jsonwebtoken");

const SECRET = "test-secret-key";

const definirSecret = () => {
  process.env.JWT_SECRET = SECRET;
};

const obterToken = (extra = {}) => {
  definirSecret();
  return jwt.sign({ id: 1, perfil: "Administrador", ...extra }, SECRET);
};

const headersAuth = (extra = {}) => ({
  Authorization: `Bearer ${obterToken(extra)}`,
});

module.exports = { SECRET, definirSecret, obterToken, headersAuth };