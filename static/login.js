const API = "https://projetoficialfacu-production.up.railway.app";

document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const r = await fetch(`${API}/login`, {
            method: "POST",
            credentials: "include", // importante para manter sessão
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

        // NÃO TEM TOKEN → REMOVIDO
        // localStorage.setItem("token", dados.token);

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
