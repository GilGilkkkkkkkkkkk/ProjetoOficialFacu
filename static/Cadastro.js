import { api } from "./api.js";

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();

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
