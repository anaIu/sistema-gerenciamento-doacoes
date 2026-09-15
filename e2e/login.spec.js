const { test, expect } = require("@playwright/test");
const { criarContaAtravesApi } = require("./utils");

let conta;

test.beforeAll(async () => {
  conta = await criarContaAtravesApi("login");
});

test("login com credenciais válidas redireciona para o dashboard", async ({ page }) => {
  await page.goto("/login.html");
  await page.fill("#email", conta.email);
  await page.fill("#senha", conta.senha);
  await page.click('button:has-text("Entrar")');

  await expect(page).toHaveURL(/dashboard\.html/);
  await expect(page.locator("#sidebar")).toBeVisible();
});

test("login com senha incorreta exibe erro", async ({ page }) => {
  await page.goto("/login.html");
  await page.fill("#email", conta.email);
  await page.fill("#senha", "SenhaErrada123!");

  await page.click('button:has-text("Entrar")');

  await expect(page.locator(".modal-box.erro")).toContainText("Credenciais inválidas");
});