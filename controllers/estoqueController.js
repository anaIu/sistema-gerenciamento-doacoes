const estoqueModel = require("../models/estoqueModel");
const auditoriaModel = require("../models/auditoriaModel");

// Lista as movimentações/itens do estoque
const listarEstoque = async (req, res) => {
  try {
    const estoque = await estoqueModel.listarEstoque(req.usuario.id_organizacao);
    res.status(200).json(estoque);
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao listar estoque" });
  }
};

// Registra saída de item do estoque
const registrarSaida = async (req, res) => {
  try {
    const { quantidade, destino, observacao, id_doacao } = req.body;

    if (!id_doacao) {
      return res.status(400).json({ mensagem: "A doação é obrigatória" });
    }

    if (quantidade === null || quantidade === undefined || quantidade === "") {
      return res.status(400).json({ mensagem: "A quantidade de saída deve ser informada" });
    }

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0 || qtd !== Number(quantidade)) {
      return res.status(400).json({ mensagem: "A quantidade de saída deve ser um número inteiro maior que zero" });
    }

    const doacao = await estoqueModel.buscarDoacaoComSaldo(id_doacao, req.usuario.id_organizacao);
    if (!doacao) {
      return res.status(400).json({ mensagem: "Doação não encontrada ou não pertence à sua organização" });
    }

    if (doacao.tipo === "Dinheiro") {
      return res.status(400).json({ mensagem: "Não é possível registrar saída de doação em dinheiro no estoque" });
    }

    if (qtd > doacao.saldo) {
      return res.status(400).json({
        mensagem: `Quantidade solicitada (${qtd}) é maior que o saldo disponível em estoque (${doacao.saldo})`,
      });
    }

    const saida = await estoqueModel.registrarSaida(
      qtd,
      destino || null,
      observacao || null,
      id_doacao,
      req.usuario.id,
      req.usuario.id_organizacao,
    );

    await auditoriaModel.registrarLog({
      id_usuario: req.usuario.id,
      id_organizacao: req.usuario.id_organizacao,
      acao: "ESTOQUE_SAIDA",
      ip: req.ip,
      detalhes: `Doação ${id_doacao}, quantidade ${qtd}`,
    });

    res.status(201).json({
      mensagem: "Saída registrada com sucesso",
      movimentacao: saida,
    });
  } catch (error) {
    res
      .status(500)
      .json({ mensagem: "Erro ao registrar saída" });
  }
};

module.exports = {
  listarEstoque,
  registrarSaida,
};
