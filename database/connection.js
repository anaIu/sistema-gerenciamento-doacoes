// Importa o dotenv para permitir o uso das variáveis do arquivo .env
require("dotenv").config({ quiet: true });

// Importa o Pool da biblioteca pg, usado para conectar ao PostgreSQL
const { Pool } = require("pg");

// Determina a configuração de SSL com base no ambiente (A16)
const obterConfiguracaoSSL = () => {
  if (process.env.DATABASE_SSL === "false" || process.env.NODE_ENV === "test") {
    return false;
  }
  if (process.env.DATABASE_SSL === "true") {
    return { rejectUnauthorized: true };
  }
  if (process.env.NODE_ENV === "production") {
    return {
      rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED !== "false",
    };
  }
  return { rejectUnauthorized: false };
};

// Cria a conexão com o banco de dados
// A URL do banco ficará no arquivo .env, por segurança
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: obterConfiguracaoSSL(),
});

// Exporta a conexão para ser usada nos models
module.exports = pool;
