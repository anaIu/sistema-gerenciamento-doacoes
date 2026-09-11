-- Cria as tabelas do sistema (idempotente)

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS doadores (
  id_doador SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  observacao TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario_cadastro INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS doacoes (
  id_doacao SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  quantidade INTEGER,
  valor DECIMAL(10,2),
  data_doacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacao TEXT,
  id_doador INTEGER REFERENCES doadores(id_doador),
  id_usuario INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id_movimentacao SERIAL PRIMARY KEY,
  tipo_movimentacao VARCHAR(20) NOT NULL,
  quantidade INTEGER NOT NULL,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  destino VARCHAR(255),
  observacao TEXT,
  id_doacao INTEGER REFERENCES doacoes(id_doacao),
  id_usuario INTEGER REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS organizacoes (
  id_organizacao SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS id_organizacao INTEGER REFERENCES organizacoes(id_organizacao),
  ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_usuarios_organizacao ON usuarios(id_organizacao);