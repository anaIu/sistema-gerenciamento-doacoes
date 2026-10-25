const pool = require("../database/connection");

const contarUsuarios = async (id_organizacao) => {
  const resultado = await pool.query(
    "SELECT COUNT(*) FROM usuarios WHERE id_organizacao = $1",
    [id_organizacao],
  );
  return parseInt(resultado.rows[0].count);
};

const contarDoadores = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT COUNT(*) FROM doadores d
     JOIN usuarios u ON d.id_usuario_cadastro = u.id_usuario
     WHERE u.id_organizacao = $1`,
    [id_organizacao],
  );
  return parseInt(resultado.rows[0].count);
};

const contarDoacoes = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT COUNT(*) FROM doacoes d
     JOIN usuarios u ON d.id_usuario = u.id_usuario
     WHERE u.id_organizacao = $1`,
    [id_organizacao],
  );
  return parseInt(resultado.rows[0].count);
};

const calcularSaldoEstoque = async (id_organizacao) => {
  const resultado = await pool.query(
    `
    SELECT
      COALESCE(
        (SELECT SUM(d.quantidade)
         FROM doacoes d
         JOIN usuarios u ON d.id_usuario = u.id_usuario
         WHERE d.tipo IN ('Alimento', 'Roupa', 'Brinquedo', 'Outro')
           AND u.id_organizacao = $1), 0
      )
      -
      COALESCE(
        (SELECT SUM(m.quantidade)
         FROM movimentacoes_estoque m
         JOIN usuarios u ON m.id_usuario = u.id_usuario
         WHERE m.tipo_movimentacao = 'Saída'
           AND u.id_organizacao = $1), 0
      ) AS saldo
  `,
    [id_organizacao],
  );
  return parseInt(resultado.rows[0].saldo);
};

const calcularTotalDinheiro = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT COALESCE(SUM(d.valor), 0) AS total
     FROM doacoes d
     JOIN usuarios u ON d.id_usuario = u.id_usuario
     WHERE d.tipo = 'Dinheiro'
       AND u.id_organizacao = $1`,
    [id_organizacao],
  );
  return parseFloat(resultado.rows[0].total);
};

const ultimasMovimentacoes = async (limite, id_organizacao) => {
  const resultado = await pool.query(
    `SELECT
        m.data_movimentacao,
        d.tipo AS tipo_doacao,
        m.observacao,
        u.nome AS usuario_responsavel
     FROM movimentacoes_estoque m
     JOIN doacoes d ON m.id_doacao = d.id_doacao
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     WHERE u.id_organizacao = $2
     ORDER BY m.data_movimentacao DESC
     LIMIT $1`,
    [limite, id_organizacao],
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
