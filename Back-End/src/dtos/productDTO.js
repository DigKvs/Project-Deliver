export class ProdutoDTO {
    constructor(produto) {
        // 'produto._id' é como o Mongoose armazena
        this.id = produto._id; 
        
        // 'produto.Nome_Produto' é como está no schema
        this.nome = produto.Nome_Produto;
        this.criadoEm = produto.createdAt;
        this.atualizadoEm = produto.updatedAt;
        
        // (Opcional) Você pode incluir timestamps se quiser
        // this.criadoEm = produto.createdAt;
    }
}