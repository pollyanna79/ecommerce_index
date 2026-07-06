const _supabase = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
// 2. VARIÁVEIS 
let cart = [];
let usuarioLogado = null;
let produtosDoBanco = [];
let modoCadastro = false;
let acaoPendente = null; // Pode ser 'checkout' ou 'pedidos'

async function carregarMeusPedidos() {
    // 1. Determina o e-mail: se logado, usa o objeto; se não, pega do input do modal
    const emailConsulta = usuarioLogado ? usuarioLogado.email : document.getElementById('email-login')?.value;

    // Se não estiver logado e não houver e-mail no input, abre o modal
    if (!usuarioLogado && !emailConsulta) {
        acaoPendente = 'pedidos';
        document.getElementById('senha-login').style.display = 'none';
        document.getElementById('auth-modal').style.display = 'flex';
        return;
    }

    console.log("DEBUG: Iniciando busca para o email:", emailConsulta);

    // 2. Prepara a UI
    const modalPedidos = document.getElementById('pedidos-modal');
    const container = document.getElementById('lista-pedidos');
    
    if (modalPedidos) modalPedidos.style.display = 'flex';
    if (container) container.innerHTML = 'Buscando seus pedidos...';

    // 3. Consulta na view usando o e-mail capturado (com trim para segurança)
    const { data, error } = await _supabase
        .from('view_detalhes_pedidos')
        .select('*')
        .eq('email', emailConsulta.trim());

    // 4. Diagnóstico de erro
    if (error) {
        console.error("ERRO SUPABASE:", error);
        if (container) container.innerHTML = 'Erro ao carregar pedidos: ' + error.message;
        return;
    }

    console.log("DEBUG: Dados retornados do Supabase:", data);

    // 5. Renderização
    if (container) {
        if (!data || data.length === 0) {
            container.innerHTML = `<p>Nenhum pedido encontrado para: <strong>${emailConsulta}</strong></p>`;
        } else {
            container.innerHTML = ''; 
            data.forEach(p => {
                container.innerHTML += `
                    <div style="border-bottom: 1px solid #eee; padding: 10px;">
                        <p><strong>Pedido ID:</strong> ${p.id_pedido}</p>
                        <p><strong>Itens:</strong> ${p.itens_compra}</p>
                        <p><strong>Total:</strong> R$ ${parseFloat(p.valor_total || 0).toFixed(2)}</p>
                    </div>
                `;
            });
        }
    }
}
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

//Finalizar pedido 
async function finalizarPedido() {
    console.log("--- DEBUG: Iniciando Função ---");
    
    // 1. Coleta e tratamento de dados
    const valorTotal = parseFloat(document.getElementById('cart-total')?.innerText.replace('R$', '').trim()) || 0;
    const itens = cart.map(item => item.descricao).join(', ');
    const metodo = document.querySelector('input[name="payment-method"]:checked')?.value || 'pix';
    const cartao = document.getElementById('num-cartao')?.value || null;
    const clienteId = usuarioLogado?.id || 0;

    // 2. Objeto formatado com campos obrigatórios
    const novoPedido = {
        id_cliente: parseInt(clienteId),
        itens_compra: itens,
        quantidade: parseInt(cart.length),
        valor_total: valorTotal,
        metodo_pagamento: metodo,
        numero_cartao: metodo === 'cartao' ? cartao : 'NULL',
        status: 'Pendente'
    };

    console.log("--- DEBUG: Objeto que será enviado ---", novoPedido);

    // 3. Inserção
    const { data, error } = await _supabase
        .from('pedidosecommerce')
        .insert([novoPedido])
        .select();

    if (error) {
        console.error("--- ERRO DO SUPABASE ---", error);
        alert("Erro no Supabase: " + error.message);
    } else {
        console.log("--- SUCESSO ---", data);
        alert("Pedido realizado com sucesso!");
        window.location.reload();
    }
}

// 6. INICIALIZAÇÃO (GARANTINDO QUE O DOM ESTEJA PRONTO)
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('tracking-btn').addEventListener('click', () => {
    // Se já estiver logado, busca direto. Se não, abre o modal de login.
    if (usuarioLogado) {
        carregarMeusPedidos();
    } else {
        acaoPendente = 'pedidos'; 
        document.getElementById('auth-modal').style.display = 'flex';
        // DICA: Você pode esconder o campo de senha aqui se quiser:
        document.getElementById('senha-login').style.display = 'none'; 
    }
});
    
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
    acaoPendente = 'checkout';
    document.getElementById('senha-login').style.display = 'block'; // Mostra a senha
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'flex';
});
document.getElementById('btn-login-executar').addEventListener('click', async () => {
    // Bloco de CADASTRO
    if (modoCadastro) {
        const nome = document.getElementById('nome-cadastro')?.value;
        const email = document.getElementById('email-cadastro')?.value;
        const senha = document.getElementById('senha-cadastro')?.value;
        
        if (!email || !senha || !nome) return alert("Preencha todos os campos.");

        const { data, error } = await _supabase
            .from('siteecommerce')
            .insert([{ nome, email, senha }])
            .select().single();

        if (error) return alert("Erro ao cadastrar: " + error.message);
        
        usuarioLogado = data;
        document.getElementById('auth-modal').style.display = 'none';
        acaoPendente === 'pedidos' ? carregarMeusPedidos() : abrirCheckout();
        acaoPendente = null;

    } else {
        // Bloco de LOGIN
        const email = document.getElementById('email-login').value;
        const senha = document.getElementById('senha-login').value;

        // Se for "pedidos", buscamos apenas pelo e-mail
        let query = _supabase.from('siteecommerce').select('*').eq('email', email);
        
        if (acaoPendente !== 'pedidos') {
            query = query.eq('senha', senha);
        }

        const { data, error } = await query.maybeSingle();

        if (data) {
            usuarioLogado = data; 
            document.getElementById('auth-modal').style.display = 'none';
            
            if (acaoPendente === 'pedidos') {
                carregarMeusPedidos();
            } else {
                abrirCheckout();
            }
            acaoPendente = null;
        } else {
            alert("Email ou dados incorretos.");
        }
    }
});

// --- 3. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    document.getElementById('btn-primary').onclick = (e) => {
    e.preventDefault(); 
    console.log("Botão clicado!");
    finalizarPedido();
};
    // Botão Pedidos (Tracking)
    document.getElementById('tracking-btn').addEventListener('click', () => {
        acaoPendente = 'pedidos';
        // Garante que o campo de senha suma para não confundir
        document.getElementById('senha-login').style.display = 'none'; 
        document.getElementById('auth-modal').style.display = 'flex';
    });
    
    // Botão Checkout
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) return alert("Carrinho vazio!");
        acaoPendente = 'checkout';
        // Garante que o campo de senha apareça para login completo
        document.getElementById('senha-login').style.display = 'block'; 
        document.getElementById('auth-modal').style.display = 'flex';
    });
});
    carregarProdutos();
});