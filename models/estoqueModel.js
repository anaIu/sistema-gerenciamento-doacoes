const pool = require("../database/connection");

// Lista movimentações do estoque da organização
const listarEstoque = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT 
        m.*,
        d.tipo AS tipo_doacao,
        u.nome AS usuario_responsavel
     FROM movimentacoes_estoque m
     JOIN doacoes d ON m.id_doacao = d.id_doacao
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     WHERE m.id_organizacao = $1
     ORDER BY m.id_movimentacao`,
    [id_organizacao],
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
  id_organizacao,
) => {
  const resultado = await pool.query(
    `INSERT INTO movimentacoes_estoque
     (tipo_movimentacao, quantidade, destino, observacao, id_doacao, id_usuario, id_organizacao)
     VALUES ('Saída', $1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [quantidade, destino, observacao, id_doacao, id_usuario, id_organizacao],
  );

  return resultado.rows[0];
};

// Busca doação e calcula saldo disponível dentro da organização
const buscarDoacaoComSaldo = async (id_doacao, id_organizacao) => {
  const resultado = await pool.query(
    `SELECT 
       d.id_doacao,
       d.tipo,
       d.quantidade,
       COALESCE(
         (SELECT SUM(m.quantidade)
          FROM movimentacoes_estoque m
          WHERE m.id_doacao = d.id_doacao
            AND m.tipo_movimentacao = 'Saída'), 0
       ) AS total_saidas
     FROM doacoes d
     WHERE d.id_doacao = $1 AND d.id_organizacao = $2`,
    [id_doacao, id_organizacao],
  );

  if (!resultado.rows[0]) return null;

  const row = resultado.rows[0];
  const saldo = (parseInt(row.quantidade, 10) || 0) - parseInt(row.total_saidas, 10);
  return {
    id_doacao: row.id_doacao,
    tipo: row.tipo,
    quantidade: row.quantidade,
    total_saidas: parseInt(row.total_saidas, 10),
    saldo,
  };
};

module.exports = {
  listarEstoque,
  registrarSaida,
  buscarDoacaoComSaldo,
};
