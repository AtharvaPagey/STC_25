import { connectDB } from "../src/db/index.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path: './.env' 
});

// Import your routes
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

// http://localhost:8000/api/v1/users/login
// http://localhost:8000/api/v1/users/predict

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