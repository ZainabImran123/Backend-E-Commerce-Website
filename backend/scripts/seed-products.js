import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../src/db/db.js";
import { seedDemoProducts } from "../src/data/demo-products.js";
import userModel from "../src/models/users.model.js";

try {
  const ownerEmail = process.env.PRODUCT_SEED_OWNER_EMAIL?.trim();
  if (!ownerEmail) {
    throw new Error("Set PRODUCT_SEED_OWNER_EMAIL in backend/.env to the email you used to sign up.");
  }

  await connectDB();
  const owner = await userModel.findOne({ email: ownerEmail.toLowerCase() });
  if (!owner) {
    throw new Error(`No account found for ${ownerEmail}. Sign up in the storefront first.`);
  }

  const added = await seedDemoProducts(owner._id);
  console.log(added ? `Added ${added} demo products.` : "Products already exist; nothing was added.");
} catch (error) {
  console.error("Could not seed products:", error.message);
  process.exitCode = 1;
} finally {
  if (process.env.MONGO_URI) {
    await mongoose.disconnect();
  }
}
