import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/product.routes.js"
import { connectDb } from "./lib/db.js";
//This will parse the cookies so we can use them in our express
import cookieParser from "cookie-parser";

const app= express();
//allow app to parse json in body
app.use(express.json())
//Allow app to read values from .env
dotenv.config()
//Use the cookie parser using express
app.use(cookieParser())
//assigning port to env
const port = process.env.PORT || 5000

//Routes
//authentication routes
app.use("/api/auth",authRoutes)
//Product routes
app.use("/api/products",productRoutes)
app.listen(port,()=>{
    console.log(`Server is running on port ${5000}`)
    connectDb()
})