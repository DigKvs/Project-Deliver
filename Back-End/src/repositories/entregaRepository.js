import { BaseRepository } from './baseRepository.js';
import Entrega from '../models/Entrega.js';

export class EntregaRepository extends BaseRepository {
    constructor() {
        super(Entrega); // Passa o Model 'Entrega' para a base
    }

    // Sobrescreve o findById para popular os dados dos produtos
    async findById(id) {
        // 'produtos.produto' é o caminho: array 'produtos', campo 'produto'
        return await this.model.findById(id)
            .populate('produtos.produto'); 
    }

    // Sobrescreve o findAll para popular também
    async findAll(filter = {}) {
        return await this.model.find(filter)
            .populate('produtos.produto');
    }
    
    /**
     * Encontra a entrega 'Pendente' mais antiga (por data de criação)
     * e a atualiza para 'Em Rota'.
     * @returns {Promise<Document|null>} O documento da entrega promovida, ou null se não houver pendentes.
     */
    async findAndPromotePendente() {
        // Encontra o item com status 'Pendente',
        // Ordena por 'createdAt' (1 = ascendente, o mais antigo primeiro),
        // Atualiza o status para 'Em Rota',
        // E retorna o documento *novo* (atualizado).
        
        return await this.model.findOneAndUpdate(
            { Status: 'Pendente' },          // 1. Filtro: Achar 'Pendente'
            { $set: { Status: 'Em Rota' } }, // 2. Update: Mudar para 'Em Rota'
            { 
                new: true,                   // 3. Opção: Retornar o doc atualizado
                sort: { createdAt: 1 }       // 4. Opção: Ordenar por data (pegar o mais antigo)
            }
        );
    }
    // Os métodos create, update e delete já são herdados e funcionam!
}