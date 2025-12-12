// ==========================================
// 🛠️ CONFIGURAÇÕES E UTILITÁRIOS
// ==========================================

const historyTableBody = document.querySelector('#historyTable tbody');
const queryTableBody = document.querySelector('#queryTable tbody');

const mapaProdutos = {
    'Quadrado': 'square',
    'Circulo': 'circle',
    'Hexagono': 'hexagon'
};

// Estado dos filtros
let filtroAtivo = 'todos';
let ordenacao = 'recente';
let mostrarApenasMeus = false;

function getUsuarioLogadoId() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId || payload.sub;
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
    }
}

function normalizeStatus(status) {
    if (!status) return '';
    return status.toLowerCase()
        .replace(/\s/g, '')
        .replace('í', 'i')
        .replace('ã', 'a')
        .replace('ç', 'c')
        .replace('õ', 'o');
}

// ==========================================
// 🎨 RENDERIZAR PEÇAS COM PROGRESSO
// ==========================================
function criarContainerPecas(produtos, emProducao = false, entregue = false, quantidadePecas = 0) {
    const tdItem = document.createElement('td');
    
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        tdItem.textContent = '-';
        return tdItem;
    }

    const produtosValidos = produtos.filter(p => {
        let nomeProduto = "";
        if (p.nome) nomeProduto = p.nome;
        else if (p.produto && p.produto.nome) nomeProduto = p.produto.nome;
        else if (typeof p.produto === 'string') nomeProduto = p.produto;
        
        return nomeProduto && nomeProduto !== "-";
    });

    if (produtosValidos.length === 0) {
        tdItem.textContent = '-';
        return tdItem;
    }

    let cont = 0;
    produtosValidos.forEach((item, index) => {
        if (cont === 3) {
            let itemSpan1 = document.createElement('span');
            itemSpan1.classList.add('item', 'separator');
            tdItem.appendChild(itemSpan1);
            cont = 0;
        }

        let nomeProduto = "";
        if (item.nome) nomeProduto = item.nome;
        else if (item.produto && item.produto.nome) nomeProduto = item.produto.nome;
        else if (typeof item.produto === 'string') nomeProduto = item.produto;

        const classeCss = mapaProdutos[nomeProduto] || 'square';
        
        let itemSpan = document.createElement('span');
        itemSpan.classList.add('item', classeCss);
        
        if (entregue || (emProducao && index < quantidadePecas)) {
            itemSpan.classList.add('filled');
        }
        
        tdItem.appendChild(itemSpan);
        cont++;
    });

    return tdItem;
}

// ==========================================
// 🏗️ CRIAÇÃO DAS LINHAS (DOM)
// ==========================================
function createRow(data, emProducao = false, entregue = false, quantidadePecas = 0) {
    const row = document.createElement('tr');
    
    if (emProducao) {
        row.classList.add('status-producao');
    }

    // --- ID ---
    let tdID = document.createElement('td');
    tdID.textContent = data.id.slice(-4).toUpperCase();
    row.appendChild(tdID);

    // --- STATUS ---
    let tdStatus = document.createElement('td');
    let statusSpan = document.createElement('span');
    
    statusSpan.classList.add('status', normalizeStatus(data.status));
    statusSpan.textContent = data.status;
    
    if (emProducao) {
        const badge = document.createElement('span');
        badge.classList.add('progress-badge');
        
        const produtosValidos = (data.produtos || []).filter(p => {
            let nome = "";
            if (p.nome) nome = p.nome;
            else if (p.produto && p.produto.nome) nome = p.produto.nome;
            else if (typeof p.produto === 'string') nome = p.produto;
            return nome && nome !== "-";
        });
        
        const qtd = produtosValidos.length;
        badge.textContent = `${quantidadePecas}/${qtd}`;
        statusSpan.appendChild(document.createElement('br'));
        statusSpan.appendChild(badge);
    }
    
    tdStatus.appendChild(statusSpan);
    row.appendChild(tdStatus);

    // --- ITENS COM PROGRESSO ---
    const tdItems = criarContainerPecas(data.produtos, emProducao, entregue, quantidadePecas);
    row.appendChild(tdItems);

    // --- CLIENTE ---
    let tdClient = document.createElement('td');
    tdClient.textContent = data.usuario ? data.usuario.nome : 'Cliente';
    row.appendChild(tdClient);

    return row;
}

// ==========================================
// 🔍 FUNÇÃO DE FILTRO E ORDENAÇÃO
// ==========================================
function aplicarFiltro(listaEntregas) {
    historyTableBody.innerHTML = '';
    queryTableBody.innerHTML = '';

    const usuarioLogadoId = getUsuarioLogadoId();

    let listaFiltrada = listaEntregas;
    if (mostrarApenasMeus && usuarioLogadoId) {
        listaFiltrada = listaEntregas.filter(entrega => {
            const entregaUserId = entrega.usuario?.id || entrega.usuario?._id;
            return entregaUserId === usuarioLogadoId;
        });
    }

    listaFiltrada = [...listaFiltrada].sort((a, b) => {
        const dataA = new Date(a.criadoEm || a.createdAt);
        const dataB = new Date(b.criadoEm || b.createdAt);
        return ordenacao === 'recente' ? dataB - dataA : dataA - dataB;
    });

    let contadorFiltrados = 0;
    listaFiltrada.forEach(entrega => {
        const dadosFormatados = {
            id: entrega.id,
            status: entrega.status,
            produtos: entrega.produtos,
            usuario: entrega.usuario
        };

        const emProducao = entrega.status === 'Producao';
        const entregue = entrega.status === 'Entregue';
        const quantidadePecas = entrega.quantidadePecas || 0;
        
        if (filtroAtivo === 'todos' || normalizeStatus(entrega.status) === filtroAtivo) {
            const rowHistory = createRow(dadosFormatados, emProducao, entregue, quantidadePecas);
            historyTableBody.appendChild(rowHistory);
            contadorFiltrados++;
        }

        if (entrega.status === 'Pendente' || entrega.status === 'Em Rota' || entrega.status === 'Producao') {
            const rowQuery = createRow(dadosFormatados, emProducao, entregue, quantidadePecas);
            queryTableBody.appendChild(rowQuery);
        }
    });

    atualizarContador(contadorFiltrados, listaEntregas.length);
}

