const rateLimit = require("express-rate-limit");

const ativo = process.env.NODE_ENV !== "test";

const configurar = (opcoes) => {
  if (!ativo) {
    return (req, res, next) => next();
  }
  return rateLimit(opcoes);
};

const limitadorLogin = configurar({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagem: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

const limitadorRegistro = configurar({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensagem: "Muitas tentativas de cadastro. Tente novamente em alguns minutos." },
});

module.exports = { limitadorLogin, limitadorRegistro };