verificarAutenticacao();

function formatarData(data) {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

async function carregarMovimentacoes() {
  try {
    const resposta = await fetch("/estoque", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });
    const movimentacoes = await resposta.json();
    popularTabela(movimentacoes);
  } catch (erro) {
    console.error("Erro ao carregar movimentações:", erro);
  }
}

function popularTabela(movimentacoes) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  movimentacoes.forEach((movimentacao) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${movimentacao.tipo_doacao}</td><td>${movimentacao.quantidade}</td><td>${movimentacao.destino || "-"}</td><td>${formatarData(movimentacao.data_movimentacao)}</td>`;
    corpo.appendChild(tr);
  });
}

async function registrarSaida() {
  const movimentacao = {
    quantidade: document.getElementById("quantidade").value,
    destino: document.getElementById("destino").value,
    observacao: document.getElementById("observacao").value,
    id_doacao: document.getElementById("idDoacao").value,
    id_usuario: obterUsuarioId(),
  };

  try {
    const resposta = await fetch("/estoque/saida", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(movimentacao),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
    carregarMovimentacoes();
  } catch (erro) {
    console.error(erro);
  }
}

carregarMovimentacoes();
