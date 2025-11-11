import { EntregaDTO } from '../dtos/entregaDTO.js';
import { EntregaService } from '../services/entregaService.js';

export class EntregaController {
    constructor() {
        this.entregaService = new EntregaService();
    }

    getAll = async (req, res) => {
        try {
            const listEntregas = await this.entregaService.getAll();
            res.status(200).json(listEntregas.map(e => new EntregaDTO(e)));
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    getById = async (req, res) => {
        try {
            const entrega = await this.entregaService.getById(req.params.id);
            res.status(200).json(new EntregaDTO(entrega));
        } catch (error) {
            if (error.message.includes("não encontrada")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    create = async (req, res) => {
        try {
            // O req.body (exemplo) está no comentário do Service
            const newEntrega = await this.entregaService.create(req.body);
            
            // O '.populate()' não funciona no 'create', então buscamos
            // o documento recém-criado (e populado) para retornar ao usuário.
            const entregaCompleta = await this.entregaService.getById(newEntrega._id);

            res.status(201).json({
                message: "Entrega criada com sucesso",
                Entrega: new EntregaDTO(entregaCompleta),
            });
        } catch (error) {
             if (error.message.includes("não encontrado")) {
                res.status(400).send(error.message); // Produto não encontrado (Bad Request)
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    update = async (req, res) => {
        try {
            const updatedEntrega = await this.entregaService.update(req.params.id, req.body);
            res.status(200).json({
                message: "Entrega atualizada com sucesso",
                Entrega: new EntregaDTO(updatedEntrega),
            });
        } catch (error) {
            if (error.message.includes("não encontrada")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    delete = async (req, res) => {
        try {
            await this.entregaService.delete(req.params.id);
            res.status(200).send("Entrega deletada com sucesso");
        } catch (error) {
            if (error.message.includes("não encontrada")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }
}