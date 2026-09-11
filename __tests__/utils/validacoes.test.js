const { validarEmail, validarSenha, validarConfirmacao } = require("../../utils/validacoes");

describe("utils/validacoes", () => {
  describe("validarEmail", () => {
    test.each([
      ["a@b.com", true],
      ["nome.sobrenome@dominio.com.br", true],
      ["  usuario@email.org  ", true],
      ["sem-arroba.com", false],
      ["a@b", false],
      ["a b@c.com", false],
      ["", false],
    ])("e-mail %p => %p", (email, esperado) => {
      expect(validarEmail(email)).toBe(esperado);
    });

    test("valores nao-strings retornam false", () => {
      expect(validarEmail(123)).toBe(false);
      expect(validarEmail(null)).toBe(false);
      expect(validarEmail(undefined)).toBe(false);
    });
  });

  describe("validarSenha", () => {
    test("aceita senhas com 8 ou mais caracteres", () => {
      expect(validarSenha("12345678")).toBe(true);
      expect(validarSenha("SenhaForte123!")).toBe(true);
    });

    test("rejeita senhas curtas", () => {
      expect(validarSenha("123")).toBe(false);
      expect(validarSenha("1234567")).toBe(false);
    });

    test("valores nao-strings retornam false", () => {
      expect(validarSenha("")).toBe(false);
      expect(validarSenha(null)).toBe(false);
      expect(validarSenha(undefined)).toBe(false);
    });
  });

  describe("validarConfirmacao", () => {
    test("retorna true quando as senhas coincidem", () => {
      expect(validarConfirmacao("abc12345", "abc12345")).toBe(true);
    });

    test("retorna false quando as senhas diferem", () => {
      expect(validarConfirmacao("abc12345", "abc54321")).toBe(false);
    });
  });
});