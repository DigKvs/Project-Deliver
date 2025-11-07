import express from "express";
import connectToDatabase from "./config/dbConnect.js"
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../src/config/swagger.js";


const connection = await connectToDatabase;
connection.on("error", (error) => {
    console.error("Erro de conexão: ", error)
});
connection.on("open", () => {
    console.log("conexão com atlas sucesso: ")
});



const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

routes(app);


export default app;