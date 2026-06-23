// 1. CONFIGURAÇÃO DO SUPABASE
const _supabase = supabase.createClient(
    'https://wdvtuvohucyndqjnfpyh.supabase.co',
    'sb_publishable_WUIsSwuV_kncGM-YfnT0EA_gnQlS_D3'
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

// DELEGAÇÃO DE EVENTOS 
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const id = parseInt(e.target.dataset.id);
        const produto = produtosDoBanco.find(p => p.id === id);
        cart.push(produto);
        alert(produto.descricao + " adicionado ao carrinho!");
        atualizarCarrinhoUI();
    }
});

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

// 6. LOGIN E CADASTRO
document.getElementById('btn-login-executar').addEventListener('click', async () => {
    const email = document.getElementById('email-auth').value;
    const senha = document.getElementById('senha-auth').value;

    if (modoCadastro) {
        const { error } = await _supabase.from('siteecommerce').insert([{
            nome: document.getElementById('nome-cadastro').value,
            cpf: document.getElementById('cpf-auth').value,
            endereco: document.getElementById('endereco-auth').value,
            numero_casa: document.getElementById('numero-auth').value,
            cep: document.getElementById('cep-auth').value,
            tel: document.getElementById('telefone-auth').value,
            email, senha
        }]);
        if (error) alert("Erro: " + error.message);
        else alert("Cadastro feito! Agora entre.");
    } else {
        const { data } = await _supabase.from('siteecommerce').select('*').eq('email', email).eq('senha', senha).single();
        if (data) {
            usuarioLogado = data;
            alert("Login realizado!");
            document.getElementById('auth-modal').style.display = 'none';
        } else alert("Email ou senha incorretos.");
    }
});

// 7. INICIALIZAÇÃO
document.getElementById('view-cart-btn').addEventListener('click', () => document.getElementById('cart-modal').style.display = 'flex');
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('cart-modal').style.display = 'none';
    if (!usuarioLogado) document.getElementById('auth-modal').style.display = 'flex';
    else document.getElementById('checkout-modal').style.display = 'flex';
});

// Filtros
document.getElementById('btn-buscar-filtros').addEventListener('click', () => {
    const tipo = document.getElementById('filter-type').value;
    let filtrados = tipo === 'all' ? produtosDoBanco : produtosDoBanco.filter(p => p.setor === tipo);
    renderizarProdutos(filtrados);
});

carregarProdutos();
