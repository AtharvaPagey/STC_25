import {connectDB} from "../src/db/index.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({
    path: './.env' 
});


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello from the backend!</h1>');
});

connectDB()
.then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});