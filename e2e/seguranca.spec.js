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

    // Recebe confirmação simulada e é redirecionado para login sem criar registro real
    await expect(page.locator(".modal-box.sucesso")).toBeVisible();
    await expect(page).toHaveURL(/login\.html/, { timeout: 15000 });

    // Tentar logar com as credenciais do bot deve falhar (não foi salvo no banco)
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

  test("S.5.5: token expirado ao carregar página protegida limpa sessão e redireciona para login", async ({ page }) => {
    // Monta um JWT estruturalmente válido mas com expiração no passado
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payloadPassado = Buffer.from(
      JSON.stringify({ id: 1, perfil: "Administrador", id_organizacao: 1, exp: Math.floor(Date.now() / 1000) - 300 })
    ).toString("base64url");
    const tokenExpirado = `${header}.${payloadPassado}.assinatura_simulada`;

    await page.goto("/login.html");
    await page.evaluate((tok) => {
      localStorage.setItem("token", tok);
      localStorage.setItem("usuario", JSON.stringify({ id: 1, nome: "Teste" }));
    }, tokenExpirado);

    // Tenta acessar página protegida com o token vencido
    await page.goto("/dashboard.html");

    // Deve redirecionar para login e ter limpado o localStorage
    await expect(page).toHaveURL(/login\.html/);
    const tokenSalvo = await page.evaluate(() => localStorage.getItem("token"));
    expect(tokenSalvo).toBeNull();
  });

  test("S.5.6: resposta 401 durante requisição exibe modal de Sessão Expirada e limpa credenciais", async ({ page }) => {
    const org = await criarContaAtravesApi("sessao-exp");
    await loginPelaInterface(page, org);
    await page.goto("/usuarios.html");

    // Simula token tornado inválido no localStorage durante o uso da tela
    await page.evaluate(() => {
      localStorage.setItem("token", "token-invalido-ou-expirado");
    });

    // Dispara ação que faz fetch autenticado
    await page.fill("#nome", "Novo Usuario");
    await page.fill("#email", "novo@test.local");
    await page.fill("#senha", "SenhaForte123!");
    await page.fill("#confirmarSenha", "SenhaForte123!");
    await page.click("#botaoPrincipal");

    // Deve exibir o modal específico de Sessão Expirada e redirecionar
    await expect(page.locator(".modal-box.erro")).toBeVisible();
    await expect(page.locator(".modal-box.erro")).toContainText("Sessão Expirada");

    // Redireciona para o login e limpa o token
    await expect(page).toHaveURL(/login\.html/, { timeout: 5000 });
    const tokenSalvo = await page.evaluate(() => localStorage.getItem("token"));
    expect(tokenSalvo).toBeNull();
  });
});
