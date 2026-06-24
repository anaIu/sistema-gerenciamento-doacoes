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

module.exports = {
  listarUsuarios,
  cadastrarUsuario,
};
