// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const { SUPABASE_URL, SUPABASE_KEY } = globalThis.APP_CONFIG || {};

// Função de validação que estava faltando no escopo do seu script
function ensureSupabase() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        alert('Configurações do Supabase não encontradas.');
        return false;
    }
    return true;
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('Variáveis de ambiente do Supabase não encontradas. Gere env.js a partir de .env');
}

// Inicializa apenas se as chaves existirem para evitar erros fatais na leitura da página
const _supabase = (SUPABASE_URL && SUPABASE_KEY) ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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
    { id: 1, name: 'Iphone 7', image: 'https://tse4.mm.bing.net/th/id/OIP.I7MjzaJ-gJVZa9Z1SyAc8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', price: 2300, type: 'eletronicos', category: 'eletronicos' },
    { id: 2, name: 'Camiseta de Algodão', image: 'https://img.elo7.com.br/product/main/2C6BFA4/camisa-definicao-de-programador-camisa-programacao.jpg', price: 59.9, type: 'roupas', category: 'camisa' },
    { id: 3, name: 'Livro: A Jornada do Herói', image: 'https://img.freepik.com/vetores-premium/pilhas-de-livros-para-leitura-pilha-de-livros-didaticos-para-educacao-isolado-no-fundo-branco-ilustracao-dos-desenhos-animados-do-vetor_76964-12652.jpg?w=2000', price: 35.5, type: 'livros', category: 'livros' },
    { id: 4, name: 'Tablet Pro', image: 'https://tse1.mm.bing.net/th/id/OIP.anvp1fW84peymY2W3P5ldAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3', price: 1200, type: 'eletronicos', category: 'eletronicos' },
    { id: 5, name: 'Jaqueta de Couro', image: 'https://tse3.mm.bing.net/th/id/OIP.DUf8JhIcJKtf-G3wJhIWKQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', price: 250, type: 'roupas', category: 'jaqueta' },
    { id: 6, name: 'Livro: O JavaScript', image: 'https://blog.marcusoliveiradev.com.br/wp-content/uploads/2024/03/JavaScript-%E2%80%93-Guia-do-Programador-Guia-Completo-das-Funcionalidades-de-Linguagem-JavaScript-300x277.jpg', price: 75, type: 'livros', category: 'livros' },
    { id: 7, name: 'Fones Bluetooth', image: 'https://mundodosreviews.com.br/wp-content/uploads/2024/04/Melhores-fones-de-ouvido.jpg', price: 199.9, type: 'eletronicos', category: 'utilidades' }
];

// ==========================================
// 3. LÓGICA DE FILTROS
// ==========================================
// CORREÇÃO: Removidos os espaços de "btnBuscar ? ." para "btnBuscar?."
btnBuscar?.addEventListener('click', () => {
    const tipo = document.getElementById('filter-type').value;
    const categoria = document.getElementById('filter-category').value;
    const precoFaixa = document.getElementById('filter-price').value;
    aplicarFiltrosGlobais(tipo, categoria, precoFaixa);
});

async function aplicarFiltrosGlobais(tipo, category, faixaPreco) {
    if (productList) productList.innerHTML = '<p>Buscando ofertas...</p>';

    let filtrados = products;

    if (tipo !== 'all') {
        filtrados = filtrados.filter(p => p.type === tipo);
    }

    if (category !== 'all') {
        filtrados = filtrados.filter(p => p.category === category);
    }

    if (faixaPreco !== 'all') {
        const [min, max] = faixaPreco.split('-').map(Number);
        filtrados = filtrados.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    if (filtrados.length === 0) {
        if (productList) productList.innerHTML = '<p>Nenhum produto encontrado. 😕</p>';
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
// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('login-form')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    if (!ensureSupabase()) return;
    const statusDiv = document.getElementById('login-status');
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;

    if (!_supabase) {
        alert("Erro: Supabase não inicializado corretamente.");
        return;
    }

    try {
        const { data, error } = await _supabase
            .from('siteecommerce')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            usuarioLogadoId = data.id;
            dadosCliente = data;
            alert(`Oi ${data.nome}, login feito!`);
            if (loginModal) loginModal.style.display = 'none';

            const orderStatusText = document.getElementById('order-status-text');
            if (orderStatusText) orderStatusText.innerText = "Meus Pedidos";

            if (cart.length > 0) abrirCheckout();
        } else {
            if (statusDiv) statusDiv.innerHTML = '<p style="color: red;">E-mail ou senha incorretos.</p>';
        }
    } catch (err) {
        console.error("Erro na requisição do Supabase:", err);
        if (statusDiv) statusDiv.innerHTML = '<p style="color: red;">Erro ao conectar ao servidor. Tente novamente.</p>';
    }
});

