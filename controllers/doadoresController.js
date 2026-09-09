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

// Edita um doador
const editarDoador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, observacao } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: "O nome é obrigatório" });
    }

    const doador = await doadoresModel.editarDoador(id, nome, telefone, email, observacao);
    if (!doador) {
      return res.status(404).json({ mensagem: "Doador não encontrado" });
    }

    res.status(200).json({ mensagem: "Doador editado com sucesso", doador });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao editar doador", erro: error.message });
  }
};

// Exclui um doador
const excluirDoador = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const doador = await doadoresModel.excluirDoador(id);
      if (!doador) {
        return res.status(404).json({ mensagem: "Doador não encontrado" });
      }
      res.status(200).json({ mensagem: "Doador excluído com sucesso" });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(400).json({ mensagem: "Não é possível excluir: doador possui doações vinculadas" });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao excluir doador", erro: error.message });
  }
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
  editarDoador,
  excluirDoador,
};
