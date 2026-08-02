import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, ...(err.code ? { code: err.code } : {}), ...(err.details !== undefined ? { details: err.details } : {}) });
  }

  if (err instanceof Error && err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof Error && err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  if (err instanceof Error && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: "A record with these unique fields already exists" });
  }

  if (err instanceof Error && err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
