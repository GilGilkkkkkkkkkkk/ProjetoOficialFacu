async function carregarCarrinho() {
    const r = await fetch("/carrinho", {
        credentials: "include"
    });

    const itens = await r.json();

    const lista = document.getElementById("listaCarrinho");
    const total = document.getElementById("total");

    lista.innerHTML = "";
    let soma = 0;

    if (itens.length === 0) {
        lista.innerHTML = "<p>🛒 Seu carrinho está vazio</p>";
        total.innerHTML = "";
        return;
    }

    itens.forEach(item => {
        soma += item.preco * item.quantidade;

        lista.innerHTML += `
            <div style="border:1px solid #ccc; padding:10px; margin:10px">
                <img src="${item.imagem || '/static/img/sem_foto.png'}" width="80"><br>
                <strong>${item.nome}</strong><br>
                R$ ${item.preco.toFixed(2)}<br>

                Quantidade:
                <input type="number" min="1" value="${item.quantidade}"
                       onchange="atualizarQtd(${item.produto_id}, this.value)">

                <br><br>
                <button onclick="removerItem(${item.produto_id})">🗑 Remover</button>
            </div>
        `;
    });

    total.innerHTML = `<strong>Total: R$ ${soma.toFixed(2)}</strong>`;
}

async function atualizarQtd(id, qtd) {
    await fetch("/carrinho", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            produto_id: id,
            quantidade: parseInt(qtd)
        })
    });
    carregarCarrinho();
}

async function removerItem(id) {
    await fetch(`/carrinho/${id}`, {
        method: "DELETE",
        credentials: "include"
    });
    carregarCarrinho();
}

async function finalizarCompra() {
    const r = await fetch("/checkout", {
        method: "POST",
        credentials: "include"
    });

    const resp = await r.json();
    alert(resp.message);
    carregarCarrinho();
}

carregarCarrinho();
