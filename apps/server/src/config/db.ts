import mongoose from "mongoose";
import { env } from "./env";

let listenersRegistered = false;
let hasConnected = false;

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, "mongodb://***:***@");
}

function registerConnectionListeners(): void {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on("reconnected", () => {
    console.info("MongoDB connection re-established successfully");
    console.info(`Database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on("disconnected", () => {
    if (hasConnected) console.warn("MongoDB connection disconnected");
  });

  mongoose.connection.on("error", (error) => {
    if (hasConnected) console.error(`MongoDB connection error: ${safeErrorMessage(error)}`);
  });
}

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);
  registerConnectionListeners();

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
    });
    hasConnected = true;
    console.info("MongoDB connection established successfully");
    console.info(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${safeErrorMessage(error)}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
