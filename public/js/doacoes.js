async function cadastrarDoacao() {
  const doacao = {
    tipo: document.getElementById("tipo").value,
    quantidade: document.getElementById("quantidade").value,
    valor: document.getElementById("valor").value,

    observacao: document.getElementById("observacao").value,

    id_doador: document.getElementById("idDoador").value,

    id_usuario: 1,
  };

  try {
    const resposta = await fetch("http://localhost:3000/doacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doacao),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
  } catch (erro) {
    console.error(erro);
  }
}
