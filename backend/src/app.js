import express from "express";
import cors from "cors"; // 1. Import cors
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();

// 2. Configure CORS to allow your frontend and cookies
app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Match your Vite frontend URL
        credentials: true,                                         // Required for cookies/JWT authentication
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);

export default app;