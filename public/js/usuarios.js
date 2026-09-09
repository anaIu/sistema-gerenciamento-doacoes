verificarAutenticacao();

let usuarioEditandoId = null;
let usuariosLocais = [];

async function carregarUsuarios() {
  try {
    const resposta = await fetch("/usuarios", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });
    usuariosLocais = await resposta.json();
    popularTabela(usuariosLocais);
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);
  }
}

function popularTabela(usuarios) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  usuarios.forEach((usuario) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>${usuario.perfil}</td>
      <td>
        <button onclick="editarUsuario(${usuario.id_usuario})">Editar</button>
        <button onclick="excluirUsuario(${usuario.id_usuario})">Excluir</button>
      </td>`;
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
  document.getElementById("perfil").value = alvo.perfil;
  document.getElementById("tituloFormulario").textContent = "Editar Usuário";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Salvar";
  botao.setAttribute("onclick", "salvarUsuario()");
  document.getElementById("botaoCancelar").style.display = "inline-block";
}

function cancelarEdicao() {
  usuarioEditandoId = null;
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("perfil").value = "Administrador";
  document.getElementById("tituloFormulario").textContent = "Novo Usuário";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Cadastrar";
  botao.setAttribute("onclick", "cadastrarUsuario()");
  document.getElementById("botaoCancelar").style.display = "none";
}

async function salvarUsuario() {
  const usuario = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    perfil: document.getElementById("perfil").value,
    senha: document.getElementById("senha").value,
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
    alert(dados.mensagem);
    cancelarEdicao();
    carregarUsuarios();
  } catch (erro) {
    console.error(erro);
  }
}

async function excluirUsuario(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) {
    return;
  }

  try {
    const resposta = await fetch(`/usuarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    carregarUsuarios();
  } catch (erro) {
    console.error(erro);
  }
}

carregarUsuarios();

async function cadastrarUsuario() {
  const usuario = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    perfil: document.getElementById("perfil").value,
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

    alert(dados.mensagem);
    carregarUsuarios();
  } catch (erro) {
    console.error(erro);
  }
}
