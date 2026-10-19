const { test, expect } = require("@playwright/test");
const { criarContaAtravesApi, gerarCNPJ, gerarCPF, gerarEmail, loginPelaInterface } = require("./utils");

test.describe("E2E de Segurança (S.5)", () => {
  test("S.5.1: tentativa de SQL Injection no login na tela real exibe erro amigável", async ({ page }) => {
    await page.goto("/login.html");
    await page.fill("#email", gerarEmail("sqli"));
    await page.fill("#senha", "' OR '1'='1' --");
    await page.click('button:has-text("Entrar")');

    await expect(page.locator(".modal-box.erro")).toBeVisible();
    await expect(page.locator(".modal-box.erro")).toContainText("Credenciais inválidas");
    expect(page.url()).toContain("login.html");
  });

  test("S.5.2: honeypot preenchido no formulário de registro não cria registros reais", async ({ page }) => {
    await page.goto("/criar-conta.html");

    const emailBot = gerarEmail("bot");
    await page.fill("#nomeOrganizacao", "Bot Company");
    await page.fill("#cnpj", gerarCNPJ());
    await page.fill("#nome", "Robô Spammer");
    await page.fill("#email", emailBot);
    await page.fill("#cpf", gerarCPF());
    await page.fill("#telefone", "(11) 98765-4321");
    await page.fill("#senha", "SenhaForte123!");
    await page.fill("#confirmarSenha", "SenhaForte123!");

    // Injeta valor no honeypot invisível
    await page.evaluate(() => {
      document.getElementById("website").value = "http://spam-link.org";
    });

    await page.click('button:has-text("Criar conta")');

    // Recebe confirmação simulada mas não loga no dashboard
    await expect(page.locator(".modal-box.sucesso")).toBeVisible();
    await expect(page.locator(".modal-box.sucesso")).toContainText("Operação registrada");

    // Tentar logar com as credenciais do bot deve falhar (não foi salvo no banco)
    await page.goto("/login.html");
    await page.fill("#email", emailBot);
    await page.fill("#senha", "SenhaForte123!");
    await page.click('button:has-text("Entrar")');

    await expect(page.locator(".modal-box.erro")).toBeVisible();
    await expect(page.locator(".modal-box.erro")).toContainText("Credenciais inválidas");
  });

  test("S.5.3: acesso direto a páginas protegidas sem token redireciona para login", async ({ page }) => {
    const rotasProtegidas = [
      "/dashboard.html",
      "/usuarios.html",
      "/doadores.html",
      "/doacoes.html",
      "/estoque.html",
      "/historico.html",
      "/perfil.html",
    ];

    for (const rota of rotasProtegidas) {
      await page.goto(rota);
      await expect(page).toHaveURL(/login\.html/);
    }
  });

  test("S.5.4: isolamento multi-tenant entre organizações", async ({ page, request }) => {
    // Cria duas contas em organizações separadas
    const orgA = await criarContaAtravesApi("org-a");
    const orgB = await criarContaAtravesApi("org-b");

    // Cadastra um doador na Org A via API
    const nomeDoadorOrgA = `Doador Exclusivo Org A ${Date.now()}`;
    const resDoador = await request.post("/doadores", {
      headers: { Authorization: `Bearer ${orgA.token}` },
      data: {
        nome: nomeDoadorOrgA,
        telefone: "(41) 99999-8888",
        email: "doadorA@test.local",
      },
    });
    expect(resDoador.status()).toBe(201);

    // Faz login com usuário da Org B pela interface
    await loginPelaInterface(page, orgB);
    await page.goto("/doadores.html");

    // O doador da Org A NÃO deve aparecer na tabela da Org B
    await expect(page.locator(`text=${nomeDoadorOrgA}`)).not.toBeVisible();
  });
});
