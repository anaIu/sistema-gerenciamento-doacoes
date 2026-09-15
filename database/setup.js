const fs = require("fs");
const path = require("path");
const pool = require("./connection");
const { seedAdmin } = require("./seed");

const aplicarSchema = async () => {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Schema aplicado.");
};

const main = async () => {
  try {
    await aplicarSchema();
    await seedAdmin();
  } catch (erro) {
    console.error("Falha na configuração do banco:", erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

main();