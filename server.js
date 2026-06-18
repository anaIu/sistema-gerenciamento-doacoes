// Importa o Express, usado para criar o servidor
const express = require("express");

// Importa o CORS, que permite comunicação entre front-end e back-end
const cors = require("cors");

// Cria a aplicação Express
const app = express();

// Configura o servidor para aceitar requisições externas
app.use(cors());

// Permite que o servidor leia dados em JSON
app.use(express.json());

// Importa as rotas do sistema
const usuariosRoutes = require("./routes/usuariosRoutes");
const doadoresRoutes = require("./routes/doadoresRoutes");
const doacoesRoutes = require("./routes/doacoesRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

// Rota inicial de teste
app.get("/", (req, res) => {
  res.send("Sistema de Gerenciamento de Doações funcionando!");
});

// Usa as rotas criadas na pasta routes
app.use("/usuarios", usuariosRoutes);
app.use("/doadores", doadoresRoutes);
app.use("/doacoes", doacoesRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/historico", historicoRoutes);

// Define a porta do servidor
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});