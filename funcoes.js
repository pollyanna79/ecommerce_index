// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const _supabase = supabase.createClient(
    'https://wdvtuvohucyndqjnfpyh.supabase.co', 
    'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3'
);

// ==========================================
// 2. VARIÁVEIS DE ESTADO
// ==========================================
let cart = [];
let usuarioLogadoId = null;
let dadosCliente = null; 
let produtosExibidos = []; 

// Mapeamento de Elementos
    const productList = document.getElementById('product-list');
    const cartCounter = document.getElementById('cart-counter');
    const cartModal = document.getElementById('cart-modal');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const ordersModal = document.getElementById('orders-modal');
    const ordersList = document.getElementById('orders-list');
    const trackingBtn = document.getElementById('tracking-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const btnBuscar = document.getElementById('btn-buscar-filtros');

    const products = [
        { id: 1, name: 'Iphone 7', image: 'https://tse4.mm.bing.net/th/id/OIP.I7MjzaJ-gJVZa9Z1SyAc8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', price: 2300.00, type: 'eletronicos', category: 'eletronicos' },
        { id: 2, name: 'Camiseta de Algodão', image: 'https://img.elo7.com.br/product/zoom/4568573/camiseta-personalizada-com-frases-biblicas-02-camiseta-gospel.jpg', price: 59.90, type: 'roupas', category: 'camisa' },
        { id: 3, name: 'Livro: A Jornada do Herói', image: 'https://img.freepik.com/vetores-premium/pilhas-de-livros-para-leitura-pilha-de-livros-didaticos-para-educacao-isolado-no-fundo-branco-ilustracao-dos-desenhos-animados-do-vetor_76964-12652.jpg?w=2000', price: 35.50, type: 'livros', category: 'livros' },
        { id: 4, name: 'Tablet Pro', image: 'https://tse1.mm.bing.net/th/id/OIP.anvp1fW84peymY2W3P5ldAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3', price: 1200.00, type: 'eletronicos', category: 'eletronicos' },
        { id: 5, name: 'Jaqueta de Couro', image: 'https://tse3.mm.bing.net/th/id/OIP.DUf8JhIcJKtf-G3wJhIWKQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', price: 250.00, type: 'roupas', category: 'jaqueta' },
        { id: 6, name: 'Livro: O JavaScript', image: 'https://blog.marcusoliveiradev.com.br/wp-content/uploads/2024/03/JavaScript-%E2%80%93-Guia-do-Programador-Guia-Completo-das-Funcionalidades-de-Linguagem-JavaScript-300x277.jpg', price: 75.00, type: 'livros', category: 'livros' },
        { id: 7, name: 'Fones Bluetooth', image: 'https://mundodosreviews.com.br/wp-content/uploads/2024/04/Melhores-fones-de-ouvido.jpg', price: 199.90, type: 'eletronicos', category: 'utilidades' }
    ];

    // ==========================================
    // 3. LÓGICA DE FILTROS
    // ==========================================
    btnBuscar?.addEventListener('click', () => {
        const tipo = document.getElementById('filter-type').value;
        const categoria = document.getElementById('filter-category').value;
        const precoFaixa = document.getElementById('filter-price').value;
        aplicarFiltrosGlobais(tipo, categoria, precoFaixa);
    });

    async function aplicarFiltrosGlobais(tipo, categoria, faixaPreco) {
        productList.innerHTML = '<p>Buscando ofertas...</p>';

        // Se o seu Supabase não tiver a tabela 'produtos' populada, 
        // usaremos o array local 'products' para filtrar.
        let filtrados = products;

        if (tipo !== 'all') {
            filtrados = filtrados.filter(p => p.type === tipo);
        }

        if (categoria !== 'all') {
            filtrados = filtrados.filter(p => p.category === categoria);
        }

        if (faixaPreco !== 'all') {
            const [min, max] = faixaPreco.split('-').map(Number);
            filtrados = filtrados.filter(p => p.price >= min && (max ? p.price <= max : true));
        }

        if (filtrados.length === 0) {
            productList.innerHTML = '<p>Nenhum produto encontrado. 😕</p>';
        } else {
            renderizarProdutos(filtrados);
        }
    }

    // ==========================================
    // 4. RENDERIZAÇÃO
    // ==========================================
    function renderizarProdutos(lista) {
        if (!productList) return;
        produtosExibidos = lista; 
        productList.innerHTML = '';
        lista.forEach(p => {
            const preco = p.price || 0;
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.image}">
                <h3>${p.name}</h3>
                <p class="price">R$ ${preco.toFixed(2).replace('.', ',')}</p>
                <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>`;
            productList.appendChild(card);
        });
    }

    function updateCartCounter() {
        if (cartCounter) cartCounter.textContent = cart.length;
    }

    // ==========================================
    // 5. USUÁRIO (LOGIN/CADASTRO)
    // ==========================================
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusDiv = document.getElementById('login-status');
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-password').value;

        try {
            const { data, error } = await _supabase.from('siteecommerce').select('*').eq('email', email).eq('senha', senha).maybeSingle();

            if (data) {
                usuarioLogadoId = data.id;
                dadosCliente = data;
                alert(`Oi ${data.nome}, login feito!`);
                loginModal.style.display = 'none';
                // Atualiza o texto do botão de pedidos
                document.getElementById('order-status-text').innerText = "Meus Pedidos";
                if (cart.length > 0) abrirCheckout();
            } else {
                statusDiv.innerHTML = '<p style="color: red;">E-mail ou senha incorretos.</p>';
            }
        } catch (err) { console.error(err); }
    });

    // ==========================================
    // 6. CHECKOUT E PAGAMENTO
    // ==========================================
    function atualizarValoresCheckout() {
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const radioSelecionado = document.querySelector('input[name="payment-method"]:checked');
        const metodo = radioSelecionado ? radioSelecionado.value : 'pix';
        
        const frete = metodo === 'pix' ? 0 : 15.00;
        const total = subtotal + frete;

        // Atualiza os elementos na tela do checkout
        document.getElementById('checkout-subtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('checkout-shipping').innerText = `R$ ${frete.toFixed(2).replace('.', ',')}`;
        document.getElementById('checkout-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Mostra/Esconde campos
        document.getElementById('credit-card-fields').classList.toggle('hidden', metodo !== 'cartao');
        const pixFields = document.getElementById('pix-fields');
        pixFields.classList.toggle('hidden', metodo !== 'pix');

        if (metodo === 'pix') {
            pixFields.innerHTML = `<div style="text-align:center;"><p>Escaneie o QR Code:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PollyStore${total.toFixed(2)}" /></div>`;
        }
    }

    function abrirCheckout() {
        if (!usuarioLogadoId) {
            alert("Faça login primeiro!");
            loginModal.style.display = 'flex';
            return;
        }
        checkoutModal.style.display = 'flex';
        atualizarValoresCheckout();
    }

    document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const radioSelecionado = document.querySelector('input[name="payment-method"]:checked');
        const metodo = radioSelecionado ? radioSelecionado.value : 'pix';
        const total = parseFloat(document.getElementById('checkout-total').innerText.replace('R$ ', '').replace(',', '.'));
        const pedidoNum = Math.floor(Math.random() * 90000) + 10000;

        const { error } = await _supabase.from('pedidosecommerce').insert([{
            id_cliente: usuarioLogadoId,
            id_pedido: pedidoNum,
            itens_compra: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
            valor_total: total,
            metodo_pagamento: metodo,
            status: 'Preparando envio'
        }]);

        if (!error) {
            checkoutModal.style.display = 'none';
            document.getElementById('order-confirm-modal').style.display = 'flex';
            document.getElementById('order-confirm-content').innerHTML = `Pedido <strong>#${pedidoNum}</strong> realizado!`;
            cart = [];
            updateCartCounter();
        } else {
            alert("Erro: " + error.message);
        }
    });

    // ==========================================
    // 7. HISTÓRICO DE PEDIDOS
    // ==========================================
    async function carregarHistoricoPedidos() {
    if (!usuarioLogadoId) {
        loginModal.style.display = 'flex';
        return;
    }
    
    const statusText = document.getElementById('order-status-text');
    const badge = document.getElementById('order-count-badge');
    
    ordersModal.style.display = 'flex';
    ordersList.innerHTML = '<p style="text-align:center;">Buscando seus pacotes... 🚚</p>';

    try { 
        const { data, error } = await _supabase
            .from('pedidosecommerce')   
            .select('*')
            .eq('id_cliente', usuarioLogadoId)
            .order('id', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            statusText.innerText = "Meus Pedidos";
            if(badge) {
                badge.innerText = data.length;
                badge.style.display = 'inline-block';
            }
            ordersList.innerHTML = data.map(p => `
                <div class="order-card" style="border-bottom: 1px solid #eee; padding: 10px;">
                    <strong>#${p.id_pedido || p.id}</strong> - <span style="color: green;">${p.status}</span>
                    <p style="font-size: 0.9em;">${p.itens_compra}</p>
                    <p>Total: R$ ${parseFloat(p.valor_total).toFixed(2).replace('.',',')}</p>
                </div>
            `).join('');
        } else {
            ordersList.innerHTML = '<p style="text-align:center;">Nenhum pedido encontrado.</p>';
        }
    } catch (err) {
        console.error(err);
        ordersList.innerHTML = '<p>Erro ao carregar histórico.</p>';
    }
} 
    // ==========================================
    // 8. EVENTOS GERAIS
    // ==========================================
    productList?.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const p = products.find(prod => prod.id === id);
            if (p) {
                const existe = cart.find(i => i.id === id);
                if (existe) existe.quantity++;
                else cart.push({ ...p, quantity: 1 });
                updateCartCounter();
                alert(`${p.name} adicionado!`);
            }
        }
    });

trackingBtn?.addEventListener('click', carregarHistoricoPedidos);
viewCartBtn?.addEventListener('click', () => { cartModal.style.display = 'flex'; });
checkoutBtn?.addEventListener('click', () => { cartModal.style.display = 'none'; abrirCheckout(); });
document.getElementById('go-to-register')?.addEventListener('click', () => { loginModal.style.display = 'none'; registerModal.style.display = 'flex'; });

document.querySelectorAll('.close-btn').forEach(b => {
    b.onclick = () => b.closest('.modal').style.display = 'none';
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos(products);
    updateCartCounter();
});