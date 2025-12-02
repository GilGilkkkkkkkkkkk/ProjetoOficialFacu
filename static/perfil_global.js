const API_URL = "https://nome-do-seu-projeto.up.railway.app";


// ==========================
// PERFIL GLOBAL (TODAS TELAS)
// ==========================
async function carregarUsuarioGlobal() {

  const fotoPerfil = document.getElementById("fotoPerfil");
  const popupLogin = document.getElementById("popupLogin");
  const popupPerfil = document.getElementById("popupPerfil");

  if (!fotoPerfil) return;

  try {

    const r = await fetch(`${API}/usuario`, { credentials: "include" });

    // ==========================
    // DESLOGADO
    // ==========================
    if (!r.ok) {

      fotoPerfil.src = "/static/img/user.png";

      fotoPerfil.onclick = () => {
        if (popupLogin) popupLogin.style.display = "flex";
      };

      return;
    }

    // ==========================
    // LOGADO
    // ==========================
    const user = await r.json();

    fotoPerfil.src = user.foto || "/static/img/user.png";

    fotoPerfil.onclick = () => {
      if (popupPerfil) popupPerfil.style.display = "flex";
    };

    // Preencher dados globais (se existir)
    const nome = document.getElementById("nomeUserGlobal");
    const email = document.getElementById("emailUserGlobal");

    if (nome) nome.innerText = user.nome;
    if (email) email.innerText = user.email;

  } catch (e) {
    console.error("Erro no user-global:", e);
  }
}

document.addEventListener("DOMContentLoaded", carregarUsuarioGlobal);
