const { test, expect } = require("@playwright/test");
const { gerarCPF, gerarCNPJ, gerarEmail } = require("./utils");

test("registra conta e redireciona para o dashboard", async ({ page }) => {
  await page.goto("/criar-conta.html");

  const sufixo = Date.now();
  await page.fill("#nomeOrganizacao", `Org E2E ${sufixo}`);
  await page.fill("#cnpj", gerarCNPJ());
  await page.fill("#nome", `Usuário ${sufixo}`);
  await page.fill("#email", gerarEmail("registro"));
  await page.fill("#cpf", gerarCPF());
  await page.fill("#telefone", "(41) 98765-0001");
  await page.fill("#senha", "SenhaForte123!");
  await page.fill("#confirmarSenha", "SenhaForte123!");

  await page.click('button:has-text("Criar conta")');

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await expect(page).toHaveURL(/dashboard\.html/, { timeout: 15000 });
  await expect(page.locator("#sidebar")).toBeVisible();
});

test("exibe erro quando as senhas não coincidem", async ({ page }) => {
  await page.goto("/criar-conta.html");

  await page.fill("#nomeOrganizacao", "Org Falha");
  await page.fill("#cnpj", gerarCNPJ());
  await page.fill("#nome", "Teste");
  await page.fill("#email", gerarEmail("registro-erro"));
  await page.fill("#cpf", gerarCPF());
  await page.fill("#senha", "SenhaForte123!");
  await page.fill("#confirmarSenha", "Diferente123!");

  await page.click('button:has-text("Criar conta")');

  await expect(page.locator(".modal-box.erro")).toContainText("As senhas não coincidem");
});