
verificarAutenticacao();

let doacaoEditandoId = null;
let doacoesLocais = [];
let doadoresLocais = [];
let salvandoDoacao = false;

const selectDoador = document.getElementById("idDoador");
const selectTipo = document.getElementById("tipo");
const campoQuantidade = document.getElementById("campoQuantidade");
const campoValor = document.getElementById("campoValor");
const inputQuantidade = document.getElementById("quantidade");
const inputValor = document.getElementById("valor");
const inputObservacao = document.getElementById("observacao");
const botaoPrincipal = document.getElementById("botaoPrincipal");
const botaoCancelar = document.getElementById("botaoCancelar");

// Mostra apenas os campos necessários para o tipo selecionado.
function atualizarCamposTipo() {
  const dinheiro = selectTipo.value === "Dinheiro";

  campoQuantidade.style.display = dinheiro ? "none" : "block";
  campoValor.style.display = dinheiro ? "block" : "none";

  inputQuantidade.disabled = dinheiro;
  inputValor.disabled = !dinheiro;

  if (dinheiro) {
    inputQuantidade.value = "";
  } else {
    inputValor.value = "";
  }
}

selectTipo.addEventListener("change", atualizarCamposTipo);

// Carrega os doadores disponíveis.
async function carregarDoadores() {
  try {
    const resposta = await fetch("/doadores", {
      headers: {
        Authorization: `Bearer ${obterToken()}`,
      },
    });

    if (!resposta.ok) return;

    doadoresLocais = await resposta.json();

    selectDoador.innerHTML =
      '<option value="">Selecione um doador</option>';

    doadoresLocais.forEach((doador) => {
      const opcao = document.createElement("option");

      opcao.value = doador.id_doador;
      opcao.textContent = `${doador.id_doador} — ${doador.nome}`;

      selectDoador.appendChild(opcao);
    });
  } catch (erro) {
    console.error("Erro ao carregar doadores:", erro);
  }
}

