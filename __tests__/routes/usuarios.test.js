process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const usuariosModel = require("../../models/usuariosModel");
const { headersAuth } = require("../helpers/auth");

jest.mock("../../models/usuariosModel");

describe("rotas /usuarios", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET sem token retorna 401", async () => {
    const res = await request(app).get("/usuarios");
    expect(res.status).toBe(401);
  });

  test("GET com token retorna lista", async () => {
    usuariosModel.listarUsuarios.mockResolvedValue([{ id_usuario: 1, nome: "A" }]);
    const res = await request(app).get("/usuarios").set(headersAuth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test("GET scoping: model recebe usuario logado", async () => {
    usuariosModel.listarUsuarios.mockResolvedValue([]);
    await request(app).get("/usuarios").set(headersAuth());
    expect(usuariosModel.listarUsuarios).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, perfil: "Administrador", id_organizacao: 1 }),
    );
  });

  test("POST cadastra usuario como Funcionario", async () => {
    usuariosModel.buscarPorEmailParaValidar.mockResolvedValue(undefined);
    usuariosModel.cadastrarUsuario.mockResolvedValue({ id_usuario: 2, nome: "Novo" });
    const res = await request(app)
      .post("/usuarios")
      .set(headersAuth())
      .send({ nome: "Novo", email: "n@n.com", senha: "12345678", perfil: "Administrador" });
    expect(res.status).toBe(201);
    expect(usuariosModel.cadastrarUsuario).toHaveBeenCalledWith(
      "Novo", "n@n.com", "12345678", "Funcionário", 1,
    );
  });

  test("POST com perfil de funcionario retorna 403", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set(headersAuth({ id: 2, perfil: "Funcionário", id_organizacao: 1 }))
      .send({ nome: "Novo", email: "n@n.com", senha: "12345678", perfil: "Funcionário" });
    expect(res.status).toBe(403);
  });

  test("POST sem campos retorna 400", async () => {
    const res = await request(app).post("/usuarios").set(headersAuth()).send({});
    expect(res.status).toBe(400);
  });

  test("POST email invalido retorna 400", async () => {
    const res = await request(app)
      .post("/usuarios")
      .set(headersAuth())
      .send({ nome: "Novo", email: "invalido", senha: "12345678" });
    expect(res.status).toBe(400);
  });

  test("POST email em uso retorna 400", async () => {
    usuariosModel.buscarPorEmailParaValidar.mockResolvedValue({ id_usuario: 9 });
    const res = await request(app)
      .post("/usuarios")
      .set(headersAuth())
      .send({ nome: "Novo", email: "n@n.com", senha: "12345678" });
    expect(res.status).toBe(400);
  });

  test("PUT edita usuario", async () => {
    usuariosModel.buscarPorEmailParaValidar.mockResolvedValue(undefined);
    usuariosModel.editarUsuario.mockResolvedValue({ id_usuario: 2, nome: "Edit" });
    const res = await request(app)
      .put("/usuarios/2")
      .set(headersAuth())
      .send({ nome: "Edit", email: "e@e.com", perfil: "Administrador" });
    expect(res.status).toBe(200);
    expect(usuariosModel.editarUsuario).toHaveBeenCalledWith(
      "2", "Edit", "e@e.com", "Funcionário", undefined, 1,
    );
  });

  test("PUT email em uso retorna 400", async () => {
    usuariosModel.buscarPorEmailParaValidar.mockResolvedValue({ id_usuario: 9 });
    const res = await request(app)
      .put("/usuarios/2")
      .set(headersAuth())
      .send({ nome: "Edit", email: "e@e.com" });
    expect(res.status).toBe(400);
  });

  test("PUT id inexistente retorna 404", async () => {
    usuariosModel.buscarPorEmailParaValidar.mockResolvedValue(undefined);
    usuariosModel.editarUsuario.mockResolvedValue(undefined);
    const res = await request(app)
      .put("/usuarios/2")
      .set(headersAuth())
      .send({ nome: "Edit", email: "e@e.com" });
    expect(res.status).toBe(404);
  });

  test("DELETE exclui usuario", async () => {
    usuariosModel.excluirUsuario.mockResolvedValue({ id_usuario: 2 });
    const res = await request(app).delete("/usuarios/2").set(headersAuth());
    expect(res.status).toBe(200);
    expect(usuariosModel.excluirUsuario).toHaveBeenCalledWith("2", 1);
  });

  test("DELETE da propria conta retorna 400", async () => {
    const res = await request(app).delete("/usuarios/1").set(headersAuth());
    expect(res.status).toBe(400);
    expect(usuariosModel.excluirUsuario).not.toHaveBeenCalled();
  });

  test("DELETE id inexistente retorna 404", async () => {
    usuariosModel.excluirUsuario.mockResolvedValue(undefined);
    const res = await request(app).delete("/usuarios/2").set(headersAuth());
    expect(res.status).toBe(404);
  });

  test("DELETE com vinculo retorna 400", async () => {
    const err = new Error("fk");
    err.code = "23503";
    usuariosModel.excluirUsuario.mockRejectedValue(err);
    const res = await request(app).delete("/usuarios/2").set(headersAuth());
    expect(res.status).toBe(400);
  });

  test("erro interno retorna 500", async () => {
    usuariosModel.listarUsuarios.mockRejectedValue(new Error("boom"));
    const res = await request(app).get("/usuarios").set(headersAuth());
    expect(res.status).toBe(500);
  });
});