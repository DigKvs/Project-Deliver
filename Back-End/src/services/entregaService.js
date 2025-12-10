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
            const emProd = await this.entregaRepository.search({ Status: 'Producao' });
            if (emRota.length > 0 && emProd.length > 0) {
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
    async getEmProducao() {
        // Certifique-se que no seu Banco/Model o status está escrito como 'Producao' ou 'Em Produção'
        // Baseado no seu model anterior, você usou 'Producao' (sem til)
        return await this.entregaRepository.findAll({ Status: 'Producao' });
    }

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
    async create(entregaData, userId) {
        const { descricao, produtos } = entregaData; 

        if (!descricao) throw new Error("A 'descricao' é obrigatória.");
        
        // 1. Validar produtos (lógica inteligente)
        const produtosValidados = await this.#validarEProcessarProdutos(produtos);

        // 2. Lógica de Negócio: Determinar o Status
        // Verifica se já existe alguma entrega "Em Rota"
        const emRota = await this.entregaRepository.search({ Status: 'Em Rota' });
        
        const qtdCalculada = 0;
        // Se houver, a nova entrega é 'Pendente'. Se não, ela se torna 'Em Rota'.
        const novoStatus = (emRota.length > 0) ? 'Pendente' : 'Em Rota';

        const dataToCreate = {
            Desc_Entrega: descricao,
            Status: novoStatus, // O status é definido pelo sistema
            produtos: produtosValidados,
            usuario: userId,
            QuantidadePecas: qtdCalculada,
        };

        return await this.entregaRepository.create(dataToCreate);
    }

    // **** MÉTODO 'UPDATE' MODIFICADO ****
    async update(id, entregaData) {
        const entregaAtual = await this.entregaRepository.findById(id);
        if (!entregaAtual) throw new Error("Entrega não encontrada.");
        
        const statusAntigo = entregaAtual.Status;
        const { descricao, produtos, status, quantidadePecas } = entregaData;
        const dataToUpdate = {};
        
        if (descricao) dataToUpdate.Desc_Entrega = descricao;
        
        // --- NOVA VALIDAÇÃO DE STATUS ---
        if (status) {
            // Só permite mudar para os status válidos
            const statusPermitidos = ['Entregue', 'Cancelada', 'Producao', 'Em Rota'];
            if (!statusPermitidos.includes(status)) {
                 // Se quiser ser restrito e não deixar mudar para Pendente manualmente, mantenha a lógica anterior
                 // Mas para testar 'Producao', precisamos permitir que ele venha no body
            }

            // REGRA DE NEGÓCIO: BLOQUEIO DE DUPLICIDADE
            // Se o usuário está tentando mudar para 'Producao' ou 'Em Rota', verificamos se já tem um.
            if (status === 'Producao' || status === 'Em Rota') {
                // Busca se existe ALGUMA entrega com esse status que NÃO SEJA a atual (_id != id)
                const jaExiste = await this.entregaRepository.model.findOne({
                    Status: status,
                    _id: { $ne: id } // $ne = Not Equal (Não igual)
                });

                if (jaExiste) {
                    throw new Error(`Ação negada: Já existe um pedido com status '${status}'. Conclua-o antes de iniciar outro.`);
                }
            }

            dataToUpdate.Status = status;
        }
        // ----------------------------------

        if (produtos) {
            const produtosValidados = await this.#validarEProcessarProdutos(produtos);
            dataToUpdate.produtos = produtosValidados;
            if (quantidadePecas === undefined) {
                dataToUpdate.QuantidadePecas = produtosValidados.length;
            }
        }

        if (quantidadePecas !== undefined) {
            if (typeof quantidadePecas !== 'number') throw new Error("A quantidade deve ser um número.");
            dataToUpdate.QuantidadePecas = quantidadePecas;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            throw new Error("Nenhum dado válido fornecido para atualização.");
        }

        const entregaAtualizada = await this.entregaRepository.update(id, dataToUpdate);

        // Lógica da Fila (Promoção Automática)
        // Se liberou uma vaga crítica (saiu de Rota ou Produção para Finalizado)
        const estavaOcupandoVaga = (statusAntigo === 'Em Rota' || statusAntigo === 'Producao');
        const liberouVaga = (entregaAtualizada.Status === 'Entregue' || entregaAtualizada.Status === 'Cancelada');

        if (estavaOcupandoVaga && liberouVaga) {
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