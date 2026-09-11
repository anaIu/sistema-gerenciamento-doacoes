# Sistema Interno de Gerenciamento de Doações (DoeGestão)

Sistema web interno para instituições gerenciarem doadores, doações, usuários e movimentações de estoque. Projeto acadêmico da **FAG - Centro Universitário Assis Gurgacz**.

## Tecnologias

- **Backend:** Node.js + Express (CommonJS)
- **Banco:** PostgreSQL (via `pg` com `Pool`; suporte a Supabase)
- **Frontend:** HTML + CSS + JavaScript vanilla
- **Autenticação:** JWT (`jsonwebtoken`) + `bcrypt` (salt rounds = 10)
- **Segurança:** `helmet` (CSP), `cors`, `express-rate-limit`, honeypot anti-bot
- **Qualidade:** Jest + Supertest (unitários/integração), Playwright (E2E), GitHub Actions (CI)

## Estrutura do Projeto

```
sistema-gerenciamento-doacoes/
├── server.js              # Inicia o servidor (lê app.js)
├── app.js                 # Configura Express, helmet, cors, JSON, estáticos e rotas
├── database/              # connection, schema.sql, migration-org.sql, setup.js, seed.js
├── models/                # Queries SQL (7 arquivos)
├── controllers/           # Lógica de negócio (7 arquivos)
├── routes/                # Endpoints REST (9 arquivos)
├── middleware/            # auth, autorizacao, honeypot, rateLimit
├── utils/                 # validacoes.js (e-mail, senha, CPF, CNPJ)
├── public/                # Frontend (10 páginas HTML + css + js)
├── __tests__/             # Testes unitários/integração (Jest + Supertest)
├── e2e/                   # Testes E2E (Playwright) + cleanup
├── .github/workflows/     # ci.yml (unitários + E2E)
├── PROEX/                 # Documentação acadêmica (gitignored)
├── .env.example           # Exemplo de variáveis de ambiente
└── package.json
```

## Executando localmente

Pré-requisitos: **Node.js 22+** e **PostgreSQL** (ou um projeto Supabase).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
#   Linux/macOS:   cp .env.example .env
#   Windows:       copy .env.example .env
#   Preencha DATABASE_URL e JWT_SECRET (no mínimo).

# 3. Criar o schema e o admin inicial (idempotente)
npm run db:setup

