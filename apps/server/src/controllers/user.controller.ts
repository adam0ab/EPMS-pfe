import { Request, Response } from "express";
import { AuditAction } from "@epms/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { userService } from "../services/user.service";
import { auditService } from "../services/audit.service";

export const userController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await userService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    await auditService.log(req.user!.sub, AuditAction.CREATE, "User", user._id.toString());
    res.status(201).json(user);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(req.params.id, req.body);
    await auditService.log(req.user!.sub, AuditAction.UPDATE, "User", req.params.id);
    res.json(user);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await userService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "User", req.params.id);
    res.status(204).send();
  }),
};
