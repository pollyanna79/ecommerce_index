// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const _supabase = supabase.createClient(
    'https://wdvtuvohucyndqjnfpyh.supabase.co',
    'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3'
);

// 2. VARIÁVEIS DE ESTADO

let cart = [];
let usuarioLogadoId = null;
let produtosDoBanco = [];

const productList = document.getElementById('product-list');
const cartCounter = document.getElementById('cart-counter');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
// --- LÓGICA DE ABRIR/FECHAR MODAIS ---
const viewCartBtn = document.getElementById('view-cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeBtns = document.querySelectorAll('.close-btn');

viewCartBtn?.addEventListener('click', () => {
    cartModal.style.display = 'flex';
    atualizarCarrinhoUI(); // Garante que o conteúdo seja renderizado ao abrir
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        document.getElementById(modalId).style.display = 'none';
    });
});


// 3. CARREGAR PRODUTOS DO SUPABASE

async function carregarProdutos() {
    const { data, error } = await _supabase.from('produtosecommerce').select('*');
    if (error) {
        console.error("Erro ao buscar produtos:", error);
        return;
    }
    produtosDoBanco = data;
    renderizarProdutos(produtosDoBanco);
}


// 4. RENDERIZAÇÃO E FILTROS

function renderizarProdutos(lista) {
    if (!productList) return;
    productList.innerHTML = '';
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.descricao}">
            <h3>${p.descricao}</h3>
            <p class="price">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>`;
        productList.appendChild(card);
    });
}

document.getElementById('btn-buscar-filtros')?.addEventListener('click', () => {
    const tipo = document.getElementById('filter-type').value;
    const precoFaixa = document.getElementById('filter-price').value;

    let filtrados = produtosDoBanco;

    if (tipo !== 'all') filtrados = filtrados.filter(p => p.setor?.toLowerCase() === tipo.toLowerCase());
   
    if (precoFaixa !== 'all') {
        const [min, max] = precoFaixa.split('-').map(Number);
        filtrados = filtrados.filter(p => p.preco >= min && (max ? p.preco <= max : true));
    }

    renderizarProdutos(filtrados);
});


// 5. LÓGICA DO CARRINHO E QUANTIDADE
// ==========================================
function atualizarCarrinhoUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.preco * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.imagem}" width="50">
            <span>${item.descricao}</span>
            <button onclick="alterarQtd(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="alterarQtd(${item.id}, 1)">+</button>
            <span>R$ ${(item.preco * item.quantity).toFixed(2).replace('.', ',')}</span>
        `;
        cartItemsContainer.appendChild(div);
    });
    cartTotalElement.innerText = total.toFixed(2).replace('.', ',');
    cartCounter.textContent = cart.length;
}

window.alterarQtd = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        atualizarCarrinhoUI();
    }
};

productList?.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const id = parseInt(e.target.dataset.id);
        const p = produtosDoBanco.find(prod => prod.id === id);
        if (p) {
            const existe = cart.find(i => i.id === id);
            if (existe) {
                existe.quantity++;
            } else {
                cart.push({ ...p, quantity: 1, preco: parseFloat(p.preco) });
            }
            atualizarCarrinhoUI();
            alert(`${p.descricao} adicionado!`);
        }
    }
});


// 6. LOGIN E FINALIZAÇÃO DE PEDIDO
// ==========================================
document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const metodo = document.querySelector('input[name="payment-method"]:checked').value;
    await salvarPedido(metodo);
});

async function salvarPedido(metodo) {
    if (!usuarioLogadoId) {
        alert("Você precisa estar logado para finalizar a compra.");
        return;
    }
    
    const pedidoNum = Math.floor(Math.random() * 900000);
    const total = parseFloat(cartTotalElement.innerText.replace(',', '.'));
    
    const { error } = await _supabase.from('pedidosecommerce').insert([{
        id_pedido: pedidoNum,
        id_cliente: usuarioLogadoId,
        itens_compra: cart.map(i => i.descricao).join(', '),
        quantidade: cart.reduce((a, b) => a + b.quantity, 0),
        valor_total: total,
        metodo_pagamento: metodo,
        status: 'Pendente'
    }]);

    if (error) {
        alert("Erro ao salvar pedido: " + error.message);
    } else {
        alert(`Pedido #${pedidoNum} realizado com sucesso via ${metodo.toUpperCase()}!`);
        cart = [];
        atualizarCarrinhoUI();
        document.getElementById('checkout-modal').style.display = 'none';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});
