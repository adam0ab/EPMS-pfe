import jwt from "jsonwebtoken";
import { JwtPayload } from "@epms/shared";
import { env } from "../config/env";

export function signToken(payload: JwtPayload): string {
  const options = { expiresIn: env.jwtExpiresIn } as unknown as jwt.SignOptions;
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
