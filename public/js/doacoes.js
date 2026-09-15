verificarAutenticacao();

let doacaoEditandoId = null;
let doacoesLocais = [];
let doadoresLocais = [];

async function carregarDoadores() {
  try {
    const resposta = await fetch("/doadores", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) return;

    doadoresLocais = await resposta.json();
    const select = document.getElementById("idDoador");
    select.innerHTML = '<option value="">Selecione um doador</option>';
    doadoresLocais.forEach((doador) => {
      const op = document.createElement("option");
      op.value = doador.id_doador;
      op.textContent = `${doador.id_doador} — ${doador.nome}`;
      select.appendChild(op);
    });
  } catch (erro) {
    console.error("Erro ao carregar doadores:", erro);
  }
}

async function carregarDoacoes() {
  try {
    const resposta = await fetch("/doacoes", {
      headers: { Authorization: `Bearer ${obterToken()}` },
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      exibirModalErro(dados.mensagem || "Erro ao carregar doações");
      return;
    }

    doacoesLocais = await resposta.json();
    popularTabela(doacoesLocais);
  } catch (erro) {
    console.error("Erro ao carregar doações:", erro);
    exibirModalErro("Erro ao carregar doações.");
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
  const selectDoador = document.getElementById("idDoador");
  const existeOpcao = Array.from(selectDoador.options).some(
    (op) => op.value === String(alvo.id_doador)
  );
  if (!existeOpcao && alvo.id_doador) {
    const op = document.createElement("option");
    op.value = alvo.id_doador;
    op.textContent = `${alvo.id_doador} — ${alvo.nome_doador || "Doador"}`;
    selectDoador.appendChild(op);
  }
  selectDoador.value = alvo.id_doador || "";
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

function validarFormularioDoacao() {
  const tipo = document.getElementById("tipo").value;
  const quantidade = document.getElementById("quantidade").value;
  const valor = document.getElementById("valor").value;
  const idDoador = document.getElementById("idDoador").value;
  const erros = [];

  if (!idDoador) erros.push("Selecione um doador");
  if (!tipo) erros.push("Selecione o tipo da doação");
  if (tipo === "Dinheiro") {
    if (valor === "" || Number(valor) <= 0) erros.push("Doações de dinheiro devem ter valor informado");
  } else if (quantidade === "" || Number(quantidade) <= 0) {
    erros.push("Doações de itens devem ter quantidade informada");
  }

  if (erros.length) exibirModalErro(erros);
  return erros.length === 0;
}

async function salvarDoacao() {
  if (!validarFormularioDoacao()) return;

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

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      carregarDoacoes();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao salvar doação.");
  }
}

function excluirDoacao(id) {
  exibirModalConfirmacao("Tem certeza que deseja excluir esta doação?", async () => {
    try {
      const resposta = await fetch(`/doacoes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${obterToken()}` },
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        exibirModalSucesso(dados.mensagem);
        carregarDoacoes();
      } else {
        exibirModalErro(dados.mensagem);
      }
    } catch (erro) {
      console.error(erro);
      exibirModalErro("Erro ao excluir doação.");
    }
  });
}

carregarDoadores();
carregarDoacoes();

async function cadastrarDoacao() {
  if (!validarFormularioDoacao()) return;

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

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      document.getElementById("quantidade").value = "";
      document.getElementById("valor").value = "";
      document.getElementById("observacao").value = "";
      carregarDoacoes();
    } else {
      exibirModalErro(dados.mensagem);
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao cadastrar doação.");
  }
}