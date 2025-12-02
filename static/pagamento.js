const API = "http://127.0.0.1:5000";


async function carregarCarrinho() {
    const r = await fetch("/carrinho", { credentials: "include" });
    const lista = await r.json();

    const listaHTML = document.getElementById("lista-produtos");
    let totalProdutos = 0;

    listaHTML.innerHTML = "";

    lista.forEach(p => {
        const subtotal = p.preco * p.quantidade;
        totalProdutos += subtotal;

        listaHTML.innerHTML += `
            <div class="produto">
                <img src="${p.imagem || "/static/img/sem_foto.png"}">

                <div class="info">
                    <h4>${p.nome}</h4>
                    <p>Qtd: ${p.quantidade}</p>
                    <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
                </div>
            </div>
            <hr>
        `;
    });

    const frete = 33.62;
    const total = totalProdutos + frete;

    document.getElementById("v-prod").innerText = `R$ ${totalProdutos.toFixed(2)}`;
    document.getElementById("v-total").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("v-pix").innerText = `R$ ${(total * 0.92).toFixed(2)}`;
}

carregarCarrinho();

document.getElementById("btn-finalizar").onclick = async () => {
    const r = await fetch("/checkout", { method: "POST", credentials: "include" });
    const dados = await r.json();

    if (dados.error) {
        alert("Erro: " + dados.error);
        return;
    }

    alert("Compra finalizada!");
    window.location.href = "/tela_usuario";
};
