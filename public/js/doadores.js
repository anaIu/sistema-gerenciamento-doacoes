verificarAutenticacao();
aplicarMascara("telefone", mascaraTelefone);

let doadorEditandoId = null;
let doadoresLocais = [];

async function carregarDoadores() {
  try {
    const resposta = await fetch("/doadores", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      exibirModalErro(dados.mensagem || "Erro ao carregar doadores");
      return;
    }

    doadoresLocais = await resposta.json();
    popularTabela(doadoresLocais);
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao carregar doadores.");
  }
}

function popularTabela(doadores) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  doadores.forEach((doador) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${doador.nome}</td>
      <td>${mascaraTelefone(doador.telefone) || "-"}</td>
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
  document.getElementById("telefone").value = mascaraTelefone(alvo.telefone) || "";
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

function validarFormularioDoador() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const erros = [];

  if (!nome) erros.push("Informe o nome do doador");
  if (email && !validarEmail(email)) erros.push("Informe um e-mail válido");
  if (telefone && !validarTelefone(telefone)) erros.push("Informe um telefone válido no formato (XX) XXXXX-XXXX");

  if (erros.length) exibirModalErro(erros);
  return erros.length === 0;
}

async function salvarDoador() {
  if (!validarFormularioDoador()) return;

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

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      carregarDoadores();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao salvar doador.");
  }
}

function excluirDoador(id) {
  exibirModalConfirmacao("Tem certeza que deseja excluir este doador?", async () => {
    try {
      const resposta = await fetch(`/doadores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${obterToken()}` },
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        exibirModalSucesso(dados.mensagem);
        carregarDoadores();
      } else {
        exibirModalErro(dados.mensagem);
      }
    } catch (erro) {
      console.error(erro);
      exibirModalErro("Erro ao excluir doador.");
    }
  });
}

carregarDoadores();

async function cadastrarDoador() {
  if (!validarFormularioDoador()) return;

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

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      document.getElementById("telefone").value = "";
      carregarDoadores();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao cadastrar doador.");
  }
}