# 4. Subir o servidor
npm start
```

O `db:setup` aplica o `schema.sql` (idempotente) e o `seed.js`, que garante uma organização padrão e cria o admin inicial com e-mail/senha definidos em `.env` (padrão do seed:

| Variável | Padrão |
|----------|--------|
| `ADMIN_EMAIL` | `admin@doegestao.local` |
| `ADMIN_SENHA` | `admin123` |
| `ADMIN_ORG_NOME` | `Organização Padrão` |

> Altere as credenciais do admin antes do primeiro `db:setup` em produção.

## Testes

```bash
npm test                  # Unitários + integração (Jest)
npm run test:coverage     # Com relatório de cobertura
npm run test:e2e          # E2E (Playwright) — requer: npx playwright install chromium
npm run test:e2e:cleanup  # Remove manualmente dados de teste E2E do banco
```

Os testes E2E sobem o servidor com `NODE_ENV=test` (o que desativa o rate limit de `/registro`), criam dados com marcadores próprios (`E2E %`, `e2e.*@test.local`, `%@test.local`) e os removem automaticamente ao final (`e2e/cleanup.js` via `globalTeardown`).

## CI/CD

O workflow `.github/workflows/ci.yml` roda em push para `main`/`develop` e em PRs para `main`:

1. **Job `unit`** — `npm ci` + `npm test`.
2. **Job `e2e`** — sobe um **PostgreSQL efêmero** (service container), instala o Chromium e roda `npm run test:e2e`; publica o relatório como artefato (`playwright-report/`).

O pipeline **não exige repository secrets**: o banco do CI é descartável e o `JWT_SECRET` é apenas um valor fixo de teste. Para **deploy** em produção, seria necessário adicionar secrets (ver `PLANO_DESENVOLVIMENTO.md`, Fase 7).

## Endpoints

Todas as rotas de dados exigem o header `Authorization: Bearer <token>` (token obtido em `/login` ou `/registro`, válido por 1h). Perfis: `Administrador` e `Funcionario`.

| Método | Rota | Acesso | Descrição / corpo |
|--------|------|--------|-------------------|
| `POST` | `/login` | Público (rate limit: 10/15min) | `{ email, senha }` → `{ token, usuario }` |
| `POST` | `/registro` | Público (honeypot + rate limit: 5/15min) | `{ nome_organizacao, cnpj, nome, email, cpf, telefone, senha, confirmar_senha }` → `{ mensagem, token, usuario }` |
| `GET` | `/perfil` | Autenticado | Dados do usuário logado + organização |
| `PUT` | `/perfil` | Autenticado | `{ nome, email, cpf, telefone }` |
| `GET` | `/usuarios` | Autenticado | Lista usuários da organização |
| `POST` | `/usuarios` | Admin | `{ nome, email, senha, perfil }` |
| `PUT` | `/usuarios/:id` | Admin | `{ nome, email, senha?, perfil }` |
| `DELETE` | `/usuarios/:id` | Admin | Exclui usuário (protege a própria conta e registros vinculados) |
| `GET` | `/doadores` | Autenticado | Lista doadores |
| `POST` | `/doadores` | Autenticado | `{ nome, telefone, email, observacao, id_usuario_cadastro }` |
| `PUT` | `/doadores/:id` | Autenticado | `{ nome, telefone, email, observacao }` |
| `DELETE` | `/doadores/:id` | Autenticado | Exclui (bloqueado se houver doações vinculadas) |
| `GET` | `/doacoes` | Autenticado | Lista doações (com nomes do doador e usuário) |
| `POST` | `/doacoes` | Autenticado | `{ tipo, quantidade, valor, data_doacao, observacao, id_doador, id_usuario }` |
| `PUT` | `/doacoes/:id` | Autenticado | `{ tipo, quantidade, valor, observacao, id_doador }` |
| `DELETE` | `/doacoes/:id` | Autenticado | Exclui (bloqueado se houver movimentações vinculadas) |
| `GET` | `/estoque` | Autenticado | Lista movimentações do estoque |
| `POST` | `/estoque/saida` | Autenticado | `{ quantidade, destino, observacao, id_doacao, id_usuario }` |
| `GET` | `/historico` | Autenticado | Histórico de movimentações (mais recentes primeiro) |
| `GET` | `/dashboard` | Autenticado | Resumo: `{ usuarios, doadores, doacoes, saldoEstoque, totalDinheiro, movimentacoes }` |

Formato de respostas: sucesso em lista retorna array; cadastros retornam `201` com `{ mensagem, recurso }`; autenticação ausente/vencida retorna `401`; perfil sem permissão `403`; validação `400`; erro interno `500`.

## Segurança

- Senhas com `bcrypt` (10 rounds), nunca armazenadas em texto puro.
- JWT assinado com `JWT_SECRET`, expiração de 1h, payload `{ id, perfil, id_organizacao }`.
- Queries SQL **parametrizadas** (`$1`, `$2`, ...) contra injeção.
- `helmet` com CSP (`script-src 'self'`; eventos inline permitidos).
- Rate limit de login (10/15min) e registro (5/15min) por IP; honeypot no registro.
- Validação de e-mail, senha (mín. 8 caracteres), CPF e CNPJ no backend (`utils/validacoes.js`).
- Regras de negócio aplicadas: dinheiro exige `valor`; itens exigem `quantidade`; exclusões bloqueadas quando há registro vinculado (FK).

## Regras de Negócio

1. Apenas usuários internos acessam o sistema (doador não tem acesso direto).
2. Toda doação possui data, tipo e quantidade **ou** valor.
3. Doação de dinheiro exige valor; doação de item físico exige quantidade.
4. Saída de itens não ultrapassa a quantidade disponível.
5. Histórico de doações e movimentações mantido para consulta.
6. Exclusão de registros importantes requer confirmação e é bloqueada se houver vínculos.

## Autores

- Ana Flávia Lunedo
- Isabela Carbonera Branco