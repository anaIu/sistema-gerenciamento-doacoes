async function registrarSaida() {
  const movimentacao = {
    quantidade: document.getElementById("quantidade").value,

    destino: document.getElementById("destino").value,

    observacao: document.getElementById("observacao").value,

    id_doacao: document.getElementById("idDoacao").value,

    id_usuario: 1,
  };

  try {
    const resposta = await fetch("http://localhost:3000/estoque/saida", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movimentacao),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
  } catch (erro) {
    console.error(erro);
  }
}
