const pool = require("../database/connection");

const buscarPorEmail = async (email) => {
  const resultado = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1",
    [email]
  );
  return resultado.rows[0];
};

module.exports = { buscarPorEmail };
