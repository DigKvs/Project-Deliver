import express from 'express';
import { EntregaController } from '../controllers/entregaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new EntregaController();

// Rotas protegidas
// router.use(authMiddleware);

/**
 * @swagger
 * /entregas:
 *   post:
 *     summary: Cria uma nova entrega
 *     description: |
 *       Cria uma entrega. O status é definido automaticamente:
 *       - Se não houver entregas "Em Rota", esta se torna "Em Rota".
 *       - Caso contrário, se torna "Pendente".
 *       O campo "produto" pode ser o ID ou o Nome do produto.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntregaCreateInput'
 *     responses:
 *       '201':
 *         description: Entrega criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       '400':
 *         description: Erro de validação (ex: Produto não encontrado)
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.post('/entregas', controller.create);

/**
 * @swagger
 * /entregas:
 *   get:
 *     summary: Lista todas as entregas
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent]
 *         description: Use 'recent' para ordenar pelas mais recentes (createdAt)
 *     responses:
 *       '200':
 *         description: Lista de entregas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entrega'
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.get('/entregas', controller.getAll);

/**
 * @swagger
 * /entregas/{id}:
 *   get:
 *     summary: Busca uma entrega pelo ID
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrega (Mongoose ObjectId)
 *     responses:
 *       '200':
 *         description: Detalhes da entrega
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       '404':
 *         description: Entrega não encontrada
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.get('/entregas/:id', controller.getById);

/**
 * @swagger
 * /entregas/{id}:
 *   put:
 *     summary: Atualiza uma entrega pelo ID
 *     description: |
 *       Atualiza descrição, status ou produtos.
 *       - O campo "status" só aceita "Entregue" ou "Cancelada".
 *       - Se atualizar uma entrega "Em Rota", a próxima "Pendente" será promovida automaticamente.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntregaUpdateInput'
 *     responses:
 *       '200':
 *         description: Entrega atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       '400':
 *         description: Erro de validação (status inválido ou dados insuficientes)
 *       '404':
 *         description: Entrega não encontrada
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.put('/entregas/:id', controller.update);

/**
 * @swagger
 * /entregas/{id}:
 *   delete:
 *     summary: Deleta uma entrega pelo ID
 *     description: |
 *       Se a entrega deletada estiver "Em Rota", a próxima "Pendente" será promovida para "Em Rota".
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrega
 *     responses:
 *       '200':
 *         description: Entrega deletada com sucesso
 *       '404':
 *         description: Entrega não encontrada
 *       '401':
 *         description: Não autorizado (Token inválido)
 */
router.delete('/entregas/:id', controller.delete);

export default router;
