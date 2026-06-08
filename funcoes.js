// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = globalThis.APP_CONFIG ?.SUPABASE_URL || 'https://wdvtuvohucyndqjnfpyh.supabase.co';
const SUPABASE_KEY = globalThis.APP_CONFIG ?.SUPABASE_KEY || 'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3';

<<<<<<< HEAD
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Variáveis de ambiente do Supabase não encontradas. Gere env.js a partir de .env');
=======
// Função de validação que estava faltando no escopo do seu script
function ensureSupabase() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        alert('Configurações do Supabase não encontradas.');
        return false;
    }
    return true;
>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926
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
let products = [];

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
        filtrados = filtrados.filter(p => p.setor === tipo);
    }

    if (category !== 'all') {
        filtrados = filtrados.filter(p => p.setor === category || p.name.toLowerCase().includes(category.toLowerCase()));
    }

    if (faixaPreco !== 'all') {
        const [min, max] = faixaPreco.split('-').map(Number);
        filtrados = filtrados.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    if (filtrados.length === 0) {
        if (productList) productList.innerHTML = '<p>Nenhum produto encontrado. ðŸ˜•</p>';
    } else {
        renderizarProdutos(filtrados);
    }
}

async function carregarProdutos() {
    if (!ensureSupabase()) return;
    if (productList) productList.innerHTML = '<p>Carregando produtos...</p>';

    try {
        const { data, error } = await _supabase
            .from('produtosecommerce')
            .select('id, descricao, imagem, estoque, setor, preco');

        if (error) throw error;
        const productsData = data || [];

        products = productsData.map(item => {
            let imageUrl = item.imagem || 'https://via.placeholder.com/300x200?text=Sem+imagem';
            if (imageUrl.endsWith('.pn')) {
                imageUrl = imageUrl + 'g';
            }
            const rawDescricao = item.descricao ? item.descricao.trim() : '';
            let productName = rawDescricao || `Produto ${item.id}`;
            let productDescription = '';
            const separatorIndex = rawDescricao.search(/[,â€“-]/);
            if (separatorIndex >= 0) {
                productName = rawDescricao.slice(0, separatorIndex).trim();
                productDescription = rawDescricao.slice(separatorIndex + 1).trim();
            }
            if (!productDescription) {
                productDescription = item.setor ? `Categoria: ${item.setor}` : 'Descrição não disponível';
            }
            return {
                id: item.id,
                name: productName,
                description: productDescription,
                imagem: imageUrl,
                price: parsePrice(item.preco),
                estoque: Number(item.estoque) || 0,
                setor: item.setor ? item.setor.toString().toLowerCase() : 'outros'
            };
        });

        renderizarProdutos(products);
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        const message = err?.message || String(err);
    }

}

