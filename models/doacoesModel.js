const pool = require("../database/connection");

// Lista todas as doações da organização
const listarDoacoes = async (id_organizacao) => {
  const resultado = await pool.query(
    `SELECT 
        doacoes.*,
        doadores.nome AS nome_doador,
        usuarios.nome AS usuario_registro
     FROM doacoes
     LEFT JOIN doadores ON doacoes.id_doador = doadores.id_doador
     JOIN usuarios ON doacoes.id_usuario = usuarios.id_usuario
     WHERE doacoes.id_organizacao = $1
     ORDER BY doacoes.id_doacao`,
    [id_organizacao],
  );

  return resultado.rows;
};

// Cadastra uma nova doação
const cadastrarDoacao = async (tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario, id_organizacao) => {
  const resultado = await pool.query(
    `INSERT INTO doacoes 
     (tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario, id_organizacao)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario, id_organizacao]
  );

  return resultado.rows[0];
};

// Edita uma doação (apenas se pertencer à organização)
const editarDoacao = async (
  id,
  tipo,
  quantidade,
  valor,
  observacao,
  id_doador,
  id_organizacao,
) => {
  const resultado = await pool.query(
    `UPDATE doacoes
     SET tipo = $1, quantidade = $2, valor = $3, observacao = $4, id_doador = $5
     WHERE id_doacao = $6
       AND id_organizacao = $7
     RETURNING *`,
    [tipo, quantidade, valor, observacao, id_doador, id, id_organizacao],
  );
  return resultado.rows[0];
};

// Exclui uma doação (apenas se pertencer à organização)
const excluirDoacao = async (id, id_organizacao) => {
  const resultado = await pool.query(
    `DELETE FROM doacoes
     WHERE id_doacao = $1
       AND id_organizacao = $2
     RETURNING id_doacao`,
    [id, id_organizacao],
  );
  return resultado.rows[0];
};

// Busca uma doação por ID dentro da organização
const buscarDoacaoPorId = async (id, id_organizacao) => {
  const resultado = await pool.query(
    `SELECT *
     FROM doacoes
     WHERE id_doacao = $1 AND id_organizacao = $2`,
    [id, id_organizacao],
  );
  return resultado.rows[0];
};

module.exports = {
  listarDoacoes,
  cadastrarDoacao,
  editarDoacao,
  excluirDoacao,
  buscarDoacaoPorId,
};