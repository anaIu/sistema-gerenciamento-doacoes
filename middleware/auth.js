const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

// Blacklist em memória de tokens revogados no logout.
// LIMITAÇÃO CONHECIDA: não é persistente (some ao reiniciar o processo) e não é
// compartilhada entre múltiplas instâncias. A revogação confiável de sessão é feita
// via `usuarios.ativo = FALSE` (verificado em `verificarUsuarioAtivo` nas rotas que
// exigem CHECK_USER_EXISTS/produção). Para revogação distribuída, migrar para uma
// blacklist persistente (tabela/Redis) com TTL igual ao `expiresIn` do JWT (1h).
const tokensRevogados = new Set();

const revogarToken = (token) => {
  if (token) tokensRevogados.add(token);
};

const tokenEstaRevogado = (token) => tokensRevogados.has(token);

const limparTokensRevogados = () => tokensRevogados.clear();

const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (tokensRevogados.has(token)) {
    return res.status(401).json({ mensagem: "Sessão encerrada. Faça login novamente" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;

    if (process.env.CHECK_USER_EXISTS === "true" || process.env.NODE_ENV === "production") {
      const usuario = await authModel.verificarUsuarioAtivo(decoded.id, decoded.id_organizacao);
      if (!usuario) {
        return res.status(401).json({ mensagem: "Usuário inativo ou não encontrado" });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado" });
  }
};

module.exports = autenticar;
module.exports.revogarToken = revogarToken;
module.exports.tokenEstaRevogado = tokenEstaRevogado;
module.exports.limparTokensRevogados = limparTokensRevogados;
