import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      // Requests without an Origin header are local tools (health checks, curl).
      // "null" and "file://" are origins sent by packaged Electron renderers.
      // In development, Vite may select a different local port when 5173 is
      // occupied, so all loopback dev-server ports are permitted.
      const isDevelopmentLoopback = env.nodeEnv === "development"
        && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? "");
      if (!origin || env.corsOrigins.includes(origin) || isDevelopmentLoopback) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }));
  app.use(express.json({ limit: "5mb" }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
