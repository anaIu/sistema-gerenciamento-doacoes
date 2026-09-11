const bcrypt = require("bcrypt");
const pool = require("./connection");

const seedAdmin = async () => {
  const nome = process.env.ADMIN_NOME || "Administrador";
  const email = process.env.ADMIN_EMAIL || "admin@doegestao.local";
  const senha = process.env.ADMIN_SENHA || "admin123";
  const orgNome = process.env.ADMIN_ORG_NOME || "Organização Padrão";
  const orgCnpj = process.env.ADMIN_ORG_CNPJ || "00.000.000/0001-00";

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Garante que existe ao menos uma organização padrão
    await client.query(
      `INSERT INTO organizacoes (nome, cnpj)
       VALUES ($1, $2)
       ON CONFLICT (cnpj) DO NOTHING`,
      [orgNome, orgCnpj],
    );

    const org = await client.query(
      "SELECT id_organizacao FROM organizacoes WHERE cnpj = $1",
      [orgCnpj],
    );
    const idOrganizacao = org.rows[0].id_organizacao;

    // Backfill: usuários sem organização apontam para a padrão
    await client.query(
      "UPDATE usuarios SET id_organizacao = $1 WHERE id_organizacao IS NULL",
      [idOrganizacao],
    );

    const existente = await client.query(
      "SELECT id_usuario FROM usuarios WHERE email = $1",
      [email],
    );

    if (existente.rows.length > 0) {
      console.log(`Admin já existe (${email}). Nada a fazer.`);
      await client.query("COMMIT");
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await client.query(
      `INSERT INTO usuarios (nome, email, senha, perfil, id_organizacao)
       VALUES ($1, $2, $3, 'Administrador', $4)`,
      [nome, email, senhaHash, idOrganizacao],
    );

    await client.query("COMMIT");
    console.log(`Admin criado: ${email}`);
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally {
    client.release();
  }
};

module.exports = { seedAdmin };