import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_DB_RESOURCE;

export const connectDB = () => {
  if (!url) {
    console.error("MongoDB URL not found in environment variables");
    return;
  }

  return mongoose.connect(url)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
    })
    .catch(err => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
};
