import express from 'express';
import { EntregaController } from '../controllers/entregaController.js';

const router = express.Router();
const controller = new EntregaController();

// Define os endpoints RESTful
router.get('/entregas', controller.getAll);
router.get('/entregas/:id', controller.getById);
router.post('/entregas', controller.create);
router.put('/entregas/:id', controller.update);
router.delete('/entregas/:id', controller.delete);

export default router;