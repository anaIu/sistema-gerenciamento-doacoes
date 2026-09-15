const { somenteAdmin } = require("../../middleware/autorizacao");

describe("middleware somenteAdmin", () => {
  const criarRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  test("libera administrador", () => {
    const req = { usuario: { id: 1, perfil: "Administrador", id_organizacao: 1 } };
    const res = criarRes();
    const next = jest.fn();

    somenteAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("bloqueia funcionario com 403", () => {
    const req = { usuario: { id: 2, perfil: "Funcionário", id_organizacao: 1 } };
    const res = criarRes();
    const next = jest.fn();

    somenteAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Acesso restrito a administradores" });
    expect(next).not.toHaveBeenCalled();
  });

  test("bloqueia sem req.usuario", () => {
    const req = {};
    const res = criarRes();
    const next = jest.fn();

    somenteAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});