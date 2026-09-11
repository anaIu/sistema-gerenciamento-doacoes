process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const authModel = require("../../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../../models/authModel");

describe("POST /login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna token e usuario em credenciais validas", async () => {
    const hash = await bcrypt.hash("123456", 10);
    authModel.buscarPorEmail.mockResolvedValue({
      id_usuario: 1,
      nome: "Admin",
      email: "admin@teste.com",
      perfil: "Administrador",
      id_organizacao: 3,
      senha: hash,
    });

    const res = await request(app)
      .post("/login")
      .send({ email: "admin@teste.com", senha: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe("admin@teste.com");
    expect(res.body.usuario.id_organizacao).toBe(3);

    const decoded = jwt.verify(res.body.token, "test-secret-key");
    expect(decoded.id_organizacao).toBe(3);
    expect(decoded.perfil).toBe("Administrador");
  });

  test("retorna 401 para usuario inexistente", async () => {
    authModel.buscarPorEmail.mockResolvedValue(undefined);
    const res = await request(app).post("/login").send({ email: "x@x.com", senha: "123" });
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe("Credenciais inválidas");
  });

  test("retorna 401 para senha incorreta", async () => {
    const hash = await bcrypt.hash("correta", 10);
    authModel.buscarPorEmail.mockResolvedValue({
      id_usuario: 1,
      nome: "Admin",
      email: "admin@teste.com",
      perfil: "Administrador",
      id_organizacao: 3,
      senha: hash,
    });
    const res = await request(app).post("/login").send({ email: "admin@teste.com", senha: "errada" });
    expect(res.status).toBe(401);
  });

  test("retorna 400 quando campos faltam", async () => {
    const res = await request(app).post("/login").send({ email: "admin@teste.com" });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("E-mail e senha são obrigatórios");
  });

  test("retorna 500 em erro interno", async () => {
    authModel.buscarPorEmail.mockRejectedValue(new Error("boom"));
    const res = await request(app).post("/login").send({ email: "a@a.com", senha: "123" });
    expect(res.status).toBe(500);
  });
});