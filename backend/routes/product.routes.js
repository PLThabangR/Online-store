import express from "express"
import { createProduct,getAllProduct } from "../controllers/product.controller.js"
import { adminRoute,protectRoute } from "../middlewares/middleware.js"

const router = express.Router()

router.post("/create",createProduct)
router.get("/",protectRoute,adminRoute,getAllProduct)
//router.post("/create",createProduct)



export default router