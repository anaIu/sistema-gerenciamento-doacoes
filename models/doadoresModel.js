const pool = require("../database/connection");

// Lista todos os doadores
const listarDoadores = async () => {
  const resultado = await pool.query(
    `SELECT d.*, u.nome AS usuario_cadastro
     FROM doadores d
     JOIN usuarios u ON d.id_usuario_cadastro = u.id_usuario
     ORDER BY d.id_doador`,
  );

  return resultado.rows;
};

// Cadastra um novo doador
const cadastrarDoador = async (
  nome,
  telefone,
  email,
  observacao,
  id_usuario_cadastro,
) => {
  const resultado = await pool.query(
    `INSERT INTO doadores (nome, telefone, email, observacao, id_usuario_cadastro)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [nome, telefone, email, observacao, id_usuario_cadastro],
  );

  return resultado.rows[0];
};

// Edita um doador
const editarDoador = async (id, nome, telefone, email, observacao) => {
  const resultado = await pool.query(
    `UPDATE doadores SET nome = $1, telefone = $2, email = $3, observacao = $4
     WHERE id_doador = $5
     RETURNING *`,
    [nome, telefone, email, observacao, id],
  );
  return resultado.rows[0];
};

// Exclui um doador
const excluirDoador = async (id) => {
  const resultado = await pool.query(
    "DELETE FROM doadores WHERE id_doador = $1 RETURNING id_doador",
    [id],
  );
  return resultado.rows[0];
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
  editarDoador,
  excluirDoador,
};
