import { ProdutoRepository } from '../repositories/produtoRepository.js';

export class ProdutoService {
    constructor() {
        this.produtoRepository = new ProdutoRepository();
    }

    async getAll() {
        return await this.produtoRepository.findAll();
    }

    async getById(id) {
        const produto = await this.produtoRepository.findById(id);
        if (!produto) {
            throw new Error("Produto não encontrado");
        }
        return produto;
    }

    async create(produtoData) {
        // 'produtoData' vem do controller, ex: { nome: "Meu Produto" }
        
        // Exemplo de regra de negócio:
        if (!produtoData.nome) {
            throw new Error("O nome é obrigatório para criar um produto.");
        }

        // Mapeia o DTO de entrada para o formato do schema
        const dataToCreate = { 
            Nome_Produto: produtoData.nome 
        };

        return await this.produtoRepository.create(dataToCreate);
    }

    async update(id, produtoData) {
        // Mapeia o DTO de entrada para o formato do schema
        const dataToUpdate = { 
            Nome_Produto: produtoData.nome 
        };

        const produto = await this.produtoRepository.update(id, dataToUpdate);
        
        if (!produto) {
            throw new Error("Produto não encontrado para atualizar");
        }
        return produto;
    }

    async delete(id) {
        const produto = await this.produtoRepository.delete(id);
        
        if (!produto) {
            throw new Error("Produto não encontrado para deletar");
        }
        return produto; // Retorna o item deletado
    }
}