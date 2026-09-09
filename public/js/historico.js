verificarAutenticacao();

function formatarData(data) {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

async function carregarHistorico() {
  try {
    const resposta = await fetch("/historico", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });
    const registros = await resposta.json();
    popularTabela(registros);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }
}

function popularTabela(registros) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";
  registros.forEach((registro) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${formatarData(registro.data_movimentacao)}</td><td>${registro.tipo_doacao}</td><td>${registro.quantidade || "-"}</td><td>${registro.destino || "-"}</td><td>${registro.usuario_responsavel || "-"}</td>`;
    corpo.appendChild(tr);
  });
}

carregarHistorico();
