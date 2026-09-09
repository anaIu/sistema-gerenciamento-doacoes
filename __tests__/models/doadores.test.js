const pool = require("../../database/connection");
const doadoresModel = require("../../models/doadoresModel");

jest.mock("../../database/connection");

describe("doadoresModel", () => {
  beforeEach(() => jest.clearAllMocks());

  test("listarDoadores retorna lista com usuario_cadastro", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doador: 1, nome: "Doador", usuario_cadastro: "Admin" }],
    });
    const resultado = await doadoresModel.listarDoadores();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Doador");
  });

  test("cadastrarDoador insere novo doador", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doador: 1, nome: "Novo Doador", telefone: "9999" }],
    });
    const resultado = await doadoresModel.cadastrarDoador("Novo Doador", "9999", "d@d.com", "obs", 1);
    expect(resultado.nome).toBe("Novo Doador");
  });

  test("editarDoador atualiza dados", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id_doador: 1, nome: "Editado", telefone: "8888" }],
    });
    const resultado = await doadoresModel.editarDoador(1, "Editado", "8888", "e@e.com", "obs");
    expect(resultado.nome).toBe("Editado");
  });

  test("excluirDoador remove doador", async () => {
    pool.query.mockResolvedValue({ rows: [{ id_doador: 1 }] });
    const resultado = await doadoresModel.excluirDoador(1);
    expect(resultado.id_doador).toBe(1);
  });
});