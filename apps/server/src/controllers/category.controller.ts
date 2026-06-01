import { Request, Response } from "express";
import { AuditAction } from "@epms/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { categoryService } from "../services/category.service";
import { auditService } from "../services/audit.service";

export const categoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await categoryService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { name, group } = req.body;
    const category = await categoryService.create(name, group);
    await auditService.log(req.user!.sub, AuditAction.CREATE, "Category", category._id.toString());
    res.status(201).json(category);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    await auditService.log(req.user!.sub, AuditAction.UPDATE, "Category", req.params.id);
    res.json(category);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "Category", req.params.id);
    res.status(204).send();
  }),
};
