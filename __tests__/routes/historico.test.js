process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const historicoModel = require("../../models/historicoModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/historicoModel");

describe("rotas /historico", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/historico");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna historico", async () => {
    historicoModel.listarHistorico.mockResolvedValue([{ id_movimentacao: 1, tipo_doacao: "Roupa" }]);
    const res = await request(app).get("/historico").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("erro interno retorna 500", async () => {
    historicoModel.listarHistorico.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/historico").set(headersAuth());
    expect(res.status).toBe(500);
  });
});