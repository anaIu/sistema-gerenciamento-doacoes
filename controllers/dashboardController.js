const dashboardModel = require("../models/dashboardModel");

const obterResumo = async (req, res) => {
  try {
    const [
      usuarios,
      doadores,
      doacoes,
      saldoEstoque,
      totalDinheiro,
      movimentacoes,
    ] = await Promise.all([
      dashboardModel.contarUsuarios(),
      dashboardModel.contarDoadores(),
      dashboardModel.contarDoacoes(),
      dashboardModel.calcularSaldoEstoque(),
      dashboardModel.calcularTotalDinheiro(),
      dashboardModel.ultimasMovimentacoes(5),
    ]);

    res.status(200).json({
      usuarios,
      doadores,
      doacoes,
      saldoEstoque,
      totalDinheiro,
      movimentacoes,
    });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao carregar dashboard", erro: error.message });
  }
};

module.exports = { obterResumo };
