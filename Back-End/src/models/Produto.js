import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
       Nome_Produto: {
        type: String,
        required: [true, "O nome do produto é obrigatório."],
        unique: true
    }
}, { timestamps: true, collection: 'Produtos' }); // Nome da coleção

const Produto = mongoose.model('Produto', produtoSchema);
export default Produto;