// Carrega as doações cadastradas.
async function carregarDoacoes() {
  try {
    const resposta = await fetch("/doacoes", {
      headers: {
        Authorization: `Bearer ${obterToken()}`,
      },
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
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Mantém a tabela existente, sem alterar a atividade 0005.
function popularTabela(doacoes) {
  const corpo = document.querySelector("table tbody");
  corpo.innerHTML = "";

  doacoes.forEach((doacao) => {
    const tr = document.createElement("tr");
    const idDoacao = Number(doacao.id_doacao);

    tr.innerHTML = `
      <td>${escaparHTML(doacao.tipo)}</td>
      <td>${escaparHTML(doacao.quantidade) || "-"}</td>
      <td>${escaparHTML(formatarValor(doacao.valor))}</td>
      <td>${escaparHTML(doacao.nome_doador) || "-"}</td>
      <td>
        <button type="button" data-acao="editar" data-id="${idDoacao}">Editar</button>
        <button type="button" data-acao="excluir" data-id="${idDoacao}">Excluir</button>
      </td>`;

    corpo.appendChild(tr);
  });
}

// Preenche o formulário para editar uma doação.
function editarDoacao(id) {
  const alvo = doacoesLocais.find(
    (doacao) => Number(doacao.id_doacao) === id
  );

  if (!alvo) return;

  doacaoEditandoId = id;

  const existeOpcao = Array.from(selectDoador.options).some(
    (opcao) => opcao.value === String(alvo.id_doador)
  );

  if (!existeOpcao && alvo.id_doador) {
    const opcao = document.createElement("option");

    opcao.value = alvo.id_doador;
    opcao.textContent =
      `${alvo.id_doador} — ${alvo.nome_doador || "Doador"}`;

    selectDoador.appendChild(opcao);
  }

  selectDoador.value = alvo.id_doador || "";

  selectTipo.value = alvo.tipo;
  atualizarCamposTipo();

  inputQuantidade.value = alvo.quantidade ?? "";
  inputValor.value = alvo.valor ?? "";
  inputObservacao.value = alvo.observacao ?? "";

  document.getElementById("tituloFormulario").textContent =
    "Editar Doação";

  botaoPrincipal.textContent = "Salvar";
  botaoCancelar.style.display = "inline-block";

  document.querySelector(".form-box").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Limpa o formulário e retorna ao modo de cadastro.
function cancelarEdicao() {
  doacaoEditandoId = null;

  selectDoador.value = "";
  selectTipo.value = "Alimento";

  inputQuantidade.value = "";
  inputValor.value = "";
  inputObservacao.value = "";

  atualizarCamposTipo();

  document.getElementById("tituloFormulario").textContent =
    "Nova Doação";

  botaoPrincipal.textContent = "Registrar";
  botaoCancelar.style.display = "none";
}

// Valida os campos antes de enviar.
function validarFormularioDoacao() {
  const tipo = selectTipo.value;
  const quantidade = inputQuantidade.value.trim();
  const valor = inputValor.value.trim();
  const idDoador = selectDoador.value;

  const erros = [];

  if (!idDoador) {
    erros.push("Selecione um doador");
  }

  if (!tipo) {
    erros.push("Selecione o tipo da doação");
  }

  if (tipo === "Dinheiro") {
    const numeroValor = Number(valor);

    if (
      valor === "" ||
      !Number.isFinite(numeroValor) ||
      numeroValor <= 0
    ) {
      erros.push("Informe um valor de doação maior que zero");
    }
  } else {
    const numeroQuantidade = Number(quantidade);

    if (
      quantidade === "" ||
      !Number.isInteger(numeroQuantidade) ||
      numeroQuantidade <= 0
    ) {
      erros.push("Informe uma quantidade inteira maior que zero");
    }
  }

  if (erros.length > 0) {
    exibirModalErro(erros);
  }

  return erros.length === 0;
}

// Monta os dados conforme o tipo de doação.
function obterDadosFormulario() {
  const dinheiro = selectTipo.value === "Dinheiro";

  return {
    tipo: selectTipo.value,
    quantidade: dinheiro ? null : Number(inputQuantidade.value),
    valor: dinheiro ? Number(inputValor.value) : null,
    observacao: inputObservacao.value.trim(),
    id_doador: selectDoador.value,
  };
}

// Evita envios duplicados.
function definirEstadoSalvamento(salvando) {
  salvandoDoacao = salvando;
  botaoPrincipal.disabled = salvando;
  botaoCancelar.disabled = salvando;
}

// Salva alterações em uma doação existente.
async function salvarDoacao() {
  if (salvandoDoacao || !validarFormularioDoacao()) return;

  const id = doacaoEditandoId;
  if (id === null) return;

  definirEstadoSalvamento(true);

  try {
    const resposta = await fetch(`/doacoes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(obterDadosFormulario()),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      await carregarDoacoes();
    } else {
      exibirModalErro(dados.mensagem || "Erro ao salvar doação");
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao salvar doação.");
  } finally {
    definirEstadoSalvamento(false);
  }
}

// Exclui uma doação após confirmação.
function excluirDoacao(id) {
  exibirModalConfirmacao(
    "Tem certeza que deseja excluir esta doação?",
    async () => {
      try {
        const resposta = await fetch(`/doacoes/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${obterToken()}`,
          },
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
    }
  );
}

// Cadastra uma nova doação.
async function cadastrarDoacao() {
  if (salvandoDoacao || !validarFormularioDoacao()) return;

  const idUsuario = obterUsuarioId();
  if (!idUsuario) return;

  definirEstadoSalvamento(true);

  try {
    const resposta = await fetch("/doacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obterToken()}`,
      },
      body: JSON.stringify(obterDadosFormulario()),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      exibirModalSucesso(dados.mensagem);
      cancelarEdicao();
      await carregarDoacoes();
    } else {
      exibirModalErro(dados.mensagem || "Erro ao cadastrar doação");
    }
  } catch (erro) {
    console.error(erro);
    exibirModalErro("Erro ao cadastrar doação.");
  } finally {
    definirEstadoSalvamento(false);
  }
}

// Mantém a confirmação antes de editar.
botaoPrincipal.addEventListener("click", () => {
  if (salvandoDoacao) return;

  if (doacaoEditandoId !== null) {
    if (!validarFormularioDoacao()) return;

    exibirModalConfirmacao(
      "Tem certeza que deseja salvar as alterações desta doação?",
      () => salvarDoacao()
    );
  } else {
    cadastrarDoacao();
  }
});

botaoCancelar.addEventListener("click", cancelarEdicao);

document.querySelector("table tbody").addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const id = Number(botao.dataset.id);

  if (botao.dataset.acao === "editar") {
    editarDoacao(id);
  } else if (botao.dataset.acao === "excluir") {
    excluirDoacao(id);
  }
});

// Inicialização.
atualizarCamposTipo();
carregarDoadores();
carregarDoacoes();
