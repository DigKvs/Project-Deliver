export class ProdutoDTO {
    constructor(produto) {
        // 'produto._id' é como o Mongoose armazena
        this.id = produto._id; 
        
        // 'produto.Nome_Produto' é como está no schema
        this.nome = produto.Nome_Produto;
        
        // (Opcional) Você pode incluir timestamps se quiser
        // this.criadoEm = produto.createdAt;
    }
}