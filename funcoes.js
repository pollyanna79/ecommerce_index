// 1. CONFIGURAÇÃO DO SUPABASE
const _supabase = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);




// 2. VARIÁVEIS 
let cart = [];
let usuarioLogado = null;
let produtosDoBanco = [];
let modoCadastro = false;

// 3. FUNÇÕES DE UI
function alternarModo() {
    modoCadastro = !modoCadastro;
    const camposExtras = document.getElementById('campos-cadastro-extra');
    const containerLogin = document.getElementById('container-login');
    const authTitle = document.getElementById('auth-title');
    const toggleLink = document.getElementById('toggle-link');

    camposExtras.style.display = modoCadastro ? 'block' : 'none';
    containerLogin.style.display = modoCadastro ? 'none' : 'block';
    authTitle.innerText = modoCadastro ? 'Cadastrar' : 'Entrar';
    toggleLink.innerText = modoCadastro ? 'Já tem conta? Clique aqui.' : 'Ainda não tem conta? Clique aqui.';
}

function mostrarCampos(metodo) {
    document.getElementById('campos-cartao').style.display = metodo === 'cartao' ? 'block' : 'none';
    document.getElementById('campos-pix').style.display = metodo === 'pix' ? 'block' : 'none';
}

// 4. LÓGICA DE PRODUTOS E FILTROS
document.getElementById('btn-buscar-filtros').addEventListener('click', () => {
    const tipoFiltro = document.getElementById('filter-type').value; // 'Eletrônico', 'Roupas', 'livraria', 'all'
    const precoFiltro = document.getElementById('filter-price').value;

    let produtosFiltrados = produtosDoBanco.filter(p => {
        // 1. Filtro de Tipo (Usando o nome da sua coluna: 'setor')
        // Convertemos tudo para minúsculo para evitar erro de digitação
        const setorProduto = (p.setor || "").toLowerCase().trim();
        const filtroFormatado = tipoFiltro.toLowerCase().trim();
        
        // Verifica se é 'Todos' ou se o setor bate
        const matchTipo = (tipoFiltro === 'all' || setorProduto === filtroFormatado);
        
        // 2. Filtro de Preço
        let matchPreco = true;
        const preco = parseFloat(p.preco);
        
        if (precoFiltro === '0-50') matchPreco = preco <= 50;
        else if (precoFiltro === '51-100') matchPreco = preco > 50 && preco <= 100;
        else if (precoFiltro === '101-2000') matchPreco = preco > 100 && preco <= 2000;

        return matchTipo && matchPreco;
    });

    renderizarProdutos(produtosFiltrados);
});
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
        cartItemsContainer.innerHTML += `<img src="${item.imagem}" style="width:150px;">- <p>${item.descricao} - R$ ${item.preco}</p>`;
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
    
    // 1. Preenche as informações do cliente e o título dos itens (fora do loop)
    resumo.innerHTML = `
        <div class="info-cliente">
            <p><strong>Nome:</strong> ${usuarioLogado.nome}</p>
            <p><strong>Email:</strong> ${usuarioLogado.email}</p>
            <p><strong>Endereço:</strong> ${usuarioLogado.endereco}, ${usuarioLogado.numero_casa}</p>
            <p><strong>CEP:</strong> ${usuarioLogado.cep}</p>
        </div>
        <h3>Itens:</h3>
        <div id="lista-produtos-checkout"></div>
        <hr>
        <p><strong>Total Geral: R$ ${document.getElementById('cart-total').innerText}</strong></p>
    `;

    // 2. Preenche apenas os produtos na div específica
    const lista = document.getElementById('lista-produtos-checkout');
    lista.innerHTML = ''; // Limpa antes de preencher

    cart.forEach(p => {
        lista.innerHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <img src="${p.imagem}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                <div style="flex-grow: 1;">
                    <p style="margin: 0; font-weight: bold;">${p.descricao}</p>
                    <p style="margin: 0; color: #555;">R$ ${parseFloat(p.preco).toFixed(2)}</p>
                </div>
            </div>
        `;
    });
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
    if (modoCadastro) {
        const nome = document.getElementById('nome-cadastro')?.value;
        const cpf = document.getElementById('cpf-auth')?.value;
        const tel = document.getElementById('telefone-auth')?.value;
        const endereco = document.getElementById('endereco-auth')?.value;
        const numero_casa = document.getElementById('numero-auth')?.value;
        const cep = document.getElementById('cep-auth')?.value;
        const email = document.getElementById('email-cadastro')?.value;
        const senha = document.getElementById('senha-cadastro')?.value;

        if (!email || !senha || !nome) return alert("Preencha todos os campos obrigatórios.");

        const { data, error } = await _supabase
            .from('siteecommerce')
            .insert([{ nome, cpf, tel, endereco, numero_casa, cep, email, senha }])
            .select() // Importante: retorna o registro criado
            .single();

        if (error) {
            alert("Erro ao cadastrar: " + error.message);
        } else {
            alert("Cadastro realizado!");
            usuarioLogado = data; // Define o usuário logado automaticamente
            document.getElementById('auth-modal').style.display = 'none';
            abrirCheckout(); // Chama o checkout logo após o cadastro
        }

    } else {
        // Lógica de Login existente...
        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;

        const { data, error } = await _supabase
            .from('siteecommerce')
            .select('*')
            .eq('email', email)
            .eq('senha', senha)
            .maybeSingle();

        if (data) {
            usuarioLogado = data;
            document.getElementById('auth-modal').style.display = 'none';
            abrirCheckout(); // Abre o checkout após o login
        } else {
            alert("Email ou senha incorretos.");
        }
    }
});

    carregarProdutos();
});