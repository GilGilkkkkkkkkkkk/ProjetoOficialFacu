// ========================
// ABRIR E FECHAR MENU AO CLICAR NA LOGO
// ========================
const logo = document.getElementById('logo');
const sidebar = document.getElementById('sidebar');
const content = document.querySelector('.content');

logo.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  content.classList.toggle('expanded');
});


// ========================
// TROCAR O CONTEÚDO SEM RECARREGAR A PÁGINA
// ========================
const menuItens = document.querySelectorAll('.sidebar nav ul li');

menuItens.forEach(item => {
  item.addEventListener('click', () => {
    // Remove "ativo" de todos
    menuItens.forEach(li => li.classList.remove('active'));
    item.classList.add('active');

    // Pega o texto do item clicado
    const opcao = item.textContent.trim();
    const main = document.querySelector('.content');

    // Faz uma animação suave
    main.style.opacity = 0;

    setTimeout(() => {
      // Define o conteúdo de acordo com a opção clicada
      if (opcao.includes('Dashboard')) {
        main.innerHTML = `
          <h1>🏠 Dashboard</h1>
          <p>Bem-vindo ao painel administrativo da UniPeças!</p>
          <div class="forecast">
            <h2>📊 Visão Geral</h2>
            <p>📦 Produtos cadastrados: <b>128</b></p>
            <p>👥 Clientes ativos: <b>32</b></p>
            <p>💰 Total de vendas no mês: <b>R$ 58.920,00</b></p>
          </div>
        `;
      }

     else if (opcao.includes('Produtos')) {
  main.innerHTML = `
    <div class="header-section">
      <h1>📦 Produtos</h1>
      <button class="btn-add" id="addProductBtn">＋ Adicionar Produto</button>
    </div>

    <p>Gerencie e edite informações dos produtos cadastrados.</p>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>EAN</th>
          <th>Produto</th>
          <th>Preço</th>
          <th>Estoque</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>001</td>
          <td>99999999</td>
          <td>Placa de Vídeo RTX 4060</td>
          <td>R$ 2.499,90</td>
          <td>15</td>
          <td>
            <button class="btn btn-edit">✏️ Editar</button>
            <button class="btn btn-delete">🗑️ Excluir</button>
          </td>
        </tr>
        <tr>
          <td>002</td>
          <td>99999999</td>
          <td>Monitor Gamer 144Hz</td>
          <td>R$ 1.299,90</td>
          <td>8</td>
          <td>
            <button class="btn btn-edit">✏️ Editar</button>
            <button class="btn btn-delete">🗑️ Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div id="modalAddProduct" class="modal">
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>🆕 Adicionar Novo Produto</h2>
        <form id="addProductForm">
          <label>EAN:</label>
          <input type="text" id="ean" placeholder="Digite o EAN" required>

          <label>Nome do Produto:</label>
          <input type="text" id="nomeProduto" placeholder="Digite o nome do produto" required>

          <label>Preço:</label>
          <input type="number" id="preco" placeholder="Digite o preço" step="0.01" required>

          <label>Estoque:</label>
          <input type="number" id="estoque" placeholder="Digite o estoque" required>

          <button type="submit" class="btn-save">Salvar Produto</button>
        </form>
      </div>
    </div>
  `;

  // Abrir e fechar modal
  const modal = document.getElementById('modalAddProduct');
  const btnAdd = document.getElementById('addProductBtn');
  const spanClose = modal.querySelector('.close');

  btnAdd.onclick = () => modal.style.display = 'flex';
  spanClose.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; }

  // Simula o salvamento do produto
  const form = document.getElementById('addProductForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Produto adicionado com sucesso!');
    modal.style.display = 'none';
    form.reset();
  });
}

      else if (opcao.includes('Vendas')) {
  main.innerHTML = `
    <h1>📈 Vendas</h1>
    <p>Veja aqui as vendas recentes e estatísticas.</p>
    <div class="forecast">
      <h2>📅 Últimos Pedidos</h2>
      <ul>
        <li>Pedido #1024 - RTX 4060 - R$ 2.499,90</li>
        <li>Pedido #1025 - Teclado Mecânico - R$ 399,00</li>
        <li>Pedido #1026 - Monitor 144Hz - R$ 1.299,90</li>
      </ul>
    </div>

    <div class="forecast" style="margin-top: 30px;">
      <h2>📊 Gráfico de Vendas Semanais</h2>
      <canvas id="salesChart" width="400" height="200"></canvas>
    </div>
  `;

  // === Criação do gráfico ===
  const ctx = document.getElementById('salesChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar', // Pode trocar para 'line', 'pie', etc.
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Vendas (unidades)',
        data: [12, 19, 8, 15, 22, 30, 18],
        backgroundColor: '#2f0d38',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#333' }
        },
        x: {
          ticks: { color: '#333' }
        }
      },
      plugins: {
        legend: { display: true, labels: { color: '#2f0d38' } }
      }
    }
  });
}

else if (opcao.includes('Usuários')) {
  main.innerHTML = `
    <h1>👥 Usuários</h1>
    <p>Gerencie e edite informações de usuários.</p>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Permissão</th>
          <th>Nova Senha</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>001</td>
          <td><input type="text" value="João da Silva" class="user-input"></td>
          <td>joao@email.com</td>
          <td>Administrador</td>
          <td><input type="password" placeholder="••••••" class="user-input"></td>
          <td>
            <button class="btn btn-edit">💾 Salvar</button>
            <button class="btn btn-delete">🗑️ Excluir</button>
          </td>
        </tr>
        <tr>
          <td>002</td>
          <td><input type="text" value="Maria Oliveira" class="user-input"></td>
          <td>maria@email.com</td>
          <td>Usuário</td>
          <td><input type="password" placeholder="••••••" class="user-input"></td>
          <td>
            <button class="btn btn-edit">💾 Salvar</button>
            <button class="btn btn-delete">🗑️ Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}



      else if (opcao.includes('Configurações')) {
        main.innerHTML = `
          <h1>⚙️ Configurações</h1>
          <p>Ajuste preferências e parâmetros do sistema.</p>
          <button class="btn btn-demand">Salvar Alterações</button>
        `;
      }

      // Volta a opacidade pra mostrar a nova tela
      main.style.opacity = 1;
    }, 250);
  });
});

document.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const senha = document.getElementById('senha').value;

  // Simulação de atualização (aqui entraria o backend futuramente)
  console.log(`Nome: ${nome} | Nova Senha: ${senha}`);

  const mensagem = document.getElementById('mensagem-sucesso');
  mensagem.style.display = 'block';
  mensagem.textContent = '✅ Alterações salvas com sucesso!';

  setTimeout(() => mensagem.style.display = 'none', 3000);
});


//Animaçao do perfil
const profileBall = document.getElementById("profile");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

profileBall.addEventListener("click", () => {
  sideMenu.classList.toggle("open");
  overlay.classList.toggle("active");
});

// fecha ao clicar fora
overlay.addEventListener("click", () => {
  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
});

