import { Request, Response } from "express";
import { AuditAction } from "@epms/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { departmentService } from "../services/department.service";
import { auditService } from "../services/audit.service";

export const departmentController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await departmentService.list());
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const department = await departmentService.create(name, description);
    await auditService.log(req.user!.sub, AuditAction.CREATE, "Department", department._id.toString());
    res.status(201).json(department);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentService.update(req.params.id, req.body);
    await auditService.log(req.user!.sub, AuditAction.UPDATE, "Department", req.params.id);
    res.json(department);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await departmentService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "Department", req.params.id);
    res.status(204).send();
  }),
};
