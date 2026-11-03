import mongoose from "mongoose";
import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";

function calculateCartTotal(cart) {
    if (cart.some(item => !Number.isFinite(item.product?.price))) {
        return null
    }
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

async function addToCart(req, res) {
    try {
        const { productId } = req.body
        const quantity = Number(req.body.quantity) || 1

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }
        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive integer" })
        }
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(400).json({ message: "Product not found" })

        }
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId)
        if (cartItem) {
            cartItem.quantity += quantity
        } else {
            user.cart.push({ product: productId, quantity })
        }
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name desc image price")

        return res.status(200).json({ message: "Product Added to cart", cart: updatedUser.cart, totalPrice: calculateCartTotal(updatedUser.cart) })

    } catch (error) {
        return res.status(400).json({ message: "Failed to Add to cart", error: error.message })
    }
}

async function updateCartQuantity(req, res) {
    try {
        const { productId } = req.params
        const change = Number(req.body.change)

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }
        if (change !== 1 && change !== -1) {
            return res.status(400).json({ message: "Quantity change must be 1 or -1" })
        }

        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId)
        if (!cartItem) {
            return res.status(404).json({ message: "Product is not in your cart" })
        }

        if (change === -1 && cartItem.quantity === 1) {
            user.cart = user.cart.filter(item => item.product.toString() !== productId)
        } else {
            cartItem.quantity += change
        }
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name desc image price")
        return res.status(200).json({
            message: "Cart quantity updated",
            cart: updatedUser.cart,
            totalPrice: calculateCartTotal(updatedUser.cart)
        })
    } catch (error) {
        console.error("Failed to update cart quantity:", error)
        return res.status(500).json({ message: "Failed to update cart quantity" })
    }
}

async function getCart(req, res) {
    const user = await userModel.findById(req.user.id).select("cart").populate("cart.product", "name desc image price")
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }
    return res.status(200).json({ cart: user.cart, totalPrice: calculateCartTotal(user.cart) })

}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        user.cart = user.cart.filter(item => item.product.toString() !== productId)
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name desc image price")
        return res.status(200).json({ message: "Product removed from cart", cart: updatedUser.cart, totalPrice: calculateCartTotal(updatedUser.cart) })
    } catch (error) {
        return res.status(400).json({ message: "Failed to remove from cart", error: error.message })
    }
}

export { addToCart, getCart, removeFromCart, updateCartQuantity }