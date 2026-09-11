const express = require("express");
const router = express.Router();
const { obterPerfil, editarPerfil } = require("../controllers/authController");

router.get("/", obterPerfil);
router.put("/", editarPerfil);

module.exports = router;