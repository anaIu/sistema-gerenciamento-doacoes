function obterToken() {
  return localStorage.getItem("token");
}

function obterUsuario() {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

function obterUsuarioId() {
  const usuario = obterUsuario();
  if (!usuario || !usuario.id) {
    window.location.href = "login.html";
    return null;
  }
  return usuario.id;
}

let sessaoExpirando = false;
let efetuandoLogout = false;

function tokenExpirado(token) {
  if (!token || typeof token !== "string") return true;
  const partes = token.split(".");
  if (partes.length !== 3) return false;
  try {
    const payloadBase64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch (_) {
    return false;
  }
}

function tratarSessaoExpirada(mostrarModal = true) {
  if (sessaoExpirando) return;
  sessaoExpirando = true;

  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  const irParaLogin = () => {
    window.location.href = "login.html";
  };

  if (mostrarModal && typeof exibirModalSessaoExpirada === "function") {
    exibirModalSessaoExpirada(irParaLogin);
    setTimeout(irParaLogin, 2500);
  } else {
    irParaLogin();
  }
}

// Intercepta respostas 401 para encerrar sessão de forma segura e redirecionar
if (typeof window !== "undefined" && window.fetch) {
  const fetchOriginal = window.fetch;
  window.fetch = async (...args) => {
    const resposta = await fetchOriginal(...args);
    if (resposta && resposta.status === 401 && !efetuandoLogout) {
      tratarSessaoExpirada(true);
    }
    return resposta;
  };
}

function verificarAutenticacao() {
  const token = obterToken();
  if (!token || tokenExpirado(token)) {
    tratarSessaoExpirada(false);
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

async function fazerLogout() {
  efetuandoLogout = true;
  const token = obterToken();
  if (token) {
    try {
      await fetch("/logout", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
    } catch (_) {}
  }
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}