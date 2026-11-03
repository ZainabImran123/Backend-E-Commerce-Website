import express from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();
// /api/auth/register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logoutUser);

export default router;