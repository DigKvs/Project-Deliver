import { BaseRepository } from "./baseRepository.js";
import  User from "../models/User.js";
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    // ---- ADICIONE ESTE NOVO MÉTODO ----
    /**
     * Busca um usuário pelo email, incluindo a senha.
     * @param {string} email 
     * @returns {Promise<Document|null>} O documento do usuário com a senha
     */
    async findByEmail(email) {
        // Usa .select('+password') para forçar a inclusão do campo
        // que tinha 'select: false' no model.
        return await this.model.findOne({ email }).select('+password');
    }
    // ---------------------------------
}