const API_URL = "https://projetoficialfacu-production.up.railway.app"; 


console.log("usuario.js carregado!");

// ======================
// CAMPOS
// ======================
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const fotoPreview = document.getElementById("fotoPreview");
const fotoInput = document.getElementById("fotoInput");
const fotoForm = document.getElementById("fotoForm");
const userForm = document.getElementById("userForm");
const logoutBtn = document.getElementById("btnLogout");
const feedback = document.getElementById("resetFeedback");
const fotoPerfil = document.getElementById("fotoPerfil");

// ======================
// CARREGAR USUÁRIO
// ======================
async function carregarUsuario() {
  const r = await fetch(`${API}/usuario`, { credentials: "include" });

  if (!r.ok) {
    window.location.href = "/login";
    return;
  }

  const user = await r.json();

  nome.value = user.nome;
  email.value = user.email;

  if (user.foto) {
    fotoPreview.src = user.foto;
    fotoPerfil.src = user.foto;
  }
}

carregarUsuario();

// ======================
// SALVAR DADOS
// ======================
userForm.onsubmit = async (e) => {
  e.preventDefault();

  const dados = { nome: nome.value, email: email.value };

  if (senha.value !== "") dados.senha = senha.value;

  const r = await fetch(`${API}/usuario`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dados)
  });

  const resp = await r.json();
  feedback.innerText = resp.message;
};

// ======================
// PREVIEW FOTO
// ======================
fotoInput.onchange = () => {
  const file = fotoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => (fotoPreview.src = reader.result);
  reader.readAsDataURL(file);
};

// ======================
// ENVIAR FOTO
// ======================
fotoForm.onsubmit = async (e) => {
  e.preventDefault();

  const fd = new FormData();
  fd.append("foto", fotoInput.files[0]);

  const r = await fetch(`${API}/upload_foto`, {
    method: "POST",
    body: fd,
    credentials: "include"
  });

  const resp = await r.json();
  feedback.innerText = resp.message;
  carregarUsuario();
};

// ======================
// LOGOUT
// ======================
logoutBtn.onclick = async () => {
  await fetch("/logout");
  window.location.href = "/";
};

// ======================
// SIDEBAR
// ======================
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const logo = document.getElementById("logo");

logo.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
  content.classList.toggle("expanded");
});

// ======================
// TROCAR ABAS
// ======================
function abrirConta(el) {
  ativarMenu(el);
  document.getElementById("minhaConta").style.display = "block";
  document.getElementById("pedidosContainer").style.display = "none";
}

function abrirPedidos(el) {
  ativarMenu(el);
  document.getElementById("minhaConta").style.display = "none";
  document.getElementById("pedidosContainer").style.display = "block";

  carregarCarrinho();
  carregarHistorico();
}

function ativarMenu(el) {
  document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
  el.classList.add("active");
}

// ======================
// ALTERAR QUANTIDADE
// ======================
async function mudarQuantidade(produto_id, delta) {
  await fetch(`${API}/carrinho`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ produto_id, quantidade: delta })
  });

  carregarCarrinho();
}

// ======================
// REMOVER ITEM
// ======================
async function mudarQuantidade(produto_id, delta) {
  await fetch(`${API}/carrinho/quantidade`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ produto_id, quantidade: delta })
  });

  carregarCarrinho();
}



// ======================
// CARRINHO (CORRIGIDO)
// ======================
async function carregarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalTxt = document.getElementById("totalCarrinho");

  lista.innerHTML = "Carregando...";

  const r = await fetch(`${API}/carrinho`, { credentials: "include" });
  const carrinho = await r.json();

  lista.innerHTML = "";
  let total = 0;

  if (!carrinho.length) {
    lista.innerHTML = "<p>Carrinho vazio.</p>";
    totalTxt.innerText = "";
    return;
  }

  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    lista.innerHTML += `
      <div class="item-carrinho">
        <img src="${item.imagem || '/static/img/sem_foto.png'}" width="70">
        <strong>${item.nome}</strong>

        <div class="controle-qtd">
            <button class="btn-qtd" onclick="mudarQuantidade(${item.produto_id}, -1)">−</button>
            <span>${item.quantidade}</span>
            <button class="btn-qtd" onclick="mudarQuantidade(${item.produto_id}, 1)">+</button>
        </div>

        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>

        <button onclick="removerItem(${item.produto_id})" class="btn-reset">
            🗑 Remover
        </button>

        <hr>
      </div>
    `;
  });

  totalTxt.innerText = `💰 Total: R$ ${total.toFixed(2)}`;
}

// ======================
// IR PARA PAGAMENTO
// ======================
async function finalizarCompra() {
  window.location.href = "/pagamento";
}

// ======================
// HISTÓRICO
// ======================
async function carregarHistorico() {
  const div = document.getElementById("historico");

  const r = await fetch(`${API}/pedidos`, { credentials: "include" });
  const pedidos = await r.json();

  if (!pedidos.length) {
    div.innerHTML = "<p>Nenhuma compra ainda.</p>";
    return;
  }

  div.innerHTML = "";

  pedidos.forEach(p => {
    div.innerHTML += `
      <div>
        🧾 Pedido #${p.id}<br>
        Total: R$ ${p.total.toFixed(2)}
        <hr>
      </div>
    `;
  });
}
