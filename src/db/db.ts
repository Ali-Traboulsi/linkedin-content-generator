import dotenv from "dotenv";
import mongoose from "mongoose";
import { dot } from "node:test/reporters";

dotenv.config();

// connect to the database
export const connectToDB = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI as string, {});
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Exit the process if connection fails
  }
};
