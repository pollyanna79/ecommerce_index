// ==========================================
// 1. CONFIGURAÇÃO E VARIÁVEIS DE ESTADO
// ==========================================
const SUPABASE_URL = globalThis.APP_CONFIG?.SUPABASE_URL || 'https://wdvtuvohucyndqjnfpyh.supabase.co';
const SUPABASE_KEY = globalThis.APP_CONFIG?.SUPABASE_KEY || 'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3';

const _supabase = (SUPABASE_URL && SUPABASE_KEY) ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let cart = [];
let usuarioLogadoId = null;
let products = [];

// Mapeamento de elementos
const productList = document.getElementById('product-list');
const cartCounter = document.getElementById('cart-counter');
const cartModal = document.getElementById('cart-modal');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const checkoutModal = document.getElementById('checkout-modal');
const filtroCategoria = document.getElementById('filter-category');
const btnBuscar = document.getElementById('btn-buscar-filtros');
const filtroPreco = document.getElementById('filter-price');
// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================
function ensureSupabase() {
    if (!_supabase) {
        alert('Erro: Supabase não inicializado.');
        return false;
    }
    return true;
}
//3-Filtrar por categoria e preço
async function buscarProdutosFiltrados() {
    if (!ensureSupabase()) return;

    const categoria = document.getElementById('filter-category').value;
    const preco = document.getElementById('filter-price').value;

    let query = _supabase.from('produtosecommerce').select('*');

    if (categoria !== 'all') {
        query = query.eq('setor', categoria);
    }

    if (preco !== 'all') {
        const [min, max] = preco.split('-').map(Number);
        query = query.gte('preco', min).lte('preco', max);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Erro ao buscar:", error);
    } else {
        // --- CORREÇÃO AQUI ---
        // Antes de renderizar, formate os dados como você fez no carregarProdutos
        const produtosFormatados = data.map(item => ({
            ...item,
            name: item.descricao?.split(/[,â€“-]/)[0].trim() || `Produto ${item.id}`,
            price: parsePrice(item.preco)
        }));
        
        renderizarProdutos(produtosFormatados);
    }
}

// Vincula ao botão
document.getElementById('btn-buscar-filtros').addEventListener('click', buscarProdutosFiltrados);
function parsePrice(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const text = String(value).trim();
    return Number(text.replace(/\./g, '').replace(',', '.')) || 0;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function updateCartCounter() {
    if (cartCounter) cartCounter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ==========================================
// 4. CARREGAMENTO E RENDERIZAÇÃO DE PRODUTOS
// ==========================================
async function carregarProdutos() {
    if (!ensureSupabase()) return;
    try {
        const { data, error } = await _supabase.from('produtosecommerce').select('*');
        if (error) throw error;
        products = data.map(item => ({
            ...item,
            name: item.descricao?.split(/[,â€“-]/)[0].trim() || `Produto ${item.id}`,
            price: parsePrice(item.preco)
        }));
        renderizarProdutos(products);
    } catch (err) { console.error('Erro ao carregar produtos:', err); }
}

function renderizarProdutos(lista) {
    if (!productList) return;
    productList.innerHTML = lista.map(p => `
        <div class="product-card">
            <img src="${p.imagem}" onerror="this.src='https://via.placeholder.com/300x200'">
            <h3>${p.name}</h3>
            <p>R$ ${p.price.toFixed(2).replace('.', ',')}</p>
            <button class="view-product-btn" data-id="${p.id}">Ver Detalhes</button>
            <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>
        </div>
    `).join('');
    
}

// ==========================================
// 5. CHECKOUT E PEDIDOS
// ==========================================
async function finalizarPedido() {
    if (!usuarioLogadoId) return alert("Faça login para finalizar!");
    
    const metodo = document.querySelector('input[name="payment-method"]:checked')?.value || 'pix';
    const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const pedidoNum = Math.floor(Math.random() * 90000) + 10000;

    const { error } = await _supabase.from('pedidosecommerce').insert([{
        id_pedido: pedidoNum,
        id_cliente: usuarioLogadoId,
        itens_compra: cart.map(i => i.descricao).join(', '),
        quantidade: cart.reduce((a, b) => a + b.quantity, 0),
        valor_total: total,
        metodo_pagamento: metodo,
        status: 'Aguardando separação',
        data_compra: new Date().toISOString()
    }]);

    if (error) return alert("Erro ao finalizar: " + error.message);

    alert(`Pedido #${pedidoNum} realizado com sucesso!`);
    cart = [];
    renderCartItems();
    updateCartCounter();
    closeAllModals();
}

// ==========================================
// 6. EVENTOS E INICIALIZAÇÃO
// ==========================================
document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    finalizarPedido();
});

productList?.addEventListener('click', (e) => {
    // 1. Captura o ID do elemento clicado
    const id = Number(e.target.dataset.id);
    if (!id) return;

    // 2. Lógica para o botão "ADICIONAR AO CARRINHO"
    if (e.target.classList.contains('add-to-cart-btn')) {
        const p = products.find(prod => prod.id === id);
        if (p) {
            const itemExistente = cart.find(i => i.id === id);
            if (itemExistente) {
                itemExistente.quantity++;
            } else {
                // Copia o produto e adiciona a quantidade inicial
                cart.push({...p, quantity: 1});
            }
            
            updateCartCounter(); // Atualiza o número no ícone do carrinho
            alert(`${p.name} adicionado ao carrinho!`);
        }
    }
// Este código adiciona o evento de fechar a TODOS os botões X que existirem no HTML
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAllModals();
    });
});
    // 3. Lógica para o botão "VER DETALHES"
    if (e.target.classList.contains('view-product-btn')) {
        const p = products.find(prod => prod.id === id);
        if (p) {
            document.getElementById('detail-image').src = p.imagem || 'https://via.placeholder.com/300x200';
            document.getElementById('detail-name').textContent = p.name;
            document.getElementById('detail-description').textContent = p.descricao || "Sem descrição disponível.";
            document.getElementById('detail-price').textContent = `R$ ${p.price.toFixed(2).replace('.', ',')}`;
            
            document.getElementById('product-detail-modal').style.display = 'block';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    carregarProdutos();
});