import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/epms"),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  // Electron can send either "null" or "file://" for a packaged renderer.
  // Keep both alongside configured browser origins.
  corsOrigins: [...new Set([
    ...(process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map((origin) => origin.trim()).filter(Boolean),
    "null",
    "file://",
  ])],
  aiProvider: process.env.AI_PROVIDER ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "openai/gpt-oss-20b",
  aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
};
