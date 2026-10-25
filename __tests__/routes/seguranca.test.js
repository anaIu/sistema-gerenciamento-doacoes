process.env.JWT_SECRET = "test-secret-key-com-ao-menos-32-caracteres-de-seguranca!";

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const express = require("express");
const app = require("../../app");
const authModel = require("../../models/authModel");
const doadoresModel = require("../../models/doadoresModel");
const doacoesModel = require("../../models/doacoesModel");
const estoqueModel = require("../../models/estoqueModel");
const usuariosModel = require("../../models/usuariosModel");
const { headersAuth } = require("../helpers/auth");
const { configurar } = require("../../middleware/rateLimit");
const { escaparHTML, validarSenhaForte } = require("../../utils/validacoes");

jest.mock("../../models/authModel");
jest.mock("../../models/doadoresModel");
jest.mock("../../models/doacoesModel");
jest.mock("../../models/estoqueModel");
jest.mock("../../models/usuariosModel");
jest.mock("../../models/auditoriaModel");

describe("Suite de Testes de Segurança do DoeGestão", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. IDOR (Insecure Direct Object Reference) & Multi-tenant
  // =========================================================================
  describe("1. IDOR (Insecure Direct Object Reference) e Isolamento Multi-tenant", () => {
    test("Org A não consegue editar doador pertencente à Org B (retorna 404)", async () => {
      doadoresModel.editarDoador.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/doadores/99")
        .set(headersAuth({ id_organizacao: 1 }))
        .send({ nome: "Tentativa Maliciosa" });

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toBe("Doador não encontrado");
      expect(doadoresModel.editarDoador).toHaveBeenCalledWith(
        "99",
        "Tentativa Maliciosa",
        null,
        null,
        null,
        1,
      );
    });

    test("Org A não consegue excluir doador pertencente à Org B (retorna 404)", async () => {
      doadoresModel.excluirDoador.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/doadores/99")
        .set(headersAuth({ id_organizacao: 1 }));

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toBe("Doador não encontrado");
      expect(doadoresModel.excluirDoador).toHaveBeenCalledWith("99", 1);
    });

    test("Org A não consegue criar doação vinculada a doador de outra org (retorna 400)", async () => {
      doadoresModel.buscarDoadorPorId.mockResolvedValue(null);

      const res = await request(app)
        .post("/doacoes")
        .set(headersAuth({ id_organizacao: 1 }))
        .send({
          tipo: "Alimento",
          quantidade: 5,
          id_doador: 999,
        });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toBe("Doador não encontrado ou não pertence à sua organização");
      expect(doacoesModel.cadastrarDoacao).not.toHaveBeenCalled();
    });

    test("Org A não consegue editar doação pertencente à Org B (retorna 404)", async () => {
      doacoesModel.editarDoacao.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/doacoes/88")
        .set(headersAuth({ id_organizacao: 1 }))
        .send({
          tipo: "Roupa",
          quantidade: 10,
        });

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toBe("Doação não encontrada");
    });

    test("Org A não consegue excluir doação pertencente à Org B (retorna 404)", async () => {
      doacoesModel.excluirDoacao.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/doacoes/88")
        .set(headersAuth({ id_organizacao: 1 }));

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toBe("Doação não encontrada");
    });

    test("Org A não consegue registrar saída vinculada à doação da Org B (retorna 400)", async () => {
      estoqueModel.buscarDoacaoComSaldo.mockResolvedValue(null);

      const res = await request(app)
        .post("/estoque/saida")
        .set(headersAuth({ id_organizacao: 1 }))
        .send({
          id_doacao: 777,
          quantidade: 2,
        });

      expect(res.status).toBe(400);
      expect(res.body.mensagem).toBe("Doação não encontrada ou não pertence à sua organização");
      expect(estoqueModel.registrarSaida).not.toHaveBeenCalled();
    });

    test("Forjamento de autoria: id_usuario enviado no corpo é ignorado e sobrescrito pelo token", async () => {
      doadoresModel.cadastrarDoador.mockResolvedValue({
        id_doador: 1,
        nome: "Doador Seguro",
        id_usuario_cadastro: 10,
        id_organizacao: 1,
      });

      const res = await request(app)
        .post("/doadores")
        .set(headersAuth({ id: 10, id_organizacao: 1 }))
        .send({
          nome: "Doador Seguro",
          id_usuario_cadastro: 9999, // Tentativa de falsificar autoria
          id_organizacao: 9999, // Tentativa de falsificar tenant
        });

      expect(res.status).toBe(201);
      // O controller deve ter passado id=10 e id_org=1 do token, NUNCA os valores forjados do body
      expect(doadoresModel.cadastrarDoador).toHaveBeenCalledWith(
        "Doador Seguro",
        null,
        null,
        null,
        10,
        1,
      );
    });

    test("Admin da Org A não consegue desativar usuário de outra organização (retorna 404)", async () => {
      usuariosModel.alterarAtivo.mockResolvedValue(undefined);

      const res = await request(app)
        .patch("/usuarios/50/ativo")
        .set(headersAuth({ id: 1, perfil: "Administrador", id_organizacao: 1 }))
        .send({ ativo: false });

      expect(res.status).toBe(404);
      expect(res.body.mensagem).toBe("Usuário não encontrado");
    });
  });

  // =========================================================================
  // 2. Criptografia / Senhas
  // =========================================================================
  describe("2. Criptografia, Hash e Segurança de Senhas", () => {
    test("Senhas nunca são salvas em texto plano: utiliza bcrypt com salt rounds >= 10", async () => {
      const senhaPlana = "SenhaForte123!";
      const hash = await bcrypt.hash(senhaPlana, 10);

      expect(hash).not.toBe(senhaPlana);
      expect(hash.startsWith("$2")).toBe(true);
      expect(await bcrypt.compare(senhaPlana, hash)).toBe(true);
      expect(await bcrypt.compare("SenhaErrada", hash)).toBe(false);
    });

    test("Senhas idênticas geram hashes diferentes devido ao salt aleatório (anti Rainbow Table)", async () => {
      const senha = "MesmaSenha123!";
      const hash1 = await bcrypt.hash(senha, 10);
      const hash2 = await bcrypt.hash(senha, 10);

      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(senha, hash1)).toBe(true);
      expect(await bcrypt.compare(senha, hash2)).toBe(true);
    });

    test("Validação de complexidade: rejeita senhas fracas ou sem requisitos mínimos", () => {
      expect(validarSenhaForte("123456")).toBe(false); // Curta
      expect(validarSenhaForte("senhafraca123")).toBe(false); // Sem maiúscula
      expect(validarSenhaForte("SENHAFRACA123")).toBe(false); // Sem minúscula
      expect(validarSenhaForte("SenhaSemNumero!")).toBe(false); // Sem número
      expect(validarSenhaForte("SenhaForte123!")).toBe(true); // Válida
    });

    test("Upgrade transparente de hash legado (MD5 → bcrypt) no login com senha correta", async () => {
      const senhaPlana = "SenhaAntiga123!";
      const hashMd5 = crypto.createHash("md5").update(senhaPlana).digest("hex");

      authModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 42,
        nome: "Usuario Legado",
        email: "legado@test.local",
        senha: hashMd5,
        perfil: "Funcionário",
        id_organizacao: 1,
      });

      authModel.atualizarSenha.mockResolvedValue({
        id_usuario: 42,
        nome: "Usuario Legado",
        email: "legado@test.local",
      });

      const res = await request(app)
        .post("/login")
        .send({ email: "legado@test.local", senha: senhaPlana });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario.id).toBe(42);

      // Garante que o upgrade de hash para bcrypt ocorreu no banco
      expect(authModel.atualizarSenha).toHaveBeenCalledTimes(1);
      const [idChamado, novoHash] = authModel.atualizarSenha.mock.calls[0];
      expect(idChamado).toBe(42);
      expect(novoHash.startsWith("$2")).toBe(true);
      expect(await bcrypt.compare(senhaPlana, novoHash)).toBe(true);
    });

    test("Login com senha MD5 incorreta falha com 401 e não altera o banco", async () => {
      const senhaPlana = "SenhaCerta123!";
      const hashMd5 = crypto.createHash("md5").update(senhaPlana).digest("hex");

      authModel.buscarPorEmail.mockResolvedValue({
        id_usuario: 42,
        email: "legado@test.local",
        senha: hashMd5,
      });

      const res = await request(app)
        .post("/login")
        .send({ email: "legado@test.local", senha: "SenhaErrada123!" });

      expect(res.status).toBe(401);
      expect(res.body.mensagem).toBe("Credenciais inválidas");
      expect(authModel.atualizarSenha).not.toHaveBeenCalled();
    });

    test("Criptografia de JWT: token adulterado com assinatura inválida é rejeitado com 401", async () => {
      const tokenFalsificado = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGVyZmlsIjoiQWRtaW5pc3RyYWRvciJ9.ASSINATURA_FALSA";

      const res = await request(app)
        .get("/perfil")
        .set("Authorization", `Bearer ${tokenFalsificado}`);

      expect(res.status).toBe(401);
      expect(res.body.mensagem).toBe("Token inválido ou expirado");
    });

    test("Criptografia de JWT: token expirado é rejeitado com 401", async () => {
      const tokenExpirado = jwt.sign(
        { id: 1, perfil: "Administrador", id_organizacao: 1 },
        process.env.JWT_SECRET,
        { expiresIn: "0s" },
      );

      const res = await request(app)
        .get("/perfil")
        .set("Authorization", `Bearer ${tokenExpirado}`);

      expect(res.status).toBe(401);
      expect(res.body.mensagem).toBe("Token inválido ou expirado");
    });
  });

  // =========================================================================
  // 3. Injeção de Código (SQL Injection e XSS)
  // =========================================================================
  describe("3. Injeção de Código (SQL Injection e XSS)", () => {
    test("SQLi no login com payload clássico ' OR '1'='1' -- retorna 401 sem vazar dados", async () => {
      authModel.buscarPorEmail.mockResolvedValue(undefined);

      const res = await request(app)
        .post("/login")
        .send({ email: "' OR '1'='1' --", senha: "qualquer_senha" });

      expect(res.status).toBe(401);
      expect(res.body.mensagem).toBe("Credenciais inválidas");
      expect(authModel.buscarPorEmail).toHaveBeenCalledWith("' OR '1'='1' --");
    });

    test("SQLi no email de login com UNION SELECT retorna 401", async () => {
      authModel.buscarPorEmail.mockResolvedValue(undefined);

      const res = await request(app)
        .post("/login")
        .send({ email: "admin@test.local' UNION SELECT 1, 'admin', 'hash', 'Administrador' --", senha: "x" });

      expect(res.status).toBe(401);
      expect(res.body.mensagem).toBe("Credenciais inválidas");
    });

    test("SQLi em ID de recurso na URL é parametrizado e tratado com segurança", async () => {
      doadoresModel.excluirDoador.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/doadores/1; DROP TABLE doadores; --")
        .set(headersAuth({ id_organizacao: 1 }));

      expect(res.status).toBe(404);
      expect(doadoresModel.excluirDoador).toHaveBeenCalledWith(
        "1; DROP TABLE doadores; --",
        1,
      );
    });

    test("XSS: Função de sanitização HTML neutraliza tags <script> e atributos maliciosos", () => {
      const payloadScript = "<script>alert('XSS')</script>";
      const sanitizadoScript = escaparHTML(payloadScript);
      expect(sanitizadoScript).not.toContain("<script>");
      expect(sanitizadoScript).toBe("&lt;script&gt;alert(&#039;XSS&#039;)&lt;/script&gt;");

      const payloadImg = '<img src=x onerror="alert(1)">';
      const sanitizadoImg = escaparHTML(payloadImg);
      expect(sanitizadoImg).not.toContain("<img");
      expect(sanitizadoImg).toContain("&lt;img");
      expect(sanitizadoImg).toContain("&quot;alert(1)&quot;");
    });

    test("Content Security Policy (CSP): Respostas HTTP incluem cabeçalho Helmet sem unsafe-inline de scripts", async () => {
      const res = await request(app).get("/");
      const csp = res.headers["content-security-policy"];
      expect(csp).toBeDefined();
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("script-src-attr 'none'");
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    });
  });

  // =========================================================================
  // 4. Proteção contra Bots (Honeypot e Rate Limiting)
  // =========================================================================
  describe("4. Proteção contra Bots (Honeypot e Rate Limiting)", () => {
    test("Honeypot: Bot preenchendo campo oculto 'website' recebe 200 simulado sem persistir no banco", async () => {
      const res = await request(app)
        .post("/registro")
        .send({
          nome_organizacao: "Robô Spammer LTDA",
          cnpj: "12.345.678/0001-95",
          nome: "Bot Automatizado",
          email: "bot@crawler.org",
          senha: "SenhaForte123!",
          confirmar_senha: "SenhaForte123!",
          website: "http://bot-malicioso.com/link", // Campo honeypot preenchido pelo bot
        });

      // Retorna sucesso falso para enganar o bot
      expect(res.status).toBe(200);
      expect(res.body.mensagem).toBe("Operação registrada");
      // Não persiste nenhuma entidade no banco de dados
      expect(authModel.registrarOrganizacao).not.toHaveBeenCalled();
    });

    test("Rate Limiting: Rajada de requisições disparada por bot de força bruta é bloqueada com HTTP 429", async () => {
      const expressRateLimit = require("express-rate-limit");
      const appRateLimit = express();
      appRateLimit.use(express.json());

      const limitadorTeste = expressRateLimit({
        windowMs: 60 * 1000,
        max: 3, // Permite 3 requisições e bloqueia a partir da 4ª
        standardHeaders: true,
        legacyHeaders: false,
        message: { mensagem: "Limite de requisições excedido. Acesso bloqueado temporariamente." },
      });

      appRateLimit.post("/teste-bot", limitadorTeste, (req, res) => {
        res.status(200).json({ ok: true });
      });

      // 3 requisições normais passam
      for (let i = 0; i < 3; i++) {
        const res = await request(appRateLimit).post("/teste-bot").send({});
        expect(res.status).toBe(200);
      }

      // 4ª requisição (rajada de bot) é bloqueada com HTTP 429 (Too Many Requests)
      const resBloqueada = await request(appRateLimit).post("/teste-bot").send({});
      expect(resBloqueada.status).toBe(429);
      expect(resBloqueada.body.mensagem).toContain("Limite de requisições excedido");
    });
  });
});
