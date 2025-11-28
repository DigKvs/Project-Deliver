import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import produtoRoutes from "./produtoRoutes.js";
import entregaRoutes from "./entregaRoutes.js";

const routes = (app) => {

    app.route("/").get((req, res) => 
        res.status(200).send("API funcionando normalmente!")
    );

    app.use(express.json());

    // Rotas reais
    app.use(userRoutes);
    app.use(authRoutes);
    app.use(produtoRoutes);
    app.use(entregaRoutes);
};

export default routes;
