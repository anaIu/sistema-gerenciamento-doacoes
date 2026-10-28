-- Migração: Adição direta de id_organizacao em tabelas de domínio e criação de logs de auditoria
-- Aplicação idempotente (executável múltiplas vezes sem erro)

-- 1. Adicionar colunas diretas de organização
ALTER TABLE doadores
  ADD COLUMN IF NOT EXISTS id_organizacao INTEGER REFERENCES organizacoes(id_organizacao);

ALTER TABLE doacoes
  ADD COLUMN IF NOT EXISTS id_organizacao INTEGER REFERENCES organizacoes(id_organizacao);

ALTER TABLE movimentacoes_estoque
  ADD COLUMN IF NOT EXISTS id_organizacao INTEGER REFERENCES organizacoes(id_organizacao);

-- 1.1 Suporte a desativação de usuário (revogação de sessão confiável)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Backfill: preencher id_organizacao para registros legados que estavam vinculados apenas via id_usuario
UPDATE doadores d
SET id_organizacao = u.id_organizacao
FROM usuarios u
WHERE d.id_usuario_cadastro = u.id_usuario
  AND d.id_organizacao IS NULL;

UPDATE doacoes d
SET id_organizacao = u.id_organizacao
FROM usuarios u
WHERE d.id_usuario = u.id_usuario
  AND d.id_organizacao IS NULL;

UPDATE movimentacoes_estoque m
SET id_organizacao = u.id_organizacao
FROM usuarios u
WHERE m.id_usuario = u.id_usuario
  AND m.id_organizacao IS NULL;

-- 3. Criação de índices para performance de queries multi-tenant
CREATE INDEX IF NOT EXISTS idx_doadores_organizacao ON doadores(id_organizacao);
CREATE INDEX IF NOT EXISTS idx_doacoes_organizacao ON doacoes(id_organizacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_organizacao ON movimentacoes_estoque(id_organizacao);

-- 4. Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id_log SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario),
  id_organizacao INTEGER REFERENCES organizacoes(id_organizacao),
  acao VARCHAR(100) NOT NULL,
  ip VARCHAR(45),
  detalhes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_org ON logs_auditoria(id_organizacao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_data ON logs_auditoria(criado_em);

-- 5. Habilitação opcional de Row Level Security (RLS) no PostgreSQL / Supabase:
-- ALTER TABLE doadores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE doacoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;
