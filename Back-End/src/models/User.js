import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: [true, "O nome é obrigatório."]
    },
    email: { 
        type: String, 
        required: [true, "O email é obrigatório."],
        unique: true, // Garante que não existam dois emails iguais
        lowercase: true, // Salva o email sempre em minúsculas
        match: [/\S+@\S+\.\S+/, 'Por favor, insira um email válido.'] // Validação de formato
    },
    password: { 
        type: String, 
        required: [true, "A senha é obrigatória."],
        minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
        select: false // Impede que a senha seja retornada em requisições GET
    }
}, { 
    timestamps: true // Adiciona createdAt e updatedAt
});

// ---- Hook (Middleware) do Mongoose ----
// 'pre' (antes) de 'save' (salvar), execute esta função
userSchema.pre('save', async function (next) {
    // 'this' se refere ao documento do usuário que está sendo salvo
    
    // Se a senha não foi modificada (ex: atualizando o email),
    // não faz o hash novamente.
    if (!this.isModified('password')) {
        return next();
    }

    // Gera o "salt" (aleatoriedade) e faz o hash da senha
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);
export default User;