import { UserRepository } from '../repositories/userRepository.js';
import { UserDTO } from '../dtos/userDTO.js'; // Importe o DTO
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Importe o JWT

export class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // ---- ADICIONE ESTE NOVO MÉTODO ----
    async login(email, password) {
        // 1. Encontra o usuário pelo email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Email ou senha inválidos."); // Erro genérico
        }

        // 2. Compara a senha enviada com a senha hashada no banco
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Email ou senha inválidos.");
        }

        // 3. Gera o Token
        const payload = { 
            id: user._id, 
            email: user.email 
        };
        
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET, // Sua chave secreta do .env
            { expiresIn: '8h' }    // O token expira em 8 horas
        );

        // 4. Retorna o token e os dados do usuário (sem a senha)
        return { 
            token, 
            user: new UserDTO(user) 
        };
    }
    // --------------------------------------

    // (Seu método 'register' ou 'createUser' existente)
    async register(userData) {
        const { email } = userData;
        const userExists = await this.userRepository.search({ email });
        if (userExists.length > 0) {
            throw new Error("Este email já está cadastrado.");
        }
        // O hash da senha é feito pelo 'pre-save' no seu 'userModel.js'
        return await this.userRepository.create(userData);
    }

    // (Seus outros métodos: getAllUser, getUserById, etc.)
}