import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Verifica se o header existe e segue o padrão
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: "Token ausente ou mal formatado. Utilize: Bearer <token>"
            });
        }

        const token = authHeader.split(' ')[1];

        if (!process.env.JWT_SECRET) {
            console.error("ERRO FATAL: JWT_SECRET não definido no ambiente.");
            return res.status(500).json({ error: "Erro interno de configuração." });
        }

        // Validação e decodificação
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Armazena o usuário nas reqs seguintes
        req.user = decoded;

        next();
    } catch (error) {

        // Tratamento de erros específicos do JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expirado." });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Token inválido." });
        }

        return res.status(401).json({ error: "Falha na autenticação." });
    }
};
