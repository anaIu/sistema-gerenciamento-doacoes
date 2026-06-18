const express = require("express");
const router = express.Router();

const {
  listarEstoque,
  registrarSaida
} = require("../controllers/estoqueController");

router.get("/", listarEstoque);
router.post("/saida", registrarSaida);

module.exports = router;