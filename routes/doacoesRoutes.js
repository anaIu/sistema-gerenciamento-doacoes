const express = require("express");
const router = express.Router();

const {
  listarDoacoes,
  cadastrarDoacao,
  editarDoacao,
  excluirDoacao
} = require("../controllers/doacoesController");

router.get("/", listarDoacoes);
router.post("/", cadastrarDoacao);
router.put("/:id", editarDoacao);
router.delete("/:id", excluirDoacao);

module.exports = router;
