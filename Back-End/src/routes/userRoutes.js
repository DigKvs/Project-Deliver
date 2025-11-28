import express from 'express';
import { UserController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
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
 *         email:
 *           type: string
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
 */

// LOGIN
/**
 * @swagger
 * /auth/login:
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
router.post('/auth/login', controller.login);

// REGISTRO
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

// router.use(authMiddleware);

// LISTAR TODOS
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
 *         description: Token inválido
 */
router.get('/users', controller.getAllUser);

// BUSCAR
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
 *         required: true
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/users/:id', controller.getUserById);

// ATUALIZAR
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
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/users/:id', controller.updateUser);

// DELETAR
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
 *         required: true
 *     responses:
 *       200:
 *         description: Usuário deletado
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/users/:id', controller.deletedUser);

export default router;
