const express = require("express");
const router = express.Router();

const {
  listarHistorico
} = require("../controllers/historicoController");

router.get("/", listarHistorico);

module.exports = router;