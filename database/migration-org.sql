-- ============================================================
-- Migração: Multi-tenant (organizações) — Supabase SQL Editor
-- ============================================================
-- Como usar:
--   1. Abra o projeto no Supabase
--   2. Acesse: SQL Editor
--   3. Cole este script inteiro e clique em "Run"
-- O script é IDEMPOTENTE: pode ser executado mais de uma vez.
-- Faz o mesmo que database/schema.sql + database/seed.js (parte da org).
-- ============================================================

-- 1) Tabela de organizações
CREATE TABLE IF NOT EXISTS organizacoes (
  id_organizacao SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Colunas novas em usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS id_organizacao INTEGER REFERENCES organizacoes(id_organizacao),
  ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

-- 3) Índice para consultas por organização
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacao ON usuarios(id_organizacao);

-- 4) Backfill: administrador(s) existente(s) ganham uma organização padrão
INSERT INTO organizacoes (nome, cnpj)
SELECT 'Organização Padrão', '00.000.000/0001-00'
WHERE NOT EXISTS (SELECT 1 FROM organizacoes);

UPDATE usuarios SET id_organizacao = (SELECT MIN(id_organizacao) FROM organizacoes)
WHERE id_organizacao IS NULL;

-- ============================================================
-- Verificações (rodar depois):
--
--   SELECT * FROM organizacoes;
--   SELECT id_usuario, email, perfil, id_organizacao FROM usuarios;
--   SELECT column_name FROM information_schema.columns
--     WHERE table_name = 'usuarios' ORDER BY ordinal_position;
-- ============================================================

-- ============================================================
-- ROLLBACK (apenas em caso de necessidade — rodar separadamente):
--
--   ALTER TABLE usuarios
--     DROP COLUMN IF EXISTS id_organizacao,
--     DROP COLUMN IF EXISTS cpf,
--     DROP COLUMN IF EXISTS telefone;
--   DROP TABLE IF EXISTS organizacoes;
-- ============================================================