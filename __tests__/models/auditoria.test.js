const pool = require("../../database/connection");
const auditoriaModel = require("../../models/auditoriaModel");

jest.mock("../../database/connection");

describe("auditoriaModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registrarLog insere log e retorna registro", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_log: 1, acao: "LOGIN_SUCESSO" }] });

    const resultado = await auditoriaModel.registrarLog({
      id_usuario: 1,
      id_organizacao: 2,
      acao: "LOGIN_SUCESSO",
      ip: "127.0.0.1",
      detalhes: "ok",
    });

    expect(resultado.id_log).toBe(1);
    expect(pool.query.mock.calls[0][1]).toEqual([1, 2, "LOGIN_SUCESSO", "127.0.0.1", "ok"]);
  });

  test("registrarLog nao interrompe a operacao quando falha", async () => {
    pool.query.mockRejectedValue(new Error("db down"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const resultado = await auditoriaModel.registrarLog({ acao: "TESTE" });

    expect(resultado).toBeNull();
    spy.mockRestore();
  });

  test("listarLogs filtra por organizacao e limite", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_log: 1 }] });
    const resultado = await auditoriaModel.listarLogs(7, 50);
    expect(resultado).toHaveLength(1);
    expect(pool.query.mock.calls[0][1]).toEqual([7, 50]);
  });
});
