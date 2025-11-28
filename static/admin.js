const API = "http://127.0.0.1:5000";

/* ======================================================
   1. SIDEBAR + MENU DO PERFIL
====================================================== */
document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.querySelector(".sidebar");
    const logo = document.querySelector(".logo");
    const content = document.querySelector(".content");
    const topbar = document.querySelector(".topbar");
    const profilePic = document.querySelector(".profile-pic");
    const sideMenu = document.getElementById("sideMenu");

    /* Abrir/fechar SIDEBAR */
    logo.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        content.classList.toggle("expanded");
        topbar.classList.toggle("expanded");
    });

    /* Abrir/fechar menu PRETO (perfil) */
    if (profilePic && sideMenu) {
        profilePic.addEventListener("click", () => {
            sideMenu.classList.toggle("open");
        });
    }

    /* ============================
       MENU PRETO - FUNCIONAL
    ============================= */

    const mpConta = document.querySelector("#sideMenu li:nth-child(1)");
    const mpConfig = document.querySelector("#sideMenu li:nth-child(2)");
    const mpCarrinho = document.querySelector("#sideMenu li:nth-child(3)");
    const mpSair = document.querySelector("#sideMenu li:nth-child(4)");

    // Minha Conta
    mpConta.addEventListener("click", () => {
        window.location.href = "/tela_usuario";
    });

    // Configurações (não faz nada)
    mpConfig.addEventListener("click", () => {});

    // Carrinho
    mpCarrinho.addEventListener("click", () => {
        window.location.href = "/carrinho";
    });

    // Sair
    mpSair.addEventListener("click", async () => {
        await fetch("/logout");
        window.location.href = "/login";
    });

    inicializarMenuLateral();
});

/* ======================================================
   2. MENU LATERAL PRINCIPAL
====================================================== */
function inicializarMenuLateral() {
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {

            document.querySelectorAll(".menu-item").forEach(i =>
                i.classList.remove("active")
            );
            item.classList.add("active");

            const screen = item.dataset.screen;

            switch (screen) {
                case "Dashboard": abrirDashboard(); break;
                case "Produtos": abrirTelaProdutos(); break;
                case "Vendas": abrirTelaVendas(); break;
                case "Usuarios": carregarUsuarios(); break;
                case "Previsao": abrirTelaPrevisao(); break;
            }
        });
    });
}

