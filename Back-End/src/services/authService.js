import { user } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import jsonSecret from "../config/jsonSecret.js";


const { compare } = bcrypt;

class AuthService {
    async login(dto){
        try {
            const userVerify = await user.findOne({
                email: dto.email,

            }).select("id email password");

            if(!userVerify){
                throw new Error("Usuário não cadastrado.")

            }

            const passwordsMatch = await compare(dto.password, userVerify.password);

            if (!passwordsMatch) {
                throw new Error("Usuário ou Senha incorreta.")
            }

            const accessToken = jwt.sign({
                    id: userVerify.id,
                    email: userVerify.email,

            },
        
            jsonSecret.secret,
            {
                expiresIn: 12,
            }
        );
        return accessToken ;
        } catch (error) {
            
        }
    }
}

export default AuthService;