const products = [
    {
        id: 1,
        name: 'Iphone 7',
        description: 'Um poderoso smartphone com câmera de alta resolução.',
        image: 'https://tse4.mm.bing.net/th/id/OIP.I7MjzaJ-gJVZa9Z1SyAc8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
        price: 2300.00,
        type: 'eletronicos',
        category: 'eletronicos',
        colors: ['Preto', 'Branco', 'Azul', 'Rosa'],
        sizes: [] // Não aplicável para smartphone
    },
    {
        id: 2,
        name: 'Camiseta de Algodão',
        description: 'Camiseta 100% algodão, confortável e estilosa.',
        image: 'https://img.elo7.com.br/product/zoom/4568573/camiseta-personalizada-com-frases-biblicas-02-camiseta-gospel.jpg',
        price: 59.90,
        type: 'roupas',
        category: 'camisa',
        colors: ['Branco'],
        sizes: ['P', 'M', 'G', 'GG']
    },
    {
        id: 3,
        name: 'Livro: A Jornada do Herói',
        description: 'Uma história de aventura e autoconhecimento.',
        image: 'https://img.freepik.com/vetores-premium/pilhas-de-livros-para-leitura-pilha-de-livros-didaticos-para-educacao-isolado-no-fundo-branco-ilustracao-dos-desenhos-animados-do-vetor_76964-12652.jpg?w=2000',
        price: 35.50,
        type: 'livros',
        category: 'livros',
        colors: [], // Não aplicável para livro
        sizes: [] // Não aplicável para livro
    },
    {
        id: 4,
        name: 'Tablet Pro',
        description: 'Tablet de última geração para trabalho e entretenimento.',
        image: 'https://tse1.mm.bing.net/th/id/OIP.anvp1fW84peymY2W3P5ldAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3',
        price: 1200.00,
        type: 'eletronicos',
        category: 'eletronicos', // Mantenho a categoria para fins de filtro de exemplo
        colors: ['Preto', 'Branco', 'Azul'],
        sizes: [] // Não aplicável para smartphone
    },
    {
        id: 5,
        name: 'Jaqueta de Couro',
        description: 'Jaqueta de couro sintético, ideal para o inverno.',
        image: 'https://tse3.mm.bing.net/th/id/OIP.DUf8JhIcJKtf-G3wJhIWKQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
        price: 250.00,
        type: 'roupas',
        category: 'jaqueta',
        colors: ['Marron', 'Preto'],
        sizes: ['P', 'M', 'G', 'GG']
    },
    {
        id: 6,
        name: 'Livro: O JavaScript',
        description: 'Um guia prático sobre inteligência artificial.',
        image: 'https://blog.marcusoliveiradev.com.br/wp-content/uploads/2024/03/JavaScript-%E2%80%93-Guia-do-Programador-Guia-Completo-das-Funcionalidades-de-Linguagem-JavaScript-300x277.jpg',
        price: 75.00,
        type: 'livros',
        category: 'livros',
        colors: [], // Não aplicável para livro
        sizes: [] // Não aplicável para livro
    },
    {
        id: 7,
        name: 'Fones de Ouvido Bluetooth',
        description: 'Áudio imersivo com cancelamento de ruído.',
        price: 199.90,
        image: 'https://mundodosreviews.com.br/wp-content/uploads/2024/04/Melhores-fones-de-ouvido.jpg',
        type: 'eletronicos',
        category: 'utilidades',
        colors: ['Preto', 'Branco', 'xumbo'],
        sizes: ['Único']
    }
];

let cart = [];
let currentOrder = null; // Armazenará os detalhes do pedido finalizado
let currentOrderStatus = "Pedidos"; // Status inicial do pedido

