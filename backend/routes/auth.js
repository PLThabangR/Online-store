import express from "express"
import { signUpController } from "../controllers/authController.js"

const router = express.Router()


router.get("/signup",(signUpController))



export  default router