function renderizarProdutos(lista) {
    if (!productList) return;
    produtosExibidos = lista;
    productList.innerHTML = '';
    lista.forEach(p => {
        const preco = p.price || 0;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagem+indispon%C3%ADvel'">
            <h3>${p.name}</h3>
            <p class="product-description">${p.description}</p>
            <p class="price">R$ ${preco.toFixed(2).replace('.', ',')}</p>
            <div class="product-actions">
                <button class="view-product-btn" data-id="${p.id}">Ver Detalhes</button>
                <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>
            </div>`;
        productList.appendChild(card);
    });
}

function ensureSupabase() {
    if (!_supabase) {
        alert('Erro: Supabase não inicializado.');
        return false;
    }
    return true;
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function parsePrice(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;
    const text = String(value).trim();
    if (text === '') return 0;
    if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(text)) {
        return Number(text.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return Number(text.replace(/\s/g, '').replace(',', '.')) || 0;
}

// (parsePrice definida anteriormente)

function updateCartCounter() {
    if (cartCounter) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalQuantity;
    }
}

function abrirDetalhesProduto(produto) {
    const detailModal = document.getElementById('product-detail-modal');
    const detailName = document.getElementById('detail-name');
    const detailDesc = document.getElementById('detail-description');
    const detailPrice = document.getElementById('detail-price');
    const detailImage = document.getElementById('detail-image');
    const detailQty = document.getElementById('detail-qty-value');
    const detailAdd = document.getElementById('detail-add-cart-btn');

    if (!detailModal || !detailName || !detailDesc || !detailPrice || !detailImage || !detailQty || !detailAdd) return;

    detailName.innerText = produto.name;
    detailDesc.innerText = produto.description || 'Descrição não disponível.';
    detailPrice.innerText = `R$ ${produto.price.toFixed(2).replace('.', ',')}`;
    detailImage.src = produto.imagem;
    detailImage.alt = produto.name;
    detailQty.dataset.productId = produto.id;
    detailQty.innerText = '1';
    detailModal.style.display = 'flex';
}

const detailQtyDecrease = document.getElementById('detail-qty-decrease');
const detailQtyIncrease = document.getElementById('detail-qty-increase');
const detailAddCartBtn = document.getElementById('detail-add-cart-btn');
const detailQtyValue = document.getElementById('detail-qty-value');

if (detailQtyDecrease && detailQtyIncrease && detailQtyValue) {
    detailQtyDecrease.addEventListener('click', () => {
        const current = Number(detailQtyValue.innerText) || 1;
        detailQtyValue.innerText = String(Math.max(1, current - 1));
    });

    detailQtyIncrease.addEventListener('click', () => {
        const current = Number(detailQtyValue.innerText) || 1;
        detailQtyValue.innerText = String(current + 1);
    });
}

if (detailAddCartBtn && detailQtyValue) {
    detailAddCartBtn.addEventListener('click', () => {
        const productId = Number(detailQtyValue.dataset.productId);
        const quantity = Number(detailQtyValue.innerText) || 1;
        const produto = products.find(item => item.id === productId);
        if (!produto) return;

        const existente = cart.find(i => i.id === productId);
        if (existente) {
            existente.quantity += quantity;
        } else {
            cart.push({...produto, quantity });
        }

        renderCartItems();
        updateCartCounter();
        const detailModal = document.getElementById('product-detail-modal');
        if (detailModal) detailModal.style.display = 'none';
        alert(`${produto.name} adicionado ao carrinho!`);
    });
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItemsContainer || !cartTotal) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho estÃ¡ vazio.</p>';
        cartTotal.textContent = '0,00';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => {
        const totalItem = (item.price * item.quantity).toFixed(2).replace('.', ',');
        return `
            <div class="cart-item">
                <img src="${item.imagem}" alt="${item.name}">
                <div class="cart-item-details">
                    <strong>${item.name}</strong>
                    <p>${item.description || ''}</p>
                    <p>R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    <div class="cart-item-controls">
                        <button class="decrease-qty" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-qty" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">Remover</button>
                    </div>
                </div>
                <div class="cart-item-total">R$ ${totalItem}</div>
            </div>`;
    }).join('');

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
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
        console.error("Erro na requisiÃ§Ã£o do Supabase:", err);
        if (statusDiv) statusDiv.innerHTML = '<p style="color: red;">Erro ao conectar ao servidor. Tente novamente.</p>';
    }
});

const registerForm = document.getElementById('register-form');
if (registerForm){
    registerForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        if (!ensureSupabase()) return;

        const statusDiv = document.getElementById('register-status');
        const nome = document.getElementById('reg-nome').value.trim();
        const cpf = document.getElementById('reg-cpf').value.trim();
        const tel = document.getElementById('reg-tel').value.trim();
        const endereco = document.getElementById('reg-end').value.trim();
        const numero_casa = document.getElementById('reg-numero_casa').value.trim();
        const cep = document.getElementById('reg-cep').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const senha = document.getElementById('reg-senha').value;

        try {
            const { data: existing, error: existingError } = await _supabase
                .from('siteecommerce')
                .select('id,cpf,email')
                .or(`cpf.eq.${cpf},email.eq.${email}`)
                .limit(1)
                .maybeSingle();

            if (existingError) throw existingError;
            if (existing) {
                const motivo = existing.cpf === cpf ? 'CPF' : 'E-mail';
                if (statusDiv) statusDiv.innerHTML = `<p style="color:red;">${motivo} já cadastrado. Faça login ou use outro cadastro.</p>`;
                return;
            }

            const { data, error } = await _supabase.from('siteecommerce').insert([{
                nome,
                cpf,
                tel,
                endereco,
                numero_casa,
                cep,
                email,
                senha
            }]);

            if (error) throw error;

            if (data && data.length > 0) {
                usuarioLogadoId = data[0].id;
                dadosCliente = data[0];
                alert('Cadastro realizado com sucesso!');
                if (registerModal) registerModal.style.display = 'none';
                if (loginModal) loginModal.style.display = 'none';
                if (checkoutModal && cart.length > 0) abrirCheckout();
            }
        } catch (err) {
            console.error('Erro ao cadastrar usuÃ¡rio:', err);
            const message = err && err.message ? err.message : String(err);
            if (statusDiv) statusDiv.innerHTML = `<p style="color:red;">Erro ao cadastrar: ${message}</p>`;
        }
    });
}

// ==========================================
// 6. CHECKOUT E PAGAMENTO
// ==========================================
function atualizarValoresCheckout() {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const radioSelecionado = document.querySelector('input[name="payment-method"]:checked');
    const metodo = radioSelecionado ? radioSelecionado.value : 'pix';

    const frete = metodo === 'pix' ? 0 : 15;
    const total = subtotal + frete;
    const installments = Number(document.getElementById('installments') ?.value || 1);
    const juros = metodo === 'cartao' && installments > 4 ? 0.05 : 0;
    const totalComJuros = total * (1 + juros);

    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (shippingEl) shippingEl.innerText = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.innerText = `R$ ${totalComJuros.toFixed(2).replace('.', ',')}`;

    const cardFields = document.getElementById('credit-card-fields');
    const pixFields = document.getElementById('pix-fields');

    if (cardFields) cardFields.classList.toggle('hidden', metodo !== 'cartao');
    if (pixFields) {
        pixFields.classList.toggle('hidden', metodo !== 'pix');
        if (metodo === 'pix') {
            pixFields.innerHTML = `
                <div style="text-align:center;">
                    <p>Escaneie o QR Code:</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PollyStore${totalComJuros.toFixed(2)}" />
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
        let totalParcelado = total;
        let juros = 0;
        let textoJuros = 'sem juros';

        if (i > 4) {
            juros = 0.05;
            totalParcelado = total * (1 + juros);
            textoJuros = 'com 5% de juros';
        }

        const valorParcela = (totalParcelado / i).toFixed(2).replace('.', ',');
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}x de R$ ${valorParcela} ${textoJuros}`;
        select.appendChild(option);
    }
}

<<<<<<< HEAD
// --- LÓGICA DE IDENTIFICAÇÃO DE BANDEIRA E MÁSCARAS ---
// --- 2. Máscara da Data de Vencimento (MM/AA) com VALIDAÇÃO ---
document.getElementById('card-expiry') ?.addEventListener('blur', function(e) {
=======

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-expiry')?.addEventListener('blur', function(e) {

>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926
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

<<<<<<< HEAD
// 1. Identificar Bandeira e formatar número
document.getElementById('card-number') ?.addEventListener('input', function(e) {
    let num = e.target.value.replace(/\s/g, ''); // Remove espaços para validar
=======

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-number')?.addEventListener('input', function(e) {
    let num = e.target.value.replace(/\s/g, ''); 

>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926
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

<<<<<<< HEAD
// Máscara da Data enquanto digita 
document.getElementById('card-expiry') ?.addEventListener('input', function(e) {
=======

// CORREÇÃO: Ajustado espaçamento do operador ?.
document.getElementById('card-expiry')?.addEventListener('input', function(e) {

>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926
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

<<<<<<< HEAD
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        if (!usuarioLogadoId) {
            alert('Faça login para finalizar o pedido.');
            if (loginModal) loginModal.style.display = 'flex';
            return;
        }
=======
>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926

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

<<<<<<< HEAD
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
            return;
        }
=======
>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926

        const orderPayload = {
            id_cliente: usuarioLogadoId,
            id_pedido: pedidoNum,
            itens_compra: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
            quantidade: cart.reduce((sum, item) => sum + item.quantity, 0),
            valor_total: total,
            metodo_pagamento: metodo === 'cartao' ? `Cartão - ${parcelas}x` : 'Pix',
            numero_cartao: metodo === 'cartao' ? cardNumber : null,
            status: 'Aguardando separação',
            data_compra: new Date().toISOString(),
            id_produto: cart[0] ?.id || null
        };

        const { error } = await _supabase.from('pedidosecommerce').insert([orderPayload]);

        if (error) {
            alert('Erro: ' + error.message);
            return;
        }

        cart = [];
        renderCartItems();
        updateCartCounter();

        const confirmModal = document.getElementById('order-confirm-modal');
        const confirmContent = document.getElementById('order-confirm-content');

        if (checkoutModal) checkoutModal.style.display = 'none';
        if (confirmModal) confirmModal.style.display = 'flex';
        if (confirmContent) confirmContent.innerHTML = `Pedido <strong>#${pedidoNum}</strong> realizado!`;

        setTimeout(() => {
            if (confirmModal) confirmModal.style.display = 'none';
            closeAllModals();
            renderizarProdutos(products);
            updateCartCounter();
        }, 2200);
    });
}

