export class ItemEstoqueDTO {
    constructor(item) {
        this.id = item._id;
        this.quantidade = item.quantidade;
        
        // Verifica se o produto foi populado (veio o objeto completo)
        if (item.produto && typeof item.produto === 'object') {
            this.produto = {
                id: item.produto._id,
                nome: item.produto.Nome_Produto
            };
        } else {
            // Se não foi populado, devolve só o ID
            this.produto = item.produto;
        }

        this.criadoEm = item.createdAt;
        this.atualizadoEm = item.updatedAt;
    }
}