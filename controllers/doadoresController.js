const doadoresModel = require("../models/doadoresModel");
const auditoriaModel = require("../models/auditoriaModel");
const { validarEmail, validarTelefone } = require("../utils/validacoes");

// Lista todos os doadores cadastrados
const listarDoadores = async (req, res) => {
  try {
    const doadores = await doadoresModel.listarDoadores(req.usuario.id_organizacao);
    res.status(200).json(doadores);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar doadores" });
  }
};

// Cadastra um novo doador
const cadastrarDoador = async (req, res) => {
  try {
    const { nome, telefone, email, observacao } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ mensagem: "O nome é obrigatório" });
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ mensagem: "Telefone inválido" });
    }

    const novoDoador = await doadoresModel.cadastrarDoador(
      nome.trim(),
      telefone || null,
      email ? email.trim() : null,
      observacao || null,
      req.usuario.id,
      req.usuario.id_organizacao,
    );

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "DOADOR_CRIADO",
      ip: req.ip,
      detalhes: `Doador ${novoDoador.id_doador}`,
    });

    res.status(201).json({
      mensagem: "Doador cadastrado com sucesso",
      doador: novoDoador,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao cadastrar doador" });
  }
};

// Edita um doador
const editarDoador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, observacao } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ mensagem: "O nome é obrigatório" });
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ mensagem: "Formato de e-mail inválido" });
    }

    if (telefone && !validarTelefone(telefone)) {
      return res.status(400).json({ mensagem: "Telefone inválido" });
    }

    const doador = await doadoresModel.editarDoador(
      id,
      nome.trim(),
      telefone || null,
      email ? email.trim() : null,
      observacao || null,
      req.usuario.id_organizacao,
    );
    if (!doador) {
      return res.status(404).json({ mensagem: "Doador não encontrado" });
    }

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "DOADOR_EDITADO",
      ip: req.ip,
      detalhes: `Doador ${doador.id_doador}`,
    });

    res.status(200).json({ mensagem: "Doador editado com sucesso", doador });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar doador" });
  }
};

// Exclui um doador
const excluirDoador = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const doador = await doadoresModel.excluirDoador(id, req.usuario.id_organizacao);
      if (!doador) {
        return res.status(404).json({ mensagem: "Doador não encontrado" });
      }

      await auditoriaModel.registrarLog({
        id_usuario: req.usuario.id,
        id_organizacao: req.usuario.id_organizacao,
        acao: "DOADOR_EXCLUIDO",
        ip: req.ip,
        detalhes: `Doador ${doador.id_doador}`,
      });

      res.status(200).json({ mensagem: "Doador excluído com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: doador possui doações vinculadas" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir doador" });
  }
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
  editarDoador,
  excluirDoador,
};