// ==========================================
// 📊 ATUALIZAR CONTADOR
// ==========================================
function atualizarContador(filtrados, total) {
    const contador = document.querySelector('.filter-counter');
    if (contador) {
        contador.textContent = `${filtrados} de ${total}`;
    }
}

// ==========================================
// 🚀 BUSCAR DADOS DA API
// ==========================================
async function carregarDados() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Sem token. O usuário precisa logar.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/entregas?sort=recent', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar entregas');
        }

        const listaEntregas = await response.json();
        aplicarFiltro(listaEntregas);
        window.listaEntregasCompleta = listaEntregas;

    } catch (error) {
        console.error('Erro:', error);
        historyTableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar dados.</td></tr>';
    }
}

// ==========================================
// 🎛️ CONFIGURAR FILTROS E CONTROLES
// ==========================================
function configurarFiltros() {
    const containerHistorico = document.querySelector('.container1');
    
    const filterWrapperAntigo = document.querySelector('.filter-container');
    if (filterWrapperAntigo) filterWrapperAntigo.remove();

    if (!containerHistorico) return;

    // Container principal
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('filter-container');

    // ========== TABS DE STATUS ==========
    const tabsContainer = document.createElement('div');
    tabsContainer.classList.add('filter-tabs');

    const filtrosStatus = [
        { id: 'todos', label: 'Todos', icon: '' },
        { id: 'producao', label: 'Produção', icon: '⚙️' },
        { id: 'emrota', label: 'Em Rota', icon: '🚚' },
        { id: 'pendente', label: 'Pendente', icon: '⏳' },
        { id: 'entregue', label: 'Entregue', icon: '✓' }
    ];

    filtrosStatus.forEach(filtro => {
        const tab = document.createElement('button');
        tab.classList.add('filter-tab');
        if (filtro.id === 'todos') tab.classList.add('active');
        
        tab.innerHTML = filtro.icon ? `<span class="tab-icon">${filtro.icon}</span>${filtro.label}` : filtro.label;
        
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filtroAtivo = filtro.id;
            aplicarFiltro(window.listaEntregasCompleta || []);
        });
        
        tabsContainer.appendChild(tab);
    });

    // ========== CONTROLES ==========
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('filter-controls');

    // Botão Meus Pedidos
    const btnMeus = document.createElement('button');
    btnMeus.classList.add('filter-btn-icon');
    btnMeus.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Meus</span>
    `;
    btnMeus.title = "Mostrar apenas meus pedidos";
    btnMeus.addEventListener('click', () => {
        mostrarApenasMeus = !mostrarApenasMeus;
        btnMeus.classList.toggle('active', mostrarApenasMeus);
        aplicarFiltro(window.listaEntregasCompleta || []);
    });
    controlsContainer.appendChild(btnMeus);

    // Botão Ordenação
    const btnOrdem = document.createElement('button');
    btnOrdem.classList.add('filter-btn-icon');
    btnOrdem.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12l7-7 7 7"/>
        </svg>
        <span>Recente</span>
    `;
    btnOrdem.title = "Alterar ordenação";
    btnOrdem.addEventListener('click', () => {
        ordenacao = ordenacao === 'recente' ? 'antigo' : 'recente';
        const iconSvg = ordenacao === 'recente' 
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7 7 7-7"/></svg>`;
        btnOrdem.innerHTML = `${iconSvg}<span>${ordenacao === 'recente' ? 'Recente' : 'Antigo'}</span>`;
        btnOrdem.classList.toggle('active', ordenacao === 'antigo');
        aplicarFiltro(window.listaEntregasCompleta || []);
    });
    controlsContainer.appendChild(btnOrdem);

    // Separador
    const separator = document.createElement('div');
    separator.classList.add('filter-separator');
    controlsContainer.appendChild(separator);

    // Contador
    const counter = document.createElement('span');
    counter.classList.add('filter-counter');
    counter.textContent = '0 de 0';
    controlsContainer.appendChild(counter);

    // Monta estrutura
    filterContainer.appendChild(tabsContainer);
    filterContainer.appendChild(controlsContainer);

    // Insere após o título
    const titulo = containerHistorico.querySelector('.title');
    if (titulo) {
        titulo.insertAdjacentElement('afterend', filterContainer);
    } else {
        containerHistorico.insertBefore(filterContainer, containerHistorico.firstChild);
    }
}

// ==========================================
// 🚀 INICIALIZAÇÃO
// ==========================================
window.addEventListener('load', () => {
    carregarDados();
    configurarFiltros();
});

setInterval(carregarDados, 5000);