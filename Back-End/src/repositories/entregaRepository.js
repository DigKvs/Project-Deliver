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
    
    // Os métodos create, update e delete já são herdados e funcionam!
}