const pool = require("../database/connection");

// Lista histórico geral de movimentações
const listarHistorico = async () => {
  const resultado = await pool.query(
    `SELECT 
        m.id_movimentacao,
        m.tipo_movimentacao,
        m.quantidade,
        m.data_movimentacao,
        m.destino,
        m.observacao,
        d.tipo AS tipo_doacao,
        u.nome AS usuario_responsavel
     FROM movimentacoes_estoque m
     JOIN doacoes d ON m.id_doacao = d.id_doacao
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     ORDER BY m.data_movimentacao DESC`,
  );

  return resultado.rows;
};

module.exports = {
  listarHistorico,
};
