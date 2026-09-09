const pool = require("../database/connection");

const contarUsuarios = async () => {
  const resultado = await pool.query("SELECT COUNT(*) FROM usuarios");
  return parseInt(resultado.rows[0].count);
};

const contarDoadores = async () => {
  const resultado = await pool.query("SELECT COUNT(*) FROM doadores");
  return parseInt(resultado.rows[0].count);
};

const contarDoacoes = async () => {
  const resultado = await pool.query("SELECT COUNT(*) FROM doacoes");
  return parseInt(resultado.rows[0].count);
};

const calcularSaldoEstoque = async () => {
  const resultado = await pool.query(`
    SELECT
      COALESCE(
        (SELECT SUM(quantidade) FROM doacoes
         WHERE tipo IN ('Alimento', 'Roupa', 'Brinquedo', 'Outro')), 0
      )
      -
      COALESCE(
        (SELECT SUM(quantidade) FROM movimentacoes_estoque
         WHERE tipo_movimentacao = 'Saída'), 0
      ) AS saldo
  `);
  return parseInt(resultado.rows[0].saldo);
};

const calcularTotalDinheiro = async () => {
  const resultado = await pool.query(
    "SELECT COALESCE(SUM(valor), 0) AS total FROM doacoes WHERE tipo = 'Dinheiro'"
  );
  return parseFloat(resultado.rows[0].total);
};

const ultimasMovimentacoes = async (limite) => {
  const resultado = await pool.query(
    `SELECT
        m.data_movimentacao,
        d.tipo AS tipo_doacao,
        m.observacao,
        u.nome AS usuario_responsavel
     FROM movimentacoes_estoque m
     JOIN doacoes d ON m.id_doacao = d.id_doacao
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     ORDER BY m.data_movimentacao DESC
     LIMIT $1`,
    [limite]
  );
  return resultado.rows;
};

module.exports = {
  contarUsuarios,
  contarDoadores,
  contarDoacoes,
  calcularSaldoEstoque,
  calcularTotalDinheiro,
  ultimasMovimentacoes,
};
