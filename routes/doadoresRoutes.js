const express = require("express");
const router = express.Router();

const {
  listarDoadores,
  cadastrarDoador,
  editarDoador,
  excluirDoador
} = require("../controllers/doadoresController");

router.get("/", listarDoadores);
router.post("/", cadastrarDoador);
router.put("/:id", editarDoador);
router.delete("/:id", excluirDoador);

module.exports = router;
