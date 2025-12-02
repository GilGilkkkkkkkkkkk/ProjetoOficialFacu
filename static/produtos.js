// =========================
// CONFIGURAÇÃO API
// =========================
const API_URL = "http://127.0.0.1:5000";

// =========================
// POPUPS LOGIN / PERFIL
// =========================
const fotoPerfil = document.getElementById("fotoPerfil");
const popup = document.getElementById("popupLogin");
const fecharPopup = document.getElementById("fecharPopup");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");

const popupPerfil = document.getElementById("popupPerfil");
const fecharPopupPerfil = document.getElementById("fecharPopupPerfil");

// =========================
// QUANTIDADE
// =========================
let quantidade = 1;

const btnMais = document.getElementById("btnMais");
const btnMenos = document.getElementById("btnMenos");
const qtdValor = document.getElementById("qtdValor");

if (btnMais) {
    btnMais.onclick = () => {
        quantidade++;
        qtdValor.textContent = quantidade;
    };
}

if (btnMenos) {
    btnMenos.onclick = () => {
        if (quantidade > 1) quantidade--;
        qtdValor.textContent = quantidade;
    };
}


// =========================
// LOGIN / PERFIL
// =========================
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

async function verificarLogin() {
    const r = await fetch("/usuario");

    if (r.ok) {
        fotoPerfil.onclick = abrirPopupPerfil;
    } else {
        fotoPerfil.onclick = abrirPopupLogin;
    }
}

btnLogin.onclick = () => window.location.href = "/login";
btnCadastro.onclick = () => window.location.href = "/cadastro";

fecharPopup.onclick = fecharPopupLoginFn;
fecharPopupPerfil.onclick = fecharPopupPerfilFn;

verificarLogin();


// =========================
// CARREGAR PRODUTO
// =========================
async function carregarProduto() {

    const r = await fetch(`${API_URL}/produtos/${ID_PRODUTO}`);
    const p = await r.json();

    document.getElementById("imgPrincipal").src = p.imagem || "/static/img/sem_foto.png";
    document.getElementById("nomeProduto").textContent = p.nome;
    document.getElementById("precoProduto").textContent = "R$ " + Number(p.preco).toFixed(2);
    document.getElementById("descricaoProduto").textContent = p.descricao;
    document.getElementById("estoqueProduto").textContent =
        p.estoque > 0 ? "✅ Em estoque" : "❌ Indisponível";
}

carregarProduto();


// =========================
// ADICIONAR AO CARRINHO
// =========================
document.querySelector(".botao-add").onclick = async () => {

    const r = await fetch("/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            produto_id: ID_PRODUTO,
            quantidade: quantidade
        })
    });

    if (r.status === 401) return abrirPopupLogin();

    alert("Produto adicionado ao carrinho!");
};


// =========================
// COMPRAR AGORA
// =========================
document.querySelector(".botao-comprar").onclick = async () => {

    const r = await fetch("/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            produto_id: ID_PRODUTO,
            quantidade: quantidade
        })
    });

    if (r.status === 401) return abrirPopupLogin();

    window.location.href = "/pagamento";
};