// ==========================================
// 6. CHECKOUT E PAGAMENTO
// ==========================================
function atualizarValoresCheckout() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const radioSelecionado = document.querySelector('input[name="payment-method"]:checked');
    const metodo = radioSelecionado ? radioSelecionado.value : 'pix';

    const frete = metodo === 'pix' ? 0 : 15;
    const total = subtotal + frete;

    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (shippingEl) shippingEl.innerText = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

    const cardFields = document.getElementById('credit-card-fields');
    const pixFields = document.getElementById('pix-fields');

    if (cardFields) cardFields.classList.toggle('hidden', metodo !== 'cartao');
    if (pixFields) {
        pixFields.classList.toggle('hidden', metodo !== 'pix');
        if (metodo === 'pix') {
            pixFields.innerHTML = `
                <div style="text-align:center;">
                    <p>Escaneie o QR Code:</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PollyStore${total.toFixed(2)}" />
                </div>`;
        }
    }

    if (metodo === 'cartao') {
        gerarParcelas(total);
    }
}

function gerarParcelas(total) {
    const select = document.getElementById('installments');
    if (!select) return;
    select.innerHTML = '';
    for (let i = 1; i <= 6; i++) {
        const valorParcela = (total / i).toFixed(2).replace('.', ',');
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}x de R$ ${valorParcela} sem juros`;
        select.appendChild(option);
    }
}

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-expiry')?.addEventListener('blur', function(e) {
    const valor = e.target.value;
    if (valor.length === 5) {
        const [mes, ano] = valor.split('/').map(Number);
        const agora = new Date();
        const mesAtual = agora.getMonth() + 1;
        const anoAtual = Number.parseInt(agora.getFullYear().toString().slice(-2));

        if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
            alert("Cartão vencido! Por favor, verifique a data de validade.");
            e.target.value = '';
            e.target.style.borderColor = 'red';
        } else if (mes < 1 || mes > 12) {
            alert("Mês inválido!");
            e.target.value = '';
            e.target.style.borderColor = 'red';
        } else {
            e.target.style.borderColor = '#ccc';
        }
    }
});

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-number')?.addEventListener('input', function(e) {
    let num = e.target.value.replace(/\s/g, ''); 
    const imgBandeira = document.getElementById('card-brand-img');

    const icones = {
        visa: 'visa.png',
        mastercard: 'mastercard.png',
        amex: 'amex.png',
        elo: 'elo.png',
        hipercard: 'hipercard.png',
        diners: 'diners.png'
    };

    const regras = {
        visa: /^4/,
        mastercard: /^5[1-5]/,
        amex: /^3[47]/,
        elo: /^((433604)|(438935)|(451416)|(457393)|(457631)|(457632)|(504175)|(627780)|(636297)|(636368)|(650031))/,
        hipercard: /^(606282|3841)/,
        diners: /^3(?:0[0-5]|[68]\d)/
    };

    let achou = false;
    for (let k in regras) {
        if (regras[k].test(num)) {
            if (imgBandeira) {
                imgBandeira.src = icones[k];
                imgBandeira.style.display = 'block';
            }
            achou = true;
            break;
        }
    }

    if (!achou && imgBandeira) {
        imgBandeira.style.display = 'none';
    }

    e.target.value = num.replace(/(\d{4})(?=\d)/g, '$1 ');
});

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-expiry')?.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) {
        e.target.value = v.substring(0, 2) + '/' + v.substring(2, 4);
    } else {
        e.target.value = v;
    }
});

function abrirCheckout() {
    if (!usuarioLogadoId) {
        alert("Faça login primeiro!");
        if (loginModal) loginModal.style.display = 'flex';
        return;
    }
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
        atualizarValoresCheckout();
    }
}

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('checkout-form')?.addEventListener('submit', async(e) => {
    e.preventDefault();
    if (!_supabase) return alert("Banco de dados desconectado.");

    const radioSelecionado = document.querySelector('input[name="payment-method"]:checked');
    const metodo = radioSelecionado ? radioSelecionado.value : 'pix';
    const totalText = document.getElementById('checkout-total')?.innerText || "0";
    const total = Number.parseFloat(totalText.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const pedidoNum = Math.floor(Math.random() * 90000) + 10000;

    const { error } = await _supabase.from('pedidosecommerce').insert([{
        id_cliente: usuarioLogadoId,
        id_pedido: pedidoNum,
        itens_compra: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
        quantidade: cart.reduce((sum, item) => sum + item.quantity, 0),
        valor_total: total,
        metodo_pagamento: metodo,
        status: 'Preparando envio',
        data_compra: new Date().toISOString()
    }]);

    if (error) {
        alert("Erro: " + error.message);
        return;
    }

    if (checkoutModal) checkoutModal.style.display = 'none';
    const confirmModal = document.getElementById('order-confirm-modal');
    const confirmContent = document.getElementById('order-confirm-content');

    if (confirmModal) confirmModal.style.display = 'flex';
    if (confirmContent) confirmContent.innerHTML = `Pedido <strong>#${pedidoNum}</strong> realizado!`;

    cart = [];
    updateCartCounter();
});

