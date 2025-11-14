import { EntregaRepository } from '../repositories/entregaRepository.js';
import { ProdutoRepository } from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';

export class EntregaService {
    constructor() {
        this.entregaRepository = new EntregaRepository();
        this.produtoRepository = new ProdutoRepository();
    }

    async getAll() {
        return await this.entregaRepository.findAll();
    }

    async getById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Formato do ID da Entrega inválido");
        }
        const entrega = await this.entregaRepository.findById(id);
        if (!entrega) {
            throw new Error("Entrega não encontrada");
        }
        return entrega;
    }
    
    /**
     * Função auxiliar para validar a lista de produtos.
     * Reutilizável para 'create' e 'update'.
     */
    async validarEProcessarProdutos(produtosArray) {
        if (!produtosArray || !Array.isArray(produtosArray)) {
            throw new Error("O campo 'produtos' deve ser um array.");
        }
        
        const produtosValidados = [];

        for (const item of produtosArray) {
            const produtoInput = item.produto;
            
            if (!produtoInput) {
                throw new Error("O 'produto' (ID ou Nome) é obrigatório.");
            }

            let produtoEncontrado = null;

            // 1. Tenta encontrar por ID
            if (mongoose.Types.ObjectId.isValid(produtoInput)) {
                produtoEncontrado = await this.produtoRepository.findById(produtoInput);
            }

            // 2. Se não achou por ID, tenta encontrar por Nome
            if (!produtoEncontrado) {
                // **** AQUI ESTÁ A MUDANÇA ****
                // Usando o novo método 'findByNome'
                produtoEncontrado = await this.produtoRepository.findByNome(produtoInput);
            }

            // 3. Se não achou de jeito nenhum, lança o erro
            if (!produtoEncontrado) {
                throw new Error(`Produto "${produtoInput}" não encontrado por ID ou Nome.`);
            }
            
            // 4. Se achou, guarda o ID real e a ordem
            produtosValidados.push({
                produto: produtoEncontrado._id, // Salva o ID real
                OrdemEntrega: item.ordem || 0
            });
        }
        
        return produtosValidados;
    }

    async create(entregaData) {
        const { descricao, produtos, status } = entregaData; 

        if (!descricao) {
            throw new Error("A 'descricao' é obrigatória.");
        }

        // Usa a função auxiliar
        const produtosValidados = await this.validarEProcessarProdutos(produtos);

        const dataToCreate = {
            Desc_Entrega: descricao,
            Status: status || 'Pendente',
            produtos: produtosValidados
        };

        return await this.entregaRepository.create(dataToCreate);
    }

    async update(id, entregaData) {
        // Garante que a entrega existe
        await this.getById(id);
        
        const { descricao, produtos, status } = entregaData;
        const dataToUpdate = {};
        
        if (descricao) dataToUpdate.Desc_Entrega = descricao;
        if (status) dataToUpdate.Status = status;
        
        // Usa a função auxiliar
        if (produtos) {
            dataToUpdate.produtos = await this.validarEProcessarProdutos(produtos);
        }

        if (Object.keys(dataToUpdate).length === 0) {
            throw new Error("Nenhum dado válido fornecido para atualização.");
        }

        const entrega = await this.entregaRepository.update(id, dataToUpdate);
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