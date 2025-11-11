import { BaseRepository } from './baseRepository.js';
import Produto from '../models/Produto.js';

export class ProdutoRepository extends BaseRepository {
    constructor() {
        // Passa o Model 'Produto' para o construtor da classe base
        super(Produto);
    }

}