import AuthService from "../services/authService.js"

const authService = new AuthService();

class authController {


    static async login(req, res) {
        const { email, password } = req.body;

        try {
            const login = await authService.login({
                email,
                password
            });

            res.status(200).send(login);
        } catch (error) {
            res.status(401).send({
                message: error.message
            }

            )

        }


    }
}

export default authController;