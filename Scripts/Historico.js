// ==========================================
// 🛠️ CONFIGURAÇÕES E UTILITÁRIOS
// ==========================================

const historyTableBody = document.querySelector('#historyTable tbody');
const queryTableBody = document.querySelector('#queryTable tbody');

// Mapa para converter o nome do banco (Back-End) para a classe CSS (Front-End)
const mapaProdutos = {
    'Quadrado': 'square',
    'Circulo': 'circle',
    'Hexagono': 'hexagon'
    // Adicione 'separator' se tiver lógica para isso no back
};

// Formata o status para classe CSS (ex: "Em Rota" -> "emrota")
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
// 🏗️ CRIAÇÃO DAS LINHAS (DOM)
// ==========================================

function createRow(data) {
    const row = document.createElement('tr');

    // --- ID (Pegamos os ultimos 4 digitos para ficar curto igual seu exemplo) ---
    let tdID = document.createElement('td');
    tdID.textContent = data.id.slice(-4).toUpperCase(); // Ex: ...A1B2
    row.appendChild(tdID);

    // --- STATUS ---
    let tdStatus = document.createElement('td');
    let statusSpan = document.createElement('span');
    
    // Usa o status que vem do banco
    statusSpan.classList.add('status', normalizeStatus(data.status));
    statusSpan.textContent = data.status;

    tdStatus.appendChild(statusSpan);
    row.appendChild(tdStatus);

    // --- ITENS (Converter Produtos em Ícones) ---
    let tdItem = document.createElement('td');

    if (data.produtos && Array.isArray(data.produtos)) {
        cont = 0
        data.produtos.forEach(item => {
            // item.nome vem do DTO. Se vier aninhado, ajuste para item.produto.nome
            // Aqui assumo que o DTO entrega uma lista simplificada ou o objeto populado
            
            // Verificação de segurança para pegar o nome
            let nomeProduto = "";
            if (item.nome) nomeProduto = item.nome; // Se DTO já limpou
            else if (item.produto && item.produto.nome) nomeProduto = item.produto.nome; // Se vier populado bruto
            else if (typeof item.produto === 'string') nomeProduto = item.produto; // Se vier só string

            const classeCss = mapaProdutos[nomeProduto]; // Fallback para square se não achar

            if (cont == 3){
                let itemSpan1 = document.createElement('span');
                itemSpan1.classList.add('item', 'separator');
                tdItem.appendChild(itemSpan1);
            }
            
            let itemSpan = document.createElement('span');
           
            itemSpan.classList.add('item', classeCss);
            
            tdItem.appendChild(itemSpan);
             
            cont = cont + 1
        });
    }
    row.appendChild(tdItem);

    // --- CLIENTE ---
    let tdClient = document.createElement('td');
    // Tenta pegar o nome do usuário populado, senão coloca "Desconhecido"
    console.log(data.usuario)
    tdClient.textContent = data.usuario ? data.usuario.nome : 'Cliente';
    row.appendChild(tdClient);

    return row;
}

// ==========================================
// 🚀 BUSCAR DADOS DA API
// ==========================================

async function carregarDados() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Sem token. O usuário precisa logar para ver o histórico.");
        return;
    }

    try {
        // Busca todas as entregas (ordenadas por mais recente se sua API suportar ?sort=recent)
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

        // 1. Limpa as tabelas
        historyTableBody.innerHTML = '';
        queryTableBody.innerHTML = '';

        // 2. Preenche as tabelas
        listaEntregas.forEach(entrega => {
            // Cria o objeto de dados simplificado para a função createRow
            const dadosFormatados = {
                id: entrega.id,
                status: entrega.status, // "Pendente", "Em Rota", etc.
                produtos: entrega.produtos, // Array de produtos
                usuario: entrega.usuario // Objeto usuário (se populado)
            };

            // -- Tabela HISTÓRICO (Todas as entregas) --
            const rowHistory = createRow(dadosFormatados);
            historyTableBody.appendChild(rowHistory);

            // -- Tabela QUERY (Exemplo: Apenas as 'Pendente' ou 'Em Rota') --
            // Você pode ajustar essa lógica. Aqui coloquei as Pendentes.
            if (entrega.status === 'Pendente' || entrega.status === 'Em Rota') {
                // Clona a linha ou cria uma nova com layout diferente se precisar
                const rowQuery = createRow(dadosFormatados);
                
                // Se a Query Table tiver coluna "Service" em vez de "Status":
                // Você pode manipular rowQuery aqui antes de dar append.
                
                queryTableBody.appendChild(rowQuery);
            }
        });

    } catch (error) {
        console.error('Erro:', error);
        // Opcional: Mostrar mensagem de erro na tabela
        historyTableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar dados.</td></tr>';
    }
}

// Carrega assim que a página abrir
window.addEventListener('load', carregarDados);