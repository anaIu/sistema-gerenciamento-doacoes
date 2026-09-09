const pool = require("../../database/connection");
const historicoModel = require("../../models/historicoModel");

jest.mock("../../database/connection");

describe("historicoModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarHistorico retorna registros ordenados", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_movimentacao: 1, tipo_doacao: "Roupa", usuario_responsavel: "Admin" }],
    });
    const resultado = await historicoModel.listarHistorico();
    expect(resultado).toHaveLength(1);
    expect(pool.query.mock.calls[0][0]).toContain("ORDER BY m.data_movimentacao DESC");
  });
});