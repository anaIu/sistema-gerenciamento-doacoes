async function carregarDoadores() {
  try {
    const resposta = await fetch("http://localhost:3000/doadores");

    const doadores = await resposta.json();

    console.log(doadores);
  } catch (erro) {
    console.error(erro);
  }
}

carregarDoadores();

async function cadastrarDoador() {
  const doador = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    email: document.getElementById("email").value,
    observacao: document.getElementById("observacao").value,

    id_usuario_cadastro: 1,
  };

  try {
    const resposta = await fetch("http://localhost:3000/doadores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doador),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
  } catch (erro) {
    console.error(erro);
  }
}
