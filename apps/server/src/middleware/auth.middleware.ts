import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing authentication token");
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}
