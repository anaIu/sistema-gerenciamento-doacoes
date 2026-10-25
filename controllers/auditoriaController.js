const auditoriaModel = require("../models/auditoriaModel");

// Lista os logs de auditoria da organização do usuário (apenas administradores)
const listarLogs = async (req, res) => {
  try {
    const limiteInformado = parseInt(req.query.limite, 10);
    const limite = Number.isNaN(limiteInformado)
      ? 100
      : Math.min(Math.max(limiteInformado, 1), 500);

    const logs = await auditoriaModel.listarLogs(req.usuario.id_organizacao, limite);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao listar auditoria" });
  }
};

module.exports = { listarLogs };
