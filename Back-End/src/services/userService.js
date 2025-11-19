import { UserRepository } from '../repositories/userRepository.js';
import { UserDTO } from '../dtos/userDTO.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // ============================================================
    // =====================   AUTENTICAÇÃO   ======================
    // ============================================================

    /**
     * LOGIN
     * Fluxo:
     * 1. Buscar usuário pelo email
     * 2. Validar senha com bcrypt
     * 3. Gerar JWT (8h)
     * 4. Retornar token + usuário formatado
     */
    async login(email, password) {
        // (1) Busca usuário pelo email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Email ou senha inválidos.");
        }

        // (2) Verifica a senha
        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) {
            throw new Error("Email ou senha inválidos.");
        }

        // (3) Gera token JWT
        const payload = {
            id: user._id,
            email: user.email
        };

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não está configurado no .env.");
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "8h"
        });

        // (4) Retorna token + DTO
        return {
            token,
            user: new UserDTO(user)
        };
    }

    // ============================================================
    // =======================   REGISTRO   =========================
    // ============================================================

    async register(data) {
        const { email } = data;

        // Verifica se email já existe
        const exists = await this.userRepository.findByEmail(email);
        if (exists) {
            throw new Error("Este email já está cadastrado.");
        }

        // Criação (hash é feito no model pre-save)
        const createdUser = await this.userRepository.create(data);

        return new UserDTO(createdUser);
    }

    // ============================================================
    // ====================   LISTAR TODOS   ========================
    // ============================================================

    async getAllUser() {
        const users = await this.userRepository.findAll();
        return users.map(u => new UserDTO(u));
    }

    // ============================================================
    // =====================   BUSCAR POR ID   =====================
    // ============================================================

    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado.");
        }
        return new UserDTO(user);
    }

    // ============================================================
    // ======================   ATUALIZAR   ========================
    // ============================================================

    async updateUser(id, data) {

        // Se a senha foi enviada → rehash
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        const updated = await this.userRepository.update(id, data);
        if (!updated) {
            throw new Error("Usuário não encontrado.");
        }

        return new UserDTO(updated);
    }

    // ============================================================
    // =======================   DELETAR   ==========================
    // ============================================================

    async deleteUser(id) {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw new Error("Usuário não encontrado.");
        }
        return true;
    }
}
