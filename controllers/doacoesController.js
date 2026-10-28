const doacoesModel = require("../models/doacoesModel");
const doadoresModel = require("../models/doadoresModel");
const auditoriaModel = require("../models/auditoriaModel");

// Lista todas as doações cadastradas
const listarDoacoes = async (req, res) => {
  try {
    const doacoes = await doacoesModel.listarDoacoes(req.usuario.id_organizacao);
    res.status(200).json(doacoes);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar doações" });
  }
};

// Cadastra uma nova doação
const cadastrarDoacao = async (req, res) => {
  try {
    const {
      tipo,
      quantidade,
      valor,
      data_doacao,
      observacao,
      id_doador,
    } = req.body;

    if (!tipo) {
      return res.status(400).json({ mensagem: "O tipo da doação é obrigatório" });
    }

    let qtdFinal = null;
    let valorFinal = null;

    if (tipo === "Dinheiro") {
      if (valor === null || valor === undefined || valor === "") {
        return res.status(400).json({ mensagem: "Doações de dinheiro devem ter valor informado" });
      }
      const numValor = parseFloat(valor);
      if (isNaN(numValor) || numValor <= 0) {
        return res.status(400).json({ mensagem: "O valor da doação deve ser um número maior que zero" });
      }
      valorFinal = numValor;
    } else {
      if (quantidade === null || quantidade === undefined || quantidade === "") {
        return res.status(400).json({ mensagem: "Doações de itens devem ter quantidade informada" });
      }
      const numQtd = parseInt(quantidade, 10);
      if (isNaN(numQtd) || numQtd <= 0 || numQtd !== Number(quantidade)) {
        return res.status(400).json({ mensagem: "A quantidade da doação deve ser um número inteiro maior que zero" });
      }
      qtdFinal = numQtd;
    }

    if (id_doador) {
      const doador = await doadoresModel.buscarDoadorPorId(id_doador, req.usuario.id_organizacao);
      if (!doador) {
        return res.status(400).json({ mensagem: "Doador não encontrado ou não pertence à sua organização" });
      }
    }

    const novaDoacao = await doacoesModel.cadastrarDoacao(
      tipo,
      qtdFinal,
      valorFinal,
      data_doacao || new Date(),
      observacao || null,
      id_doador || null,
      req.usuario.id,
      req.usuario.id_organizacao,
    );

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "DOACAO_CRIADA",
      ip: req.ip,
      detalhes: `Doação ${novaDoacao.id_doacao} (${tipo})`,
    });

    res.status(201).json({
      mensagem: "Doação cadastrada com sucesso",
      doacao: novaDoacao,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao cadastrar doação" });
  }
};

// Edita uma doação
const editarDoacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, quantidade, valor, observacao, id_doador } = req.body;

    if (!tipo) {
      return res.status(400).json({ mensagem: "O tipo da doação é obrigatório" });
    }

    let qtdFinal = null;
    let valorFinal = null;

    if (tipo === "Dinheiro") {
      if (valor === null || valor === undefined || valor === "") {
        return res.status(400).json({ mensagem: "Doações de dinheiro devem ter valor informado" });
      }
      const numValor = parseFloat(valor);
      if (isNaN(numValor) || numValor <= 0) {
        return res.status(400).json({ mensagem: "O valor da doação deve ser um número maior que zero" });
      }
      valorFinal = numValor;
    } else {
      if (quantidade === null || quantidade === undefined || quantidade === "") {
        return res.status(400).json({ mensagem: "Doações de itens devem ter quantidade informada" });
      }
      const numQtd = parseInt(quantidade, 10);
      if (isNaN(numQtd) || numQtd <= 0 || numQtd !== Number(quantidade)) {
        return res.status(400).json({ mensagem: "A quantidade da doação deve ser um número inteiro maior que zero" });
      }
      qtdFinal = numQtd;
    }

    if (id_doador) {
      const doador = await doadoresModel.buscarDoadorPorId(id_doador, req.usuario.id_organizacao);
      if (!doador) {
        return res.status(400).json({ mensagem: "Doador não encontrado ou não pertence à sua organização" });
      }
    }

    const doacao = await doacoesModel.editarDoacao(
      id,
      tipo,
      qtdFinal,
      valorFinal,
      observacao || null,
      id_doador || null,
      req.usuario.id_organizacao,
    );
    if (!doacao) {
      return res.status(404).json({ mensagem: "Doação não encontrada" });
    }

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "DOACAO_EDITADA",
      ip: req.ip,
      detalhes: `Doação ${doacao.id_doacao}`,
    });

    res.status(200).json({ mensagem: "Doação editada com sucesso", doacao });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar doação" });
  }
};

// Exclui uma doação
const excluirDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const doacao = await doacoesModel.excluirDoacao(id, req.usuario.id_organizacao);
      if (!doacao) {
        return res.status(404).json({ mensagem: "Doação não encontrada" });
      }

      await auditoriaModel.registrarLog({
        id_usuario: req.usuario.id,
        id_organizacao: req.usuario.id_organizacao,
        acao: "DOACAO_EXCLUIDA",
        ip: req.ip,
        detalhes: `Doação ${doacao.id_doacao}`,
      });

      res.status(200).json({ mensagem: "Doação excluída com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: doação possui movimentações vinculadas" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir doação" });
  }
};

module.exports = {
  listarDoacoes,
  cadastrarDoacao,
  editarDoacao,
  excluirDoacao,
};
