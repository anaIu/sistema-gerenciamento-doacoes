const express = require("express");
const router = express.Router();

const { somenteAdmin } = require("../middleware/autorizacao");
const { listarLogs } = require("../controllers/auditoriaController");

router.get("/", somenteAdmin, listarLogs);

module.exports = router;