// ==========================================
// 7. HISTÓRICO DE PEDIDOS 
// ==========================================
async function carregarHistoricoPedidos() {
<<<<<<< HEAD
    // 1. Verificação de Segurança
=======

>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926
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
    if (ordersList) ordersList.innerHTML = '<p style="text-align:center;">Buscando seus pacotes... ðŸšš</p>';

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
                const paymentText = p.metodo_pagamento || 'Não informado';
                const statusText = p.status || 'Aguardando separação';
                const itemList = p.itens_compra || '';
                const orderItems = itemList.split(',').map(i => i.trim()).filter(Boolean);

                const imagesHtml = orderItems.map(itemLine => {
                    const match = itemLine.match(/^(\d+)x\s+(.*)$/i);
                    const itemName = match ? match[2].trim() : itemLine;
                    const product = products.find(prod => prod.name.toLowerCase() === itemName.toLowerCase() || prod.name.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(prod.name.toLowerCase()));
                    const imageUrl = product ? product.image : 'https://via.placeholder.com/60x60?text=Item';
                    return `<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;"><img src="${imageUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" alt="${itemName}"><span>${itemLine}</span></div>`;
                }).join('');

                return `
                    <div class="order-card" style="border-bottom: 1px solid #eee; padding: 15px; text-align: left; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>Pedido #${p.id_pedido}</strong>
                            <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 4px; font-size: 0.8em; font-weight: bold;">
                                ${statusText}
                            </span>
                        </div>
                        <div style="margin: 10px 0;">
                            ${imagesHtml}
                        </div>
                        <p style="font-size: 0.9em; color: #666; margin: 8px 0;">
                            <strong>Forma de pagamento:</strong> ${paymentText}<br>
                            <strong>Quantidade total:</strong> ${p.quantidade || 1}
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
            renderCartItems();
            alert(`${p.name} adicionado ao carrinho!`);
        }
    }

    if (target.classList.contains('view-product-btn')) {
        const id = Number.parseInt(target.dataset.id);
        const p = products.find(prod => prod.id === id);
        if (p) {
            abrirDetalhesProduto(p);
        }
    }
});

<<<<<<< HEAD
// Eventos de Botões e Modais
trackingBtn ?.addEventListener('click', carregarHistoricoPedidos);
=======
>>>>>>> 73f9780560d9739757141d170e0c00cf2b264926

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
const installmentsSelect = document.getElementById('installments');
if (installmentsSelect) {
    installmentsSelect.addEventListener('change', atualizarValoresCheckout);
}
const cartItemsElement = document.getElementById('cart-items');
if (cartItemsElement) {
    cartItemsElement.addEventListener('click', (e) => {
        const target = e.target;
        const id = Number(target.dataset.id);
        if (!id) return;

        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (target.classList.contains('increase-qty')) {
            item.quantity++;
        }
        if (target.classList.contains('decrease-qty')) {
            item.quantity = Math.max(1, item.quantity - 1);
        }
        if (target.classList.contains('remove-item')) {
            cart = cart.filter(i => i.id !== id);
        }

        renderCartItems();
        updateCartCounter();
    });
}

// Fechar Modais
document.querySelectorAll('.close-btn').forEach(b => {
    b.onclick = () => {
        const modal = b.closest('.modal');
        if (modal) modal.style.display = 'none';
    };
});

// InicializaÃ§Ã£o ao carregar a pÃ¡gina
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    updateCartCounter();
});
