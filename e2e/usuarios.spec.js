const { test, expect } = require("@playwright/test");
const { criarContaAtravesApi, loginPelaInterface, gerarEmail } = require("./utils");

let conta;

test.beforeAll(async () => {
  conta = await criarContaAtravesApi("usuarios");
});

test("cadastra usuário com confirmação de senha e perfil Funcionário", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/usuarios.html");

  const nome = `Funcionário ${Date.now()}`;
  await page.fill("#nome", nome);
  await page.fill("#email", gerarEmail("usuario"));
  await page.fill("#senha", "SenhaForte123!");
  await page.fill("#confirmarSenha", "SenhaForte123!");
  await page.click('button:has-text("Cadastrar")');

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: nome })).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: nome })).toContainText("Funcionário");
});

test("exibe erro quando as senhas não coincidem", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/usuarios.html");

  await page.fill("#nome", "Funcionário Inválido");
  await page.fill("#email", gerarEmail("usuario-erro"));
  await page.fill("#senha", "SenhaForte123!");
  await page.fill("#confirmarSenha", "Diferente123!");
  await page.click('button:has-text("Cadastrar")');

  await expect(page.locator(".modal-box.erro")).toContainText("As senhas não coincidem");
});

test("rejeita senha fraca no cadastro", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/usuarios.html");

  await page.fill("#nome", "Senha Fraca");
  await page.fill("#email", gerarEmail("senha-fraca"));
  await page.fill("#senha", "12345678");
  await page.fill("#confirmarSenha", "12345678");
  await page.click("#botaoPrincipal");

  await expect(page.locator(".modal-box.erro")).toContainText("maiúscula");
});

test("desativa funcionário e bloqueia seu login", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/usuarios.html");

  const nome = `Desativar ${Date.now()}`;
  const email = gerarEmail("desativar");
  const senha = "SenhaForte123!";

  await page.fill("#nome", nome);
  await page.fill("#email", email);
  await page.fill("#senha", senha);
  await page.fill("#confirmarSenha", senha);
  await page.click("#botaoPrincipal");

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await page.locator(".modal-box.sucesso button", { hasText: "OK" }).click();

  const linha = page.locator("tbody tr", { hasText: nome });
  await expect(linha).toContainText("Ativo");
  await linha.locator('button[data-acao="desativar"]').click();

  await expect(page.locator(".modal-box.confirmacao")).toBeVisible();
  await page.locator(".modal-box.confirmacao button", { hasText: "Confirmar" }).click();

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await page.locator(".modal-box.sucesso button", { hasText: "OK" }).click();

  await expect(page.locator("tbody tr", { hasText: nome })).toContainText("Inativo");

  await page.evaluate(() => localStorage.clear());
  await page.goto("/login.html");
  await page.fill("#email", email);
  await page.fill("#senha", senha);
  await page.click("#botaoLogin");

  await expect(page.locator(".modal-box.erro")).toContainText("inativo");
});