
import app from "./src/app.js";
import dotenv from 'dotenv';



const PORT = 3000;
dotenv.config();
app.listen(PORT, () => {
    console.log("Servidor na escuta!");
});
 
