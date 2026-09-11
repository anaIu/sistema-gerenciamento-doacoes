const pool = require("../database/connection");
const bcrypt = require("bcrypt");

const buscarPorEmail = async (email) => {
  const resultado = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1",
    [email]
  );
  return resultado.rows[0];
};

const registrarOrganizacao = async ({
  nomeOrganizacao,
  cnpj,
  nome,
  email,
  cpf,
  telefone,
  senha,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const org = await client.query(
      `INSERT INTO organizacoes (nome, cnpj)
       VALUES ($1, $2)
       RETURNING id_organizacao`,
      [nomeOrganizacao, cnpj],
    );
    const idOrganizacao = org.rows[0].id_organizacao;

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await client.query(
      `INSERT INTO usuarios (nome, email, senha, perfil, id_organizacao, cpf, telefone)
       VALUES ($1, $2, $3, 'Administrador', $4, $5, $6)
       RETURNING id_usuario, nome, email, perfil, id_organizacao, cpf, telefone`,
      [nome, email, senhaCriptografada, idOrganizacao, cpf || null, telefone || null],
    );

    await client.query("COMMIT");
    return usuario.rows[0];
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally {
    client.release();
  }
};

const buscarPerfil = async (id) => {
  const resultado = await pool.query(
    `SELECT
        u.id_usuario, u.nome, u.email, u.cpf, u.telefone, u.perfil,
        o.id_organizacao, o.nome AS nome_organizacao, o.cnpj,
        o.data_cadastro AS data_cadastro_org
     FROM usuarios u
     JOIN organizacoes o ON u.id_organizacao = o.id_organizacao
     WHERE u.id_usuario = $1`,
    [id],
  );
  return resultado.rows[0];
};

const editarPerfil = async (id, { nome, email, cpf, telefone }) => {
  const resultado = await pool.query(
    `UPDATE usuarios
     SET nome = $1, email = $2, cpf = $3, telefone = $4
     WHERE id_usuario = $5
     RETURNING id_usuario, nome, email, cpf, telefone, perfil`,
    [nome, email, cpf || null, telefone || null, id],
  );
  return resultado.rows[0];
};

module.exports = { buscarPorEmail, registrarOrganizacao, buscarPerfil, editarPerfil };