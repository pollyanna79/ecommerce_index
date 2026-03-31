// 1. CONFIGURAÇÃO ÚNICA DO SUPABASE
const _supabase = supabase.createClient(
    'https://wdvtuvohucyndqjnfpyh.supabase.co', 
    'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3'
);

// 2. BANCO DE DADOS DE PRODUTOS
const products = [
    { id: 1, name: 'Iphone 7', description: 'Smartphone com câmera de alta resolução.', image: 'https://tse4.mm.bing.net/th/id/OIP.I7MjzaJ-gJVZa9Z1SyAc8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', price: 2300.00, type: 'eletronicos', category: 'eletronicos', colors: ['Preto', 'Branco', 'Azul'], sizes: [] },
    { id: 2, name: 'Camiseta de Algodão', description: 'Camiseta 100% algodão, confortável.', image: 'https://img.elo7.com.br/product/zoom/4568573/camiseta-personalizada-com-frases-biblicas-02-camiseta-gospel.jpg', price: 59.90, type: 'roupas', category: 'camisa', colors: ['Branco'], sizes: ['P', 'M', 'G', 'GG'] },
    { id: 3, name: 'Livro: A Jornada do Herói', description: 'História de aventura e autoconhecimento.', image: 'https://img.freepik.com/vetores-premium/pilhas-de-livros-para-leitura-pilha-de-livros-didaticos-para-educacao-isolado-no-fundo-branco-ilustracao-dos-desenhos-animados-do-vetor_76964-12652.jpg?w=2000', price: 35.50, type: 'livros', category: 'livros', colors: [], sizes: [] },
    { id: 4, name: 'Tablet Pro', description: 'Tablet para trabalho e entretenimento.', image: 'https://tse1.mm.bing.net/th/id/OIP.anvp1fW84peymY2W3P5ldAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3', price: 1200.00, type: 'eletronicos', category: 'eletronicos', colors: ['Preto', 'Branco'], sizes: [] },
    { id: 5, name: 'Jaqueta de Couro', description: 'Jaqueta sintética ideal para o inverno.', image: 'https://tse3.mm.bing.net/th/id/OIP.DUf8JhIcJKtf-G3wJhIWKQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', price: 250.00, type: 'roupas', category: 'jaqueta', colors: ['Marrom', 'Preto'], sizes: ['P', 'M', 'G', 'GG'] },
    { id: 6, name: 'Livro: O JavaScript', description: 'Guia prático sobre programação.', image: 'https://blog.marcusoliveiradev.com.br/wp-content/uploads/2024/03/JavaScript-%E2%80%93-Guia-do-Programador-Guia-Completo-das-Funcionalidades-de-Linguagem-JavaScript-300x277.jpg', price: 75.00, type: 'livros', category: 'livros', colors: [], sizes: [] },
    { id: 7, name: 'Fones Bluetooth', description: 'Áudio imersivo com cancelamento de ruído.', price: 199.90, image: 'https://mundodosreviews.com.br/wp-content/uploads/2024/04/Melhores-fones-de-ouvido.jpg', type: 'eletronicos', category: 'utilidades', colors: ['Preto', 'Branco'], sizes: ['Único'] }
];

// 3. VARIÁVEIS DE ESTADO
let cart = [];
let usuarioLogadoId = null;

// 4. MAPEAMENTO DE ELEMENTOS
const productList = document.getElementById('product-list');
const cartCounter = document.getElementById('cart-counter');
const cartModal = document.getElementById('cart-modal');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const checkoutModal = document.getElementById('checkout-modal');
const orderConfirmModal = document.getElementById('order-confirm-modal');
const viewCartBtn = document.getElementById('view-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const goToRegister = document.getElementById('go-to-register');
const checkoutForm = document.getElementById('checkout-form');
const orderDetails = document.getElementById('order-details');
const trackingBtn = document.getElementById('tracking-btn');
const ordersModal = document.getElementById('orders-modal');
const ordersList = document.getElementById('orders-list');


// 1. Captura do Botão e dos Elementos
const btnBuscar = document.getElementById('btn-buscar-filtros');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterPrice = document.getElementById('filter-price');

// 2. Evento de Clique no Botão de Buscar
btnBuscar?.addEventListener('click', () => {
    const tipo = filterType.value;
    const categoria = filterCategory.value;
    const precoFaixa = filterPrice.value;

    console.log(`Buscando: ${tipo}, ${categoria}, ${precoFaixa}`);
    aplicarFiltrosGlobais(tipo, categoria, precoFaixa);
});

// 3. Função Principal de Busca no Supabase
async function aplicarFiltrosGlobais(tipo, categoria, faixaPreco) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '<p>Buscando ofertas...</p>';

    // Inicia a query básica
    let query = _supabase.from('produtos').select('*');

    // Filtro por Tipo (se não for "all")
    if (tipo !== 'all') {
        query = query.eq('tipo', tipo);
    }

    // Filtro por Categoria (se não for "all")
    if (categoria !== 'all') {
        query = query.eq('categoria', categoria);
    }

    // Filtro por Faixa de Preço
    if (faixaPreco !== 'all') {
        const [min, max] = faixaPreco.split('-').map(Number);
        if (max) {
            query = query.gte('preco', min).lte('preco', max);
        } else {
            // Caso seja "101-2000" ou apenas um valor mínimo alto
            query = query.gte('preco', min);
        }
    }

    try {
        const { data, error } = await query;

        if (error) throw error;

        if (data.length === 0) {
            productList.innerHTML = '<p>Nenhum produto encontrado com esses filtros. 😕</p>';
            return;
        }

        // Chama sua função existente que desenha os produtos na tela
        renderizarProdutos(data); 

    } catch (err) {
        console.error("Erro na busca:", err);
        productList.innerHTML = '<p>Erro ao carregar produtos.</p>';
    }
}