/* ======================================================
   3. LISTAR USUÁRIOS
====================================================== */
async function carregarUsuarios() {
    const main = document.querySelector("main");

    main.innerHTML = `
        <h1>👤 Usuários</h1>
        <table class="user-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="listaUsuarios"></tbody>
        </table>
    `;

    const lista = document.getElementById("listaUsuarios");
    lista.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

    const resp = await fetch(`${API}/admin/usuarios`, { credentials: "include" });
    const users = await resp.json();

    lista.innerHTML = "";

    users.forEach(u => {
        lista.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.admin ? "✔️ Admin" : "👤 Usuário"}</td>
                <td>${u.bloqueado ? "⛔ Bloqueado" : "Ativo"}</td>
                <td>
                    <button class="btn-edit" onclick="editarUsuario(${u.id})">✏️ Editar</button>
                    <button class="btn-block" onclick="bloquearUsuario(${u.id})">
                        ${u.bloqueado ? "🔓 Desbloquear" : "🔒 Bloquear"}
                    </button>
                </td>
            </tr>
        `;
    });
}

/* ======================================================
   4. BLOQUEAR / DESBLOQUEAR
====================================================== */
async function bloquearUsuario(id) {
    if (!confirm("Alterar status do usuário?")) return;

    await fetch(`${API}/admin/usuarios/${id}/bloquear`, {
        method: "PUT",
        credentials: "include"
    });

    alert("Status atualizado!");
    carregarUsuarios();
}

/* ======================================================
   5. EDITAR USUÁRIO (MODAL)
====================================================== */
async function editarUsuario(id) {
    const r = await fetch(`${API}/admin/usuarios/${id}`, { credentials: "include" });
    const user = await r.json();

    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "flex";

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Editar Usuário</h2>

            <label>Nome:</label>
            <input id="editNome" type="text" value="${user.nome}">

            <label>Email:</label>
            <input id="editEmail" type="email" value="${user.email}">

            <label>Nova Senha (opcional):</label>
            <input id="editSenha" type="password">

            <button class="btn-save" onclick="salvarUsuario(${user.id})">Salvar</button>
        </div>
    `;

    document.body.appendChild(modal);
}

async function salvarUsuario(id) {
    const nome = document.getElementById("editNome").value;
    const email = document.getElementById("editEmail").value;
    const senha = document.getElementById("editSenha").value;

    const dados = { nome, email };
    if (senha.trim() !== "") dados.senha = senha;

    await fetch(`${API}/admin/usuarios/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });

    alert("Usuário atualizado!");
    document.querySelector(".modal").remove();
    carregarUsuarios();
}

/* ======================================================
   6. PRODUTOS
====================================================== */
function abrirTelaProdutos() {
    const main = document.querySelector("main");

    main.innerHTML = `
        <div class="header-section">
            <h1>📦 Produtos</h1>
            <button class="btn-add" onclick="abrirModalProduto()">+ Adicionar Produto</button>
        </div>

        <table class="user-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="listaProdutos"></tbody>
        </table>
    `;

    carregarTabelaProdutos();
}

async function carregarTabelaProdutos() {
    const table = document.getElementById("listaProdutos");
    table.innerHTML = "<tr><td colspan='6'>Carregando...</td></tr>";

    const resp = await fetch(`${API}/produtos`);
    const produtos = await resp.json();

    table.innerHTML = "";

    produtos.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.imagem ? `<img src="${p.imagem}" width="50">` : "Sem imagem"}</td>
                <td>${p.nome}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td>${p.estoque}</td>
                <td>
                    <button class="btn-edit" onclick="abrirModalEditarProduto(${p.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="excluirProduto(${p.id})">🗑 Excluir</button>
                </td>
            </tr>
        `;
    });
}

/* ======================================================
   7. ADICIONAR PRODUTO
====================================================== */
function abrirModalProduto() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "flex";

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Adicionar Produto</h2>

            <label>Nome:</label>
            <input id="produtoNome" type="text">

            <label>Descrição:</label>
            <input id="produtoDescricao" type="text">

            <label>Preço:</label>
            <input id="produtoPreco" type="number" step="0.01">

            <label>Estoque:</label>
            <input id="produtoEstoque" type="number">

            <label>Imagem:</label>
            <input id="produtoImagem" type="file">

            <button class="btn-save" onclick="salvarNovoProduto()">Salvar Produto</button>
        </div>
    `;

    document.body.appendChild(modal);
}

async function salvarNovoProduto() {
    const nome = document.getElementById("produtoNome").value;
    const descricao = document.getElementById("produtoDescricao").value;
    const preco = document.getElementById("produtoPreco").value;
    const estoque = document.getElementById("produtoEstoque").value;
    const imagem = document.getElementById("produtoImagem").files[0];

    const form = new FormData();
    form.append("nome", nome);
    form.append("descricao", descricao);
    form.append("preco", preco);
    form.append("estoque", estoque);
    if (imagem) form.append("imagem", imagem);

    await fetch(`${API}/produtos`, {
        method: "POST",
        credentials: "include",
        body: form
    });

    alert("Produto cadastrado!");
    document.querySelector(".modal").remove();
    abrirTelaProdutos();
}

/* ======================================================
   8. EDITAR PRODUTO
====================================================== */
async function abrirModalEditarProduto(id) {
    const resp = await fetch(`${API}/produtos/${id}`);
    const p = await resp.json();

    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "flex";

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Editar Produto</h2>

            <label>Nome:</label>
            <input id="editNome" type="text" value="${p.nome}">

            <label>Descrição:</label>
            <input id="editDescricao" type="text" value="${p.descricao}">

            <label>Preço:</label>
            <input id="editPreco" type="number" step="0.01" value="${p.preco}">

            <label>Estoque:</label>
            <input id="editEstoque" type="number" value="${p.estoque}">

            <label>Imagem (opcional):</label>
            <input id="editImagem" type="file">

            <button class="btn-save" onclick="salvarEdicaoProduto(${id})">Salvar</button>
        </div>
    `;

    document.body.appendChild(modal);
}

