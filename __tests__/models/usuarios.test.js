const pool = require("../../database/connection");
const usuariosModel = require("../../models/usuariosModel");
const bcrypt = require("bcrypt");

jest.mock("../../database/connection");

describe("usuariosModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarUsuarios admin filtra por organizacao", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Teste", email: "teste@test.com", perfil: "Administrador" }],
    });
    const resultado = await usuariosModel.listarUsuarios({
      id: 1,
      perfil: "Administrador",
      id_organizacao: 4,
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Teste");
    expect(pool.query.mock.calls[0][0]).toContain("id_organizacao");
    expect(pool.query.mock.calls[0][1]).toEqual([4]);
  });

  test("listarUsuarios funcionario filtra pela propria conta", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 3 }] });
    const resultado = await usuariosModel.listarUsuarios({ id: 3, perfil: "Funcionário", id_organizacao: 4 });
    expect(resultado).toHaveLength(1);
    expect(pool.query.mock.calls[0][1]).toEqual([3]);
  });

  test("cadastrarUsuario criptografa senha e insere com organizacao", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Novo", email: "novo@test.com", perfil: "Funcionário" }],
    });
    const resultado = await usuariosModel.cadastrarUsuario("Novo", "novo@test.com", "12345678", "Funcionário", 9);
    const params = pool.query.mock.calls[0][1];
    expect(bcrypt.compareSync("12345678", params[2])).toBe(true);
    expect(params[3]).toBe("Funcionário");
    expect(params[4]).toBe(9);
    expect(resultado.nome).toBe("Novo");
  });

  test("editarUsuario altera sem senha dentro da organizacao", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Editado", email: "e@e.com", perfil: "Funcionário" }],
    });
    const resultado = await usuariosModel.editarUsuario(1, "Editado", "e@e.com", "Funcionário", "", 9);
    expect(pool.query).toHaveBeenCalled();
    expect(resultado.nome).toBe("Editado");
    expect(pool.query.mock.calls[0][1].includes(9)).toBe(true);
  });

  test("editarUsuario re-criptografa senha quando informada", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Editado", email: "e@e.com", perfil: "Funcionário" }],
    });
    await usuariosModel.editarUsuario(1, "Editado", "e@e.com", "Funcionário", "novaSenha", 9);
    expect(bcrypt.compareSync("novaSenha", pool.query.mock.calls[0][1][3])).toBe(true);
  });

  test("excluirUsuario remove usuario dentro da organizacao", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 2 }] });
    const resultado = await usuariosModel.excluirUsuario(2, 9);
    expect(resultado.id_usuario).toBe(2);
    expect(pool.query.mock.calls[0][1]).toEqual([2, 9]);
  });

  test("buscarPorEmailParaValidar retorna usuario com outro id", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 2 }] });
    const resultado = await usuariosModel.buscarPorEmailParaValidar("e@e.com", 1);
    expect(resultado.id_usuario).toBe(2);
  });

  test("buscarPorEmailParaValidar ignora quando ignorarId é nulo", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 2 }] });
    const resultado = await usuariosModel.buscarPorEmailParaValidar("e@e.com", null);
    expect(resultado.id_usuario).toBe(2);
    expect(pool.query.mock.calls[0][1]).toEqual(["e@e.com", null]);
  });
});