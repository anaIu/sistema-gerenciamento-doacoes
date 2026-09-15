aplicarMascara("cnpj", mascaraCnpj);
aplicarMascara("cpf", mascaraCpf);
aplicarMascara("telefone", mascaraTelefone);

async function criarConta() {
  const dados = {
    nome_organizacao: document.getElementById("nomeOrganizacao").value.trim(),
    cnpj: document.getElementById("cnpj").value.trim(),
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    cpf: document.getElementById("cpf").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    senha: document.getElementById("senha").value,
    confirmar_senha: document.getElementById("confirmarSenha").value,
    website: document.getElementById("website").value,
  };

  const erros = [];
  if (!dados.nome_organizacao) erros.push("Informe o nome da organização");
  if (!validarCNPJ(dados.cnpj)) erros.push("Informe um CNPJ válido");
  if (!dados.nome) erros.push("Informe o seu nome");
  if (!validarEmail(dados.email)) erros.push("Informe um e-mail válido");
  if (!validarCPF(dados.cpf)) erros.push("Informe um CPF válido");
  if (dados.telefone && !validarTelefone(dados.telefone)) erros.push("Informe um telefone válido");
  if (!validarSenha(dados.senha)) erros.push("A senha deve ter no mínimo 8 caracteres com pelo menos um número");
  if (!validarConfirmacao(dados.senha, dados.confirmar_senha)) erros.push("As senhas não coincidem");

  if (erros.length) {
    exibirModalErro(erros);
    return;
  }

  try {
    const resposta = await fetch("/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const retorno = await resposta.json();

    if (resposta.ok) {
      localStorage.setItem("token", retorno.token);
      localStorage.setItem("usuario", JSON.stringify(retorno.usuario));
      exibirModalSucesso(retorno.mensagem);
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } else {
      exibirModalErro(retorno.mensagem || "Não foi possível criar a conta");
    }
  } catch (erro) {
    console.error("Erro ao criar conta:", erro);
    exibirModalErro("Erro ao criar conta. Tente novamente.");
  }
}