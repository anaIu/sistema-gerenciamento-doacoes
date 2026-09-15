const { request } = require("@playwright/test");

const gerarNumero = (n) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

const formatarCPF = (digitos) =>
  `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;

const formatarCNPJ = (digitos) =>
  `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;

const digitoVerificadorCPF = (digitos, pesos) => {
  let soma = 0;
  for (let i = 0; i < pesos.length; i++) soma += Number(digitos[i]) * pesos[i];
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
};

function gerarCPF() {
  const base = gerarNumero(9);
  const d1 = digitoVerificadorCPF(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificadorCPF(base + d1, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return formatarCPF(base + d1 + d2);
}

const digitoVerificadorCNPJ = (digitos, pesos) => {
  let soma = 0;
  for (let i = 0; i < pesos.length; i++) soma += Number(digitos[i]) * pesos[i];
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

function gerarCNPJ() {
  const base = gerarNumero(12);
  const d1 = digitoVerificadorCNPJ(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificadorCNPJ(base + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return formatarCNPJ(base + d1 + d2);
}

const gerarEmail = (prefixo) =>
  `e2e.${prefixo}.${Date.now()}.${Math.floor(Math.random() * 10000)}@test.local`;

async function criarContaAtravesApi(prefixo) {
  const contexto = await request.newContext({ baseURL: "http://localhost:3000" });
  const dados = {
    nome_organizacao: `E2E ${prefixo} ${Date.now()}`,
    cnpj: gerarCNPJ(),
    nome: `Usuário ${prefixo}`,
    email: gerarEmail(prefixo),
    cpf: gerarCPF(),
    telefone: "(41) 98765-0001",
    senha: "SenhaForte123!",
    confirmar_senha: "SenhaForte123!",
  };

  const resposta = await contexto.post("/registro", { data: dados });
  if (resposta.status() !== 201) {
    const texto = await resposta.text();
    await contexto.dispose();
    throw new Error(`Falha ao criar conta via API: ${resposta.status()} ${texto}`);
  }

  const corpo = await resposta.json();
  await contexto.dispose();

  return {
    ...corpo.usuario,
    email: dados.email,
    senha: dados.senha,
    token: corpo.token,
  };
}

async function loginPelaInterface(page, conta) {
  await page.goto("/login.html");
  await page.fill("#email", conta.email);
  await page.fill("#senha", conta.senha);
  await page.click('button:has-text("Entrar")');
  await page.waitForURL(/dashboard\.html/);
}

module.exports = {
  gerarCPF,
  gerarCNPJ,
  gerarEmail,
  criarContaAtravesApi,
  loginPelaInterface,
};