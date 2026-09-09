const express = require("express");
const router = express.Router();

const {
  obterResumo
} = require("../controllers/dashboardController");

router.get("/", obterResumo);

module.exports = router;
