//teste deploy//
// 1. CONFIGURAÇÃO DO SUPABASE
const _supabase = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY
);
// 2. VARIÁVEIS 
let cart = [];
let usuarioLogado = null;
let produtosDoBanco = [];
let modoCadastro = false;

// 3. FUNÇÕES DE UI
function alternarModo() {
    modoCadastro = !modoCadastro;
    const camposExtras = document.getElementById('campos-cadastro-extra');
    const authTitle = document.getElementById('auth-title');
    const toggleLink = document.getElementById('toggle-link');

    camposExtras.style.display = modoCadastro ? 'block' : 'none';
    authTitle.innerText = modoCadastro ? 'Cadastrar' : 'Entrar';
    toggleLink.innerText = modoCadastro ? 'Já tem conta? Clique aqui.' : 'Ainda não tem conta? Clique aqui.';
}

function mostrarCampos(metodo) {
    document.getElementById('campos-cartao').style.display = metodo === 'cartao' ? 'block' : 'none';
    document.getElementById('campos-pix').style.display = metodo === 'pix' ? 'block' : 'none';
}

// 4. LÓGICA DE PRODUTOS E FILTROS
async function carregarProdutos() {
    const { data } = await _supabase.from('produtosecommerce').select('*');
    produtosDoBanco = data || [];
    renderizarProdutos(produtosDoBanco);
}

function renderizarProdutos(lista) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    lista.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.imagem}" style="width:150px;">
            <h3>${p.descricao}</h3>
            <p>R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart-btn" data-id="${p.id}">Adicionar</button>`;
        productList.appendChild(card);
    });
}
// 5. CARRINHO
function atualizarCarrinhoUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.preco);
        cartItemsContainer.innerHTML += `<p>${item.descricao} - R$ ${item.preco}</p>`;
    });
    cartTotalElement.innerText = total.toFixed(2);
    document.getElementById('cart-counter').innerText = cart.length;
}

// --- FUNÇÃO PARA ABRIR E PREENCHER O CHECKOUT ---
function abrirCheckout() {
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('checkout-modal').style.display = 'flex';

    const resumo = document.getElementById('resumo-conteudo');
    resumo.innerHTML = `
        <div class="info-cliente">
            <p><strong>Nome:</strong> ${usuarioLogado.nome}</p>
            <p><strong>Endereço:</strong> ${usuarioLogado.endereco}, ${usuarioLogado.numero_casa}</p>
        </div>
        <h3>Itens:</h3>
        <div id="lista-produtos-checkout"></div>
        <p><strong>Total: R$ ${document.getElementById('cart-total').innerText}</strong></p>
    `;
    const lista = document.getElementById('lista-produtos-checkout');
    cart.forEach(p => lista.innerHTML += `<p>${p.descricao} - R$ ${p.preco}</p>`);
}

// 6. INICIALIZAÇÃO (GARANTINDO QUE O DOM ESTEJA PRONTO)
document.addEventListener('DOMContentLoaded', () => {
    
    // Delegar cliques para botões dinâmicos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const produto = produtosDoBanco.find(p => p.id === id);
            cart.push(produto);
            alert(produto.descricao + " adicionado!");
            atualizarCarrinhoUI();
        }
        if (e.target.classList.contains('close-btn')) {
            e.target.closest('.modal').style.display = 'none';
        }
    });

    // Eventos de Botões Fixos
    document.getElementById('view-cart-btn').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'flex';
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) return alert("Carrinho vazio!");
        if (!usuarioLogado) {
            document.getElementById('cart-modal').style.display = 'none';
            document.getElementById('auth-modal').style.display = 'flex';
        } else {
            abrirCheckout();
        }
    });

    document.getElementById('btn-login-executar').addEventListener('click', async () => {
        const email = document.getElementById('email-auth').value;
        const senha = document.getElementById('senha-auth').value;
        
        if (modoCadastro) {
            // Insira sua lógica de cadastro aqui
            alert("Cadastro realizado!");
        } else {
            const { data } = await _supabase.from('siteecommerce').select('*').eq('email', email).eq('senha', senha).single();
            if (data) {
                usuarioLogado = data;
                alert("Login realizado!");
                cart.length > 0 ? abrirCheckout() : (document.getElementById('auth-modal').style.display = 'none');
            } else alert("Email ou senha incorretos.");
        }
    });

    carregarProdutos();
});