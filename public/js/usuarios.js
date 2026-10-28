
verificarAutenticacao();

let usuarioEditandoId = null;
let usuariosLocais = [];

const usuarioLogado = obterUsuario();
const podeGerenciarUsuarios =
  usuarioLogado && usuarioLogado.perfil === "Administrador";

async function carregarUsuarios() {
  try {
    const resposta = await fetch("/usuarios", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      exibirModalErro(dados.mensagem || "Erro ao carregar usuários");
      return;
    }

    usuariosLocais = await resposta.json();
    popularTabela(usuariosLocais);
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);
    exibirModalErro("Erro ao carregar usuários.");
  }
}

function popularTabela(usuarios) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";

  usuarios.forEach((usuario) => {
    const tr = document.createElement("tr");
    const idUsuario = Number(usuario.id_usuario);
    const estaAtivo = usuario.ativo !== false;
    const ehPropriaConta =
      usuarioLogado && usuarioLogado.id === idUsuario;

    let acoes = "-";

    if (podeGerenciarUsuarios) {
      const botoes = [
        `<button type="button" data-acao="editar" data-id="${idUsuario}">Editar</button>`,
        `<button type="button" data-acao="excluir" data-id="${idUsuario}">Excluir</button>`,
      ];

      if (!ehPropriaConta) {
        botoes.push(
          estaAtivo
            ? `<button type="button" data-acao="desativar" data-id="${idUsuario}">Desativar</button>`
            : `<button type="button" data-acao="ativar" data-id="${idUsuario}">Ativar</button>`
        );
      }

      acoes = botoes.join(" ");
    }

    tr.innerHTML = `
      <td>${escaparHTML(usuario.nome)}</td>
      <td>${escaparHTML(usuario.email)}</td>
      <td>${escaparHTML(usuario.perfil)}</td>
      <td>${estaAtivo ? "Ativo" : "Inativo"}</td>
      <td>${acoes}</td>`;

    corpo.appendChild(tr);
  });
}

function editarUsuario(id) {
  const alvo = usuariosLocais.find((u) => u.id_usuario === id);
  if (!alvo) return;

  usuarioEditandoId = id;

  document.getElementById("nome").value = alvo.nome;
  document.getElementById("email").value = alvo.email;
  document.getElementById("senha").value = "";
  document.getElementById("confirmarSenha").value = "";

  document.getElementById("tituloFormulario").textContent =
    "Editar Usuário";

  const botao = document.getElementById("botaoPrincipal");
  botao.textContent = "Salvar";

  document.getElementById("botaoCancelar").style.display =
    "inline-block";
}

function cancelarEdicao() {
  usuarioEditandoId = null;

  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("confirmarSenha").value = "";

  document.getElementById("tituloFormulario").textContent =
    "Novo Usuário";

  const botao = document.getElementById("botaoPrincipal");
  botao.textContent = "Cadastrar";

  document.getElementById("botaoCancelar").style.display = "none";
}

function validarFormularioUsuario(exigeSenha) {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const confirmarSenha =
    document.getElementById("confirmarSenha").value;

  const erros = [];

  if (!nome) erros.push("Informe o nome");

  if (!validarEmail(email)) {
    erros.push("Informe um e-mail válido");
  }

  if (exigeSenha || senha) {
    if (!validarSenha(senha)) {
      erros.push(
        "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula e número"
      );
    } else if (!validarConfirmacao(senha, confirmarSenha)) {
      erros.push("As senhas não coincidem");
    }
  }

  if (erros.length) exibirModalErro(erros);

  return erros.length === 0;
}

async function salvarUsuario() {
  if (!validarFormularioUsuario(false)) return;

  const usuario = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value || undefined,
  };

  try {
    const resposta = await fetch(`/usuarios/${usuarioEditandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(usuario),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      carregarUsuarios();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao salvar usuário.");
  }
}

function excluirUsuario(id) {
  exibirModalConfirmacao(
    "Tem certeza que deseja excluir este usuário?",
    async () => {
      try {
        const resposta = await fetch(`/usuarios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${obterToken()}`,
          },
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          exibirModalSucesso(dados.mensagem);
          carregarUsuarios();
        } else {
          exibirModalErro(dados.mensagem);
        }
      } catch (erro) {
        console.error(erro);
        exibirModalErro("Erro ao excluir usuário.");
      }
    }
  );
}

carregarUsuarios();

async function cadastrarUsuario() {
  if (!validarFormularioUsuario(true)) return;

  const usuario = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
  };

  try {
    const resposta = await fetch("/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(usuario),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      document.getElementById("senha").value = "";
      document.getElementById("confirmarSenha").value = "";
      carregarUsuarios();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao cadastrar usuário.");
  }
}

async function alterarAtivo(id, ativo) {
  const acao = ativo ? "ativar" : "desativar";

  exibirModalConfirmacao(
    `Tem certeza que deseja ${acao} este usuário?`,
    async () => {
      try {
        const resposta = await fetch(`/usuarios/${id}/ativo`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${obterToken()}`,
          },
          body: JSON.stringify({ ativo }),
        });

        const dados = await resposta.json();

        if (resposta.ok) {
          exibirModalSucesso(dados.mensagem);
          carregarUsuarios();
        } else {
          exibirModalErro(dados.mensagem);
        }
      } catch (erro) {
        console.error(erro);
        exibirModalErro("Erro ao alterar status do usuário.");
      }
    }
  );
}

// Confirmação antes de salvar alterações em um usuário
document.getElementById("botaoPrincipal").addEventListener("click", () => {
  if (usuarioEditandoId !== null) {
    if (!validarFormularioUsuario(false)) return;

    exibirModalConfirmacao(
      "Tem certeza que deseja salvar as alterações deste usuário?",
      () => salvarUsuario()
    );
  } else {
    cadastrarUsuario();
  }
});

document
  .getElementById("botaoCancelar")
  .addEventListener("click", cancelarEdicao);

document.querySelector("table tbody").addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const id = Number(botao.dataset.id);
  const acao = botao.dataset.acao;

  if (acao === "editar") {
    editarUsuario(id);
  } else if (acao === "excluir") {
    excluirUsuario(id);
  } else if (acao === "ativar") {
    alterarAtivo(id, true);
  } else if (acao === "desativar") {
    alterarAtivo(id, false);
  }
});
