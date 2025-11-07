import jwt from "jsonwebtoken";
import jsonSecret from "../config/jsonSecret.js";

export default async(req, res, next) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).send("Access Token não informado");
    }

    const[, accessToken] = token.split(" ");

    try{
        const decoded = jwt.verify(accessToken, jsonSecret.secret);
        const{id, email} = decoded;
        req.userId = id;
        req.userEmail = email;

        return next();
    }catch(error){
        return res.status(401).send("Usuario nao autorizado");
    }
}