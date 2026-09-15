const { test, expect } = require("@playwright/test");
const { criarContaAtravesApi, loginPelaInterface } = require("./utils");

let conta;

test.beforeAll(async () => {
  conta = await criarContaAtravesApi("perfil");
});

test("exibe dados e edita o perfil", async ({ page }) => {
  await loginPelaInterface(page, conta);
  await page.goto("/perfil.html");

  await expect(page.locator("#infoNome")).toHaveText(conta.nome);
  await expect(page.locator("#infoOrganizacao")).toContainText(/E2E perfil/i);

  await page.click('button:has-text("Editar")');

  const nomeEditado = `${conta.nome} Editado`;
  await page.fill("#nome", nomeEditado);
  await page.fill("#telefone", "(41) 98888-0003");
  await page.click('button:has-text("Salvar")');

  await expect(page.locator(".modal-box.sucesso")).toBeVisible();
  await expect(page.locator("#infoNome")).toHaveText(nomeEditado);
});