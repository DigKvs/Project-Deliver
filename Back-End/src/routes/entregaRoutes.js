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
 * components:
 *   schemas:
 *
 *     ProdutoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "69176f147698683744dd52ac"
 *         nome:
 *           type: string
 *           example: "Circulo"
 *         ordem:
 *           type: number
 *           example: 1
 *
 *     Entrega:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "6928a6e3f79df764dcf4da48"
 *         descricao:
 *           type: string
 *           example: "Entrega do pino 3D"
 *         status:
 *           type: string
 *           enum: [Pendente, Em Rota, Entregue, Cancelada, Producao]
 *           example: "Entregue"
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           example: "2025-11-27T19:30:43.244Z"
 *         atualizadoEm:
 *           type: string
 *           format: date-time
 *           example: "2025-11-28T17:08:33.644Z"
 *         produtos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProdutoItem'
 *
 *     EntregaCreateInput:
 *       type: object
 *       required:
 *         - descricao
 *         - produtos
 *       properties:
 *         descricao:
 *           type: string
 *           example: "Entrega do pino 3D"
 *         produtos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "69176f147698683744dd52ac"
 *               ordem:
 *                 type: number
 *                 example: 1
 *
 *     EntregaUpdateInput:
 *       type: object
 *       properties:
 *         descricao:
 *           type: string
 *           example: "Entrega ajustada"
 *         status:
 *           type: string
 *           enum: [Pendente, Em Rota, Entregue, Cancelada, Producao]
 *           example: "Entregue"
 *         produtos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "69176f147698683744dd52ac"
 *               ordem:
 *                 type: number
 *                 example: 1
 */

/**
 * @swagger
 * /entregas/em-rota:
 *   get:
 *     summary: Retorna a entrega que está atualmente "Em Rota"
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Nenhuma entrega com status Em Rota encontrada
 */
router.get('/entregas/em-rota', controller.getSomenteEntrega);

/**
 * @swagger
 * /entregas:
 *   post:
 *     summary: Cria uma nova entrega
 *     description: |
 *       Cria uma nova entrega aplicando regras de status:
 *
 *       - Se nenhuma entrega estiver "Em Rota", esta vira **Em Rota**
 *       - Caso contrário, vira **Pendente**
 *
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
 *       201:
 *         description: Entrega criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       400:
 *         description: Dados inválidos
 */
router.post('/entregas', controller.create);

/**
 * @swagger
 * /entregas:
 *   get:
 *     summary: Lista todas as entregas
 *     description: Retorna todas as entregas já convertidas para o formato de resposta.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent]
 *         description: Ordena pela mais recente
 *     responses:
 *       200:
 *         description: Lista de entregas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entrega'
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
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entrega encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entrega'
 *       404:
 *         description: Entrega não encontrada
 */
router.get('/entregas/:id', controller.getById);

/**
 * @swagger
 * /entregas/{id}:
 *   put:
 *     summary: Atualiza uma entrega existente
 *     description: |
 *       Atualiza campos da entrega.  
 *       Caso altere uma entrega "Em Rota", a próxima pendente assume sua posição.
 *     tags: [Entregas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 */
router.put('/entregas/:id', controller.update);

/**
 * @swagger
 * /entregas/{id}:
 *   delete:
 *     summary: Remove uma entrega
 *     description: |
 *       Se a entrega removida estiver "Em Rota",
 *       a próxima pendente assume a rota automaticamente.
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
 */
router.delete('/entregas/:id', controller.delete);

export default router;
