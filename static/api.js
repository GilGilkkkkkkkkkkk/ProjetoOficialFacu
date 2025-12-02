const API_URL = "https://projetooficialfacu-production.up.railway.app";

// ========================
// FUNÇÃO PADRÃO REQUEST
// ========================
async function apiRequest(url, method = "GET", data = null, isForm = false) {

    const options = {
        method,
        credentials: "include",
        headers: {}
    };

    if (data) {
        if (isForm) {
            options.body = data;
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }
    }

    const response = await fetch(API_URL + url, options);
    return await response.json();
}


// ========================
// API
// ========================
export const api = {

    // ---------------------
    // AUTH
    // ---------------------
    login: async (email, senha) => {
        return await apiRequest("/api/login", "POST", { email, senha });
    },

    cadastrar: async (nome, email, senha) => {
        return await apiRequest("/api/cadastro", "POST", { nome, email, senha });
    },

    usuarioLogado: async () => {
        return await apiRequest("/usuario", "GET");
    },

    atualizarUsuario: async (dados) => {
        return await apiRequest("/usuario", "PUT", dados);
    },

    enviarFoto: async (file) => {
        const form = new FormData();
        form.append("foto", file);
        return await apiRequest("/upload_foto", "POST", form, true);
    },

    logout: async () => {
        return await apiRequest("/logout", "GET");
    },

    // ---------------------
    // PRODUTOS
    // ---------------------
    criarProduto: async (produtoForm) => {
        return await apiRequest("/produtos", "POST", produtoForm, true);
    },

    listarProdutos: async (filtros = {}) => {
        let query = "";

        if (filtros.categoria) query += `?categoria=${filtros.categoria}`;
        if (filtros.min) query += (query ? "&" : "?") + `min=${filtros.min}`;
        if (filtros.max) query += (query ? "&" : "?") + `max=${filtros.max}`;

        return await apiRequest(`/produtos${query}`, "GET");
    },

    // ---------------------
    // 🔥 ADMIN — USUÁRIOS
    // ---------------------
    listarUsuarios: async () => {
        return await apiRequest("/admin/usuarios", "GET");
    },

    pegarUsuario: async (id) => {
        return await apiRequest(`/admin/usuarios/${id}`, "GET");
    },

    editarUsuario: async (id, dados) => {
        return await apiRequest(`/admin/usuarios/${id}`, "PUT", dados);
    },

    bloquearUsuario: async (id) => {
        return await apiRequest(`/admin/usuarios/${id}/bloquear`, "PUT");
    },

    // ---------------------
    // 🔥 ADMIN — DASHBOARD
    // ---------------------
    resumoDashboard: async () => {
        return await apiRequest("/admin/dashboard/resumo", "GET");
    },

    graficoVendas: async () => {
        return await apiRequest("/admin/dashboard/grafico_vendas", "GET");
    },

    produtosMaisVendidos: async () => {
        return await apiRequest("/admin/dashboard/produtos_mais_vendidos", "GET");
    },

    // ---------------------
    // 🔥 ADMIN — VENDAS
    // ---------------------
    listaPedidos: async () => {
        return await apiRequest("/admin/vendas/pedidos", "GET");
    },

    topProdutos: async () => {
        return await apiRequest("/admin/vendas/top_produtos", "GET");
    },

    // ---------------------
    // 🔥 ADMIN — PREVISÃO
    // ---------------------
    previsaoDoProduto: async (produtoId) => {
        return await apiRequest(`/admin/previsao/${produtoId}`, "GET");
    }
};