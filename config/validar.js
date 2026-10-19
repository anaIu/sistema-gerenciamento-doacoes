const SEGREDOS_FRACOS = [
  "mude_esta_chave_em_producao",
  "sua_chave_secreta_aqui",
  "segredo",
  "test-secret-key",
  "ci-test-secret",
  "admin123",
  "senha123",
  "password",
  "12345678",
  "secret",
];

/**
 * Valida variáveis de ambiente críticas no startup do servidor.
 * Proteção contra inicialização com configurações ausentes ou inseguras (Achado A14).
 *
 * @param {object} [env=process.env] Objeto de variáveis de ambiente
 * @returns {boolean} Retorna true se a configuração for válida
 */
const validarConfiguracao = (env = process.env) => {
  const isTest = env.NODE_ENV === "test";

  if (!isTest) {
    if (!env.DATABASE_URL || !env.DATABASE_URL.trim()) {
      throw new Error("Configuração inválida: DATABASE_URL é obrigatória para iniciar o servidor.");
    }
  }

  if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) {
    if (isTest) {
      env.JWT_SECRET = "test-secret-key-default-para-testes-unitarios-32chars";
    } else {
      throw new Error("Configuração inválida: JWT_SECRET é obrigatório. Gere um segredo seguro com: openssl rand -hex 32");
    }
  }

  if (!isTest) {
    if (env.JWT_SECRET.length < 32) {
      throw new Error("Configuração insegura: JWT_SECRET deve possuir ao menos 32 caracteres.");
    }
    if (SEGREDOS_FRACOS.includes(env.JWT_SECRET.toLowerCase().trim())) {
      throw new Error("Configuração insegura: JWT_SECRET utiliza um valor padrão conhecido ou previsível. Defina uma chave única e segura.");
    }
  }

  return true;
};

module.exports = {
  validarConfiguracao,
  SEGREDOS_FRACOS,
};
