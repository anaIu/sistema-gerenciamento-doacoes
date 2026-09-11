verificarAutenticacao();
aplicarMascara("telefone", mascaraTelefone);
aplicarMascara("cpf", mascaraCpf);

let perfil = null;

async function carregarPerfil() {
  try {
    const resposta = await fetch("/perfil", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      exibirModalErro(dados.mensagem || "Erro ao carregar perfil");
      return;
    }

    perfil = await resposta.json();

    document.getElementById("infoNome").textContent = perfil.usuario.nome;
    document.getElementById("infoEmail").textContent = perfil.usuario.email;
    document.getElementById("infoCpf").textContent = mascaraCpf(perfil.usuario.cpf) || "-";
    document.getElementById("infoTelefone").textContent = mascaraTelefone(perfil.usuario.telefone) || "-";
    document.getElementById("infoPerfil").textContent = perfil.usuario.perfil;
    document.getElementById("infoOrganizacao").textContent = perfil.organizacao.nome;
    document.getElementById("infoCnpj").textContent = mascaraCnpj(perfil.organizacao.cnpj) || "-";
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    exibirModalErro("Erro ao carregar perfil.");
  }
}

function editarPerfil() {
  document.getElementById("nome").value = perfil.usuario.nome;
  document.getElementById("email").value = perfil.usuario.email;
  document.getElementById("telefone").value = mascaraTelefone(perfil.usuario.telefone) || "";
  document.getElementById("cpf").value = mascaraCpf(perfil.usuario.cpf) || "";
  document.getElementById("infoBox").style.display = "none";
  document.getElementById("editBox").style.display = "block";
}

function cancelarEdicao() {
  document.getElementById("infoBox").style.display = "block";
  document.getElementById("editBox").style.display = "none";
}

async function salvarPerfil() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cpf = document.getElementById("cpf").value.trim();

  const erros = [];
  if (!nome) erros.push("Informe o nome");
  if (!validarEmail(email)) erros.push("Informe um e-mail válido");
  if (telefone && !validarTelefone(telefone)) erros.push("Informe um telefone válido");
  if (cpf && !validarCPF(cpf)) erros.push("Informe um CPF válido");

  if (erros.length) {
    exibirModalErro(erros);
    return;
  }

  try {
    const resposta = await fetch("/perfil", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify({ nome, email, cpf, telefone }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      const usuarioLogado = obterUsuario();
      if (usuarioLogado) {
        usuarioLogado.nome = nome;
        usuarioLogado.email = email;
        usuarioLogado.cpf = cpf;
        usuarioLogado.telefone = telefone;
        localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
      }
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      carregarPerfil();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);
    exibirModalErro("Erro ao salvar perfil.");
  }
}

carregarPerfil();