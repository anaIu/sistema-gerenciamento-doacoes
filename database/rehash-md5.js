/**
 * Script de Auditoria e Migração de Hashes Legados (MD5 -> bcrypt)
 * Uso: node database/rehash-md5.js
 */

require("dotenv").config();
const pool = require("./connection");

async function auditarHashes() {
  console.log("Iniciando auditoria de senhas no banco de dados...");

  try {
    const res = await pool.query(
      `SELECT id_usuario, nome, email, senha
       FROM usuarios
       ORDER BY id_usuario`
    );

    const usuarios = res.rows;
    let totalBcrypt = 0;
    let totalLegado = 0;

    for (const u of usuarios) {
      const ehBcrypt = u.senha && u.senha.startsWith("$2");
      if (ehBcrypt) {
        totalBcrypt++;
      } else {
        totalLegado++;
        console.warn(`[ALERTA] Usuário ID ${u.id_usuario} (${u.email}) possui hash legado (não-bcrypt).`);
      }
    }

    console.log("-----------------------------------------");
    console.log(`Total de usuários analisados: ${usuarios.length}`);
    console.log(`Usuários com bcrypt ($2...):  ${totalBcrypt}`);
    console.log(`Usuários com hash legado:     ${totalLegado}`);
    console.log("-----------------------------------------");

    if (totalLegado > 0) {
      console.log(
        "Nota: O sistema realiza o upgrade automático e transparente para bcrypt no momento do login dos usuários com hash legado."
      );
    } else {
      console.log("Sucesso: Todas as senhas cadastradas já utilizam hash bcrypt!");
    }
  } catch (error) {
    console.error("Erro ao auditar hashes de senhas:", error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  auditarHashes();
}

module.exports = { auditarHashes };
