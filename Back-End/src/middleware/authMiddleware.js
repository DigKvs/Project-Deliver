import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    // Pega o token do cabeçalho 'Authorization'
    const authHeader = req.headers.authorization;

    // 1. Verifica se o token foi enviado
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ error: "Token não fornecido ou mal formatado." });
    }

    // 2. Pega o token (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Se for válido, salva os dados do usuário no 'req'
        // para que outras rotas possam usá-lo
        req.user = decoded; // ex: { id: '...', email: '...' }

        next(); // Permite que a requisição continue
    } catch (error) {
        // 5. Se for inválido ou expirado
        res.status(401).send({ error: "Token inválido ou expirado." });
    }
};