import { BaseRepository } from './baseRepository.js';
import ItemEstoque from '../models/Estoque.js';

export class ItemEstoqueRepository extends BaseRepository {
    constructor() {
        super(ItemEstoque);
    }

    // Sobrescreve para trazer os dados do produto junto
    async findAll(filter = {}, sortOptions = {}) {
        return await this.model.find(filter)
            .populate('produto') // Preenche os dados do produto
            .sort(sortOptions);
    }

    async findById(id) {
        return await this.model.findById(id).populate('produto');
    }
}