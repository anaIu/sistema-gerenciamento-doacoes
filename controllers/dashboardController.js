const dashboardModel = require("../models/dashboardModel");

const obterResumo = async (req, res) => {
  try {
    const idOrganizacao = req.usuario.id_organizacao;
    const [
      usuarios,
      doadores,
      doacoes,
      saldoEstoque,
      totalDinheiro,
      movimentacoes,
    ] = await Promise.all([
      dashboardModel.contarUsuarios(idOrganizacao),
      dashboardModel.contarDoadores(idOrganizacao),
      dashboardModel.contarDoacoes(idOrganizacao),
      dashboardModel.calcularSaldoEstoque(idOrganizacao),
      dashboardModel.calcularTotalDinheiro(idOrganizacao),
      dashboardModel.ultimasMovimentacoes(5, idOrganizacao),
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
    res.status(500).json({ mensagem: "Erro ao carregar dashboard" });
  }
};

module.exports = { obterResumo };
