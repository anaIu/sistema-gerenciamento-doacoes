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

// Serve os arquivos estáticos da pasta public
app.use(express.static("public"));

// Importa o middleware de autenticação
const autenticar = require("./middleware/auth");

// Importa as rotas do sistema
const authRoutes = require("./routes/authRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const doadoresRoutes = require("./routes/doadoresRoutes");
const doacoesRoutes = require("./routes/doacoesRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const historicoRoutes = require("./routes/historicoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Rota inicial de teste
app.get("/", (req, res) => {
  res.send("Sistema de Gerenciamento de Doações funcionando!");
});

// Rota pública de login
app.use("/login", authRoutes);

// Usa as rotas criadas na pasta routes (protegidas por autenticação)
app.use("/usuarios", autenticar, usuariosRoutes);
app.use("/doadores", autenticar, doadoresRoutes);
app.use("/doacoes", autenticar, doacoesRoutes);
app.use("/estoque", autenticar, estoqueRoutes);
app.use("/historico", autenticar, historicoRoutes);
app.use("/dashboard", autenticar, dashboardRoutes);

module.exports = app;