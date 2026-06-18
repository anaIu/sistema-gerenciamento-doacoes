// Importa o dotenv para permitir o uso das variáveis do arquivo .env
require("dotenv").config();

// Importa o Pool da biblioteca pg, usado para conectar ao PostgreSQL
const { Pool } = require("pg");

// Cria a conexão com o banco de dados
// A URL do banco ficará no arquivo .env, por segurança
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exporta a conexão para ser usada nos models
module.exports = pool;