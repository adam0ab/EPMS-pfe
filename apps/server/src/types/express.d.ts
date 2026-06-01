import { JwtPayload } from "@epms/shared";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
