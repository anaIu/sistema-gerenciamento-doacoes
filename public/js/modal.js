function exibirModalSucesso(mensagem) {
  criarModal({ titulo: "Sucesso", mensagem, classe: "sucesso", confirmaFecharFora: true });
}

function exibirModalErro(mensagem) {
  criarModal({ titulo: "Erro", mensagem, classe: "erro", confirmaFecharFora: true });
}

function exibirModalConfirmacao(mensagem, aoConfirmar) {
  criarModal({
    titulo: "Confirmação",
    mensagem,
    classe: "confirmacao",
    botoes: [
      { texto: "Cancelar", classe: "modo-cancelar", aoClicar: fecharModal },
      {
        texto: "Confirmar",
        classe: "modo-confirmar",
        aoClicar: () => {
          fecharModal();
          aoConfirmar();
        },
      },
    ],
  });
}

function criarModal({ titulo, mensagem, classe, botoes, confirmaFecharFora = true }) {
  fecharModal();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "modalOverlay";

  const box = document.createElement("div");
  box.className = `modal-box ${classe || ""}`;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");

  const botaoFechar = document.createElement("button");
  botaoFechar.className = "modal-fechar";
  botaoFechar.textContent = "×";
  botaoFechar.setAttribute("aria-label", "Fechar");
  botaoFechar.addEventListener("click", fecharModal);

  const tituloEl = document.createElement("h3");
  tituloEl.textContent = titulo;

  const mensagemEl = document.createElement("p");
  const mensagens = Array.isArray(mensagem) ? mensagem : [mensagem];
  if (mensagens.length === 1) {
    mensagemEl.textContent = mensagens[0];
  } else {
    const lista = document.createElement("ul");
    mensagens.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      lista.appendChild(li);
    });
    mensagemEl.appendChild(lista);
  }

  const botoesEl = document.createElement("div");
  botoesEl.className = "modal-botoes";

  box.appendChild(botaoFechar);
  box.appendChild(tituloEl);
  box.appendChild(mensagemEl);

  if (botoes && botoes.length) {
    botoes.forEach((botao) => {
      const btn = document.createElement("button");
      btn.textContent = botao.texto;
      if (botao.classe) btn.className = botao.classe;
      btn.addEventListener("click", botao.aoClicar);
      botoesEl.appendChild(btn);
    });
  } else {
    const botaoOk = document.createElement("button");
    botaoOk.textContent = "OK";
    botaoOk.addEventListener("click", fecharModal);
    botoesEl.appendChild(botaoOk);
  }

  box.appendChild(botoesEl);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (evento) => {
    if (confirmaFecharFora && evento.target === overlay) {
      fecharModal();
    }
  });

  document.addEventListener("keydown", fecharModalNoEsc);
}

function fecharModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.remove();
  document.removeEventListener("keydown", fecharModalNoEsc);
}

function fecharModalNoEsc(evento) {
  if (evento.key === "Escape") fecharModal();
}