// Elementos HTML
const productList = document.getElementById('product-list');
const cartCounter = document.getElementById('cart-counter');
const cartModal = document.getElementById('cart-modal');
const closeButtons = document.querySelectorAll('.close-btn');
const viewCartBtn = document.getElementById('view-cart-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const orderConfirmModal = document.getElementById('order-confirm-modal');
const orderDetails = document.getElementById('order-details');
const trackingBtn = document.getElementById('tracking-btn');
const trackingModal = document.getElementById('tracking-modal');
const trackingDetails = document.getElementById('tracking-details');
const orderStatusText = document.getElementById('order-status-text');
const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
const checkoutShippingEl = document.getElementById('checkout-shipping');
const couponInput = document.getElementById('coupon-input');
const applyCouponBtn = document.getElementById('apply-coupon-btn');
const discountLine = document.getElementById('discount-line');
const checkoutDiscountEl = document.getElementById('checkout-discount');
const checkoutTotalEl = document.getElementById('checkout-total');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterPrice = document.getElementById('filter-price');
const cepInput = document.getElementById('cep');
const cardNumberInput = document.getElementById('card-number');
const cardBrandInfo = document.getElementById('card-brand-info');
const securityCodeInput = document.getElementById('security-code');
const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
const creditCardFields = document.getElementById('credit-card-fields');
const boletoFields = document.getElementById('boleto-fields');
const pixFields = document.getElementById('pix-fields');

// Novos elementos para CPF e Telefone
const cpfInput = document.getElementById('cpf');
const telefoneInput = document.getElementById('telefone');

// --- Funções de Lógica e Renderização ---

function updateOrderStatusDisplay() {
    if (orderStatusText) {
        orderStatusText.textContent = currentOrderStatus;
    }
}

// Lógica para gerar dinamicamente as opções do filtro de preço
function setupPriceFilter() {
    const prices = products.map(p => p.price);
    const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);
    
    let optionsHtml = '<option value="all">Todos</option>';
    uniquePrices.forEach(price => {
        optionsHtml += `<option value="${price}">${price.toFixed(2).replace('.', ',')}</option>`;
    });
    filterPrice.innerHTML = optionsHtml;
}

function createOptionsHtml(product) {
    let optionsHtml = '<div class="product-options">';
    if (product.colors && product.colors.length > 0) {
        optionsHtml += '<label>Cor:</label>';
        optionsHtml += '<select class="product-color-select">';
        product.colors.forEach(color => {
            optionsHtml += `<option value="${color}">${color}</option>`;
        });
        optionsHtml += '</select>';
    }
    if (product.sizes && product.sizes.length > 0) {
        optionsHtml += '<label>Tamanho:</label>';
        optionsHtml += '<select class="product-size-select">';
        product.sizes.forEach(size => {
            optionsHtml += `<option value="${size}">${size}</option>`;
        });
        optionsHtml += '</select>';
    }
    optionsHtml += '<label>Qtd:</label>';
    optionsHtml += '<input type="number" class="product-quantity-input" value="1" min="1">';
    optionsHtml += '</div>';
    return optionsHtml;
}

