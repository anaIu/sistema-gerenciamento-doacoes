const pool = require("../database/connection");
const bcrypt = require("bcrypt");

// Lista usuários conforme o escopo (admin vê a organização; funcionário vê a própria conta)
const listarUsuarios = async (usuario) => {
  let resultado;
  if (usuario.perfil === "Administrador") {
    resultado = await pool.query(
      `SELECT id_usuario, nome, email, perfil
       FROM usuarios
       WHERE id_organizacao = $1
       ORDER BY id_usuario`,
      [usuario.id_organizacao],
    );
  } else {
    resultado = await pool.query(
      `SELECT id_usuario, nome, email, perfil
       FROM usuarios
       WHERE id_usuario = $1`,
      [usuario.id],
    );
  }
  return resultado.rows;
};

// Cadastra um novo usuário com senha criptografada e vínculo com a organização
const cadastrarUsuario = async (nome, email, senha, perfil, idOrganizacao) => {
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const resultado = await pool.query(
    `INSERT INTO usuarios (nome, email, senha, perfil, id_organizacao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario, nome, email, perfil`,
    [nome, email, senhaCriptografada, perfil, idOrganizacao],
  );

  return resultado.rows[0];
};

// Verifica se um e-mail já existe (ignora o próprio usuário na edição)
const buscarPorEmailParaValidar = async (email, ignorarId) => {
  const resultado = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE email = $1 AND id_usuario <> COALESCE($2, -1)",
    [email, ignorarId],
  );
  return resultado.rows[0];
};

// Edita um usuário (senha opcional: se informada, re-hash) — apenas dentro da organização
const editarUsuario = async (id, nome, email, perfil, senha, idOrganizacao) => {
  let resultado;
  if (senha) {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    resultado = await pool.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3, senha = $4
       WHERE id_usuario = $5 AND id_organizacao = $6
       RETURNING id_usuario, nome, email, perfil`,
      [nome, email, perfil, senhaCriptografada, id, idOrganizacao],
    );
  } else {
    resultado = await pool.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3
       WHERE id_usuario = $4 AND id_organizacao = $5
       RETURNING id_usuario, nome, email, perfil`,
      [nome, email, perfil, id, idOrganizacao],
    );
  }
  return resultado.rows[0];
};

// Exclui um usuário — apenas dentro da organização
const excluirUsuario = async (id, idOrganizacao) => {
  const resultado = await pool.query(
    "DELETE FROM usuarios WHERE id_usuario = $1 AND id_organizacao = $2 RETURNING id_usuario",
    [id, idOrganizacao],
  );
  return resultado.rows[0];
};

module.exports = {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario,
  buscarPorEmailParaValidar,
};