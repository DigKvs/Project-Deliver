import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
       Nome_Produto: {
        type: String
    }
}, { timestamps: true, collection: 'Produtos' }); // Nome da coleção

const Produto = mongoose.model('Produto', produtoSchema);
export default Produto;