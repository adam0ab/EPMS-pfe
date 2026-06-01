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
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  aiProvider: process.env.AI_PROVIDER ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
};
