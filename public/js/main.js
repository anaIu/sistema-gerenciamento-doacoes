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
    return;
  }
  injetarSidebar();
}

function injetarSidebar() {
  const container = document.querySelector(".container");
  if (!container || document.getElementById("sidebar")) return;

  const usuario = obterUsuario();

  const aside = document.createElement("aside");
  aside.className = "sidebar";
  aside.id = "sidebar";

  const titulo = document.createElement("h2");
  titulo.textContent = "DoeGestão";
  aside.appendChild(titulo);

  const links = [
    ["dashboard.html", "Dashboard"],
    ["usuarios.html", "Usuários"],
    ["doadores.html", "Doadores"],
    ["doacoes.html", "Doações"],
    ["estoque.html", "Estoque"],
    ["historico.html", "Histórico"],
  ];

  const paginaAtual = window.location.pathname.split("/").pop() || "dashboard.html";

  const menuLinks = document.createElement("nav");
  menuLinks.className = "menu-links";

  links.forEach(([href, texto]) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = texto;
    if (href === paginaAtual) link.classList.add("ativo");
    menuLinks.appendChild(link);
  });

  aside.appendChild(menuLinks);

  const usuarioMenu = document.createElement("div");
  usuarioMenu.className = "usuario-menu";

  const botaoUsuario = document.createElement("button");
  botaoUsuario.type = "button";
  botaoUsuario.id = "botaoUsuario";
  botaoUsuario.textContent = `${usuario ? usuario.nome : "Usuário"} ▾`;

  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";

  const linkPerfil = document.createElement("a");
  linkPerfil.href = "perfil.html";
  linkPerfil.textContent = "Ver perfil";

  const linkSair = document.createElement("a");
  linkSair.href = "#";
  linkSair.textContent = "Sair";
  linkSair.addEventListener("click", (evento) => {
    evento.preventDefault();
    fazerLogout();
  });

  botaoUsuario.addEventListener("click", (evento) => {
    evento.stopPropagation();
    dropdown.classList.toggle("ativo");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("ativo");
  });

  dropdown.appendChild(linkPerfil);
  dropdown.appendChild(linkSair);
  usuarioMenu.appendChild(botaoUsuario);
  usuarioMenu.appendChild(dropdown);
  aside.appendChild(usuarioMenu);

  container.prepend(aside);
}

function fazerLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}