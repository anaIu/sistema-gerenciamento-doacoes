function obterToken() {
  return localStorage.getItem("token");
}

function obterUsuario() {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

function obterUsuarioId() {
  const usuario = obterUsuario();
  return usuario && usuario.id ? usuario.id : 1;
}

function verificarAutenticacao() {
  const token = obterToken();
  if (!token) {
    window.location.href = "login.html";
  }
}

function fazerLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}
