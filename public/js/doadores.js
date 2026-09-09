verificarAutenticacao();

let doadorEditandoId = null;
let doadoresLocais = [];

async function carregarDoadores() {
  try {
    const resposta = await fetch("/doadores", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });
    doadoresLocais = await resposta.json();
    popularTabela(doadoresLocais);
  } catch (erro) {
    console.error(erro);
  }
}

function popularTabela(doadores) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  doadores.forEach((doador) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${doador.nome}</td>
      <td>${doador.telefone || "-"}</td>
      <td>${doador.email || "-"}</td>
      <td>
        <button onclick="editarDoador(${doador.id_doador})">Editar</button>
        <button onclick="excluirDoador(${doador.id_doador})">Excluir</button>
      </td>`;
    corpo.appendChild(tr);
  });
}

function editarDoador(id) {
  const alvo = doadoresLocais.find((d) => d.id_doador === id);
  if (!alvo) return;

  doadorEditandoId = id;
  document.getElementById("nome").value = alvo.nome;
  document.getElementById("telefone").value = alvo.telefone || "";
  document.getElementById("email").value = alvo.email || "";
  document.getElementById("observacao").value = alvo.observacao || "";
  document.getElementById("tituloFormulario").textContent = "Editar Doador";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Salvar";
  botao.setAttribute("onclick", "salvarDoador()");
  document.getElementById("botaoCancelar").style.display = "inline-block";
}

function cancelarEdicao() {
  doadorEditandoId = null;
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("observacao").value = "";
  document.getElementById("tituloFormulario").textContent = "Novo Doador";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Cadastrar";
  botao.setAttribute("onclick", "cadastrarDoador()");
  document.getElementById("botaoCancelar").style.display = "none";
}

async function salvarDoador() {
  const doador = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    email: document.getElementById("email").value,
    observacao: document.getElementById("observacao").value,
  };

  try {
    const resposta = await fetch(`/doadores/${doadorEditandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(doador),
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    cancelarEdicao();
    carregarDoadores();
  } catch (erro) {
    console.error(erro);
  }
}

async function excluirDoador(id) {
  if (!confirm("Tem certeza que deseja excluir este doador?")) {
    return;
  }

  try {
    const resposta = await fetch(`/doadores/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    carregarDoadores();
  } catch (erro) {
    console.error(erro);
  }
}

carregarDoadores();

async function cadastrarDoador() {
  const doador = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    email: document.getElementById("email").value,
    observacao: document.getElementById("observacao").value,
    id_usuario_cadastro: obterUsuarioId(),
  };

  try {
    const resposta = await fetch("/doadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(doador),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
    carregarDoadores();
  } catch (erro) {
    console.error(erro);
  }
}
