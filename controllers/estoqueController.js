// Consulta os itens disponíveis no estoque
const listarEstoque = (req, res) => {
  res.send("Lista de itens em estoque");
};

// Registra a saída de um item do estoque
const registrarSaida = (req, res) => {
  res.send("Saída de item registrada com sucesso");
};

module.exports = {
  listarEstoque,
  registrarSaida
};