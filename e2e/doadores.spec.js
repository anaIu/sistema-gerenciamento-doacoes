const { test, expect } = require("@playwright/test");
const { criarContaAtravesApi, loginPelaInterface } = require("./utils");

let conta;

test.beforeAll(async () => {
  conta = await criarContaAtravesApi("doadores");
});

test("cadastra doador e exibe na tabela", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/doadores.html");

  const nome = `Doador ${Date.now()}`;
  await page.fill("#nome", nome);
  await page.fill("#telefone", "(41) 98765-0002");
  await page.fill("#email", `doador.${Date.now()}@test.local`);
  await page.click('button:has-text("Cadastrar")');

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await expect(page.locator("tbody tr", { hasText: nome })).toBeVisible();
});

test("rejeita telefone inválido", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/doadores.html");

  await page.fill("#nome", "Doador Inválido");
  await page.fill("#telefone", "123");
  await page.click('button:has-text("Cadastrar")');

  await expect(page.locator(".modal-box.erro")).toContainText("telefone válido");
});