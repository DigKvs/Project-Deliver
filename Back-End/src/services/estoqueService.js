import { ItemEstoqueRepository } from '../repositories/estoqueRepository.js';
import { ProdutoRepository } from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';

export class ItemEstoqueService {
    constructor() {
        this.itemEstoqueRepository = new ItemEstoqueRepository();
        this.produtoRepository = new ProdutoRepository();
    }

    async getAll() {
        return await this.itemEstoqueRepository.findAll();
    }

    async getById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("ID inválido");
        }
        const item = await this.itemEstoqueRepository.findById(id);
        if (!item) {
            throw new Error("Item de estoque não encontrado");
        }
        return item;
    }

    async create(data) {
        const { produtoId, quantidade } = data;

        if (!produtoId) throw new Error("O ID do produto é obrigatório.");
        if (quantidade === undefined || quantidade === null) throw new Error("A quantidade é obrigatória.");

        // Valida se o produto existe
        if (!mongoose.Types.ObjectId.isValid(produtoId)) {
            throw new Error("ID do produto inválido.");
        }
        const produtoExiste = await this.produtoRepository.findById(produtoId);
        if (!produtoExiste) {
            throw new Error("Produto não encontrado.");
        }

        const dataToCreate = {
            produto: produtoId,
            quantidade: quantidade
        };

        return await this.itemEstoqueRepository.create(dataToCreate);
    }

    async update(id, data) {
        const { produtoId, quantidade } = data;
        const dataToUpdate = {};

        if (quantidade !== undefined) dataToUpdate.quantidade = quantidade;
        
        // Se quiser mudar o produto
        if (produtoId) {
             const produtoExiste = await this.produtoRepository.findById(produtoId);
             if (!produtoExiste) throw new Error("Produto não encontrado.");
             dataToUpdate.produto = produtoId;
        }

        const item = await this.itemEstoqueRepository.update(id, dataToUpdate);
        if (!item) throw new Error("Item não encontrado para atualizar.");
        return item;
    }

    async delete(id) {
        const item = await this.itemEstoqueRepository.delete(id);
        if (!item) throw new Error("Item não encontrado para deletar.");
        return item;
    }
}