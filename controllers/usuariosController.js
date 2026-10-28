// Importa as funções do model de usuários
const usuariosModel = require("../models/usuariosModel");
const auditoriaModel = require("../models/auditoriaModel");
const { validarEmail, validarSenhaForte } = require("../utils/validacoes");

// Lista usuários conforme o escopo do usuário logado:
// admin vê a própria organização; funcionário vê somente a própria conta
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuariosModel.listarUsuarios(req.usuario);
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar usuários" });
  }
};

// Cadastra um novo usuário (apenas administradores, sempre como Funcionário da própria org)
const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const perfil = "Funcionário";

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: "Nome, e-mail e senha são obrigatórios" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (!validarSenhaForte(senha)) {
      return res
        .status(400)
        .json({ mensagem: "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número" });
    }

    const emailExistente = await usuariosModel.buscarPorEmailParaValidar(email, null);
    if (emailExistente) {
      return res.status(400).json({ mensagem: "Este e-mail já está em uso" });
    }

    const novoUsuario = await usuariosModel.cadastrarUsuario(
      nome,
      email,
      senha,
      perfil,
      req.usuario.id_organizacao,
    );

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "USUARIO_CRIADO",
      ip: req.ip,
      detalhes: `Usuário ${novoUsuario.id_usuario} (${email})`,
    });

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: novoUsuario,
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
};

// Edita um usuário da própria organização
const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const perfil = "Funcionário";

    if (!nome || !email) {
      return res.status(400).json({ mensagem: "Nome e e-mail são obrigatórios" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (senha && !validarSenhaForte(senha)) {
      return res
        .status(400)
        .json({ mensagem: "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número" });
    }

    const emailExistente = await usuariosModel.buscarPorEmailParaValidar(email, id);
    if (emailExistente) {
      return res.status(400).json({ mensagem: "Este e-mail já está em uso" });
    }

    const usuario = await usuariosModel.editarUsuario(id, nome, email, perfil, senha, req.usuario.id_organizacao);
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "USUARIO_EDITADO",
      ip: req.ip,
      detalhes: `Usuário ${usuario.id_usuario}`,
    });

    res.status(200).json({ mensagem: "Usuário editado com sucesso", usuario });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar usuário" });
  }
};

// Exclui um usuário da própria organização
const excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.usuario.id) {
      return res.status(400).json({ mensagem: "Não é possível excluir a própria conta" });
    }

    try {
      const usuario = await usuariosModel.excluirUsuario(id, req.usuario.id_organizacao);
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado" });
      }

      await auditoriaModel.registrarLog({
        id_usuario: req.usuario.id,
        id_organizacao: req.usuario.id_organizacao,
        acao: "USUARIO_EXCLUIDO",
        ip: req.ip,
        detalhes: `Usuário ${usuario.id_usuario}`,
      });

      res.status(200).json({ mensagem: "Usuário excluído com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: usuário possui registros vinculados" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir usuário" });
  }
};

// Ativa/desativa um usuário da própria organização (apenas administradores)
const alterarAtivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({ mensagem: "O campo 'ativo' deve ser booleano" });
    }

    if (Number(id) === req.usuario.id && ativo === false) {
      return res.status(400).json({ mensagem: "Não é possível desativar a própria conta" });
    }

    const usuario = await usuariosModel.alterarAtivo(id, ativo, req.usuario.id_organizacao);
    if (!usuario) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: ativo ? "USUARIO_ATIVADO" : "USUARIO_DESATIVADO",
      ip: req.ip,
      detalhes: `Usuário ${usuario.id_usuario}`,
    });

    res.status(200).json({
      mensagem: ativo ? "Usuário ativado com sucesso" : "Usuário desativado com sucesso",
      usuario,
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao alterar status do usuário" });
  }
};

module.exports = {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario,
  alterarAtivo,
};