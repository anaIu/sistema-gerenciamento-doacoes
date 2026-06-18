// Lista todas as doações registradas
const listarDoacoes = (req, res) => {
  res.send("Lista de doações");
};

// Registra uma nova doação
const cadastrarDoacao = (req, res) => {
  res.send("Doação cadastrada com sucesso");
};

module.exports = {
  listarDoacoes,
  cadastrarDoacao
};