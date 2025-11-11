export class EntregaDTO {
    constructor(entrega) {
        this.id = entrega._id;
        this.descricao = entrega.Desc_Entrega;

        // Verifica se 'produtos' existe e foi populado
        if (entrega.produtos && entrega.produtos.length > 0) {
            this.produtos = entrega.produtos.map(item => {
                // Se 'item.produto' é um objeto, ele foi populado
                if (item.produto && typeof item.produto === 'object') {
                    return {
                        id: item.produto._id,
                        nome: item.produto.Nome_Produto,
                        ordem: item.OrdemEntrega // A ordem vem do subdocumento
                    };
                }
                // Caso não seja populado (ex: após um 'create'), retorna só o ID
                return {
                    id: item.produto, // ObjectId
                    ordem: item.OrdemEntrega
                };
            });
        } else {
            this.produtos = []; // Retorna array vazio
        }
    }
}