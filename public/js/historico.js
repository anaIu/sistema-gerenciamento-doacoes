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
    tr.innerHTML = `<td>${escaparHTML(formatarData(registro.data_movimentacao))}</td><td>${escaparHTML(registro.tipo_doacao)}</td><td>${escaparHTML(registro.quantidade) || "-"}</td><td>${escaparHTML(registro.destino) || "-"}</td><td>${escaparHTML(registro.usuario_responsavel) || "-"}</td>`;
    corpo.appendChild(tr);
  });
}

carregarHistorico();
