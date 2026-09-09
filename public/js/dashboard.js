verificarAutenticacao();

function formatarData(data) {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function carregarDashboard() {
  try {
    const resposta = await fetch("/dashboard", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}`);
    }

    const dados = await resposta.json();

    document.getElementById("totalUsuarios").textContent = dados.usuarios + " cadastrados";
    document.getElementById("totalDoadores").textContent = dados.doadores + " cadastrados";
    document.getElementById("totalDoacoes").textContent = dados.doacoes + " registradas";
    document.getElementById("totalEstoque").textContent = dados.saldoEstoque + " itens";
    document.getElementById("totalDinheiro").textContent = formatarMoeda(dados.totalDinheiro);

    const corpo = document.querySelector("table tbody");
    corpo.innerHTML = "";
    dados.movimentacoes.forEach((mov) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${formatarData(mov.data_movimentacao)}</td><td>${mov.tipo_doacao}</td><td>${mov.observacao || "-"}</td><td>${mov.usuario_responsavel || "-"}</td>`;
      corpo.appendChild(tr);
    });
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
  }
}

carregarDashboard();
