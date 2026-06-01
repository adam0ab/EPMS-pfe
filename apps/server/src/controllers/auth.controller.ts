import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authService } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) throw ApiError.badRequest("Email and password are required");

    const result = await authService.login(email, password);
    res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.sub);
    res.json(user);
  }),
};
