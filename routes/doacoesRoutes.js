const express = require("express");
const router = express.Router();

const {
  listarDoacoes,
  cadastrarDoacao
} = require("../controllers/doacoesController");

router.get("/", listarDoacoes);
router.post("/", cadastrarDoacao);

module.exports = router;