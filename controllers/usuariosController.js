// Lista todos os usuários cadastrados no sistema
const listarUsuarios = (req, res) => {
  res.send("Lista de usuários");
};

// Cadastra um novo usuário no sistema
const cadastrarUsuario = (req, res) => {
  res.send("Usuário cadastrado com sucesso");
};

// Exporta as funções para serem usadas nas rotas
module.exports = {
  listarUsuarios,
  cadastrarUsuario
};