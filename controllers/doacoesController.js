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

    const novaDoacao = await doacoesModel.cadastrarDoacao(
      tipo,
      quantidade,
      valor,
      data_doacao,
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

module.exports = {
  listarDoacoes,
  cadastrarDoacao,
};
