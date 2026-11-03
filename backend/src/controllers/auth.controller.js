import userModel from "../models/users.model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { jwtSecret } from "../config/auth.js";

const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

function clearSessionCookie(res) {
    const clearOptions = { ...sessionCookieOptions };
    delete clearOptions.maxAge;
    res.clearCookie("token", clearOptions);
    res.clearCookie("token", { ...clearOptions, path: "/api/auth" });
}

function setSessionCookie(res, user) {
    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, jwtSecret, { expiresIn: "7d" });
    res.cookie("token", token, sessionCookieOptions);
}

function getSafeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        brandName: user.brandName || null
    };
}

async function registerUser(req, res) {
   try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password, accountType, brandName } = req.body;
    const isBrandAccount = accountType === "brand";
    if (accountType && !["shopper", "brand"].includes(accountType)) {
        return res.status(400).json({ message: "Choose a valid account type" });
    }
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }
    if (isBrandAccount && !brandName?.trim()) {
        return res.status(400).json({ message: "Brand name is required for a brand account" });
    }

    const userAlreadyExists= await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(userAlreadyExists){
        return res.status(409).json({
            message:"User Already Exists"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user= await userModel.create({
        username,
        email,
        password: hash,
        role: isBrandAccount ? "admin" : "user",
        ...(isBrandAccount ? { brandName: brandName.trim() } : {})
    })
    setSessionCookie(res, user);

    res.status(201).json({
        message:"User created sucessfully",
        user: getSafeUser(user)
    })
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    
   }
}

async function loginUser(req, res) {
    const {username, email, password } = req.body;
    const login = String(username || email || "").trim();
    const user = await userModel.findOne({
        $or:[
            {username: login},
            {email: login.toLowerCase()}
        ]
    })

    if(!user || !password){
        return res.status(404).json({
            message:"User not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid password"
        })
    }

    setSessionCookie(res, user);

    res.status(200).json({
        message:"User logged in sucessfully",
        user: getSafeUser(user)
    })

}

async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("username email role brandName");
        if (!user) {
            clearSessionCookie(res);
            return res.status(401).json({ message: "Session expired. Please sign in again." });
        }
        return res.status(200).json({ user: getSafeUser(user) });
    } catch (error) {
        console.error("Could not restore user session:", error);
        return res.status(500).json({ message: "Could not restore your session." });
    }
}

function logoutUser(req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ message: "Signed out successfully" });
}

export { registerUser, loginUser, getCurrentUser, logoutUser };