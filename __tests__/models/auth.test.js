const pool = require("../../database/connection");
const authModel = require("../../models/authModel");

jest.mock("../../database/connection");

describe("models/authModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("buscarPorEmail retorna usuario", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_usuario: 1, email: "x@x.com" }] });
    const resultado = await authModel.buscarPorEmail("x@x.com");
    expect(resultado.email).toBe("x@x.com");
    expect(pool.query.mock.calls[0][1]).toEqual(["x@x.com"]);
  });

  test("buscarPerfil aplica JOIN com organizacoes", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome_organizacao: "Org", cnpj: "123" }],
    });
    const resultado = await authModel.buscarPerfil(1);
    expect(resultado.nome_organizacao).toBe("Org");
    expect(pool.query.mock.calls[0][1]).toEqual([1]);
  });

  test("registrarOrganizacao cria org e admin com senha bcrypt", async () => {
    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    client.query
      .mockResolvedValueOnce({})                                             // BEGIN
      .mockResolvedValueOnce({ rows: [{ id_organizacao: 7 }] })              // INSERT org
      .mockResolvedValueOnce({
        rows: [{ id_usuario: 1, nome: "A", email: "a@a.com", perfil: "Administrador", id_organizacao: 7 }],
      })                                                                     // INSERT usuario
      .mockResolvedValueOnce({});                                            // COMMIT
    pool.connect.mockResolvedValue(client);

    const resultado = await authModel.registrarOrganizacao({
      nomeOrganizacao: "Org",
      cnpj: "123",
      nome: "A",
      email: "a@a.com",
      cpf: "123",
      telefone: "123",
      senha: "SenhaForte123!",
    });

    expect(resultado.id_organizacao).toBe(7);
    const insertUsuario = client.query.mock.calls[2][0];
    expect(insertUsuario).toContain("Administrador");
    const senhaHash = client.query.mock.calls[2][1][2];
    expect(senhaHash.startsWith("$2")).toBe(true);
    expect(senhaHash).not.toContain("SenhaForte123!");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  test("registrarOrganizacao faz rollback em erro", async () => {
    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    client.query
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("boom"));
    pool.connect.mockResolvedValue(client);

    await expect(
      authModel.registrarOrganizacao({
        nomeOrganizacao: "Org",
        cnpj: "123",
        nome: "A",
        email: "a@a.com",
        senha: "SenhaForte123!",
      }),
    ).rejects.toThrow("boom");

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  test("editarPerfil atualiza dados do usuario", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_usuario: 1, nome: "Admin", email: "a@a.com", cpf: null, telefone: null, perfil: "Administrador" }],
    });
    const resultado = await authModel.editarPerfil(1, {
      nome: "Admin",
      email: "a@a.com",
      cpf: undefined,
      telefone: undefined,
    });
    expect(resultado.id_usuario).toBe(1);
    expect(pool.query.mock.calls[0][1]).toEqual(["Admin", "a@a.com", null, null, 1]);
  });

  test("editarPerfil retorna undefined quando usuario nao existe", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const resultado = await authModel.editarPerfil(99, { nome: "X", email: "x@x.com" });
    expect(resultado).toBeUndefined();
  });
});