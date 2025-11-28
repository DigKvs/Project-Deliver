import { UserService } from '../services/userService.js';
import { UserDTO } from '../dtos/userDTO.js';

export class UserController {
    constructor() {
        this.userService = new UserService();
    }

    // =============================================================
    //  LOGIN
    // =============================================================
    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: "Email e senha são obrigatórios."
                });
            }

            const result = await this.userService.login(email, password);

            return res.status(200).json({
                message: "Login bem-sucedido",
                token: result.token,
                user: new UserDTO(result.user)
            });

        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    };

    // =============================================================
    //  REGISTRO DE USUÁRIO
    // =============================================================
    registerUser = async (req, res) => {
        try {
            const createdUser = await this.userService.register(req.body);

            return res.status(201).json({
                message: "Usuário criado com sucesso",
                user: new UserDTO(createdUser),
            });

        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    };

    // =============================================================
    //  LISTAR TODOS OS USUÁRIOS
    // =============================================================
    getAllUser = async (req, res) => {
        try {
            const users = await this.userService.getAllUser();

            return res.status(200).json(
                users.map((u) => new UserDTO(u))
            );

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    // =============================================================
    //  BUSCAR USUÁRIO POR ID
    // =============================================================
    getUserById = async (req, res) => {
        try {
            const user = await this.userService.getUserById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            return res.status(200).json(new UserDTO(user));

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    // =============================================================
    //  UPDATE DE USUÁRIO
    // =============================================================
    updateUser = async (req, res) => {
        try {
            const updatedUser = await this.userService.updateUser(req.params.id, req.body);

            if (!updatedUser) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            return res.status(200).json({
                message: "Usuário atualizado com sucesso",
                user: new UserDTO(updatedUser),
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    // =============================================================
    //  DELETE DE USUÁRIO
    // =============================================================
    deletedUser = async (req, res) => {
        try {
            const deletedUser = await this.userService.deleteUser(req.params.id);

            if (!deletedUser) {
                return res.status(404).json({
                    error: "Usuário não encontrado"
                });
            }

            return res.status(200).json({
                message: "Usuário deletado com sucesso"
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
}
