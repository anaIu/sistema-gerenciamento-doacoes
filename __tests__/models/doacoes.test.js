const pool = require("../../database/connection");
const doacoesModel = require("../../models/doacoesModel");

jest.mock("../../database/connection");

describe("doacoesModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarDoacoes retorna lista com nome_doador", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doacao: 1, tipo: "Alimento", nome_doador: "Doador" }],
    });
    const resultado = await doacoesModel.listarDoacoes();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome_doador).toBe("Doador");
  });

  test("cadastrarDoacao insere nova doacao", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doacao: 1, tipo: "Dinheiro", valor: 100 }],
    });
    const resultado = await doacoesModel.cadastrarDoacao("Dinheiro", null, 100, new Date(), "obs", 1, 1);
    expect(resultado.tipo).toBe("Dinheiro");
  });

  test("editarDoacao atualiza doacao", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doacao: 1, tipo: "Roupa", quantidade: 5 }],
    });
    const resultado = await doacoesModel.editarDoacao(1, "Roupa", 5, null, "obs", 1);
    expect(resultado.quantidade).toBe(5);
  });

  test("excluirDoacao remove doacao", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_doacao: 1 }] });
    const resultado = await doacoesModel.excluirDoacao(1);
    expect(resultado.id_doacao).toBe(1);
  });
});