// 5. FUNÇÕES DE LÓGICA E BANCO

function abrirCheckout() {
    checkoutModal.style.display = 'flex';
    atualizarValoresCheckout();
}

async function salvarPedidoNoBanco(metodo, detalhesCartao = {}) {
    const valorTotal = parseFloat(document.getElementById('checkout-total').textContent.replace('R$ ', '').replace(',', '.'));
    const itensDescricao = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    const novoPedido = {
        id_cliente: usuarioLogadoId,
        itens_compra: itensDescricao,
        quantidade: cart.reduce((acc, item) => acc + item.quantity, 0),
        valor_total: valorTotal,
        metodo_pagamento: metodo,
        numero_cartao: detalhesCartao.numero || 'N/A',
        status: 'Pedido Aprovado'
    };

    try {
        const { data, error } = await _supabase
            .from('pedidosecommerce')
            .insert([novoPedido])
            .select();

        if (error) throw error;

        const idGerado = data[0].id_pedido;
        alert(`Pedido #${idGerado} realizado com sucesso!`);
        
        cart = [];
        updateCartCounter();
        checkoutModal.style.display = 'none';
        orderConfirmModal.style.display = 'flex';
        orderDetails.innerHTML = `<p>Pedido <strong>#${idGerado}</strong> enviado para separação!</p>`;
        
    } catch (err) {
        alert("Erro ao gravar pedido: " + err.message);
    }
}

async function carregarHistoricoPedidos() {
    // Se não tiver ID, manda pro login
    if (!usuarioLogadoId) {
        alert("Acesse sua conta para ver seus pedidos.");
        loginModal.style.display = 'flex';
        return;
    }

    // ESCONDE o modal de checkout explicitamente aqui também por segurança
    document.getElementById('checkout-modal').style.display = 'none';

    // MOSTRA o modal de pedidos
    const ordersModal = document.getElementById('orders-modal');
    ordersModal.style.display = 'flex';
    
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '<p>Carregando histórico do Amigo do Bairro...</p>';

    try {
        const { data, error } = await _supabase
            .from('v_historico_pedidos_cliente')
            .select('*')
            .eq('id_cliente', usuarioLogadoId);

        if (error) throw error;

        if (!data || data.length === 0) {
            ordersList.innerHTML = '<p>Você ainda não possui pedidos.</p>';
            return;
        }
        ordersList.innerHTML = data.map(pedido => `
            <div class="order-item" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 10px; border-radius: 5px;">
                <p><strong>🛒 Pedido:</strong> #${pedido.id_pedido}</p>
                <p><strong>📦 Itens:</strong> ${pedido.itens_compra}</p>
                <p><strong>💰 Total:</strong> R$ ${parseFloat(pedido.valor_total).toFixed(2).replace('.', ',')}</p>
                <p><strong>✅ Status:</strong> <span style="color: green; font-weight: bold;">${pedido.status}</span></p>
                <p><small>📅 Data: ${new Date(pedido.data_compra).toLocaleDateString('pt-BR')}</small></p>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        ordersList.innerHTML = '<p>Erro ao carregar histórico.</p>';
    }
}

function atualizarValoresCheckout() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const metodoEl = document.querySelector('input[name="payment-method"]:checked');
    const metodo = metodoEl ? metodoEl.value : 'cartao';
    const frete = (metodo === 'pix') ? 0 : 15.00;
    const total = subtotal + frete;

    document.getElementById('checkout-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('checkout-shipping').textContent = frete === 0 ? "Grátis" : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    document.getElementById('checkout-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    const parcelasSelect = document.getElementById('installments');
    if (parcelasSelect) {
        parcelasSelect.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const valorParcela = (total / i).toFixed(2).replace('.', ',');
            parcelasSelect.innerHTML += `<option value="${i}">${i}x de R$ ${valorParcela} sem juros</option>`;
        }
    }

    const pixArea = document.getElementById('pix-fields');
    if (metodo === 'pix' && pixArea) {
        pixArea.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagamentoPolly" style="margin-bottom:10px;"> <p>Escaneie o QR Code para pagar</p>`;
    }
}

// 6. EVENTOS DE INTERFACE

// Abrir Modal de Registro a partir do Login
goToRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

// Cadastro de Usuário
const registerForm = document.getElementById('register-form');
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const novoUsuario = {
        nome: document.getElementById('reg-nome').value,
        cpf: document.getElementById('reg-cpf').value,
        tel: document.getElementById('reg-tel').value,
        endereco: document.getElementById('reg-end').value,
        numero_casa: document.getElementById('reg-numero_casa').value,
        cep: document.getElementById('reg-cep').value,
        email: document.getElementById('reg-email').value,
        senha: document.getElementById('reg-senha').value
    };

    try {
        const { data, error } = await _supabase
            .from('siteecommerce')
            .insert([novoUsuario])
            .select();

        if (error) throw error;

        if (data && data.length > 0) {
            usuarioLogadoId = data[0].id; 
            alert('Cadastro realizado com sucesso, Polly!');
            registerModal.style.display = 'none';
            abrirCheckout();
        }
    } catch (err) {
        alert('Erro ao cadastrar: ' + err.message);
    }
});

