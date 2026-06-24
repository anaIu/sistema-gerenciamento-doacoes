const pool = require("../database/connection");

// Lista movimentações do estoque
const listarEstoque = async () => {
  const resultado = await pool.query(
    `SELECT 
        m.*,
        d.tipo AS tipo_doacao,
        u.nome AS usuario_responsavel
     FROM movimentacoes_estoque m
     JOIN doacoes d ON m.id_doacao = d.id_doacao
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     ORDER BY m.id_movimentacao`,
  );

  return resultado.rows;
};

// Registra saída de item do estoque
const registrarSaida = async (
  quantidade,
  destino,
  observacao,
  id_doacao,
  id_usuario,
) => {
  const resultado = await pool.query(
    `INSERT INTO movimentacoes_estoque
     (tipo_movimentacao, quantidade, destino, observacao, id_doacao, id_usuario)
     VALUES ('Saída', $1, $2, $3, $4, $5)
     RETURNING *`,
    [quantidade, destino, observacao, id_doacao, id_usuario],
  );

  return resultado.rows[0];
};

module.exports = {
  listarEstoque,
  registrarSaida,
};
