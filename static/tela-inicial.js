const fotoPerfil = document.getElementById("fotoPerfil");
const popup = document.getElementById("popupLogin");
const fecharPopup = document.getElementById("fecharPopup");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");

const popupPerfil = document.getElementById("popupPerfil");
const fecharPopupPerfil = document.getElementById("fecharPopupPerfil");
const areaBotoesPerfil = document.getElementById("areaBotoesPerfil");


// ==============================
// ABRIR ABA AUTOMÁTICA (URL)
// ==============================
const urlParams = new URLSearchParams(window.location.search);
const aba = urlParams.get("aba");

if (aba === "pedidos") {
    setTimeout(() => {
        abrirPedidos(document.getElementById("menuPedidos"));
    }, 200);
}

// ==================================
// POPUPS
// ==================================
function abrirPopupLogin() {
    popup.style.display = "flex";
}

function fecharPopupLoginFn() {
    popup.style.display = "none";
}

function abrirPopupPerfil() {
    popupPerfil.style.display = "flex";
}

function fecharPopupPerfilFn() {
    popupPerfil.style.display = "none";
}

btnLogin.onclick = () => window.location.href = "/login";
btnCadastro.onclick = () => window.location.href = "/cadastro";
fecharPopup.onclick = fecharPopupLoginFn;
fecharPopupPerfil.onclick = fecharPopupPerfilFn;

// ==================================
// VERIFICAR LOGIN
// ==================================
async function verificarLogin() {
    try {
        const r = await fetch("/usuario");

        if (r.ok) {
            const user = await r.json();
            fotoPerfil.onclick = () => abrirPopupPerfil();

            // 🔥 MONTA O POPUP CONFORME TIPO DE USUÁRIO
            montarPopupUsuario(user);

        } else {
            fotoPerfil.onclick = () => abrirPopupLogin();
        }

    } catch (e) {
        fotoPerfil.onclick = () => abrirPopupLogin();
    }
}

verificarLogin();

// ==================================
// MONTAR POPUP (ADMIN OU NORMAL)
// ==================================
function montarPopupUsuario(user) {
    areaBotoesPerfil.innerHTML = ""; // limpa antes

    if (user.admin === true) {
        // 🔥 ADMIN LOGADO
        areaBotoesPerfil.innerHTML = `
            <button onclick="window.location.href='/admin'">Painel Administrador</button>
            <button onclick="window.location.href='/tela_usuario'">Minha Conta</button>
            <button onclick="window.location.href='/logout'">Sair</button>
        `;
    } else {
        // 🔥 USUÁRIO NORMAL
        areaBotoesPerfil.innerHTML = `
        <button onclick="window.location.href='/tela_usuario'">Ver Perfil</button>
        <button onclick="window.location.href='/tela_usuario?aba=pedidos'">Meus Pedidos</button>
        <button onclick="window.location.href='/logout'">Sair</button>
            `;
    }
}

// ==================================
// CARREGAR PRODUTOS
// ==================================
async function carregarProdutos() {
    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const r = await fetch("/produtos");

        if (!r.ok) throw new Error("Erro API");

        const produtos = await r.json();
        lista.innerHTML = "";

        produtos.forEach(p => {
            const div = document.createElement("div");
            div.className = "produto";

            const imagem = p.imagem || "/static/uploads/sem_foto.png";

            div.innerHTML = `
                <a href="/produto/${p.id}" class="link-produto">
                    <img src="${imagem}">
                    <h3>${p.nome}</h3>
                    <p class="preco">R$ ${Number(p.preco).toFixed(2)}</p>
                </a>
            `;

            lista.appendChild(div);
        });

    } catch (e) {
        lista.innerHTML = "<p>Erro ao carregar produtos.</p>";
    }
}

carregarProdutos();
