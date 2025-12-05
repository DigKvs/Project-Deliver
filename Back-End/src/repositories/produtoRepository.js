import { BaseRepository } from './baseRepository.js';
import Produto from '../models/Produto.js';

export class ProdutoRepository extends BaseRepository {
    constructor() {
        // Passa o Model 'Produto' para o construtor da classe base
        super(Produto);
    }
    async findByNome(nome) {
        // Usamos findOne porque o nome é 'unique'
        // Isso é mais rápido e direto que 'find()[0]'
        return await this.model.findOne({ Nome_Produto: nome });
    }

}