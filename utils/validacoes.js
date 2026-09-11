const validarEmail = (email) => {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

const validarSenha = (senha) => {
  if (typeof senha !== "string") return false;
  return senha.length >= 8;
};

const validarConfirmacao = (senha, confirmarSenha) => {
  return senha === confirmarSenha;
};

module.exports = { validarEmail, validarSenha, validarConfirmacao };