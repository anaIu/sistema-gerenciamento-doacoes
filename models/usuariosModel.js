const pool = require("../database/connection");
const bcrypt = require("bcrypt");

// Lista todos os usuários
const listarUsuarios = async () => {
  const resultado = await pool.query(
    "SELECT id_usuario, nome, email, perfil FROM usuarios ORDER BY id_usuario",
  );

  return resultado.rows;
};

// Cadastra um novo usuário com senha criptografada
const cadastrarUsuario = async (nome, email, senha, perfil) => {
  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const resultado = await pool.query(
    `INSERT INTO usuarios (nome, email, senha, perfil)
     VALUES ($1, $2, $3, $4)
     RETURNING id_usuario, nome, email, perfil`,
    [nome, email, senhaCriptografada, perfil],
  );

  return resultado.rows[0];
};

// Verifica se um e-mail já existe (exceto o próprio usuário na edição)
const buscarPorEmailParaValidar = async (email, ignorarId) => {
  const resultado = await pool.query(
    "SELECT id_usuario FROM usuarios WHERE email = $1 AND id_usuario <> $2",
    [email, ignorarId],
  );
  return resultado.rows[0];
};

// Edita um usuário (senha opcional: se informada, re-hash)
const editarUsuario = async (id, nome, email, perfil, senha) => {
  let resultado;
  if (senha) {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    resultado = await pool.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3, senha = $4
       WHERE id_usuario = $5
       RETURNING id_usuario, nome, email, perfil`,
      [nome, email, perfil, senhaCriptografada, id],
    );
  } else {
    resultado = await pool.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3
       WHERE id_usuario = $4
       RETURNING id_usuario, nome, email, perfil`,
      [nome, email, perfil, id],
    );
  }
  return resultado.rows[0];
};

// Exclui um usuário
const excluirUsuario = async (id) => {
  const resultado = await pool.query(
    "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario",
    [id],
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
