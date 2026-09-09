process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const estoqueModel = require("../../models/estoqueModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/estoqueModel");

describe("rotas /estoque", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/estoque");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna movimentacoes", async () => {
    estoqueModel.listarEstoque.mockResolvedValue([{ id_movimentacao: 1 }]);
    const res = await request(app).get("/estoque").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("POST /saida registra saida", async () => {
    estoqueModel.registrarSaida.mockResolvedValue({ id_movimentacao: 1, tipo_movimentacao: "Saída" });
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ quantidade: 2, destino: "X", observacao: "", id_doacao: 1, id_usuario: 1 });
    expect(res.status).toBe(201);
  });

  test("erro interno retorna 500", async () => {
    estoqueModel.listarEstoque.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/estoque").set(headersAuth());
    expect(res.status).toBe(500);
  });
});