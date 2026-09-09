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

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
    }

    const novoUsuario = await usuariosModel.cadastrarUsuario(nome, email, senha, perfil);

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: novoUsuario
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário", erro: error.message });
  }
};

// Edita um usuário
const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil, senha } = req.body;

    if (!nome || !email || !perfil) {
      return res.status(400).json({ mensagem: "Nome, e-mail e perfil são obrigatórios" });
    }

    const emailExistente = await usuariosModel.buscarPorEmailParaValidar(email, id);
    if (emailExistente) {
      return res.status(400).json({ mensagem: "Este e-mail já está em uso" });
    }

    const usuario = await usuariosModel.editarUsuario(id, nome, email, perfil, senha);
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.status(200).json({ mensagem: "Usuário editado com sucesso", usuario });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar usuário", erro: error.message });
  }
};

// Exclui um usuário
const excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const usuario = await usuariosModel.excluirUsuario(id);
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      }
      res.status(200).json({ mensagem: "Usuário excluído com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: usuário possui registros vinculados" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir usuário", erro: error.message });
  }
};

module.exports = {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario
};