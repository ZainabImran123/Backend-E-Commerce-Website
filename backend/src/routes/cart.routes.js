import express from "express";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.post("/items",authenticateToken,addToCart)
router.patch("/items/:productId",authenticateToken,updateCartQuantity)
router.delete("/items/:productId",authenticateToken,removeFromCart)
router.get("/",authenticateToken,getCart)

export default router