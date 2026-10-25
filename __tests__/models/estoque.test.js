const pool = require("../../database/connection");
const estoqueModel = require("../../models/estoqueModel");

jest.mock("../../database/connection");

describe("estoqueModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarEstoque retorna movimentacoes", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_movimentacao: 1, tipo_doacao: "Roupa", quantidade: 3, destino: "X" }],
    });
    const resultado = await estoqueModel.listarEstoque();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].destino).toBe("X");
  });

  test("registrarSaida insere movimentacao do tipo Saida", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_movimentacao: 1, tipo_movimentacao: "Saída", quantidade: 2 }],
    });
    const resultado = await estoqueModel.registrarSaida(2, "Destino", "obs", 1, 1);
    expect(pool.query.mock.calls[0][1][0]).toBe(2);
    expect(resultado.tipo_movimentacao).toBe("Saída");
  });

  test("buscarDoacaoComSaldo retorna doacao e calcula saldo", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doacao: 1, tipo: "Roupa", quantidade: 10, total_saidas: 4 }],
    });
    const resultado = await estoqueModel.buscarDoacaoComSaldo(1, 10);
    expect(resultado.saldo).toBe(6);
    expect(pool.query.mock.calls[0][1]).toEqual([1, 10]);
  });

  test("buscarDoacaoComSaldo retorna null quando nao encontrada", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const resultado = await estoqueModel.buscarDoacaoComSaldo(99, 10);
    expect(resultado).toBeNull();
  });
});