import express from "express";
import authRotes from "./authRoutes.js"
import user from "./userRoutes.js";
import produto from "./produtoRoutes.js"
import entrega from "./entregaRoutes.js";


const routes = (app) => {
    app.route("/").get((req, res) => res.status(200).send
    ("Node.js com Express"));    

    app.use(express.json());
    app.use(authRotes);
    app.use(user);
    app.use(produto);
    app.use(entrega);
}

export default routes;