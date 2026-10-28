require("dotenv").config({ quiet: true });

const { validarConfiguracao } = require("./config/validar");
validarConfiguracao();

const app = require("./app");

// Define a porta do servidor
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});