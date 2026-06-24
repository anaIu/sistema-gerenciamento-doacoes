const doadoresModel = require("../models/doadoresModel");

// Lista todos os doadores cadastrados
const listarDoadores = async (req, res) => {
  try {
    const doadores = await doadoresModel.listarDoadores();
    res.status(200).json(doadores);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar doadores", erro: error.message });
  }
};

// Cadastra um novo doador
const cadastrarDoador = async (req, res) => {
  try {
    const { nome, telefone, email, observacao, id_usuario_cadastro } = req.body;

    const novoDoador = await doadoresModel.cadastrarDoador(
      nome,
      telefone,
      email,
      observacao,
      id_usuario_cadastro,
    );

    res.status(201).json({
      mensagem: "Doador cadastrado com sucesso",
      doador: novoDoador,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao cadastrar doador", erro: error.message });
  }
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
};
