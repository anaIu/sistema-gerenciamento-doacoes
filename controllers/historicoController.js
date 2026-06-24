const historicoModel = require("../models/historicoModel");

// Lista o histórico de movimentações
const listarHistorico = async (req, res) => {
  try {
    const historico = await historicoModel.listarHistorico();
    res.status(200).json(historico);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar histórico", erro: error.message });
  }
};

module.exports = {
  listarHistorico,
};
