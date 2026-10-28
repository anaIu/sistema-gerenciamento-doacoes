const { validarConfiguracao } = require("./config/validar");
validarConfiguracao();

// Importa o Express, usado para criar o servidor
const express = require("express");

// Importa o path, usado para resolver caminhos de forma robusta (inclusive no Vercel)
const path = require("path");

// Importa o CORS, que permite comunicação entre front-end e back-end
const cors = require("cors");

// Importa o Helmet, que adiciona headers de segurança
const helmet = require("helmet");

// Cria a aplicação Express
const app = express();

// Configura proxy reverso para captura correta de IP e rate limiting em produção
app.set("trust proxy", 1);

// Headers de segurança
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
      },
    },
  }),
);

// Configura o CORS com suporte a ALLOWED_ORIGINS do .env
const origensPermitidas = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : (process.env.NODE_ENV === "production" ? false : "*");

app.use(
  cors({
    origin: origensPermitidas,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Permite que o servidor leia dados em JSON
app.use(express.json());

// Serve os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Importa os middlewares do sistema
const autenticar = require("./middleware/auth");
const honeyPot = require("./middleware/honeypot");
const { limitadorLogin, limitadorRegistro, limitadorGeral } = require("./middleware/rateLimit");

// Importa as rotas do sistema
const authRoutes = require("./routes/authRoutes");
const registroRoutes = require("./routes/registroRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const usuariosRoutes = require("./routes/usuariosRoutes");
const doadoresRoutes = require("./routes/doadoresRoutes");
const doacoesRoutes = require("./routes/doacoesRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const historicoRoutes = require("./routes/historicoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const auditoriaRoutes = require("./routes/auditoriaRoutes");

// Rota inicial de teste
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
// Rotas públicas
app.use("/login", limitadorLogin, authRoutes);
app.use("/logout", authRoutes);
app.use("/registro", honeyPot, limitadorRegistro, registroRoutes);

// Rota de perfil (autenticada e protegida por rate limit)
app.use("/perfil", limitadorGeral, autenticar, perfilRoutes);

// Usa as rotas criadas na pasta routes (protegidas por autenticação e rate limit)
app.use("/usuarios", limitadorGeral, autenticar, usuariosRoutes);
app.use("/doadores", limitadorGeral, autenticar, doadoresRoutes);
app.use("/doacoes", limitadorGeral, autenticar, doacoesRoutes);
app.use("/estoque", limitadorGeral, autenticar, estoqueRoutes);
app.use("/historico", limitadorGeral, autenticar, historicoRoutes);
app.use("/dashboard", limitadorGeral, autenticar, dashboardRoutes);
app.use("/auditoria", limitadorGeral, autenticar, auditoriaRoutes);

module.exports = app;