// Login
const loginForm = document.getElementById('login-form');
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;

    try {
        const { data, error } = await _supabase
            .from('siteecommerce')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .single();

        if (error || !data) {
            alert('E-mail ou senha incorretos!');
            return;
        }

        usuarioLogadoId = data.id;
        alert(`Bem-vinda de volta, ${data.nome}!`);
        loginModal.style.display = 'none';
        abrirCheckout();
    } catch (err) {
        alert('Erro ao tentar logar.');
    }
});

// Finalizar Pagamento
checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const metodo = document.querySelector('input[name="payment-method"]:checked').value;
    const numCartao = document.getElementById('card-number')?.value || '';
    salvarPedidoNoBanco(metodo, { numero: numCartao });
});

// Mudança de Frete/Pagamento
document.addEventListener('change', (e) => {
    if (e.target.name === 'payment-method') {
        atualizarValoresCheckout();
        document.getElementById('credit-card-fields').classList.toggle('hidden', e.target.value !== 'cartao');
        document.getElementById('pix-fields').classList.toggle('hidden', e.target.value !== 'pix');
    }
});

// Renderização de Produtos
function renderProducts() {
    if (!productList) return;
    productList.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>`;
        productList.appendChild(card);
    });
}

productList?.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const id = parseInt(e.target.dataset.id);
        const p = products.find(prod => prod.id === id);
        cart.push({...p, quantity: 1});
        updateCartCounter();
        alert('Adicionado ao carrinho!');
    }
});

function updateCartCounter() {
    if (cartCounter) cartCounter.textContent = cart.length;
}

viewCartBtn?.addEventListener('click', () => cartModal.style.display = 'flex');
checkoutBtn?.addEventListener('click', () => {
    cartModal.style.display = 'none';
    if (usuarioLogadoId) {
        abrirCheckout();
    } else {
        loginModal.style.display = 'flex';
    }
});

// Listener para o botão de caminhão 🚚
trackingBtn?.addEventListener('click', function(e)  {
    e.preventDefault();
    e.stopPropagation();
    console.log("Botão de pedidos clicado. Limpando outros modais...");
    // 2. FORÇA o fechamento do modal de checkout/pagamento se ele estiver aberto
    if (checkoutModal) checkoutModal.style.display = 'none';
    if (cartModal) cartModal.style.display = 'none';
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';

    // 3. Chama a função de carregar os pedidos
    carregarHistoricoPedidos();
});

document.querySelectorAll('.close-btn').forEach(b => {
    b.onclick = () => b.closest('.modal').style.display = 'none';
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCounter();
});
const cardNumberInput = document.getElementById('card-number');
const cardBrandInfo = document.getElementById('card-brand-info');

// Ajuste no Reconhecimento de Bandeira com Imagem Real
cardNumberInput?.addEventListener('input', (e) => {
    const value = e.target.value;
    cardBrandInfo.innerHTML = ""; // Limpa o que tinha antes

    let imgSrc = "";
    
    if (value.startsWith('4')) {
        imgSrc = "visa.png";
    } else if (value.startsWith('5')) {
        imgSrc = "mastercard.png";
    }

    if (imgSrc !== "") {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.width = "40px"; // Tamanho da bandeira
        img.style.marginTop = "5px";
        cardBrandInfo.appendChild(img);
    } else if (value.length > 0) {
        cardBrandInfo.textContent = "Bandeira: Outra";
        cardBrandInfo.style.color = "#666";
    }
});