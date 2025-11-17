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

    async #promoverProximaEntrega() {
        try {
            const emRota = await this.entregaRepository.search({ Status: 'Em Rota' });
            if (emRota.length > 0) {
                console.warn("WARN: Tentativa de promover entrega, mas uma já está 'Em Rota'.");
                return;
            }
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
    async update(id, entregaData) {
        // 1. Verifica se o body está vazio
        if (Object.keys(entregaData).length === 0) {
            throw new Error("Nenhum dado fornecido para atualização.");
        }
        
        // 2. Busca o estado ATUAL da entrega
        const entregaAtual = await this.getById(id);
        const statusAntigo = entregaAtual.Status;
        
        const { descricao, produtos, status } = entregaData;
        const dataToUpdate = {};
        
        // 3. Processa os campos permitidos
        if (descricao) {
            dataToUpdate.Desc_Entrega = descricao;
        }

        if (status) {
            // A sua regra de negócio: só permite atualizar para 'Entregue' ou 'Cancelada'
            if (status === 'Entregue' || status === 'Cancelada') {
                dataToUpdate.Status = status;
            } else {
                // Se o usuário enviou um status inválido (ex: "Pendente")
                // E é a *única* coisa que ele enviou, devolve um erro claro.
                if (!descricao && !produtos) {
                    throw new Error(`Não é permitido atualizar o status para "${status}" manualmente.`);
                }
                // Se ele enviou *outros* dados (descricao, produtos),
                // apenas ignoramos a atualização de status inválida e continuamos.
            }
        }

        // 4. Se houver produtos, re-valida (usando a lógica inteligente)
        if (produtos) {
            dataToUpdate.produtos = await this.#validarEProcessarProdutos(produtos);
        }

        // 5. Verifica se, após os filtros, sobrou algo para atualizar
        if (Object.keys(dataToUpdate).length === 0) {
            // Isso acontece se o usuário enviou SÓ um status inválido
            // (ex: `{"status": "Pendente"}`). O `if(status)` acima já tratou disso.
            // Mas por segurança, mantemos a verificação.
            throw new Error("Nenhum dado *válido* para atualização foi fornecido.");
        }

        // 6. Executa o Update
        const entregaAtualizada = await this.entregaRepository.update(id, dataToUpdate);

        // 7. Lógica de Negócio: Disparar a próxima da fila
        if (statusAntigo === 'Em Rota' && 
           (entregaAtualizada.Status === 'Entregue' || entregaAtualizada.Status === 'Cancelada')) {
            
            await this.#promoverProximaEntrega();
        }
        
        return entregaAtualizada;
    }

    async delete(id) {
        const produto = await this.produtoRepository.delete(id);
        
        if (!produto) {
            throw new Error("Produto não encontrado para deletar");
        }
        return produto; // Retorna o item deletado
    }
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