async function salvarEdicaoProduto(id) {
    const form = new FormData();
    form.append("nome", document.getElementById("editNome").value);
    form.append("descricao", document.getElementById("editDescricao").value);
    form.append("preco", document.getElementById("editPreco").value);
    form.append("estoque", document.getElementById("editEstoque").value);

    const img = document.getElementById("editImagem").files[0];
    if (img) form.append("imagem", img);

    await fetch(`${API}/produtos/${id}`, {
        method: "PUT",
        credentials: "include",
        body: form
    });

    alert("Produto atualizado!");
    document.querySelector(".modal").remove();
    abrirTelaProdutos();
}

/* ======================================================
   9. EXCLUIR PRODUTO
====================================================== */
async function excluirProduto(id) {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    await fetch(`${API}/produtos/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    alert("Produto removido!");
    abrirTelaProdutos();
}

/* ======================================================
   10. DASHBOARD
====================================================== */
async function abrirDashboard() {

    const main = document.querySelector("main");

    main.innerHTML = `
        <h1>📊 Dashboard</h1>

        <div class="dash-grid">
            <div class="card" id="c-usuarios">👤 Usuários: carregando...</div>
            <div class="card" id="c-produtos">📦 Produtos: carregando...</div>
            <div class="card" id="c-pedidos">🧾 Pedidos: carregando...</div>
            <div class="card" id="c-faturado">💰 Faturado: carregando...</div>
        </div>

        <h2>📈 Faturamento por Pedido</h2>
        <canvas id="graficoVendas"></canvas>

        <h2>🔥 Produtos Mais Vendidos</h2>
        <canvas id="graficoProdutos"></canvas>
    `;

    // Carregar resumo
    const r = await fetch(`${API}/admin/dashboard/resumo`, { credentials: "include" });
    const dados = await r.json();

    document.getElementById("c-usuarios").innerText = `👤 Usuários: ${dados.usuarios}`;
    document.getElementById("c-produtos").innerText = `📦 Produtos: ${dados.produtos}`;
    document.getElementById("c-pedidos").innerText = `🧾 Pedidos: ${dados.pedidos}`;
    document.getElementById("c-faturado").innerText = `💰 Faturado: R$ ${dados.faturado.toFixed(2)}`;

    // Gráfico de vendas
    const g1 = await fetch(`${API}/admin/dashboard/grafico_vendas`, { credentials: "include" });
    const vendas = await g1.json();

    new Chart(document.getElementById("graficoVendas"), {
        type: "bar",
        data: {
            labels: vendas.labels,
            datasets: [{
                label: "Faturamento por pedido",
                data: vendas.values
            }]
        }
    });

    // Gráfico produtos mais vendidos
    const g2 = await fetch(`${API}/admin/dashboard/produtos_mais_vendidos`, { credentials: "include" });
    const ranking = await g2.json();

    new Chart(document.getElementById("graficoProdutos"), {
        type: "pie",
        data: {
            labels: Object.keys(ranking),
            datasets: [{
                data: Object.values(ranking)
            }]
        }
    });
}

/* ======================================================
   11. OUTRAS TELAS
====================================================== */
async function abrirTelaVendas() {
    const main = document.querySelector("main");

    main.innerHTML = `
        <h1>📈 Vendas</h1>

        <h2>🧾 Pedidos Realizados</h2>
        <table>
            <thead>
                <tr>
                    <th>ID do Pedido</th>
                    <th>Cliente</th>
                    <th>Total (R$)</th>
                </tr>
            </thead>
            <tbody id="tabelaPedidos">Carregando...</tbody>
        </table>

        <br><br>

        <h2>🔥 Produtos Mais Vendidos</h2>
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Quantidade Vendida</th>
                </tr>
            </thead>
            <tbody id="tabelaTopProdutos">Carregando...</tbody>
        </table>
    `;

    // --------- CARREGAR PEDIDOS ---------
    const pedidosResp = await fetch(`${API}/admin/vendas/pedidos`, { credentials: "include" });
    const pedidos = await pedidosResp.json();

    const tabelaPedidos = document.getElementById("tabelaPedidos");
    tabelaPedidos.innerHTML = "";

    pedidos.forEach(p => {
        tabelaPedidos.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.usuario}</td>
                <td>R$ ${p.total.toFixed(2)}</td>
            </tr>
        `;
    });

    // --------- CARREGAR TOP PRODUTOS ---------
    const topResp = await fetch(`${API}/admin/vendas/top_produtos`, { credentials: "include" });
    const produtos = await topResp.json();

    const tabelaTop = document.getElementById("tabelaTopProdutos");
    tabelaTop.innerHTML = "";

    produtos.forEach(item => {
        tabelaTop.innerHTML += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
            </tr>
        `;
    });
}


async function abrirTelaPrevisao() {

    const main = document.querySelector("main");

    main.innerHTML = `
        <h1>🔮 Previsão de Demanda</h1>

        <label for="produtoSelect">Selecione um produto:</label>
        <select id="produtoSelect">
            <option value="">Carregando...</option>
        </select>

        <div id="previsaoInfo" style="display:none; margin-top:20px;">
            <h2 id="tituloProduto"></h2>

            <canvas id="graficoPrevisao" width="500" height="250"></canvas>

            <div class="previsao-numeros">
                <p>📅 Próximo mês: <strong id="p1"></strong></p>
                <p>📅 Em 2 meses: <strong id="p2"></strong></p>
                <p>📅 Em 3 meses: <strong id="p3"></strong></p>
            </div>
        </div>
    `;

    const select = document.getElementById("produtoSelect");

    // ================================
    // 1. Carregar lista de produtos
    // ================================
    const r = await fetch(`${API}/produtos`);
    const produtos = await r.json();

    select.innerHTML = `<option value="">Selecione...</option>`;

    produtos.forEach(p => {
        select.innerHTML += `
            <option value="${p.id}">${p.nome}</option>
        `;
    });

    // ================================
    // 2. Quando selecionar um produto
    // ================================
    select.addEventListener("change", async () => {
        const id = select.value;
        if (!id) return;

        const api = await fetch(`${API}/admin/previsao/${id}`, { credentials: "include" });
        const dados = await api.json();

        if (dados.erro) {
            alert("Sem vendas suficientes para previsão.");
            return;
        }

        document.getElementById("previsaoInfo").style.display = "block";
        document.getElementById("tituloProduto").innerText = `📦 Produto: ${dados.produto_id}`;

        // Números previstos
        document.getElementById("p1").innerText = dados.previsao["+1_mes"];
        document.getElementById("p2").innerText = dados.previsao["+2_mes"];
        document.getElementById("p3").innerText = dados.previsao["+3_mes"];

        // Histórico
        const meses = Object.keys(dados.historico);
        const valores = Object.values(dados.historico);

        // Destruir gráfico antigo se existir
        if (window.graficoPrevisaoInstance) {
            window.graficoPrevisaoInstance.destroy();
        }

        // Criar novo gráfico
        const ctx = document.getElementById("graficoPrevisao").getContext("2d");

        window.graficoPrevisaoInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: meses,
                datasets: [{
                    label: "Vendas por mês",
                    data: valores,
                    borderColor: "#6a0dad",
                    backgroundColor: "rgba(106, 13, 173, 0.3)",
                    borderWidth: 2,
                    tension: 0.3
                }]
            }
        });
    });
}

