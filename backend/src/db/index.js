import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_CONNECTION_STRING}/test`);
        console.log("\nMongodb connected");
        return true;
    }catch(error){
        console.log("Mongo DB connection failed", error);
        process.exit(1);
    }
}

export {connectDB}