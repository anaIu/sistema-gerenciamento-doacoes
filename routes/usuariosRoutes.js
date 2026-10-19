const express = require("express");
const router = express.Router();

const { somenteAdmin } = require("../middleware/autorizacao");

const {
  listarUsuarios,
  cadastrarUsuario,
  editarUsuario,
  excluirUsuario,
  alterarAtivo,
} = require("../controllers/usuariosController");

router.get("/", listarUsuarios);
router.post("/", somenteAdmin, cadastrarUsuario);
router.put("/:id", somenteAdmin, editarUsuario);
router.patch("/:id/ativo", somenteAdmin, alterarAtivo);
router.delete("/:id", somenteAdmin, excluirUsuario);

module.exports = router;