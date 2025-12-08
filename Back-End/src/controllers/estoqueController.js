import { ItemEstoqueService } from '../services/estoqueService.js';
import { ItemEstoqueDTO } from '../dtos/estoqueDTO.js';

export class ItemEstoqueController {
    constructor() {
        this.service = new ItemEstoqueService();
    }

    getAll = async (req, res) => {
        try {
            const itens = await this.service.getAll();
            res.status(200).json(itens.map(i => new ItemEstoqueDTO(i)));
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    getById = async (req, res) => {
        try {
            const item = await this.service.getById(req.params.id);
            res.status(200).json(new ItemEstoqueDTO(item));
        } catch (error) {
            res.status(404).send(error.message);
        }
    }

    create = async (req, res) => {
        try {
            // Espera receber: { "produtoId": "...", "quantidade": 10 }
            const newItem = await this.service.create(req.body);
            
            // Busca novamente para popular os dados do produto na resposta
            const itemPopulado = await this.service.getById(newItem._id);
            
            res.status(201).json({
                message: "Item de estoque criado",
                Item: new ItemEstoqueDTO(itemPopulado)
            });
        } catch (error) {
            res.status(400).send(error.message);
        }
    }

    update = async (req, res) => {
        try {
            const updated = await this.service.update(req.params.id, req.body);
            res.status(200).json(new ItemEstoqueDTO(updated));
        } catch (error) {
            res.status(400).send(error.message);
        }
    }

    delete = async (req, res) => {
        try {
            await this.service.delete(req.params.id);
            res.status(200).send("Item deletado com sucesso");
        } catch (error) {
            res.status(404).send(error.message);
        }
    }
}