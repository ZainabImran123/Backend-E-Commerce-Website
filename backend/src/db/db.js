import mongoose from "mongoose";

export default async function connectDB() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is missing. Add your MongoDB connection string to backend/.env.");
    }

    await mongoose.connect(mongoUri);
    console.log("Database connected successfully");
}
