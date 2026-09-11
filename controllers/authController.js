const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const { validarEmail, validarSenha, validarConfirmacao } = require("../utils/validacoes");

const gerarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id_usuario, perfil: usuario.perfil, id_organizacao: usuario.id_organizacao },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

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

    const token = gerarToken(usuario);

    res.status(200).json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        id_organizacao: usuario.id_organizacao,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
      },
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao fazer login", erro: error.message });
  }
};

const registrarOrganizacao = async (req, res) => {
  try {
    const {
      nome_organizacao,
      cnpj,
      nome,
      email,
      cpf,
      telefone,
      senha,
      confirmar_senha,
    } = req.body;

    if (!nome_organizacao || !cnpj || !nome || !email || !senha || !confirmar_senha) {
      return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (!validarSenha(senha)) {
      return res.status(400).json({ mensagem: "A senha deve ter pelo menos 8 caracteres" });
    }

    if (!validarConfirmacao(senha, confirmar_senha)) {
      return res.status(400).json({ mensagem: "As senhas não coincidem" });
    }

    const novoUsuario = await authModel.registrarOrganizacao({
      nomeOrganizacao: nome_organizacao,
      cnpj,
      nome,
      email,
      cpf,
      telefone,
      senha,
    });

    const token = gerarToken(novoUsuario);

    res.status(201).json({
      mensagem: "Conta criada com sucesso",
      token,
      usuario: {
        id: novoUsuario.id_usuario,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        id_organizacao: novoUsuario.id_organizacao,
        cpf: novoUsuario.cpf,
        telefone: novoUsuario.telefone,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      const mensagem = error.constraint === "organizacoes_cnpj_key"
        ? "CNPJ já cadastrado"
        : "E-mail já cadastrado";
      return res.status(400).json({ mensagem });
    }
    res.status(500).json({ mensagem: "Erro ao criar conta", erro: error.message });
  }
};

const obterPerfil = async (req, res) => {
  try {
    const perfil = await authModel.buscarPerfil(req.usuario.id);
    if (!perfil) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.status(200).json({
      usuario: {
        id: perfil.id_usuario,
        nome: perfil.nome,
        email: perfil.email,
        cpf: perfil.cpf,
        telefone: perfil.telefone,
        perfil: perfil.perfil,
      },
      organizacao: {
        id_organizacao: perfil.id_organizacao,
        nome: perfil.nome_organizacao,
        cnpj: perfil.cnpj,
        data_cadastro: perfil.data_cadastro_org,
      },
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao carregar perfil", erro: error.message });
  }
};

const editarPerfil = async (req, res) => {
  try {
    const { nome, email, cpf, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ mensagem: "Nome e e-mail são obrigatórios" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    const emailExistente = await authModel.buscarPorEmail(email);
    if (emailExistente && emailExistente.id_usuario !== req.usuario.id) {
      return res.status(400).json({ mensagem: "Este e-mail já está em uso" });
    }

    const usuarioAtualizado = await authModel.editarPerfil(req.usuario.id, {
      nome,
      email,
      cpf,
      telefone,
    });

    if (!usuarioAtualizado) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.status(200).json({
      mensagem: "Perfil atualizado com sucesso",
      usuario: usuarioAtualizado,
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao atualizar perfil", erro: error.message });
  }
};

module.exports = { login, registrarOrganizacao, obterPerfil, editarPerfil };