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
// 3. PRODUTOS E FILTROS
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
// 4. CHECKOUT E PEDIDOS
// ==========================================
async function finalizarPedido() {
    if (!usuarioLogadoId) return alert("Faça login para finalizar!");
    
    const metodo = document.querySelector('input[name="payment-method"]:checked')?.value || 'pix';
    const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const pedidoNum = Math.floor(Math.random() * 90000) + 10000;

    const { error } = await _supabase.from('pedidosecommerce').insert([{
        id_cliente: usuarioLogadoId,
        id_pedido: pedidoNum,
        itens_compra: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
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
// 5. EVENTOS E INICIALIZAÇÃO
// ==========================================
document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    finalizarPedido();
});

productList?.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('add-to-cart-btn')) {
        const p = products.find(prod => prod.id === id);
        const existe = cart.find(i => i.id === id);
        existe ? existe.quantity++ : cart.push({...p, quantity: 1});
        updateCartCounter();
        alert("Adicionado ao carrinho!");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});