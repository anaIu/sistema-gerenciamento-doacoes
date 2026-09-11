const express = require("express");
const router = express.Router();
const { registrarOrganizacao } = require("../controllers/authController");

router.post("/", registrarOrganizacao);

module.exports = router;