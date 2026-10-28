
const pool = require("../../database/connection");
const dashboardModel = require("../../models/dashboardModel");

jest.mock("../../database/connection");

describe("dashboardModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("contarUsuarios retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "3" }] });
    const resultado = await dashboardModel.contarUsuarios(10);
    expect(resultado).toBe(3);
  });

  test("contarDoadores retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "2" }] });
    const resultado = await dashboardModel.contarDoadores(10);
    expect(resultado).toBe(2);
  });

  test("contarDoacoes retorna numero", async () => {
    pool.query.mockResolvedValue({ rows: [{ count: "5" }] });
    const resultado = await dashboardModel.contarDoacoes(10);
    expect(resultado).toBe(5);
  });

  test("calcularSaldoEstoque retorna saldo", async () => {
    pool.query.mockResolvedValue({ rows: [{ saldo: 10 }] });
    const resultado = await dashboardModel.calcularSaldoEstoque(10);
    expect(resultado).toBe(10);
  });

  test("calcularTotalDinheiro retorna total", async () => {
    pool.query.mockResolvedValue({ rows: [{ total: "150.5" }] });
    const resultado = await dashboardModel.calcularTotalDinheiro(10);
    expect(resultado).toBe(150.5);
  });

  test("ultimasMovimentacoes retorna lista limitada", async () => {
    pool.query.mockResolvedValue({
      rows: [{ data_movimentacao: new Date(), tipo_doacao: "Roupa" }],
    });

    const resultado = await dashboardModel.ultimasMovimentacoes(5, 10);

    expect(resultado).toHaveLength(1);
    expect(pool.query.mock.calls[0][1]).toEqual([5, 10]);
  });
});

describe("Isolamento dos dados por organização", () => {
  const idOrganizacao = 10;

  beforeEach(() => {
    jest.clearAllMocks();

    pool.query.mockResolvedValue({
      rows: [{
        count: "3",
        saldo: "10",
        total: "150.50"
      }]
    });
  });

  test.each([
    ["usuarios", dashboardModel.contarUsuarios],
    ["doadores", dashboardModel.contarDoadores],
    ["doacoes", dashboardModel.contarDoacoes],
    ["estoque", dashboardModel.calcularSaldoEstoque],
    ["dinheiro", dashboardModel.calcularTotalDinheiro],
  ])("%s deve filtrar pela organização", async (_, funcao) => {
    await funcao(idOrganizacao);

    const [sql, parametros] = pool.query.mock.calls[0];

    expect(sql).toMatch(/id_organizacao\s*=\s*\$1/i);
    expect(parametros).toEqual([idOrganizacao]);
  });

  test("movimentações devem filtrar pela organização", async () => {
    await dashboardModel.ultimasMovimentacoes(5, idOrganizacao);

    const [sql, parametros] = pool.query.mock.calls[0];

    expect(sql).toMatch(/m\.id_organizacao\s*=\s*\$2/i);
    expect(sql).toMatch(/d\.id_organizacao\s*=\s*\$2/i);
    expect(sql).toMatch(/u\.id_organizacao\s*=\s*\$2/i);

    expect(parametros).toEqual([5, idOrganizacao]);
  });
});
