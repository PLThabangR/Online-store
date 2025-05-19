import express from "express"
import { createProduct,getAllProduct,getFeaturedProduct ,deleteProduct,getRecommendedProduct,getProductByCatergory,ToggleFeaturedProduct} from "../controllers/product.controller.js"
import { adminRoute,protectRoute, } from "../middlewares/middleware.js"

const router = express.Router()

router.post("/create",protectRoute,adminRoute,createProduct)
router.get("/",protectRoute,adminRoute,getAllProduct)
router.get("/featured",getFeaturedProduct)
router.delete("/:id",protectRoute,adminRoute,deleteProduct)
router.patch("/:id",protectRoute,adminRoute,ToggleFeaturedProduct)
router.get("/recommendations",getRecommendedProduct)
router.get("/category/:category",getProductByCatergory)

//router.post("/create",createProduct)



export default router