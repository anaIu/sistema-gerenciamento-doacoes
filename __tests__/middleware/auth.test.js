process.env.JWT_SECRET = "test-secret-key";

const autenticar = require("../../middleware/auth");
const { obterToken } = require("../helpers/auth");

describe("middleware autenticar", () => {
  const criarRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test("retorna 401 quando nao ha header", () => {
    const req = { headers: {} };
    const res = criarRes();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  test("retorna 401 para token invalido", () => {
    const req = { headers: { authorization: "Bearer invalido" } };
    const res = criarRes();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("chama next e define req.usuario com token valido", () => {
    const token = obterToken({ id: 7 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = criarRes();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.usuario.id).toBe(7);
  });
});