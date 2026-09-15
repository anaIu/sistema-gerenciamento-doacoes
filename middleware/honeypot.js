const honeyPot = (req, res, next) => {
  const website = req.body && typeof req.body.website === "string"
    ? req.body.website.trim()
    : "";
  if (website !== "") {
    return res.status(200).json({ mensagem: "Operação registrada" });
  }
  if (req.body) delete req.body.website;
  next();
};

module.exports = honeyPot;