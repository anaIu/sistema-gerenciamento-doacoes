const pool = require("../database/connection");

// Lista todas as doações
const listarDoacoes = async () => {
  const resultado = await pool.query(
    `SELECT 
        doacoes.*,
        doadores.nome AS nome_doador,
        usuarios.nome AS usuario_registro
     FROM doacoes
     JOIN doadores ON doacoes.id_doador = doadores.id_doador
     JOIN usuarios ON doacoes.id_usuario = usuarios.id_usuario
     ORDER BY doacoes.id_doacao`
  );

  return resultado.rows;
};

// Cadastra uma nova doação
const cadastrarDoacao = async (tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario) => {
  const resultado = await pool.query(
    `INSERT INTO doacoes 
     (tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario]
  );

  return resultado.rows[0];
};

// Edita uma doação
const editarDoacao = async (id, tipo, quantidade, valor, observacao, id_doador) => {
  const resultado = await pool.query(
    `UPDATE doacoes SET tipo = $1, quantidade = $2, valor = $3, observacao = $4, id_doador = $5
     WHERE id_doacao = $6
     RETURNING *`,
    [tipo, quantidade, valor, observacao, id_doador, id],
  );
  return resultado.rows[0];
};

// Exclui uma doação
const excluirDoacao = async (id) => {
  const resultado = await pool.query(
    "DELETE FROM doacoes WHERE id_doacao = $1 RETURNING id_doacao",
    [id],
  );
  return resultado.rows[0];
};

module.exports = {
  listarDoacoes,
  cadastrarDoacao,
  editarDoacao,
  excluirDoacao,
};