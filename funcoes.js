const _supabase = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
// 2. VARIÁVEIS 
let cart = [];
let usuarioLogado = null;
let produtosDoBanco = [];
let modoCadastro = false;
let acaoPendente = null; // Pode ser 'checkout' ou 'pedidos'

async function carregarMeusPedidos() {
    const emailConsulta = usuarioLogado ? usuarioLogado.email : document.getElementById('email-login')?.value;
    const email = (emailConsulta || '').toString().trim();

    if (!usuarioLogado && !email) {
        acaoPendente = 'pedidos';
        document.getElementById('senha-login').style.display = 'none';
        document.getElementById('auth-modal').style.display = 'flex';
        return;
    }

    const modalPedidos = document.getElementById('pedidos-modal');
    const container = document.getElementById('lista-pedidos');

    if (modalPedidos) modalPedidos.style.display = 'flex';
    if (container) container.innerHTML = 'Buscando seus pedidos...';

    try {
        let query = _supabase.from('view_detalhes_pedidos').select('*');

        if (usuarioLogado?.id) {
            query = query.eq('id_cliente', usuarioLogado.id);
        } else if (email) {
            query = query.eq('email', email);
        }

        const { data, error } = await query;

        if (error) {
            console.error('ERRO SUPABASE:', error);
            if (container) container.innerHTML = 'Erro ao carregar pedidos: ' + error.message;
            return;
        }

        if (container) {
            if (!data || data.length === 0) {
                container.innerHTML = `<p>Nenhum pedido encontrado para: <strong>${email || 'este usuário'}</strong></p>`;
            } else {
                container.innerHTML = data.map(p => {
                    const nome = p.nome || p.nome_cliente || 'Cliente';
                    const endereco = p.endereco || p.endereco_cliente || 'Não informado';
                    const numeroCasa = p.numero_casa || p.numero || p.numero_endereco || 'S/N';
                    const cep = p.cep || p.cep_cliente || 'Não informado';
                    const emailPedido = p.email || p.email_cliente || email;
                    const idPedido = p.id_pedido || p.id || p.pedido_id || 'Sem ID';
                    const itensCompra = p.itens_compra || p['itens compra'] || p.itens || 'Sem itens';
                    const quantidade = p.quantidade || p.qtd || 0;
                    const valorTotal = p.valor_total || p['valor total'] || p.valor || 0;
                    const status = p.status || p.status_pedido || 'Pendente';

                    return `
                        <div style="border-bottom: 1px solid #eee; padding: 10px;">
                            <p><strong>Nome:</strong> ${nome}</p>
                            <p><strong>Endereço:</strong> ${endereco}</p>
                            <p><strong>Número:</strong> ${numeroCasa}</p>
                            <p><strong>CEP:</strong> ${cep}</p>
                            <p><strong>Email:</strong> ${emailPedido}</p>
                            <p><strong>Pedido:</strong> ${idPedido}</p>
                            <p><strong>Itens:</strong> ${itensCompra}</p>
                            <p><strong>Quantidade:</strong> ${quantidade}</p>
                            <p><strong>Total:</strong> R$ ${parseFloat(valorTotal || 0).toFixed(2)}</p>
                            <p><strong>Status:</strong> ${status}</p>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Erro inesperado ao carregar pedidos:', err);
        if (container) container.innerHTML = 'Erro ao carregar pedidos.';
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
    const exibirCartao = metodo === 'cartao' ? 'block' : 'none';
    
    document.getElementById('campos-cartao').style.display = exibirCartao;
    document.getElementById('div-nome-cartao').style.display = exibirCartao;
    document.getElementById('div-validade-cartao').style.display = exibirCartao;
    document.getElementById('div-cod-seguranca').style.display = exibirCartao;
    
    document.getElementById('campos-pix').style.display = metodo === 'pix' ? 'block' : 'none';
}
function identificarBandeiraCartao(numero) {
    const imgBandeira = document.getElementById('card-brand-img');
    if (!imgBandeira) return;

    // Remove espaços e caracteres não numéricos
    const numLimpo = numero.replace(/\D/g, '');

    let bandeira = '';
    let urlImagem = '';

    // Regras básicas de identificação por BIN (dígitos iniciais)
    if (/^4/.test(numLimpo)) {
        bandeira = 'visa';
        urlImagem = 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png';
    } else if (/^5[1-5]/.test(numLimpo) || /^2[2-7]/.test(numLimpo)) {
        bandeira = 'mastercard';
        urlImagem = 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg';
    } else if (/^3[47]/.test(numLimpo)) {
        bandeira = 'amex';
        urlImagem = 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg';
    } else if (/^6[09]/.test(numLimpo) || /^652[0-9]/.test(numLimpo)) {
        bandeira = 'elo';
        urlImagem = 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Elo_logo_%282018%29.svg';
    }

    if (urlImagem && numLimpo.length >= 2) {
        imgBandeira.src = urlImagem;
        imgBandeira.style.display = 'block';
    } else {
        imgBandeira.src = '';
        imgBandeira.style.display = 'none';
    }
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
    const clienteNome = usuarioLogado?.nome || usuarioLogado?.full_name || 'Cliente';
    const clienteEmail = usuarioLogado?.email || document.getElementById('email-login')?.value || 'Não informado';
    const clienteEndereco = usuarioLogado?.endereco || usuarioLogado?.endereço || 'Não informado';
    const clienteNumero = usuarioLogado?.numero_casa || usuarioLogado?.numero || 'S/N';
    const clienteCep = usuarioLogado?.cep || 'Não informado';

    resumo.innerHTML = `
        <div class="info-cliente">
            <p><strong>Nome:</strong> ${clienteNome}</p>
            <p><strong>Email:</strong> ${clienteEmail}</p>
            <p><strong>Endereço:</strong> ${clienteEndereco}, ${clienteNumero}</p>
            <p><strong>CEP:</strong> ${clienteCep}</p>
        </div>
        <h3>Itens:</h3>
        <div id="lista-produtos-checkout"></div>
        <hr>
        <p><strong>Total Geral: R$ ${document.getElementById('cart-total').innerText}</strong></p>
    `;

    const lista = document.getElementById('lista-produtos-checkout');
    lista.innerHTML = '';

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

async function finalizarPedido() {
  const metodo = document.querySelector('input[name="payment-method"]:checked')?.value || 'pix';

    // VALIDAÇÕES ESPECÍFICAS PARA CARTÃO
    if (metodo === 'cartao') {
        const numCartaoInput = document.getElementById('num-cartao')?.value.replace(/\D/g, '') || '';
        const nomeCartaoInput = document.getElementById('nome-cartao')?.value.trim() || '';
        const validadeInput = document.getElementById('validade-cartao')?.value.trim() || '';

        // 1. Validação de 16 números exatos
        if (numCartaoInput.length !== 16) {
            alert('O número do cartão deve conter exatamente 16 números.');
            return;
        }

        // 2. Validação de Nome e Sobrenome
        const partesNome = nomeCartaoInput.split(' ').filter(p => p.length > 0);
        if (partesNome.length < 2) {
            alert('Por favor, informe o nome completo (Nome e Sobrenome) igual ao impresso no cartão.');
            return;
        }

        // 3. Validação de Validade (Mês/Ano não inferior ao atual)
        const regexValidade = /^(\d{2})\/(\d{2,4})$/;
        const matchValidade = validadeInput.match(regexValidade);
        
        if (!matchValidade) {
            alert('Informe a validade no formato correto (MM/AA ou MM/AAAA).');
            return;
        }

        const mesInformado = parseInt(matchValidade[1], 10);
        let anoInformado = parseInt(matchValidade[2], 10);

        if (mesInformado < 1 || mesInformado > 12) {
            alert('Mês de validade inválido.');
            return;
        }

        if (anoInformado < 100) {
            anoInformado += 2000;
        }

        const dataAtual = new Date();
        const anoAtual = dataAtual.getFullYear();
        const mesAtual = dataAtual.getMonth() + 1;

        if (anoInformado < anoAtual || (anoInformado === anoAtual && mesInformado < mesAtual)) {
            alert('A validade do cartão não pode ser inferior ao mês e ano atual.');
            return;
        }
    }

    const valorTotal = parseFloat(
        document.getElementById('cart-total')?.innerText.replace(/[R$\s]/g, '').replace(',', '.') || 0
    );
    const itens = cart.map(item => item.descricao).join(', ');
    const cartao = document.getElementById('num-cartao')?.value || null;
    const clienteId = usuarioLogado?.id ? parseInt(usuarioLogado.id) : null;
    const idProduto = cart[0]?.id ?? null;

    const novoPedido = {
        id_cliente: clienteId,
        itens_compra: itens || 'Sem itens',
        quantidade: parseInt(cart.length || 0),
        valor_total: valorTotal,
        metodo_pagamento: metodo,
        numero_cartao: metodo === 'cartao' ? cartao : null,
        status: 'Pendente',
        data_compra: new Date().toISOString(),
        id_produto: idProduto
    };

    console.log('Dados enviados para o pedido:', novoPedido);

    const { data, error } = await _supabase
        .from('pedidosecommerce')
        .insert([novoPedido])
        .select();

    if (error) {
        console.error('ERRO DO SUPABASE:', error);
        alert('Erro ao salvar pedido: ' + error.message);
    } else {
        console.log('Pedido salvo com sucesso:', data);
        alert('Pedido realizado com sucesso!');
        cart = [];
        atualizarCarrinhoUI();
        document.getElementById('checkout-modal').style.display = 'none';
        window.location.reload();
    }
}


// 6. INICIALIZAÇÃO (GARANTINDO QUE O DOM ESTEJA PRONTO)
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();

    document.getElementById('tracking-btn').addEventListener('click', () => {
        if (usuarioLogado) {
            carregarMeusPedidos();
        } else {
            acaoPendente = 'pedidos';
            document.getElementById('auth-modal').style.display = 'flex';
            document.getElementById('senha-login').style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const produto = produtosDoBanco.find(p => p.id === id);
            if (produto) {
                cart.push(produto);
                alert(produto.descricao + ' adicionado!');
                atualizarCarrinhoUI();
            }
        }

        if (e.target.classList.contains('close-btn')) {
            e.target.closest('.modal').style.display = 'none';
        }
    });

    document.getElementById('view-cart-btn').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'flex';
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) return alert('Carrinho vazio!');
        acaoPendente = 'checkout';
        document.getElementById('senha-login').style.display = 'block';
        document.getElementById('cart-modal').style.display = 'none';
        document.getElementById('auth-modal').style.display = 'flex';
    });

    document.getElementById('btn-login-executar').addEventListener('click', async () => {
        if (modoCadastro) {
            const nome = document.getElementById('nome-cadastro')?.value;
             const cpf = document.getElementById('cpf-auth')?.value;
            const email = document.getElementById('email-cadastro')?.value;
            const senha = document.getElementById('senha-cadastro')?.value;
            const tel = document.getElementById('telefone-auth')?.value;
           const endereco = document.getElementById('endereco-auth')?.value;
            const numero_casa = document.getElementById('numero-auth')?.value;
          const cep = document.getElementById('cep-auth').value;
            


            if (!email || !senha || !nome) return alert('Preencha todos os campos.');

            const { data, error } = await _supabase
                .from('siteecommerce')
                .insert([{ nome,cpf,email,senha,tel,endereco,numero_casa,cep }])
                .select()
                .single();

            if (error) return alert('Erro ao cadastrar: ' + error.message);

            usuarioLogado = data;
            document.getElementById('auth-modal').style.display = 'none';
            acaoPendente === 'pedidos' ? carregarMeusPedidos() : abrirCheckout();
            acaoPendente = null;
        } else {
            const email = document.getElementById('email-login').value;
            const senha = document.getElementById('senha-login').value;

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
                alert('Email ou dados incorretos.');
            }
        }
    });

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await finalizarPedido();
    });
});