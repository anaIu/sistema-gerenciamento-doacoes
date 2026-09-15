const express = require("express");
const router = express.Router();

const { somenteAdmin } = require("../middleware/autorizacao");

const {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario
} = require("../controllers/usuariosController");

router.get("/", listarUsuarios);
router.post("/", somenteAdmin, cadastrarUsuario);
router.put("/:id", somenteAdmin, editarUsuario);
router.delete("/:id", somenteAdmin, excluirUsuario);

module.exports = router;