// Importa as funções do model de usuários
const usuariosModel = require("../models/usuariosModel");

// Lista todos os usuários cadastrados
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuariosModel.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar usuários", erro: error.message });
  }
};

// Cadastra um novo usuário
const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    const novoUsuario = await usuariosModel.cadastrarUsuario(nome, email, senha, perfil);

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: novoUsuario
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário", erro: error.message });
  }
};

module.exports = {
  listarUsuarios,
  cadastrarUsuario
};