// Busca os usuários no back-end
async function carregarUsuarios() {
  try {
    const resposta = await fetch("http://localhost:3000/usuarios");

    const usuarios = await resposta.json();

    console.log(usuarios);
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro);
  }
}

// Executa quando a página abrir
carregarUsuarios();

async function cadastrarUsuario() {
  const usuario = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    perfil: document.getElementById("perfil").value,
  };

  try {
    const resposta = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    const dados = await resposta.json();

    alert(dados.mensagem);
  } catch (erro) {
    console.error(erro);
  }
}
