import { EntregaRepository } from '../repositories/entregaRepository.js';
import { ProdutoRepository } from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';

export class EntregaService {
    constructor() {
        this.entregaRepository = new EntregaRepository();
        this.produtoRepository = new ProdutoRepository();
    }

    // ---- NOVO MÉTODO PRIVADO (HELPER) ----
    /**
     * Tenta promover a próxima entrega pendente para "Em Rota".
     * Só deve ser chamado quando uma rota é concluída ou cancelada.
     */
    async getSomenteEntrega() {
        return await this.entregaRepository.findAll({ Status: "Em Rota" });
    }
    async #promoverProximaEntrega() {
        try {
            // Verifica se já existe alguma entrega "Em Rota"
            // (Medida de segurança, embora não devesse acontecer)
            const emRota = await this.entregaRepository.search({ Status: 'Em Rota' });
            if (emRota.length > 0) {
                console.warn("WARN: Tentativa de promover entrega, mas uma já está 'Em Rota'.");
                return;
            }

            // Chama o novo método do repositório
            const entregaPromovida = await this.entregaRepository.findAndPromotePendente();
            
            if (entregaPromovida) {
                console.log(`Entrega ${entregaPromovida._id} foi promovida para 'Em Rota'.`);
            } else {
                console.log("Nenhuma entrega pendente para promover.");
            }
        } catch (error) {
            console.error("Erro ao promover próxima entrega:", error);
        }
    }
    // --------------------------------------

    async getAll(sortOptions = {}) {
        return await this.entregaRepository.findAll({}, sortOptions);
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

    // **** MÉTODO 'CREATE' MODIFICADO ****
    async create(entregaData) {
        const { descricao, produtos } = entregaData; 

        if (!descricao) throw new Error("A 'descricao' é obrigatória.");
        
        // 1. Validar produtos (lógica inteligente)
        const produtosValidados = await this.#validarEProcessarProdutos(produtos);

        // 2. Lógica de Negócio: Determinar o Status
        // Verifica se já existe alguma entrega "Em Rota"
        const emRota = await this.entregaRepository.search({ Status: 'Em Rota' });
        
        // Se houver, a nova entrega é 'Pendente'. Se não, ela se torna 'Em Rota'.
        const novoStatus = (emRota.length > 0) ? 'Pendente' : 'Em Rota';

        const dataToCreate = {
            Desc_Entrega: descricao,
            Status: novoStatus, // O status é definido pelo sistema
            produtos: produtosValidados
        };

        return await this.entregaRepository.create(dataToCreate);
    }

    // **** MÉTODO 'UPDATE' MODIFICADO ****
    async update(id, entregaData) {
        // 1. Busca o estado ATUAL da entrega
        const entregaAtual = await this.getById(id);
        const statusAntigo = entregaAtual.Status;
        
        const { descricao, produtos, status } = entregaData;
        const dataToUpdate = {};
        
        if (descricao) dataToUpdate.Desc_Entrega = descricao;
        
        // O usuário só pode definir o status para 'Entregue' ou 'Cancelada'
        // (Ele não pode forçar 'Em Rota' ou 'Pendente' manualmente)
        if (status && (status === 'Entregue' || status === 'Cancelada')) {
            dataToUpdate.Status = status;
        }

        // 2. Se houver produtos, re-valida
        if (produtos) {
            dataToUpdate.produtos = await this.#validarEProcessarProdutos(produtos);
        }

        if (Object.keys(dataToUpdate).length === 0) {
            throw new Error("Nenhum dado válido fornecido para atualização.");
        }

        // 3. Executa o Update
        const entregaAtualizada = await this.entregaRepository.update(id, dataToUpdate);

        // 4. Lógica de Negócio: Disparar a próxima da fila
        // Se o status *era* 'Em Rota' E o status *novo* (que acabou de ser salvo) 
        // for 'Entregue' ou 'Cancelada', então promove a próxima.
        if (statusAntigo === 'Em Rota' && 
           (entregaAtualizada.Status === 'Entregue' || entregaAtualizada.Status === 'Cancelada')) {
            
            // Usamos 'await' para garantir que ele tente promover
            // antes de retornar a resposta ao usuário.
            await this.#promoverProximaEntrega();
        }
        
        return entregaAtualizada;
    }

    // **** MÉTODO 'DELETE' MODIFICADO ****
    async delete(id) {
        // 1. Busca o estado ATUAL
        const entregaParaDeletar = await this.getById(id);

        // 2. Executa o Delete
        const entregaDeletada = await this.entregaRepository.delete(id);
        
        // 3. Lógica de Negócio: Se o item deletado estava 'Em Rota',
        // chama o próximo da fila.
        if (entregaParaDeletar.Status === 'Em Rota') {
            await this.#promoverProximaEntrega();
        }

        return entregaDeletada;
    }


    // ---- MÉTODO PRIVADO (HELPER) DE VALIDAÇÃO ----
    // (Usei '#' para torná-lo privado no JavaScript)
    async #validarEProcessarProdutos(produtosArray) {
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
            if (mongoose.Types.ObjectId.isValid(produtoInput)) {
                produtoEncontrado = await this.produtoRepository.findById(produtoInput);
            }
            if (!produtoEncontrado) {
                produtoEncontrado = await this.produtoRepository.findByNome(produtoInput);
            }
            if (!produtoEncontrado) {
                throw new Error(`Produto "${produtoInput}" não encontrado por ID ou Nome.`);
            }
            
            produtosValidados.push({
                produto: produtoEncontrado._id,
                OrdemEntrega: item.ordem || 0
            });
        }
        
        return produtosValidados;
    }
}