const API_URL = "https://projetooficialfacu-production.up.railway.app";

document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const r = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await r.json();

        if (dados.error) {
            alert(dados.error);
            return;
        }

        if (dados.admin === true) {
            window.location.href = "/admin";
        } else {
            window.location.href = "/tela_inicial";
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao tentar logar!");
    }
});
