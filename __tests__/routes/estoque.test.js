process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const estoqueModel = require("../../models/estoqueModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/estoqueModel");
jest.mock("../../models/auditoriaModel");

describe("rotas /estoque", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    estoqueModel.buscarDoacaoComSaldo.mockResolvedValue({
      id_doacao: 1,
      tipo: "Roupa",
      quantidade: 10,
      total_saidas: 2,
      saldo: 8,
    });
  });

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

  test("POST /saida sem id_doacao retorna 400", async () => {
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ quantidade: 2 });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("A doação é obrigatória");
  });

  test("POST /saida com quantidade invalida retorna 400", async () => {
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ id_doacao: 1, quantidade: -1 });
    expect(res.status).toBe(400);
  });

  test("POST /saida com doacao de outra org retorna 400", async () => {
    estoqueModel.buscarDoacaoComSaldo.mockResolvedValue(null);
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ id_doacao: 99, quantidade: 2 });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Doação não encontrada ou não pertence à sua organização");
  });

  test("POST /saida em doacao de dinheiro retorna 400", async () => {
    estoqueModel.buscarDoacaoComSaldo.mockResolvedValue({
      id_doacao: 2,
      tipo: "Dinheiro",
      saldo: 100,
    });
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ id_doacao: 2, quantidade: 10 });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Não é possível registrar saída de doação em dinheiro no estoque");
  });

  test("POST /saida com quantidade maior que o saldo retorna 400", async () => {
    estoqueModel.buscarDoacaoComSaldo.mockResolvedValue({
      id_doacao: 1,
      tipo: "Roupa",
      saldo: 3,
    });
    const res = await request(app)
      .post("/estoque/saida")
      .set(headersAuth())
      .send({ id_doacao: 1, quantidade: 5 });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toContain("maior que o saldo disponível");
  });

  test("erro interno retorna 500", async () => {
    estoqueModel.listarEstoque.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/estoque").set(headersAuth());
    expect(res.status).toBe(500);
  });
});