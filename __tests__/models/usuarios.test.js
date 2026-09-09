const pool = require("../../database/connection");
const usuariosModel = require("../../models/usuariosModel");
const bcrypt = require("bcrypt");

jest.mock("../../database/connection");

describe("usuariosModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarUsuarios retorna lista de usuarios", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Teste", email: "teste@test.com", perfil: "Administrador" }],
    });
    const resultado = await usuariosModel.listarUsuarios();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Teste");
  });

  test("cadastrarUsuario criptografa senha e insere", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Novo", email: "novo@test.com", perfil: "Funcionário" }],
    });
    const resultado = await usuariosModel.cadastrarUsuario("Novo", "novo@test.com", "123456", "Funcionário");
    expect(bcrypt.compareSync("123456", pool.query.mock.calls[0][1][2])).toBe(true);
    expect(resultado.nome).toBe("Novo");
  });

  test("editarUsuario altera sem senha", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Editado", email: "e@e.com", perfil: "Administrador" }],
    });
    const resultado = await usuariosModel.editarUsuario(1, "Editado", "e@e.com", "Administrador", "");
    expect(pool.query).toHaveBeenCalled();
    expect(resultado.nome).toBe("Editado");
  });

  test("editarUsuario re-criptografa senha quando informada", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Editado", email: "e@e.com", perfil: "Administrador" }],
    });
    await usuariosModel.editarUsuario(1, "Editado", "e@e.com", "Administrador", "novaSenha");
    expect(bcrypt.compareSync("novaSenha", pool.query.mock.calls[0][1][3])).toBe(true);
  });

  test("excluirUsuario remove usuario", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 1 }] });
    const resultado = await usuariosModel.excluirUsuario(1);
    expect(resultado.id_usuario).toBe(1);
  });

  test("buscarPorEmailParaValidar retorna usuario com outro id", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 2 }] });
    const resultado = await usuariosModel.buscarPorEmailParaValidar("e@e.com", 1);
    expect(resultado.id_usuario).toBe(2);
  });
});