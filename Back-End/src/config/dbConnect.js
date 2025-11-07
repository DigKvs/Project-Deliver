import mongoose from "mongoose";


async function connectToDatabase(){
    
    mongoose.connect("mongodb+srv://<User>:<Senha>@cluster0.23scyyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

    return mongoose.connection;
}

export default connectToDatabase();

