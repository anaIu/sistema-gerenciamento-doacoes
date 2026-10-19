process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const doacoesModel = require("../../models/doacoesModel");
const doadoresModel = require("../../models/doadoresModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/doacoesModel");
jest.mock("../../models/doadoresModel");
jest.mock("../../models/auditoriaModel");

describe("rotas /doacoes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    doadoresModel.buscarDoadorPorId.mockResolvedValue({ id_doador: 1, nome: "Doador 1" });
  });

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/doacoes");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna lista", async () => {
    doacoesModel.listarDoacoes.mockResolvedValue([{ id_doacao: 1, tipo: "Roupa" }]);
    const res = await request(app).get("/doacoes").set(headersAuth());
    expect(res.status).toBe(200);
  });

  test("POST cadastra doacao de item", async () => {
    doacoesModel.cadastrarDoacao.mockResolvedValue({ id_doacao: 1, tipo: "Roupa", quantidade: 3 });
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Roupa", quantidade: 3, id_doador: 1, id_usuario: 1 });
    expect(res.status).toBe(201);
  });

  test("POST dinheiro sem valor retorna 400", async () => {
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Dinheiro", id_doador: 1, id_usuario: 1 });
    expect(res.status).toBe(400);
  });

  test("POST dinheiro com valor invalido retorna 400", async () => {
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Dinheiro", valor: -10, id_doador: 1 });
    expect(res.status).toBe(400);
  });

  test("POST item com quantidade invalida retorna 400", async () => {
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Roupa", quantidade: 2.5, id_doador: 1 });
    expect(res.status).toBe(400);
  });

  test("POST doador de outra org retorna 400", async () => {
    doadoresModel.buscarDoadorPorId.mockResolvedValue(null);
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Roupa", quantidade: 3, id_doador: 99 });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Doador não encontrado ou não pertence à sua organização");
  });

  test("POST item sem quantidade retorna 400", async () => {
    const res = await request(app)
      .post("/doacoes")
      .set(headersAuth())
      .send({ tipo: "Roupa", id_doador: 1, id_usuario: 1 });
    expect(res.status).toBe(400);
  });

  test("PUT edita doacao", async () => {
    doacoesModel.editarDoacao.mockResolvedValue({ id_doacao: 1, tipo: "Alimento", quantidade: 5 });
    const res = await request(app)
      .put("/doacoes/1")
      .set(headersAuth())
      .send({ tipo: "Alimento", quantidade: 5, id_doador: 1 });
    expect(res.status).toBe(200);
  });

  test("PUT de dinheiro exige valor retorna 400", async () => {
    const res = await request(app)
      .put("/doacoes/1")
      .set(headersAuth())
      .send({ tipo: "Dinheiro", id_doador: 1 });
    expect(res.status).toBe(400);
  });

  test("PUT id inexistente retorna 404", async () => {
    doacoesModel.editarDoacao.mockResolvedValue(undefined);
    const res = await request(app)
      .put("/doacoes/1")
      .set(headersAuth())
      .send({ tipo: "Alimento", quantidade: 1, id_doador: 1 });
    expect(res.status).toBe(404);
  });

  test("DELETE exclui doacao", async () => {
    doacoesModel.excluirDoacao.mockResolvedValue({ id_doacao: 1 });
    const res = await request(app).delete("/doacoes/1").set(headersAuth());
    expect(res.status).toBe(200);
  });

  test("DELETE com vinculo retorna 400", async () => {
    const err = new Error("fk");
    err.code = "23503";
    doacoesModel.excluirDoacao.mockRejectedValue(err);
    const res = await request(app).delete("/doacoes/1").set(headersAuth());
    expect(res.status).toBe(400);
  });
});