// ==========================================
// 7. HISTÓRICO DE PEDIDOS 
// ==========================================
async function carregarHistoricoPedidos() {
    if (!usuarioLogadoId) {
        console.error("Usuário não identificado.");
        if (loginModal) loginModal.style.display = 'flex';
        return;
    }
    if (!_supabase) {
        alert("Erro: Conexão com banco de dados indisponível.");
        return;
    }

    const ordersList = document.getElementById('orders-list');
    const ordersModal = document.getElementById('orders-modal');

    if (ordersModal) ordersModal.style.display = 'flex';
    if (ordersList) ordersList.innerHTML = '<p style="text-align:center;">Buscando seus pacotes... 🚚</p>';

    try {
        const { data, error } = await _supabase
            .from('pedidosecommerce')
            .select('*')
            .eq('id_cliente', usuarioLogadoId)
            .order('data_compra', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            ordersList.innerHTML = data.map(p => {
                const valor = p.valor_total ? Number.parseFloat(p.valor_total) : 0;
                const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const dataFormatada = p.data_compra ? new Date(p.data_compra).toLocaleDateString('pt-BR') : 'Data indisp.';

                return `
                    <div class="order-card" style="border-bottom: 1px solid #eee; padding: 15px; text-align: left; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>Pedido #${p.id_pedido}</strong>
                            <span style="background: #e1f5fe; color: #0288d1; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">
                                ${p.status ? p.status.toUpperCase() : 'PROCESSANDO'}
                            </span>
                        </div>
                        <p style="font-size: 0.9em; color: #666; margin: 8px 0;">
                            <strong>Itens:</strong> ${p.itens_compra || 'Não informado'}<br>
                            <strong>Qtd:</strong> ${p.quantidade || 1}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <small style="color: #999;">${dataFormatada}</small>
                            <div style="font-weight: bold; color: #333;">Total: ${valorFormatado}</div>
                        </div>
                    </div>
                `;
            }).join('');

        } else {
            if (ordersList) {
                ordersList.innerHTML = `
                    <div style="text-align:center; padding: 20px;">
                        <p>Você ainda não realizou nenhum pedido.</p>
                        <small style="color: #ccc;">ID: ${usuarioLogadoId}</small>
                    </div>`;
            }
        }
    } catch (err) {
        console.error('Erro ao buscar histórico:', err);
        if (ordersList) ordersList.innerHTML = '<p style="color: red; text-align: center;">Erro técnico ao carregar histórico.</p>';
    }
}

// ==========================================
// 8. EVENTOS GERAIS
// ==========================================

// CORREÇÃO: Ajustado espaçamento do operador ?.
productList?.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const id = Number.parseInt(e.target.dataset.id);
        const p = products.find(prod => prod.id === id);
        if (p) {
            const existe = cart.find(i => i.id === id);
            if (existe) {
                existe.quantity++;
            } else {
                cart.push({...p, quantity: 1 });
            }
            updateCartCounter();
            alert(`${p.name} adicionado ao carrinho!`);
        }
    }
});

// CORREÇÃO: Ajustado espaçamento do operador ?.
trackingBtn?.addEventListener('click', carregarHistoricoPedidos);

viewCartBtn?.addEventListener('click', () => {
    if (cartModal) cartModal.style.display = 'flex';
});

checkoutBtn?.addEventListener('click', () => {
    if (cartModal) cartModal.style.display = 'none';
    abrirCheckout();
});
// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('go-to-register')?.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'flex';
});

// Fechar Modais
document.querySelectorAll('.close-btn').forEach(b => {
    b.onclick = () => {
        const modal = b.closest('.modal');
        if (modal) modal.style.display = 'none';
    };
});

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos(products);
    updateCartCounter();
});
