process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const doadoresModel = require("../../models/doadoresModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/doadoresModel");

describe("rotas /doadores", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/doadores");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna lista", async () => {
    doadoresModel.listarDoadores.mockResolvedValue([{ id_doador: 1, nome: "D" }]);
    const res = await request(app).get("/doadores").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("POST cadastra doador", async () => {
    doadoresModel.cadastrarDoador.mockResolvedValue({ id_doador: 1, nome: "D" });
    const res = await request(app)
      .post("/doadores")
      .set(headersAuth())
      .send({ nome: "D", telefone: "99", email: "d@d.com", observacao: "", id_usuario_cadastro: 1 });
    expect(res.status).toBe(201);
  });

  test("PUT edita doador", async () => {
    doadoresModel.editarDoador.mockResolvedValue({ id_doador: 1, nome: "Edit" });
    const res = await request(app)
      .put("/doadores/1")
      .set(headersAuth())
      .send({ nome: "Edit" });
    expect(res.status).toBe(200);
  });

  test("PUT sem nome retorna 400", async () => {
    const res = await request(app).put("/doadores/1").set(headersAuth()).send({});
    expect(res.status).toBe(400);
  });

  test("PUT id inexistente retorna 404", async () => {
    doadoresModel.editarDoador.mockResolvedValue(undefined);
    const res = await request(app).put("/doadores/1").set(headersAuth()).send({ nome: "X" });
    expect(res.status).toBe(404);
  });

  test("DELETE exclui doador", async () => {
    doadoresModel.excluirDoador.mockResolvedValue({ id_doador: 1 });
    const res = await request(app).delete("/doadores/1").set(headersAuth());
    expect(res.status).toBe(200);
  });

  test("DELETE com vinculo retorna 400", async () => {
    const err = new Error("fk");
    err.code = "23503";
    doadoresModel.excluirDoador.mockRejectedValue(err);
    const res = await request(app).delete("/doadores/1").set(headersAuth());
    expect(res.status).toBe(400);
  });
});