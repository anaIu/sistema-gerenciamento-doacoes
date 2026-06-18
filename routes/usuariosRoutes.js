const express = require("express");
const router = express.Router();

const {
  listarUsuarios,
  cadastrarUsuario
} = require("../controllers/usuariosController");

router.get("/", listarUsuarios);
router.post("/", cadastrarUsuario);

module.exports = router;