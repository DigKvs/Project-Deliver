import mongoose from 'mongoose';

const entregaSchema = new mongoose.Schema({
    // PK _id é automática
    Desc_Entrega: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        required: true,
        // Enum define os únicos valores permitidos
        enum: ['Pendente', 'Em Rota', 'Entregue', 'Cancelada'],
        default: 'Pendente' // Valor padrão ao criar
    },
    // Relação N:N com Produtos
    produtos: [
        {
            // O ID do produto na coleção 'Produtos'
            produto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Produto', // Referência ao Model 'Produto'
                required: true
            },
            // A "coluna extra" da relação
            OrdemEntrega: {
                type: Number,
                required: true
            }
        }
    ]
}, { 
    timestamps: true, // Adiciona createdAt e updatedAt
    collection: 'Entrega' // Nome da coleção no banco
});

const Entrega = mongoose.model('Entrega', entregaSchema);
export default Entrega;