const express = require("express");
const router = express.Router();

const {
  listarDoadores,
  cadastrarDoador
} = require("../controllers/doadoresController");

router.get("/", listarDoadores);
router.post("/", cadastrarDoador);

module.exports = router;