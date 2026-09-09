verificarAutenticacao();

let doacaoEditandoId = null;
let doacoesLocais = [];

async function carregarDoacoes() {
  try {
    const resposta = await fetch("/doacoes", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });
    doacoesLocais = await resposta.json();
    popularTabela(doacoesLocais);
  } catch (erro) {
    console.error("Erro ao carregar doações:", erro);
  }
}

function formatarValor(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function popularTabela(doacoes) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  doacoes.forEach((doacao) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${doacao.tipo}</td>
      <td>${doacao.quantidade || "-"}</td>
      <td>${formatarValor(doacao.valor)}</td>
      <td>${doacao.nome_doador || "-"}</td>
      <td>
        <button onclick="editarDoacao(${doacao.id_doacao})">Editar</button>
        <button onclick="excluirDoacao(${doacao.id_doacao})">Excluir</button>
      </td>`;
    corpo.appendChild(tr);
  });
}

function editarDoacao(id) {
  const alvo = doacoesLocais.find((d) => d.id_doacao === id);
  if (!alvo) return;

  doacaoEditandoId = id;
  document.getElementById("idDoador").value = alvo.id_doador || "";
  document.getElementById("tipo").value = alvo.tipo;
  document.getElementById("quantidade").value = alvo.quantidade || "";
  document.getElementById("valor").value = alvo.valor || "";
  document.getElementById("observacao").value = alvo.observacao || "";
  document.getElementById("tituloFormulario").textContent = "Editar Doação";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Salvar";
  botao.setAttribute("onclick", "salvarDoacao()");
  document.getElementById("botaoCancelar").style.display = "inline-block";
}

function cancelarEdicao() {
  doacaoEditandoId = null;
  document.getElementById("idDoador").value = "";
  document.getElementById("tipo").value = "Alimento";
  document.getElementById("quantidade").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("observacao").value = "";
  document.getElementById("tituloFormulario").textContent = "Nova Doação";
  const botao = document.querySelector(".form-box button");
  botao.textContent = "Registrar";
  botao.setAttribute("onclick", "cadastrarDoacao()");
  document.getElementById("botaoCancelar").style.display = "none";
}

async function salvarDoacao() {
  const doacao = {
    tipo: document.getElementById("tipo").value,
    quantidade: document.getElementById("quantidade").value,
    valor: document.getElementById("valor").value,
    observacao: document.getElementById("observacao").value,
    id_doador: document.getElementById("idDoador").value,
  };

  try {
    const resposta = await fetch(`/doacoes/${doacaoEditandoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(doacao),
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    cancelarEdicao();
    carregarDoacoes();
  } catch (erro) {
    console.error(erro);
  }
}

async function excluirDoacao(id) {
  if (!confirm("Tem certeza que deseja excluir esta doação?")) {
    return;
  }

  try {
    const resposta = await fetch(`/doacoes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    const dados = await resposta.json();
    alert(dados.mensagem);
    carregarDoacoes();
  } catch (erro) {
    console.error(erro);
  }
}

carregarDoacoes();

async function cadastrarDoacao() {
  const doacao = {
    tipo: document.getElementById("tipo").value,
    quantidade: document.getElementById("quantidade").value,
    valor: document.getElementById("valor").value,
    observacao: document.getElementById("observacao").value,
    id_doador: document.getElementById("idDoador").value,
    id_usuario: obterUsuarioId(),
  };

  try {
    const resposta = await fetch("/doacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(doacao),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
    carregarDoacoes();
  } catch (erro) {
    console.error(erro);
  }
}
