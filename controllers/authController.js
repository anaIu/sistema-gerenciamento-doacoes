const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios" });
    }

    const usuario = await authModel.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao fazer login", erro: error.message });
  }
};

module.exports = { login };
