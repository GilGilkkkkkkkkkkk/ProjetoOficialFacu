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

    criarCategoria: async (nome) => {
        return await apiRequest("/categorias", "POST", { nome });
    },

    listarCategorias: async () => {
        return await apiRequest("/categorias", "GET");
    },

    criarProduto: async (produtoForm) => {
        return await apiRequest("/produtos", "POST", produtoForm, true);
    },

    listarProdutos: async (filtros = {}) => {
        let query = "";

        if (filtros.categoria) query += `?categoria=${filtros.categoria}`;
        if (filtros.min) query += (query ? "&" : "?") + `min=${filtros.min}`;
        if (filtros.max) query += (query ? "&" : "?") + `max=${filtros.max}`;

        return await apiRequest(`/produtos${query}`, "GET");
    }
};
