// HISTORY TABLE

tableBody = document.querySelector('#historyTable tbody');

let orderData = [
    { id: 1654, status: 'Concluído', itens: ['square', 'hexagon', 'circle'], cliente: 'Nycolas Prado' },
    { id: 1655, status: 'Em Fila', itens: ['circle', 'hexagon', 'square', 'separator', 'square', 'circle', 'hexagon'], cliente: 'Diego Kaviski' },
    { id: 1656, status: 'Enviado', itens: ['square', 'circle', 'hexagon'], cliente: 'Guilherme Alquieri' },
    { id: 1657, status: 'Rascunho', itens: ['hexagon', 'circle', 'square'], cliente: 'Juliano Lesinski' },
    { id: 1658, status: 'Em Produção', itens: ['hexagon', 'circle', 'square'], cliente: 'Isabella Duarte' },
    { id: 1658, status: 'Cancelado', itens: ['hexagon', 'circle', 'square'], cliente: 'Ana Queiroz' },
];

function normalizeStatus(status){
    return status.toLowerCase().replace(/\s/g, '').replace('í','i').replace('ã','a').replace('ç','c');
}

function createRow(data){
    const row = document.createElement('tr');

    // - ID PEDIDO -
    let tdID = document.createElement('td');
    tdID.textContent = data.id;
    row.appendChild(tdID);

    // - STATUS -
    let tdStatus = document.createElement('td');
    let statusSpan = document.createElement('span');

    statusSpan.classList.add('status', normalizeStatus(data.status));
    statusSpan.textContent = data.status;

    tdStatus.appendChild(statusSpan);
    row.appendChild(tdStatus);

    // - ITEM -
    let tdItem = document.createElement('td');

    data.itens.forEach(itemClass => {
        let itemSpan = document.createElement('span');
        itemSpan.classList.add('item', itemClass)
        tdItem.appendChild(itemSpan);
    });
    row.appendChild(tdItem);

    /// - CLIENTE -
    let tdClient = document.createElement('td');
    tdClient.textContent = data.cliente;
    row.appendChild(tdClient);

    return row;
}

tableBody.innerHTML = ''; // Limpar linhas de exemplo

orderData.forEach(data => {
    const newRow = createRow(data);
    tableBody.appendChild(newRow);
});


// QUERY TABLE

const queryTableBody = document.querySelector('#queryTable tbody');

let queryData = [
    { id: 1001, service: 'Prioridade', itens: ['circle', 'hexagon', 'square'] },
    { id: 1002, service: 'Express', itens: ['hexagon', 'square', 'circle']},
    { id: 1003, service: 'Padrão', itens: ['circle', 'hexagon', 'square', 'separator', 'hexagon', 'square', 'circle']},
    { id: 1004, service: 'Prioridade', itens: ['square', 'hexagon','circle']},
    { id: 1005, service: 'Express', itens: ['hexagon', 'circle', 'square']},
];

function normalizeService(service) {
    return service.toLowerCase().replace(/\s/g, '').replace('ã', 'a').replace('ç', 'c');
}

function createQueryRow(data) {
    const row = document.createElement('tr');

    let tdID = document.createElement('td');
    tdID.textContent = data.id;
    row.appendChild(tdID);

    let tdItem = document.createElement('td');

    data.itens.forEach(itemClass => {
        let itemSpan = document.createElement('span');
        itemSpan.classList.add('item', itemClass);
        tdItem.appendChild(itemSpan);
    });
    row.appendChild(tdItem);

    let tdService = document.createElement('td');
    let serviceSpan = document.createElement('span');

    serviceSpan.classList.add('status', normalizeService(data.service));
    serviceSpan.textContent = data.service;

    tdService.appendChild(serviceSpan);
    row.appendChild(tdService);

    return row;
}

queryTableBody.innerHTML = ''; 

queryData.forEach(data => {
    const newRow = createQueryRow(data);
    queryTableBody.appendChild(newRow);
});