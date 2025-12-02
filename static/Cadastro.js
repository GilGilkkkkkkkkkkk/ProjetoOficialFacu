const API = "https://seu-projeto.up.railway.app"

// Função para enviar dados ao backend
async function cadastrarUsuario(nome, email, senha) {
    const response = await fetch(`${API_URL}/cadastro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
    });

    return await response.json();
}

// Captura o envio do formulário
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const resultado = await cadastrarUsuario(nome, email, senha);

    if (resultado.error) {
        alert("❌ " + resultado.error);
        return;
    }

    alert("✔ Cadastro realizado com sucesso!");

    // Redireciona para a rota correta do login
    window.location.href = "/";
});
