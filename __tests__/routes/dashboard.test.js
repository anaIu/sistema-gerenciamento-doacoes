process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const dashboardModel = require("../../models/dashboardModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/dashboardModel");

describe("rota /dashboard", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna resumo", async () => {
    dashboardModel.contarUsuarios.mockResolvedValue(3);
    dashboardModel.contarDoadores.mockResolvedValue(2);
    dashboardModel.contarDoacoes.mockResolvedValue(5);
    dashboardModel.calcularSaldoEstoque.mockResolvedValue(10);
    dashboardModel.calcularTotalDinheiro.mockResolvedValue(150);
    dashboardModel.ultimasMovimentacoes.mockResolvedValue([{ data_movimentacao: new Date() }]);

    const res = await request(app).get("/dashboard").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body.usuarios).toBe(3);
    expect(res.body.saldoEstoque).toBe(10);
    expect(res.body.totalDinheiro).toBe(150);
  });

  test("erro interno retorna 500", async () => {
    dashboardModel.contarUsuarios.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/dashboard").set(headersAuth());
    expect(res.status).toBe(500);
  });
});