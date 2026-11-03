import mongoose from "mongoose";
import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";
import { seedDemoProducts } from "../data/demo-products.js";

const supportedImageTypes = new Set([
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp"
]);

function getUploadedImage(file) {
    if (!supportedImageTypes.has(file.mimetype)) {
        throw new Error("Choose a JPEG, PNG, GIF, WebP, or AVIF image.");
    }
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

async function createProduct(req, res) {
    try {
        const { name, desc } = req.body
        const price = Number(req.body.price)
        if (!req.file) {
            return res.status(400).json({ message: "Product image upload is required" })
        }
        if (!name?.trim() || !desc?.trim() || String(req.body.price ?? "").trim() === "" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: "Name, description, and a nonnegative price are required" })
        }

        const image = getUploadedImage(req.file)
        const product = await productModel.create({
            image,
            name: name.trim(),
            desc: desc.trim(),
            price,
            admin: req.user.id
        })
        const populatedProduct = await productModel.findById(product._id).populate("admin", "username email brandName")

        return res.status(201).json({ message: "Product added", product: populatedProduct })
    } catch (error) {
        console.error("Failed to create product:", error);
        const isInvalidImage = error instanceof Error && error.message.startsWith("Choose a ");
        return res.status(isInvalidImage ? 400 : 500).json({
            message: isInvalidImage ? error.message : "Could not save the product to MongoDB. Check the backend logs for details."
        })
    }
}

async function getProducts(req,res){
    try {
        if (!(await productModel.exists({}))) {
            const firstUser = await userModel.findOne().sort({ _id: 1 });
            if (firstUser) await seedDemoProducts(firstUser._id);
        }

        const products = await productModel.find().sort({ _id: -1 }).populate("admin","username email brandName")
        res.status(200).json({
            message:"Products fetched sucessfully",
            products
        })

    } catch (error) {
        res.status(500).json({
            message:"Failed to fetch Products",
            error:error.message
        })
    }
}

async function updateProduct(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own products" })
        }

        const { name, desc } = req.body
        const price = Number(req.body.price)
        if (!name?.trim() || !desc?.trim() || String(req.body.price ?? "").trim() === "" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: "Name, description, and a nonnegative price are required" })
        }

        product.name = name.trim()
        product.desc = desc.trim()
        product.price = price
        if (req.file) {
            product.image = getUploadedImage(req.file)
        }
        await product.save()

        const updatedProduct = await productModel.findById(product._id).populate("admin", "username email brandName")
        return res.status(200).json({ message: "Product updated", product: updatedProduct })
    } catch (error) {
        console.error("Failed to update product:", error);
        const isInvalidImage = error instanceof Error && error.message.startsWith("Choose a ");
        return res.status(isInvalidImage ? 400 : 500).json({
            message: isInvalidImage ? error.message : "Could not update the product in MongoDB. Check the backend logs for details."
        })
    }
}

async function deleteProduct(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own products" })
        }

        await userModel.updateMany(
            { "cart.product": productId },
            { $pull: { cart: { product: productId } } },
        )
        await product.deleteOne()
        return res.status(200).json({ message: "Product deleted" })
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete product", error: error.message })
    }
}

export { createProduct, getProducts, updateProduct, deleteProduct }