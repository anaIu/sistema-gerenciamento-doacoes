verificarAutenticacao();

function formatarData(data) {
  const dataObj = new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
}

async function carregarOpcoesDoacoes() {
  try {
    const resposta = await fetch("/doacoes", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) return;

    const doacoes = await resposta.json();
    const select = document.getElementById("idDoacao");
    select.innerHTML = '<option value="">Selecione uma doação</option>';
    doacoes
      .filter((d) => d.tipo !== "Dinheiro")
      .forEach((doacao) => {
        const op = document.createElement("option");
        op.value = doacao.id_doacao;
        op.textContent = `${doacao.id_doacao} — ${doacao.tipo} — ${doacao.nome_doador || "sem doador"}`;
        select.appendChild(op);
      });
  } catch (erro) {
    console.error("Erro ao carregar doações para o estoque:", erro);
  }
}

async function carregarMovimentacoes() {
  try {
    const resposta = await fetch("/estoque", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      exibirModalErro(dados.mensagem || "Erro ao carregar movimentações");
      return;
    }

    const movimentacoes = await resposta.json();
    popularTabela(movimentacoes);
  } catch (erro) {
    console.error("Erro ao carregar movimentações:", erro);
    exibirModalErro("Erro ao carregar movimentações.");
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
  const idDoacao = document.getElementById("idDoacao").value;
  const quantidade = document.getElementById("quantidade").value;
  const destino = document.getElementById("destino").value.trim();
  const observacao = document.getElementById("observacao").value;

  const erros = [];
  if (!idDoacao) erros.push("Selecione uma doação");
  if (!quantidade || Number(quantidade) <= 0) erros.push("Informe uma quantidade válida");
  if (!destino) erros.push("Informe o destino da saída");

  if (erros.length) {
    exibirModalErro(erros);
    return;
  }

  const movimentacao = {
    quantidade,
    destino,
    observacao,
    id_doacao: idDoacao,
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

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      document.getElementById("quantidade").value = "";
      document.getElementById("destino").value = "";
      document.getElementById("observacao").value = "";
      carregarMovimentacoes();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao registrar saída.");
  }
}

carregarOpcoesDoacoes();
carregarMovimentacoes();