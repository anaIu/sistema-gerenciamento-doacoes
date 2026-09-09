const doacoesModel = require("../models/doacoesModel");

// Lista todas as doações cadastradas
const listarDoacoes = async (req, res) => {
  try {
    const doacoes = await doacoesModel.listarDoacoes();
    res.status(200).json(doacoes);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar doações", erro: error.message });
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
      id_usuario,
    } = req.body;

    if (!tipo) {
      return res.status(400).json({ mensagem: "O tipo da doação é obrigatório" });
    }

    if (tipo === "Dinheiro" && (valor === null || valor === undefined || valor === "")) {
      return res.status(400).json({ mensagem: "Doações de dinheiro devem ter valor informado" });
    }

    if (tipo !== "Dinheiro" && (quantidade === null || quantidade === undefined || quantidade === "")) {
      return res.status(400).json({ mensagem: "Doações de itens devem ter quantidade informada" });
    }

    const novaDoacao = await doacoesModel.cadastrarDoacao(
      tipo,
      quantidade,
      valor,
      data_doacao || new Date(),
      observacao,
      id_doador,
      id_usuario,
    );

    res.status(201).json({
      mensagem: "Doação cadastrada com sucesso",
      doacao: novaDoacao,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao cadastrar doação", erro: error.message });
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

    if (tipo === "Dinheiro" && (valor === null || valor === undefined || valor === "")) {
      return res.status(400).json({ mensagem: "Doações de dinheiro devem ter valor informado" });
    }

    if (tipo !== "Dinheiro" && (quantidade === null || quantidade === undefined || quantidade === "")) {
      return res.status(400).json({ mensagem: "Doações de itens devem ter quantidade informada" });
    }

    const doacao = await doacoesModel.editarDoacao(id, tipo, quantidade, valor, observacao, id_doador);
    if (!doacao) {
      return res.status(404).json({ mensagem: "Doação não encontrada" });
    }

    res.status(200).json({ mensagem: "Doação editada com sucesso", doacao });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar doação", erro: error.message });
  }
};

// Exclui uma doação
const excluirDoacao = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const doacao = await doacoesModel.excluirDoacao(id);
      if (!doacao) {
        return res.status(404).json({ mensagem: "Doação não encontrada" });
      }
      res.status(200).json({ mensagem: "Doação excluída com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: doação possui movimentações vinculadas" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir doação", erro: error.message });
  }
};

module.exports = {
  listarDoacoes,
  cadastrarDoacao,
  editarDoacao,
  excluirDoacao,
};
