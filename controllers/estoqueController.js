const estoqueModel = require("../models/estoqueModel");

// Lista as movimentações/itens do estoque
const listarEstoque = async (req, res) => {
  try {
    const estoque = await estoqueModel.listarEstoque();
    res.status(200).json(estoque);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar estoque", erro: error.message });
  }
};

// Registra saída de item do estoque
const registrarSaida = async (req, res) => {
  try {
    const { quantidade, destino, observacao, id_doacao, id_usuario } = req.body;

    const saida = await estoqueModel.registrarSaida(
      quantidade,
      destino,
      observacao,
      id_doacao,
      id_usuario,
    );

    res.status(201).json({
      mensagem: "Saída registrada com sucesso",
      movimentacao: saida,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao registrar saída", erro: error.message });
  }
};

module.exports = {
  listarEstoque,
  registrarSaida,
};
