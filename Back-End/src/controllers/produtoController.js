import { ProdutoDTO } from '../dtos/productDTO.js';
import { ProdutoService } from '../services/produtoService.js';

export class ProdutoController {
    constructor() {
        this.produtoService = new ProdutoService();
    }

    getAll = async (req, res) => {
        try {
            const listProdutos = await this.produtoService.getAll();
            // Mapeia a lista de produtos para o formato do DTO
            res.status(200).json(listProdutos.map(p => new ProdutoDTO(p)));
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    getById = async (req, res) => {
        try {
            const produto = await this.produtoService.getById(req.params.id);
            res.status(200).json(new ProdutoDTO(produto));
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    create = async (req, res) => {
        try {
            // O req.body virá como { "nome": "Produto X" }
            const newProduto = await this.produtoService.create(req.body);
            res.status(201).json({
                message: "Produto criado com sucesso",
                Produto: new ProdutoDTO(newProduto),
            });
        } catch (error) {
             if (error.message.includes("obrigatório")) {
                res.status(400).send(error.message); // Bad Request
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    update = async (req, res) => {
        try {
            // O req.body virá como { "nome": "Novo Nome" }
            const updatedProduto = await this.produtoService.update(req.params.id, req.body);
            res.status(200).json({
                message: "Produto atualizado com sucesso",
                Produto: new ProdutoDTO(updatedProduto),
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    delete = async (req, res) => {
        try {
            await this.produtoService.delete(req.params.id);
            res.status(200).send("Produto deletado com sucesso");
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                res.status(404).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }
}