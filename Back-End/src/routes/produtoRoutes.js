import express from 'express';
import { ProdutoController } from '../controllers/produtoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new ProdutoController();

// Rotas protegidas
router.use(authMiddleware);

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       '201':
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       '400':
 *         description: Erro de validação (ex: nome já existe)
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.post('/produtos', controller.create);

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.get('/produtos', controller.getAll);

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto (Mongoose ObjectId)
 *     responses:
 *       '200':
 *         description: Detalhes do produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       '404':
 *         description: Produto não encontrado
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.get('/produtos/:id', controller.getById);

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza um produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProdutoInput'
 *     responses:
 *       '200':
 *         description: Produto atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       '404':
 *         description: Produto não encontrado
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.put('/produtos/:id', controller.update);

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Deleta um produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do produto
 *     responses:
 *       '200':
 *         description: Produto deletado com sucesso
 *       '404':
 *         description: Produto não encontrado
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.delete('/produtos/:id', controller.delete);

export default router;
