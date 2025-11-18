import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     # --- Schemas de User ---
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: O ID do usuário (gerado pelo Mongoose)
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         criadoEm:
 *           type: string
 *           format: date-time
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *
 *     UserRegister:
 *       type: object
 *       required: [nome, email, password]
 *       properties:
 *         nome:
 *           type: string
 *           example: "Meu Nome"
 *         email:
 *           type: string
 *           example: "email@exemplo.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "senha123"
 *
 *     UserLogin:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: "email@exemplo.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "senha123"
 *
 *     UserUpdate:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: "Meu Nome Atualizado"
 *         email:
 *           type: string
 *           example: "novoemail@exemplo.com"
 *
 *     # --- Schemas de Produto ---
 *     Produto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "67f5b6e9a1b2c3d4e5f6a7b8"
 *         nome:
 *           type: string
 *           example: "Quadrado"
 *         criadoEm:
 *           type: string
 *           format: date-time
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *
 *     ProdutoInput:
 *       type: object
 *       required: [nome]
 *       properties:
 *         nome:
 *           type: string
 *           example: "Hexagono"
 *
 *     # --- Schemas de Entrega ---
 *     ProdutoEmEntrega:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         ordem:
 *           type: number
 *
 *     Entrega:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         descricao:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Pendente, Em Rota, Entregue, Cancelada]
 *         produtos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProdutoEmEntrega'
 *         criadoEm:
 *           type: string
 *           format: date-time
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *
 *     ProdutoInputEntrega:
 *       type: object
 *       required: [produto, ordem]
 *       properties:
 *         produto:
 *           type: string
 *           description: O ID ou o Nome (único) do produto
 *           example: "Quadrado"
 *         ordem:
 *           type: number
 *           example: 1
 *
 *     EntregaCreateInput:
 *       type: object
 *       required: [descricao, produtos]
 *       properties:
 *         descricao:
 *           type: string
 *           example: "Entrega do Cliente X"
 *         produtos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProdutoInputEntrega'
 *
 *     EntregaUpdateInput:
 *       type: object
 *       properties:
 *         descricao:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Entregue, Cancelada]
 *         produtos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProdutoInputEntrega'
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Usuários e Autenticação
 *     description: Endpoints para registro, login e gerenciamento de usuários
 *   - name: Produtos
 *     description: Endpoints para gerenciar produtos (Requer Autenticação)
 *   - name: Entregas
 *     description: Endpoints para gerenciar entregas e fila (Requer Autenticação)
 */

// --- ROTAS DE USUÁRIO ---

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Usuários e Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: Login bem-sucedido
 *       '401':
 *         description: Email ou senha inválidos
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários e Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       '201':
 *         description: Usuário criado com sucesso
 *       '400':
 *         description: Erro de validação
 */
router.post('/users', controller.registerUser);

// Middleware para proteger as rotas seguintes
// router.use(authMiddleware);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários e Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de usuários
 *       '401':
 *         description: Token inválido ou não fornecido
 */
router.get('/users', controller.getAllUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário específico pelo ID
 *     tags: [Usuários e Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: Detalhes do usuário
 *       '404':
 *         description: Usuário não encontrado
 */
router.get('/users/:id', controller.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário específico
 *     tags: [Usuários e Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       '200':
 *         description: Usuário atualizado
 *       '404':
 *         description: Usuário não encontrado
 */
router.put('/users/:id', controller.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deleta um usuário específico
 *     tags: [Usuários e Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: Usuário deletado
 *       '404':
 *         description: Usuário não encontrado
 */
router.delete('/users/:id', controller.deletedUser);

export default router;
