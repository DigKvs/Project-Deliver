import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {type: String, required: [true,"Nome do usúario é obrigatório"]},
    email: {type: String, required: [true,"Email é obrigatório"], unique: true },
    password: {type: String, required: [true,"password do user é obrigatório"]},
});

const user = mongoose.model("user", userSchema);

export {user, userSchema};