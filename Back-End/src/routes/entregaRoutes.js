import express from 'express';
import { EntregaController } from '../controllers/entregaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const controller = new EntregaController();

// router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   - name: Entregas
 *     description: Endpoints para gerenciamento de entregas
 */

/**
 * @swagger
 * /entregas:
 *   post:
 *     summary: Cria uma nova entrega
 *     description: |
 *       Cria uma entrega com status automático:
 *       - Se não existir entrega em "Em Rota", esta se torna "Em Rota".
 *       - Caso exista, esta se torna "Pendente".
 *
 *       O campo **produto** pode ser o ID ou o Nome do produto.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: Entrega criada com sucesso
 *         content:
 *           application/json:
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 */
router.post('/entregas', controller.create);

/**
 * @swagger
 * /entregas:
 *   get:
 *     summary: Lista todas as entregas
 *     description: Lista todas as entregas, podendo aplicar ordenação por data.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent]
 *         description: Ordena pelas entregas mais recentes (createdAt)
 *     responses:
 *       200:
 *         description: Lista de entregas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Não autorizado
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
 *         description: ID da entrega
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Entrega não encontrada
 *       401:
 *         description: Não autorizado
 */
router.get('/entregas/:id', controller.getById);

/**
 * @swagger
 * /entregas/{id}:
 *   put:
 *     summary: Atualiza uma entrega
 *     description: |
 *       Atualiza os dados de uma entrega:
 *       - O status só pode ser **Entregue** ou **Cancelada**.
 *       - Se uma entrega "Em Rota" for alterada, a próxima "Pendente" será promovida automaticamente.
 *     tags: [Entregas]
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
 *             $ref: '#/components/schemas/EntregaUpdateInput'
 *     responses:
 *       200:
 *         description: Entrega atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Entrega não encontrada
 *       401:
 *         description: Não autorizado
 */
router.put('/entregas/:id', controller.update);

/**
 * @swagger
 * /entregas/{id}:
 *   delete:
 *     summary: Deleta uma entrega
 *     description: |
 *       À exclusão de uma entrega em "Em Rota", a próxima "Pendente" assume seu lugar.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrega removida com sucesso
 *       404:
 *         description: Entrega não encontrada
 *       401:
 *         description: Não autorizado
 */
router.delete('/entregas/:id', controller.delete);

/**
 * @swagger
 * /entregas/em-rota:
 *   get:
 *     summary: Retorna a entrega que está atualmente "Em Rota"
 *     description: |
 *       Essa rota retorna **apenas a entrega que possui o status "Em Rota"**.
 *       Caso não exista nenhuma entrega nesse status, retorna 404.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Entrega com status "Em Rota" encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       '404':
 *         description: Nenhuma entrega "Em Rota" encontrada
 *       '401':
 *         description: Token inválido ou ausente
 */
router.get('/entregas/em-rota', controller.getEmRota);
export default router;
