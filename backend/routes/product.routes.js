import express from "express"
import { createProduct,getAllProduct,getFeaturedProduct ,deleteProduct,getRecommendedProduct} from "../controllers/product.controller.js"
import { adminRoute,protectRoute, } from "../middlewares/middleware.js"

const router = express.Router()

router.post("/create",protectRoute,adminRoute,createProduct)
router.get("/",protectRoute,adminRoute,getAllProduct)
router.get("/featured",getFeaturedProduct)
router.delete("/:id",protectRoute,adminRoute,deleteProduct)
router.get("/recommendations",getRecommendedProduct)

//router.post("/create",createProduct)



export default router