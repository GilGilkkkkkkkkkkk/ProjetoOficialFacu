const API_URL = "https://projetooficialfacu-production.up.railway.app";



// Função para enviar dados ao backend
async function cadastrarUsuario(nome, email, senha) {
    const response = await fetch(`${API_URL}/api/cadastro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
    });

    return await response.json();
}

// Captura o envio do formulário
import { api } from "./api.js";

document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const r = await api.cadastrar(nome, email, senha);

    if (r.error) {
        alert("❌ " + r.error);
        return;
    }

    alert("✔ Cadastro realizado com sucesso!");
    window.location.href = "/login";
});

