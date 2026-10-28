const {
  obterDigitos,
  validarEmail,
  validarSenha,
  validarSenhaForte,
  validarConfirmacao,
  validarTelefone,
  validarCPF,
  validarCNPJ,
  escaparHTML,
} = require("../../utils/validacoes");

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

  describe("obterDigitos", () => {
    test("extrai apenas numeros de uma string", () => {
      expect(obterDigitos("(11) 98765-4321")).toBe("11987654321");
      expect(obterDigitos("abc123xyz456")).toBe("123456");
      expect(obterDigitos(null)).toBe("");
      expect(obterDigitos(undefined)).toBe("");
    });
  });

  describe("validarTelefone", () => {
    test("aceita telefones com 10 ou 11 digitos", () => {
      expect(validarTelefone("(11) 98765-4321")).toBe(true);
      expect(validarTelefone("11987654321")).toBe(true);
      expect(validarTelefone("(41) 3333-4444")).toBe(true);
      expect(validarTelefone("4133334444")).toBe(true);
    });

    test("rejeita telefones com quantidade incorreta de digitos", () => {
      expect(validarTelefone("123456789")).toBe(false);
      expect(validarTelefone("123456789012")).toBe(false);
      expect(validarTelefone("")).toBe(false);
      expect(validarTelefone(null)).toBe(false);
    });
  });

  describe("validarCPF", () => {
    test("aceita CPFs válidos", () => {
      expect(validarCPF("123.456.789-09")).toBe(true);
      expect(validarCPF("12345678909")).toBe(true);
    });

    test("rejeita CPFs com digito verificador invalido", () => {
      expect(validarCPF("123.456.789-00")).toBe(false);
      expect(validarCPF("111.456.789-09")).toBe(false);
    });

    test("rejeita CPFs com digitos repetidos", () => {
      expect(validarCPF("111.111.111-11")).toBe(false);
      expect(validarCPF("000.000.000-00")).toBe(false);
    });

    test("rejeita entradas invalidas", () => {
      expect(validarCPF("123")).toBe(false);
      expect(validarCPF("")).toBe(false);
      expect(validarCPF(null)).toBe(false);
    });
  });

  describe("validarCNPJ", () => {
    test("aceita CNPJs válidos", () => {
      expect(validarCNPJ("12.345.678/0001-95")).toBe(true);
      expect(validarCNPJ("12345678000195")).toBe(true);
    });

    test("rejeita CNPJs com digito verificador invalido", () => {
      expect(validarCNPJ("12.345.678/0001-90")).toBe(false);
      expect(validarCNPJ("12.345.678/0001-00")).toBe(false);
    });
  });

  describe("validarSenhaForte", () => {
    test("aceita senhas com 8+ caracteres, maiuscula, minuscula e numero", () => {
      expect(validarSenhaForte("SenhaForte123!")).toBe(true);
      expect(validarSenhaForte("Abc12345")).toBe(true);
    });

    test("rejeita senhas sem letras maiusculas", () => {
      expect(validarSenhaForte("senhaforte123")).toBe(false);
    });

    test("rejeita senhas sem letras minusculas", () => {
      expect(validarSenhaForte("SENHAFORTE123")).toBe(false);
    });

    test("rejeita senhas sem numeros", () => {
      expect(validarSenhaForte("SenhaForteSemNumero")).toBe(false);
    });

    test("rejeita senhas com menos de 8 caracteres", () => {
      expect(validarSenhaForte("Ab123")).toBe(false);
    });
  });

  describe("escaparHTML", () => {
    test("escapa caracteres especiais para prevenir XSS", () => {
      expect(escaparHTML("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(escaparHTML('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
      expect(escaparHTML("João & Maria 'admin'")).toBe("João &amp; Maria &#039;admin&#039;");
    });

    test("lida com valores nulos, indefinidos e numeros", () => {
      expect(escaparHTML(null)).toBe("");
      expect(escaparHTML(undefined)).toBe("");
      expect(escaparHTML(123)).toBe("123");
    });
  });
});