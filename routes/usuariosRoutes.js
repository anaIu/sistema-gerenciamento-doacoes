const express = require("express");
const router = express.Router();

const {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario
} = require("../controllers/usuariosController");

router.get("/", listarUsuarios);
router.post("/", cadastrarUsuario);
router.put("/:id", editarUsuario);
router.delete("/:id", excluirUsuario);

module.exports = router;
