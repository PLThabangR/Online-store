import express from "express"
import { login,signup,logout,refresh_token ,getProfile } from "../controllers/authController.js"

const router = express.Router()


router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)
router.post("/refresh-token",refresh_token)
router.get("/profile",getProfile)



export  default router