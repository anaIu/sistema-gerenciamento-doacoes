const pool = require("../database/connection");

// Registra um evento de auditoria no sistema
const registrarLog = async ({ id_usuario, id_organizacao, acao, ip, detalhes }) => {
  try {
    const resultado = await pool.query(
      `INSERT INTO logs_auditoria (id_usuario, id_organizacao, acao, ip, detalhes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_usuario || null, id_organizacao || null, acao, ip || null, detalhes || null],
    );
    return resultado.rows[0];
  } catch (error) {
    // Falha ao gravar log não interrompe a operação principal
    console.error("Falha ao registrar log de auditoria:", error.message);
    return null;
  }
};

// Lista logs de auditoria por organização
const listarLogs = async (id_organizacao, limite = 100) => {
  const resultado = await pool.query(
    `SELECT l.*, u.nome AS nome_usuario, u.email AS email_usuario
     FROM logs_auditoria l
     LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
     WHERE l.id_organizacao = $1
     ORDER BY l.criado_em DESC
     LIMIT $2`,
    [id_organizacao, limite],
  );
  return resultado.rows;
};

module.exports = {
  registrarLog,
  listarLogs,
};
