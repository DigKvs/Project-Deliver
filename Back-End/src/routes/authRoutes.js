import express from "express";
import AuthController from "../controllers/authController.js";

const routes = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints para login e geração de token
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthLoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "senha123"
 *
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: Token JWT gerado após login
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Credenciais inválidas
 */
routes.post("/auth/login", AuthController.login);

export default routes;
