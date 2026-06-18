// Lista todos os doadores cadastrados
const listarDoadores = (req, res) => {
  res.send("Lista de doadores");
};

// Cadastra um novo doador
const cadastrarDoador = (req, res) => {
  res.send("Doador cadastrado com sucesso");
};

module.exports = {
  listarDoadores,
  cadastrarDoador
};