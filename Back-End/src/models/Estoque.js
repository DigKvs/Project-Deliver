import mongoose from 'mongoose';

const itemEstoqueSchema = new mongoose.Schema({
    // FK: Referência ao Produto
    produto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produto', // Deve bater com o nome exportado no produtoModel.js
        required: true
    },
    quantidade: {
        type: Number,
        required: true,
        min: [0, 'A quantidade não pode ser negativa']
    }
}, { 
    timestamps: true,
    collection: 'ItensEstoque'
});

const ItemEstoque = mongoose.model('ItemEstoque', itemEstoqueSchema);
export default ItemEstoque;