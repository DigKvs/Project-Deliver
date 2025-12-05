import express from 'express';
import { ItemEstoqueController } from '../controllers/estoqueController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new ItemEstoqueController();

// Protege todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   - name: Estoque
 *     description: Gerenciamento de itens e quantidades
 */

/**
 * @swagger
 * /estoque:
 *   post:
 *     summary: Cria um novo item no estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produtoId
 *               - quantidade
 *             properties:
 *               produtoId:
 *                 type: string
 *                 description: ID do Produto (FK)
 *               quantidade:
 *                 type: number
 *                 description: Quantidade inicial do item no estoque
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 */
router.post('/estoque', controller.create);

/**
 * @swagger
 * /estoque:
 *   get:
 *     summary: Lista todo o estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de itens retornada
 */
router.get('/estoque', controller.getAll);

/**
 * @swagger
 * /estoque/{id}:
 *   get:
 *     summary: Busca item por ID
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item no estoque
 *     responses:
 *       200:
 *         description: Item encontrado
 */
router.get('/estoque/:id', controller.getById);

/**
 * @swagger
 * /estoque/{id}:
 *   put:
 *     summary: Atualiza quantidade ou produto
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item a ser atualizado
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: number
 *               produtoId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 */
router.put('/estoque/:id', controller.update);

/**
 * @swagger
 * /estoque/{id}:
 *   delete:
 *     summary: Remove item do estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do item a ser removido
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 */
router.delete('/estoque/:id', controller.delete);

export default router;
