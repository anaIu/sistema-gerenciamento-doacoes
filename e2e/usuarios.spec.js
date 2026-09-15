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