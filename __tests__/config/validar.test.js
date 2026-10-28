const { validarConfiguracao, SEGREDOS_FRACOS } = require("../../config/validar");

describe("Validação de Configuração de Inicialização (A14)", () => {
  test("permite execução em ambiente de teste", () => {
    const env = {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret-key",
    };
    expect(validarConfiguracao(env)).toBe(true);
  });

  test("define fallback para JWT_SECRET em teste se não fornecido", () => {
    const env = {
      NODE_ENV: "test",
    };
    expect(validarConfiguracao(env)).toBe(true);
    expect(env.JWT_SECRET).toBeDefined();
  });

  test("lança erro se DATABASE_URL estiver ausente fora de teste", () => {
    const env = {
      NODE_ENV: "production",
      JWT_SECRET: "chave-muito-segura-e-longa-com-mais-de-32-caracteres!",
    };
    expect(() => validarConfiguracao(env)).toThrow(
      "DATABASE_URL é obrigatória para iniciar o servidor",
    );
  });

  test("lança erro se JWT_SECRET estiver ausente fora de teste", () => {
    const env = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "",
    };
    expect(() => validarConfiguracao(env)).toThrow(
      "JWT_SECRET é obrigatório",
    );
  });

  test("lança erro se JWT_SECRET tiver menos de 32 caracteres fora de teste", () => {
    const env = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "curta-demais",
    };
    expect(() => validarConfiguracao(env)).toThrow(
      "JWT_SECRET deve possuir ao menos 32 caracteres",
    );
  });

  test("lança erro se JWT_SECRET for um segredo padrão conhecido", () => {
    SEGREDOS_FRACOS.forEach((segredo) => {
      const env = {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: segredo,
      };
      expect(() => validarConfiguracao(env)).toThrow();
    });
  });

  test("aprova configuração válida e segura em ambiente de produção", () => {
    const env = {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "8f7e2a9b4c6d1e0f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f",
    };
    expect(validarConfiguracao(env)).toBe(true);
  });
});