function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
        ${createOptionsHtml(product)}
        <button class="add-to-cart-btn" data-id="${product.id}">Adicionar ao Carrinho</button>
    `;
    return productCard;
}

function renderProducts(filteredProducts = products) {
    productList.innerHTML = '';
    filteredProducts.forEach(product => {
        productList.appendChild(createProductCard(product));
    });
}

function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartCounter() {
    cartCounter.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        cartTotalElement.textContent = '0,00';
        return;
    }
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Cor: ${item.color || 'N/A'}</p>
                <p>Tamanho: ${item.size || 'N/A'}</p>
                <p>Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="cart-item-actions">
                <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="update-quantity">
                <button class="remove-from-cart-btn" data-id="${item.id}">Remover</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
    cartTotalElement.textContent = calculateCartTotal().toFixed(2).replace('.', ',');
}

function detectCreditCardBrand(number) {
    const firstDigit = number.trim().charAt(0);
    let brand = { name: 'Bandeira Desconhecida', image: '' };

    switch (firstDigit) {
        case '4':
            brand.name = 'Visa';
            brand.image = 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg'; // Ícone da Visa
            break;
        case '5':
            brand.name = 'Mastercard';
            brand.image = 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg'; // Ícone da Mastercard
            break;
        case '3':
            // Considera American Express ou Diners
            if (number.length >= 2 && (number.charAt(1) === '4' || number.charAt(1) === '7')) {
                brand.name = 'American Express';
                brand.image = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo.svg'; // Ícone da American Express
            } else {
                brand.name = 'Bandeira Desconhecida';
            }
            break;
        case '6':
            brand.name = 'Discover';
            brand.image = 'https://tse2.mm.bing.net/th/id/OIP.30lzhcZBdxnh-TTpxhY1BAHaD4?pid=ImgDet&w=474&h=248&rs=1&o=7&rm=3'; // Ícone da Discover
            break;
        default:
            brand.name = 'Bandeira Desconhecida';
            brand.image = '';
    }
    return brand;
}

function showPaymentFields(method) {
    creditCardFields.classList.add('hidden');
    boletoFields.classList.add('hidden');
    pixFields.classList.add('hidden');
    
    // Remove a classe 'hidden' apenas do método selecionado
    const selectedFields = document.getElementById(`${method}-fields`);
    if (selectedFields) {
        selectedFields.classList.remove('hidden');
    }
}

function calculateCheckoutTotal() {
    let subtotal = calculateCartTotal();
    let shipping = 15.00;
    
    // Lógica de frete grátis para compras acima de R$100
    if (subtotal >= 100) {
        shipping = 0.00;
        checkoutShippingEl.textContent = 'Frete Grátis';
    } else {
        checkoutShippingEl.textContent = `R$ ${shipping.toFixed(2).replace('.', ',')}`;
    }
    
    let total = subtotal + shipping;
    let discountAmount = 0;
    
    checkoutSubtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    checkoutTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Reaplicar cupom se houver
    const couponCode = couponInput.value.trim().toUpperCase();
    if (couponCode === 'POLYDOG10') {
        discountAmount = total * 0.10;
    } else if (couponCode === 'FRETEGRATIS' && subtotal >= 100) {
        discountAmount = shipping;
    }
    
    if (discountAmount > 0) {
        discountLine.style.display = 'flex';
        checkoutDiscountEl.textContent = `- R$ ${discountAmount.toFixed(2).replace('.', ',')}`;
        total -= discountAmount;
        checkoutTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    } else {
        discountLine.style.display = 'none';
    }
}

function applyFilters() {
    const type = filterType.value;
    const category = filterCategory.value;
    const maxPrice = filterPrice.value === 'all' ? Infinity : parseFloat(filterPrice.value);
    
    const filtered = products.filter(product => {
        const matchesType = type === 'all' || product.type === type;
        const matchesCategory = category === 'all' || product.category === category;
        const matchesPrice = product.price <= maxPrice;
        return matchesType && matchesCategory && matchesPrice;
    });
    renderProducts(filtered);
}

// --- Funções de Validação e Máscara ---

function formatCpf(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length > 11) cpf = cpf.slice(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return cpf;
}

function validateCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum;
    let remainder;
    sum = 0;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

function formatTelefone(tel) {
    tel = tel.replace(/\D/g, "");
    if (tel.length > 11) tel = tel.slice(0, 11);
    tel = tel.replace(/^(\d\d)(\d)/g, "($1) $2");
    tel = tel.replace(/(\d{5})(\d)/, "$1-$2");
    return tel;
}

function validateTelefone(tel) {
    tel = tel.replace(/[^\d]+/g, '');
    return tel.length >= 10 && tel.length <= 11;
}

// --- Event Listeners ---

// Adicionar ao carrinho
productList.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(event.target.dataset.id);
        const productCard = event.target.closest('.product-card');
        const selectedColorEl = productCard.querySelector('.product-color-select');
        const selectedSizeEl = productCard.querySelector('.product-size-select');
        const selectedQuantityEl = productCard.querySelector('.product-quantity-input');
        const selectedColor = selectedColorEl ? selectedColorEl.value : 'N/A';
        const selectedSize = selectedSizeEl ? selectedSizeEl.value : 'N/A';
        const selectedQuantity = parseInt(selectedQuantityEl.value);
        const product = products.find(p => p.id === productId);

        if (product && selectedQuantity > 0) {
            const existingItemIndex = cart.findIndex(item =>
                item.id === productId &&
                item.color === selectedColor &&
                item.size === selectedSize
            );
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += selectedQuantity;
            } else {
                cart.push({
                    ...product,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: selectedQuantity
                });
            }
            updateCartCounter();
            alert(`${selectedQuantity}x ${product.name} adicionado ao carrinho!`);
        }
    }
});

// Abrir e fechar modais
viewCartBtn.addEventListener('click', () => {
    renderCartItems();
    cartModal.style.display = 'flex';
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'none';
        orderConfirmModal.style.display = 'none';
        trackingModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === cartModal) cartModal.style.display = 'none';
    if (event.target === checkoutModal) checkoutModal.style.display = 'none';
    if (event.target === orderConfirmModal) orderConfirmModal.style.display = 'none';
    if (event.target === trackingModal) trackingModal.style.display = 'none';
});

// Atualizar e remover itens do carrinho
cartItemsContainer.addEventListener('change', (event) => {
    if (event.target.classList.contains('update-quantity')) {
        const productId = parseInt(event.target.dataset.id);
        const newQuantity = parseInt(event.target.value);
        if (newQuantity < 1) {
            event.target.value = 1;
            return;
        }
        const itemToUpdate = cart.find(item => item.id === productId);
        if (itemToUpdate) {
            itemToUpdate.quantity = newQuantity;
            renderCartItems();
            updateCartCounter();
        }
    }
});

cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-from-cart-btn')) {
        const productId = parseInt(event.target.dataset.id);
        cart = cart.filter(item => item.id !== productId);
        renderCartItems();
        updateCartCounter();
    }
});

// Checkout e Pagamento
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'flex';
    calculateCheckoutTotal();
    showPaymentFields('credit-card'); // Exibe o campo de cartão por padrão
});

paymentMethodInputs.forEach(input => {
    input.addEventListener('change', (event) => {
        showPaymentFields(event.target.value);
    });
});

cardNumberInput.addEventListener('input', (event) => {
    const cardInfo = detectCreditCardBrand(event.target.value);
    
    // Limpa o conteúdo anterior
    cardBrandInfo.innerHTML = '';

    // Cria a imagem da bandeira se o URL existir
    if (cardInfo.image) {
        const brandImage = document.createElement('img');
        brandImage.src = cardInfo.image;
        brandImage.alt = `${cardInfo.name} logo`;
        brandImage.classList.add('card-brand-image'); // Adiciona uma classe para estilização
        cardBrandInfo.appendChild(brandImage);
    }

    // Adiciona o texto da bandeira
    const brandText = document.createElement('span');
    brandText.textContent =  cardInfo.name;
    cardBrandInfo.appendChild(brandText);
});

securityCodeInput.addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3);
});

applyCouponBtn.addEventListener('click', calculateCheckoutTotal);

checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Validação de CPF e Telefone
    if (!validateCpf(cpfInput.value)) {
        alert('Por favor, insira um CPF válido.');
        return;
    }
    if (!validateTelefone(telefoneInput.value)) {
        alert('Por favor, insira um telefone válido com DDD (ex: (11) 90000-0000).');
        return;
    }

    // Simular o envio do pedido e exibir os modais
    let processPayment = true;
    
    if (paymentMethod === 'credit-card') {
        const securityCode = securityCodeInput.value.trim();
        if (securityCode.length !== 3) {
            alert('Por favor, insira um Código de Segurança (CVV) válido com 3 números.');
            processPayment = false;
        }
    } else if (paymentMethod === 'boleto') {
        processPayment = confirm('Gerar e enviar o boleto para o e-mail fornecido?');
        if (processPayment) {
            alert('Boleto enviado para o e-mail fornecido!');
        } else {
            alert('Selecione uma forma de pagamento.');
            return;
        }
    }
    
    if (processPayment) {
        alert('Processando pagamento...');
        setTimeout(() => {
            checkoutModal.style.display = 'none';
            orderConfirmModal.style.display = 'flex';
            
            // -------------------- INÍCIO DAS MUDANÇAS --------------------
            // Definir os status exatos que você solicitou
            const mainStatus = "Pedido Aprovado";
            const subStatus = "Aguardando Separação";
            
            // NOVIDADE: Atualiza o texto do botão do header para o subStatus
            currentOrderStatus = subStatus;
            updateOrderStatusDisplay();

            // NOVIDADE: Salvar o pedido com os status corretos para o rastreamento
            currentOrder = {
                id: Math.floor(Math.random() * 100000),
                items: [...cart],
                status: mainStatus,
                subStatus: subStatus, // Novo campo para o status detalhado
                total: checkoutTotalEl.textContent, // Já formatado
                paymentMethod: paymentMethod,
            };
            
            orderDetails.innerHTML = `
                <p>Seu pedido está sob o número: <strong>#${currentOrder.id}</strong></p>
                <p>Você receberá um e-mail com os detalhes do rastreamento.</p>
            `;
            
            // Limpar carrinho após a compra
            cart = [];
            updateCartCounter();
            renderCartItems();
            // -------------------- FIM DAS MUDANÇAS --------------------
        }, 2000);
    }
});

// Lógica de Filtros
filterType.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);
filterPrice.addEventListener('change', applyFilters); // Mudança para 'change' para o select

// NOVIDADE: Lógica de Rastreamento (agora exibe o pedido salvo na variável `currentOrder`)
trackingBtn.addEventListener('click', () => {
    trackingModal.style.display = 'flex';
    if (currentOrder) {
        trackingDetails.innerHTML = `
            <p><strong>Número do Pedido:</strong> #${currentOrder.id}</p>
            <p><strong>Status:</strong> ${currentOrder.status}, ${currentOrder.subStatus}</p>
            <p><strong>Total:</strong> ${currentOrder.total}</p>
            <p><strong>Itens:</strong></p>
            <ul>
                ${currentOrder.items.map(item => `<li>${item.quantity}x ${item.name} (${item.color}, ${item.size})</li>`).join('')}
            </ul>
        `;
    } else {
        trackingDetails.innerHTML = '<p>Você ainda não finalizou nenhum pedido.</p>';
    }
});

// Adicionando máscaras
cpfInput.addEventListener('input', (e) => {
    e.target.value = formatCpf(e.target.value);
});

telefoneInput.addEventListener('input', (e) => {
    e.target.value = formatTelefone(e.target.value);
});


// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupPriceFilter(); // Configura as opções do filtro de preço
    renderProducts();
    updateCartCounter();
    updateOrderStatusDisplay();
});