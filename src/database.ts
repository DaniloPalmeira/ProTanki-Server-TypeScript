import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./utils/Logger";

dotenv.config();

export async function connectToDatabase(): Promise<void> {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  try {
    await mongoose.connect(dbUri);
    logger.info("Successfully connected to MongoDB.");

    mongoose.connection.on("error", (error: Error) => {
      logger.error("MongoDB connection error:", { error });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected.");
    });
  } catch (error) {
    logger.error("Error connecting to MongoDB", { error });
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("Successfully disconnected from MongoDB.");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB", { error });
    throw error;
  }
}
