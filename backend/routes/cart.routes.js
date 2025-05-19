import express from "express";
import {addToCart,removeAllFromCart,updateQuantity,getAllProducts} from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/middleware.js";

//Routes for cart
const router = express.Router();


//Routes
router.get("/", protectRoute, getAllProducts);
router.post("/", protectRoute,addToCart);
router.delete("/", protectRoute,removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;