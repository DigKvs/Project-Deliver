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
            // Erro 500 para falhas inesperadas de 'find'
            res.status(500).send(error.message);
        }
    }
// ... outros métodos ...

    getSomenteEntrega = async (req, res) => {
        try {
            // Chama o service que consulta o repositório com o filtro adequado.
            const lista = await this.entregaService.getSomenteEntrega();

            // Transforma o retorno da camada de dados em DTOs antes de enviar ao cliente
            const respostaDTO = lista.map(e => new EntregaDTO(e));

            // Retorna 200 OK com o array de entregas filtradas
            res.status(200).json(respostaDTO);

        } catch (error) {
            // Tratamento de erro padronizado
            res.status(500).json({
                erro: "Erro ao buscar entregas com status 'Entrega'.",
                detalhes: error.message
            });
        }
    }

    // ...
    getById = async (req, res) => {
        try {
            const entrega = await this.entregaService.getById(req.params.id);
            res.status(200).json(new EntregaDTO(entrega));
        } catch (error) {
            // **** MANIPULAÇÃO DE ERRO MELHORADA ****
            if (error.message.includes("não encontrada") || error.message.includes("inválido")) {
                // Erro 404 se não achar, 400 se o ID for inválido
                res.status(error.message.includes("não encontrada") ? 404 : 400).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    }

    create = async (req, res) => {
        try {
            const userId = req.user.id;
            // O req.body (ex: {"descricao": "...", "produtos": [...]})
            const newEntrega = await this.entregaService.create(req.body, userId);
            
            // Busca o item recém-criado para "popular" os produtos
            const entregaCompleta = await this.entregaService.getById(newEntrega._id);

            res.status(201).json({
                message: "Entrega criada com sucesso",
                Entrega: new EntregaDTO(entregaCompleta),
            });
            
        } catch (error) {
            // **** O BLOCO CATCH UNIVERSAL ****
            // Este bloco agora captura os erros que o Service lança
            // (ex: "Formato do ID inválido", "Produto não encontrado", etc.)
            
            // Erros de validação do Mongoose (ex: 'Desc_Entrega' faltando)
            if (error.name === 'ValidationError') {
                return res.status(400).send({ error: error.message });
            }

            // Nossos erros customizados do Service
            // Se o erro tiver uma mensagem, envia como 400 Bad Request
            if (error.message) {
                return res.status(400).send({ error: error.message });
            }
            
            // Se for um erro inesperado, envia 500
            res.status(500).send({ error: "Erro interno no servidor." });
        }
    }

    update = async (req, res) => {
        // (Use o mesmo bloco try/catch do 'create' aqui)
        try {
            const updatedEntrega = await this.entregaService.update(req.params.id, req.body);
            res.status(200).json({
                message: "Entrega atualizada com sucesso",
                Entrega: new EntregaDTO(updatedEntrega),
            });
        } catch (error) {
            // (Copie o bloco catch do 'create' para cá)
            if (error.message.includes("não encontrada") || error.message.includes("inválido")) {
                res.status(400).send(error.message);
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