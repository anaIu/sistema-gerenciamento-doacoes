const pool = require("../database/connection");

// Lista todos os doadores da organização
const listarDoadores = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT d.*, u.nome AS usuario_cadastro
     FROM doadores d
     LEFT JOIN usuarios u ON d.id_usuario_cadastro = u.id_usuario
     WHERE d.id_organizacao = $1
     ORDER BY d.id_doador`,
    [id_organizacao],
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
  id_organizacao,
) => {
  const resultado = await pool.query(
    `INSERT INTO doadores (nome, telefone, email, observacao, id_usuario_cadastro, id_organizacao)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nome, telefone, email, observacao, id_usuario_cadastro, id_organizacao],
  );

  return resultado.rows[0];
};

// Edita um doador (apenas se pertencer à organização)
const editarDoador = async (id, nome, telefone, email, observacao, id_organizacao) => {
  const resultado = await pool.query(
    `UPDATE doadores
     SET nome = $1, telefone = $2, email = $3, observacao = $4
     WHERE id_doador = $5
       AND id_organizacao = $6
     RETURNING *`,
    [nome, telefone, email, observacao, id, id_organizacao],
  );
  return resultado.rows[0];
};

// Exclui um doador (apenas se pertencer à organização)
const excluirDoador = async (id, id_organizacao) => {
  const resultado = await pool.query(
    `DELETE FROM doadores
     WHERE id_doador = $1
       AND id_organizacao = $2
     RETURNING id_doador`,
    [id, id_organizacao],
  );
  return resultado.rows[0];
};

// Busca um doador por ID dentro da organização
const buscarDoadorPorId = async (id, id_organizacao) => {
  const resultado = await pool.query(
    `SELECT *
     FROM doadores
     WHERE id_doador = $1 AND id_organizacao = $2`,
    [id, id_organizacao],
  );
  return resultado.rows[0];
};

module.exports = {
  listarDoadores,
  cadastrarDoador,
  editarDoador,
  excluirDoador,
  buscarDoadorPorId,
};
