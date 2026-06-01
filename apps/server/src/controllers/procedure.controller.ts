import { Request, Response } from "express";
import { AuditAction, ProcedureStatus } from "@epms/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { procedureService } from "../services/procedure.service";
import { auditService } from "../services/audit.service";

export const procedureController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { search, department, category, keyword, status, versionNumber, effectiveFrom, effectiveTo } = req.query;
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);

    const result = await procedureService.list(
      {
        search: search as string,
        department: department as string,
        category: category as string,
        keyword: keyword as string,
        status: status as string,
        versionNumber: versionNumber as string,
        effectiveFrom: effectiveFrom as string,
        effectiveTo: effectiveTo as string,
      },
      page,
      pageSize
    );

    res.json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.getById(req.params.id, true);
    res.json(procedure);
  }),

  recommendations: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await procedureService.recommend(req.params.id);
    res.json(recommendations);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.create(req.body, req.user!.sub);
    await auditService.log(req.user!.sub, AuditAction.CREATE, "Procedure", procedure._id.toString());
    res.status(201).json(procedure);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.update(req.params.id, req.body, req.user!.sub);
    await auditService.log(req.user!.sub, AuditAction.UPDATE, "Procedure", req.params.id);
    res.json(procedure);
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.changeStatus(req.params.id, ProcedureStatus.PUBLISHED, req.user!.sub);
    await auditService.log(req.user!.sub, AuditAction.PUBLISH, "Procedure", req.params.id);
    res.json(procedure);
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.changeStatus(req.params.id, ProcedureStatus.ARCHIVED, req.user!.sub);
    await auditService.log(req.user!.sub, AuditAction.ARCHIVE, "Procedure", req.params.id);
    res.json(procedure);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await procedureService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "Procedure", req.params.id);
    res.status(204).send();
  }),
};
