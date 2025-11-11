import { EntregaRepository } from '../repositories/entregaRepository.js';
import { ProdutoRepository } from './produtoRepository.js'; // Importação extra!

export class EntregaService {
    constructor() {
        this.entregaRepository = new EntregaRepository();
        this.produtoRepository = new ProdutoRepository(); // Instancia o repo de Produto
    }

    async getAll() {
        // Já virão "populados" graças à sobrescrita no repositório
        return await this.entregaRepository.findAll();
    }

    async getById(id) {
        const entrega = await this.entregaRepository.findById(id);
        if (!entrega) {
            throw new Error("Entrega não encontrada");
        }
        return entrega;
    }

    /**
     * O 'entregaData' (req.body) deve ser algo como:
     * {
     * "descricao": "Entrega do Cliente X",
     * "produtos": [
     * { "produto": "id_mongoose_do_produto_1", "ordem": 1 },
     * { "produto": "id_mongoose_do_produto_2", "ordem": 2 }
     * ]
     * }
     */
    async create(entregaData) {
        // 1. Validação de negócio: Verificar se os produtos existem
        if (entregaData.produtos && entregaData.produtos.length > 0) {
            for (const item of entregaData.produtos) {
                const produtoExiste = await this.produtoRepository.findById(item.produto);
                if (!produtoExiste) {
                    throw new Error(`Produto com ID ${item.produto} não encontrado.`);
                }
            }
        }

        // 2. Mapear o DTO de entrada para o schema do banco
        const dataToCreate = {
            Desc_Entrega: entregaData.descricao,
            produtos: entregaData.produtos.map(p => ({
                produto: p.produto, // O ID
                OrdemEntrega: p.ordem
            }))
        };

        return await this.entregaRepository.create(dataToCreate);
    }

    async update(id, entregaData) {
        // Você também deve validar os produtos aqui, se necessário
        
        const dataToUpdate = {
            Desc_Entrega: entregaData.descricao,
            produtos: entregaData.produtos.map(p => ({
                produto: p.produto,
                OrdemEntrega: p.ordem
            }))
        };

        const entrega = await this.entregaRepository.update(id, dataToUpdate);
        if (!entrega) {
            throw new Error("Entrega não encontrada para atualizar");
        }
        return entrega;
    }

    async delete(id) {
        const entrega = await this.entregaRepository.delete(id);
        if (!entrega) {
            throw new Error("Entrega não encontrada para deletar");
        }
        return entrega;
    }
}