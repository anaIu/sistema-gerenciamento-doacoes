require("dotenv").config({ quiet: true });

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function limparDadosE2E() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const qUsuariosE2E =
      "SELECT id_usuario FROM usuarios WHERE email LIKE 'e2e.%@test.local'";

    const total = {
      movimentacoes: 0,
      doacoes: 0,
      doadores: 0,
      usuarios: 0,
      organizacoes: 0,
    };

    const resMov = await client.query(
      `DELETE FROM movimentacoes_estoque
       WHERE id_usuario IN (${qUsuariosE2E})
          OR id_doacao IN (
             SELECT id_doacao FROM doacoes
             WHERE id_usuario IN (${qUsuariosE2E})
                OR id_doador IN (
                   SELECT id_doador FROM doadores
                   WHERE email LIKE '%@test.local'
                      OR id_usuario_cadastro IN (${qUsuariosE2E})
                )
          )`,
    );
    total.movimentacoes = resMov.rowCount;

    const resDoacoes = await client.query(
      `DELETE FROM doacoes
       WHERE id_usuario IN (${qUsuariosE2E})
          OR id_doador IN (
             SELECT id_doador FROM doadores
             WHERE email LIKE '%@test.local'
                OR id_usuario_cadastro IN (${qUsuariosE2E})
          )`,
    );
    total.doacoes = resDoacoes.rowCount;

    const resDoadores = await client.query(
      `DELETE FROM doadores
       WHERE email LIKE '%@test.local'
          OR id_usuario_cadastro IN (${qUsuariosE2E})`,
    );
    total.doadores = resDoadores.rowCount;

    const resUsuarios = await client.query(
      `DELETE FROM usuarios WHERE email LIKE 'e2e.%@test.local'`,
    );
    total.usuarios = resUsuarios.rowCount;

    const resOrgs = await client.query(
      `DELETE FROM organizacoes
       WHERE nome LIKE 'E2E %' OR nome LIKE 'Org E2E %'`,
    );
    total.organizacoes = resOrgs.rowCount;

    await client.query("COMMIT");
    console.log("[e2e:cleanup] Dados de teste removidos:", JSON.stringify(total));
    return total;
  } catch (erro) {
    await client.query("ROLLBACK");
    console.error("[e2e:cleanup] Falha ao limpar dados de teste:", erro.message);
    throw erro;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  limparDadosE2E()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = limparDadosE2E;