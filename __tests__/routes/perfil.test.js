process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const authModel = require("../../models/authModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/authModel");

describe("GET /perfil", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna 401 sem token", async () => {
    const res = await request(app).get("/perfil");
    expect(res.status).toBe(401);
  });

  test("retorna dados da organizacao com token", async () => {
    authModel.buscarPerfil.mockResolvedValue({
      id_usuario: 1,
      nome: "Admin",
      email: "a@b.com",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      perfil: "Administrador",
      id_organizacao: 1,
      nome_organizacao: "Casa do Bem",
      cnpj: "12.345.678/0001-90",
      data_cadastro_org: "2026-01-01T00:00:00.000Z",
    });

    const res = await request(app).get("/perfil").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body.organizacao.nome).toBe("Casa do Bem");
    expect(res.body.usuario.nome).toBe("Admin");
    expect(res.body.usuario.senha).toBeUndefined();
  });

  test("retorna 404 para usuario inexistente", async () => {
    authModel.buscarPerfil.mockResolvedValue(undefined);
    const res = await request(app).get("/perfil").set(headersAuth());
    expect(res.status).toBe(404);
  });

  test("retorna 500 em erro interno", async () => {
    authModel.buscarPerfil.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/perfil").set(headersAuth());
    expect(res.status).toBe(500);
  });
});

describe("PUT /perfil", () => {
  beforeEach(() => jest.clearAllMocks());

  test("retorna 401 sem token", async () => {
    const res = await request(app).put("/perfil");
    expect(res.status).toBe(401);
  });

  test("atualiza os dados do usuario logado", async () => {
    authModel.buscarPorEmail.mockResolvedValue({
      id_usuario: 1,
      email: "a@b.com",
    });
    authModel.editarPerfil.mockResolvedValue({
      id_usuario: 1,
      nome: "Admin Atualizado",
      email: "a@b.com",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
      perfil: "Administrador",
    });

    const res = await request(app).put("/perfil").set(headersAuth()).send({
      nome: "Admin Atualizado",
      email: "a@b.com",
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
    });

    expect(res.status).toBe(200);
    expect(res.body.usuario.nome).toBe("Admin Atualizado");
    expect(res.body.usuario.senha).toBeUndefined();
  });

  test("retorna 400 quando email ja esta em uso por outro usuario", async () => {
    authModel.buscarPorEmail.mockResolvedValue({
      id_usuario: 2,
      email: "outro@b.com",
    });

    const res = await request(app).put("/perfil").set(headersAuth()).send({
      nome: "Admin",
      email: "outro@b.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Este e-mail já está em uso");
  });

  test("retorna 400 quando nome ou email faltam", async () => {
    const res = await request(app).put("/perfil").set(headersAuth()).send({ nome: "Admin" });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Nome e e-mail são obrigatórios");
  });

  test("retorna 400 quando email tem formato invalido", async () => {
    const res = await request(app).put("/perfil").set(headersAuth()).send({ nome: "Admin", email: "invalido" });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Formato de e-mail inválido");
  });

  test("retorna 404 quando usuario nao existe", async () => {
    authModel.buscarPorEmail.mockResolvedValue(undefined);
    authModel.editarPerfil.mockResolvedValue(undefined);
    const res = await request(app).put("/perfil").set(headersAuth()).send({
      nome: "Admin",
      email: "a@b.com",
    });
    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe("Usuário não encontrado");
  });

  test("retorna 500 em erro interno", async () => {
    authModel.editarPerfil.mockRejectedValue(new Error("boom"));
    const res = await request(app).put("/perfil").set(headersAuth()).send({
      nome: "Admin",
      email: "a@b.com",
    });
    expect(res.status).toBe(500);
  });
});