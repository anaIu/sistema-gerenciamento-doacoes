process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const auditoriaModel = require("../../models/auditoriaModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/auditoriaModel");

describe("rotas /auditoria", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/auditoria");
    expect(res.status).toBe(401);
  });

  test("GET como funcionario retorna 403", async () => {
    const res = await request(app)
      .get("/auditoria")
      .set(headersAuth({ perfil: "Funcionário" }));
    expect(res.status).toBe(403);
  });

  test("GET como admin retorna logs da organizacao", async () => {
    auditoriaModel.listarLogs.mockResolvedValue([
      { id_log: 1, acao: "LOGIN_SUCESSO" },
    ]);
    const res = await request(app).get("/auditoria").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(auditoriaModel.listarLogs).toHaveBeenCalledWith(1, 100);
  });

  test("GET limita o parametro limite ao maximo de 500", async () => {
    auditoriaModel.listarLogs.mockResolvedValue([]);
    await request(app).get("/auditoria?limite=9999").set(headersAuth());
    expect(auditoriaModel.listarLogs).toHaveBeenCalledWith(1, 500);
  });

  test("erro interno retorna 500", async () => {
    auditoriaModel.listarLogs.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/auditoria").set(headersAuth());
    expect(res.status).toBe(500);
  });
});
