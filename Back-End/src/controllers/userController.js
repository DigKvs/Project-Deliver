import { UserService } from '../services/userService.js';
import { UserDTO } from '../dtos/userDTO.js';

export class UserController {
    constructor() {
        this.userService = new UserService();
    }

    // --- Métodos de Autenticação ---

    /**
     * Rota: POST /login
     */
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).send({ error: "Email e senha são obrigatórios." });
            }

            const loginData = await this.userService.login(email, password);
            
            res.status(200).json({ 
                message: "Login bem-sucedido!",
                token: loginData.token,
                user: loginData.user
            });
        } catch (error) {
            res.status(401).send({ error: error.message }); // 401 Unauthorized
        }
    }

    /**
     * Rota: POST /users
     */
    registerUser = async (req, res) => {
        try {
            // O seu userModel.js já faz o hash da senha
            const newUser = await this.userService.register(req.body);
            res.status(201).json({
                message: "Usuário criado com sucesso",
                User: new UserDTO(newUser),
            });
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    }

    // --- Métodos de Gerenciamento (Protegidos) ---

    /**
     * Rota: GET /users
     */
    getAllUser = async (req, res) => {
        try {
            const listUsers = await this.userService.getAllUser();
            res.status(200).json(listUsers.map((User) => new UserDTO(User)));
        }
        catch(error){
            res.status(500).send(error.message)
        }
    }

    /**
     * Rota: GET /users/:id
     */
    getUserById = async (req, res) => {
        try {
            const UserById = await this.userService.getUserById(req.params.id);
            if (!UserById){
                return res.status(404).send("User não encontrado")
            }
            res.status(200).json(new UserDTO(UserById))
            
        }
        catch(error){
            res.status(500).send(error.message)
        }
    }

    /**
     * Rota: PUT /users/:id
     */
    updateUser = async(req, res) => {
        try {
            // Nota: Se a senha for atualizada, o model/service precisa
            // fazer o hash dela novamente.
            const updateUser = await this.userService.updateUser(req.params.id, req.body);
            if (!updateUser){
                return res.status(404).send("User não encontrado")
            }
            res.status(200).json({
                message: "Usuário atualizado com sucesso",
                Users: new UserDTO(updateUser),
            })
        }
        catch(error){
            res.status(500).send(error.message)
        }
    }

    /**
     * Rota: DELETE /users/:id
     */
    deletedUser = async (req, res) => {
        try {
            const deleteUser = await this.userService.deleteUser(req.params.id);
            if (!deleteUser){
                return res.status(404).send("User não encontrado")
            }
            res.status(200).json("Usuário deletado")
        }
        catch(error){
            res.status(500).send(error.message)
        }
    }
}