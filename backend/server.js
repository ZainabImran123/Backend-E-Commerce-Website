import "dotenv/config";

import app from "./src/app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

// Hardcoded MongoDB connection string so you don't need a .env file
const MONGO_URI = "mongodb+srv://zainabimran:parekhhouse@cluster0.ntgdgah.mongodb.net/";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });