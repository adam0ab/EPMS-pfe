import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log(`[db] connected to ${env.mongoUri}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
