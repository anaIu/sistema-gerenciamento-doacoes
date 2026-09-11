async function fazerLogin() {
  if (window.location.protocol === "file:") {
    exibirModalErro(
      "Abra o sistema pelo servidor: rode `node server.js` e acesse http://localhost:3000/login.html. Não abra o arquivo direto."
    );
    return;
  }

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    exibirModalErro("Informe e-mail e senha");
    return;
  }

  if (!validarEmail(email)) {
    exibirModalErro("Informe um e-mail válido");
    return;
  }

  try {
    const resposta = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));
      window.location.href = "dashboard.html";
    } else {
      exibirModalErro(dados.mensagem || "E-mail ou senha incorretos");
    }
  } catch (erro) {
    console.error("Erro ao fazer login:", erro);
    exibirModalErro("Erro ao fazer login. Tente novamente.");
  }
}