const pool = require("../../database/connection");
const dashboardModel = require("../../models/dashboardModel");

jest.mock("../../database/connection");

describe("dashboardModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("contarUsuarios retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "3" }] });
    const resultado = await dashboardModel.contarUsuarios();
    expect(resultado).toBe(3);
  });

  test("contarDoadores retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "2" }] });
    const resultado = await dashboardModel.contarDoadores();
    expect(resultado).toBe(2);
  });

  test("contarDoacoes retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "5" }] });
    const resultado = await dashboardModel.contarDoacoes();
    expect(resultado).toBe(5);
  });

  test("calcularSaldoEstoque retorna saldo", async () => {
    pool.query.mockResolvedValue({ rows: [{ saldo: 10 }] });
    const resultado = await dashboardModel.calcularSaldoEstoque();
    expect(resultado).toBe(10);
  });

  test("calcularTotalDinheiro retorna total", async () => {
    pool.query.mockResolvedValue({ rows: [{ total: "150.5" }] });
    const resultado = await dashboardModel.calcularTotalDinheiro();
    expect(resultado).toBe(150.5);
  });

  test("ultimasMovimentacoes retorna lista limitada", async () => {
    pool.query.mockResolvedValue({
      rows: [{ data_movimentacao: new Date(), tipo_doacao: "Roupa" }],
    });
    const resultado = await dashboardModel.ultimasMovimentacoes(5);
    expect(resultado).toHaveLength(1);
    expect(pool.query.mock.calls[0][1][0]).toBe(5);
  });
});