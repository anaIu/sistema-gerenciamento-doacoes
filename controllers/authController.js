const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");
const auditoriaModel = require("../models/auditoriaModel");
const { revogarToken } = require("../middleware/auth");
const {
  validarEmail,
  validarSenhaForte,
  validarConfirmacao,
  validarTelefone,
  validarCPF,
  validarCNPJ,
} = require("../utils/validacoes");

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
      await auditoriaModel.registrarLog({
        acao: "LOGIN_FALHA",
        ip: req.ip,
        detalhes: `Tentativa com email inexistente: ${email}`,
      });
      return res.status(401).json({ mensagem: "Credenciais inválidas" });
    }

    let senhaValida = false;
    const ehBcrypt = usuario.senha && usuario.senha.startsWith("$2");

    if (ehBcrypt) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else if (usuario.senha) {
      // Suporte a hash legado (MD5 hexadecimal)
      const hashMd5 = crypto.createHash("md5").update(senha).digest("hex");
      if (usuario.senha.toLowerCase() === hashMd5.toLowerCase()) {
        senhaValida = true;
        // Upgrade automático transparente para bcrypt
        const novoHashBcrypt = await bcrypt.hash(senha, 10);
        await authModel.atualizarSenha(usuario.id_usuario, novoHashBcrypt);
      }
    }

    if (!senhaValida) {
      await auditoriaModel.registrarLog({
        id_usuario: usuario.id_usuario,
        id_organizacao: usuario.id_organizacao,
        acao: "LOGIN_FALHA",
        ip: req.ip,
        detalhes: "Senha incorreta",
      });
      return res.status(401).json({ mensagem: "Credenciais inválidas" });
    }

    if (usuario.ativo === false) {
      await auditoriaModel.registrarLog({
        id_usuario: usuario.id_usuario,
        id_organizacao: usuario.id_organizacao,
        acao: "LOGIN_BLOQUEADO",
        ip: req.ip,
        detalhes: "Usuário inativo",
      });
      return res.status(401).json({ mensagem: "Usuário inativo. Contate um administrador" });
    }

    await auditoriaModel.registrarLog({
      id_usuario: usuario.id_usuario,
      id_organizacao: usuario.id_organizacao,
      acao: "LOGIN_SUCESSO",
      ip: req.ip,
    });

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
    res.status(500).json({ mensagem: "Erro ao fazer login" });
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

    if (!validarCNPJ(cnpj)) {
      return res.status(400).json({ mensagem: "CNPJ inválido" });
    }

    if (cpf && !validarCPF(cpf)) {
      return res.status(400).json({ mensagem: "CPF inválido" });
    }

    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ mensagem: "Telefone inválido" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (!validarSenhaForte(senha)) {
      return res
        .status(400)
        .json({ mensagem: "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número" });
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
    res.status(500).json({ mensagem: "Erro ao criar conta" });
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
    res.status(500).json({ mensagem: "Erro ao carregar perfil" });
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

    if (cpf && !validarCPF(cpf)) {
      return res.status(400).json({ mensagem: "CPF inválido" });
    }

    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ mensagem: "Telefone inválido" });
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
    res.status(500).json({ mensagem: "Erro ao atualizar perfil" });
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      revogarToken(token);
    }

    if (req.usuario) {
      await auditoriaModel.registrarLog({
        id_usuario: req.usuario.id,
        id_organizacao: req.usuario.id_organizacao,
        acao: "LOGOUT",
        ip: req.ip,
      });
    }

    res.status(200).json({ mensagem: "Logout realizado com sucesso" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao realizar logout" });
  }
};

module.exports = { login, logout, registrarOrganizacao, obterPerfil, editarPerfil };