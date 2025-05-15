import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import { connectDb } from "./lib/db.js";

const app= express();

//Allow app to read values from .env
dotenv.config()
//assigning port to env
const port = process.env.PORT || 5000

//authentication routes
app.use("/api/auth",authRoutes)
app.listen(port,()=>{
    console.log(`Server is running on port ${5000}`)
    connectDb()
})