process.env.JWT_SECRET = "test-secret-key";

const request = require("supertest");
const app = require("../../app");
const authModel = require("../../models/authModel");

jest.mock("../../models/authModel");

const payloadValido = {
  nome_organizacao: "Casa do Bem",
  cnpj: "12.345.678/0001-90",
  nome: "João Admin",
  email: "joao@bem.com",
  cpf: "123.456.789-00",
  telefone: "(11) 99999-9999",
  senha: "SenhaForte123!",
  confirmar_senha: "SenhaForte123!",
};

describe("POST /registro", () => {
  beforeEach(() => jest.clearAllMocks());

  test("cria organizacao+admin e retorna token", async () => {
    authModel.registrarOrganizacao.mockResolvedValue({
      id_usuario: 10,
      nome: "João Admin",
      email: "joao@bem.com",
      perfil: "Administrador",
      id_organizacao: 5,
      cpf: "123.456.789-00",
      telefone: "(11) 99999-9999",
    });

    const res = await request(app).post("/registro").send(payloadValido);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.id_organizacao).toBe(5);
    expect(authModel.registrarOrganizacao).toHaveBeenCalledTimes(1);
  });

  test("campos faltando retorna 400", async () => {
    const res = await request(app).post("/registro").send({ email: "x@x.com" });
    expect(res.status).toBe(400);
    expect(authModel.registrarOrganizacao).not.toHaveBeenCalled();
  });

  test("email invalido retorna 400", async () => {
    const res = await request(app).post("/registro").send({ ...payloadValido, email: "invalido" });
    expect(res.status).toBe(400);
  });

  test("senha curta retorna 400", async () => {
    const res = await request(app).post("/registro").send({ ...payloadValido, senha: "123", confirmar_senha: "123" });
    expect(res.status).toBe(400);
  });

  test("senhas diferentes retorna 400", async () => {
    const res = await request(app).post("/registro").send({ ...payloadValido, confirmar_senha: "Diferente123!" });
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("As senhas não coincidem");
  });

  test("honeypot preenchido retorna 200 fake e nao chama model", async () => {
    const res = await request(app).post("/registro").send({ ...payloadValido, website: "http://spam.com" });
    expect(res.status).toBe(200);
    expect(authModel.registrarOrganizacao).not.toHaveBeenCalled();
  });

  test("cnpj duplicado retorna 400", async () => {
    const err = new Error("dup");
    err.code = "23505";
    err.constraint = "organizacoes_cnpj_key";
    authModel.registrarOrganizacao.mockRejectedValue(err);

    const res = await request(app).post("/registro").send(payloadValido);
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("CNPJ já cadastrado");
  });

  test("email duplicado retorna 400", async () => {
    const err = new Error("dup");
    err.code = "23505";
    err.constraint = "usuarios_email_key";
    authModel.registrarOrganizacao.mockRejectedValue(err);

    const res = await request(app).post("/registro").send(payloadValido);
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("E-mail já cadastrado");
  });

  test("erro interno retorna 500", async () => {
    authModel.registrarOrganizacao.mockRejectedValue(new Error("boom"));
    const res = await request(app).post("/registro").send(payloadValido);
    expect(res.status).toBe(500);
  });
});