import { NextFunction, Request, Response } from "express";
import { Role } from "@epms/shared";
import { ApiError } from "../utils/ApiError";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
}
