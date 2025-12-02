const API_URL = "https://projetooficialfacu-production.up.railway.app";



// ========================
// FUNÇÃO PADRÃO REQUEST
// ========================
async function apiRequest(url, method = "GET", data = null, isForm = false) {

    const options = {
        method,
        credentials: "include", // COOKIE DO FLASK
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

    const result = await response.json();
    return result;
}

// ========================
// API
// ========================
export const api = {

    // ========================
    // AUTH
    // ========================
    login: async (email, senha, next="/") => {
        return await apiRequest("/api/login", "POST", { email, senha, next });
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

    // ========================
    // CATEGORIAS
    // ========================
    criarCategoria: async (nome) => {
        return await apiRequest("/categorias", "POST", { nome });
    },

    listarCategorias: async () => {
        return await apiRequest("/categorias", "GET");
    },

    // ========================
    // PRODUTOS
    // ========================
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

    // ========================
    // CARRINHO
    // ========================
    addCarrinho: async (produto_id, quantidade = 1) => {
        return await apiRequest("/carrinho", "POST", {
            produto_id,
            quantidade
        });
    },

    listarCarrinho: async () => {
        return await apiRequest("/carrinho", "GET");
    },

    atualizarCarrinho: async (produto_id, quantidade) => {
        return await apiRequest("/carrinho", "PUT", {
            produto_id,
            quantidade
        });
    },

    removerCarrinho: async (produto_id) => {
        return await apiRequest(`/carrinho/${produto_id}`, "DELETE");
    },

    checkout: async () => {
        return await apiRequest("/checkout", "POST");
    },

    // ========================
    // PEDIDOS
    // ========================
    listarPedidos: async () => {
        return await apiRequest("/pedidos", "GET");
    }
};
