import { Request, Response } from "express";
import { AuditAction, ChangeType, ProcedureStatus } from "@epms/shared";
import { procedureVersionService } from "../services/procedureVersion.service";
import { asyncHandler } from "../utils/asyncHandler";
import { procedureService } from "../services/procedure.service";
import { auditService } from "../services/audit.service";

export const procedureController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { search, department, category, keyword, status, versionNumber, effectiveFrom, effectiveTo, health } = req.query;
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
        health: health as string,
      },
      page,
      pageSize,
      req.user!.role
    );

    res.json(result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.getById(req.params.id, true, req.user!.role, req.user!.sub);
    res.json(procedure);
  }),

  recommendations: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await procedureService.recommend(req.params.id, 5, req.user!.role);
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

  validationHistory: asyncHandler(async (req: Request, res: Response) => {
    res.json(await procedureService.validationHistory(req.params.id, req.user!.role));
  }),
  versions: asyncHandler(async (req,res)=> { const versions=await procedureVersionService.list(req.params.id,req.user!.role); await auditService.log(req.user!.sub,AuditAction.VERSION_VIEWED,"Procedure",req.params.id); res.json(versions); }),
  versionDetail: asyncHandler(async (req,res)=> { const version=await procedureVersionService.detail(req.params.id,req.params.versionId,req.user!.role); await auditService.log(req.user!.sub,AuditAction.VERSION_VIEWED,"ProcedureVersion",req.params.versionId); res.json(version); }),
  restoreVersion: asyncHandler(async (req,res)=> { const p=await procedureVersionService.restore(req.params.id,req.params.versionId); await auditService.log(req.user!.sub,AuditAction.VERSION_RESTORED,"ProcedureVersion",req.params.versionId); res.json(p); }),
  compareVersions: asyncHandler(async (req,res)=> { const result=await procedureVersionService.compare(req.params.id,req.params.versionA,req.params.versionB,req.user!.role); await auditService.log(req.user!.sub,AuditAction.VERSION_COMPARED,"Procedure",req.params.id,{versionA:req.params.versionA,versionB:req.params.versionB}); res.json(result); }),

  submitForReview: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.submitForReview(req.params.id, req.user!.sub, req.user!.role, req.body.comment);
    await auditService.log(req.user!.sub, AuditAction.SUBMIT_REVIEW, "Procedure", req.params.id, { comment: req.body.comment });
    res.json(procedure);
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.approve(req.params.id, req.user!.sub, req.user!.role, req.body.comment);
    await auditService.log(req.user!.sub, AuditAction.APPROVE, "Procedure", req.params.id, { comment: req.body.comment });
    res.json(procedure);
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.reject(req.params.id, req.user!.sub, req.user!.role, req.body.comment);
    await auditService.log(req.user!.sub, AuditAction.REJECT, "Procedure", req.params.id, { comment: req.body.comment });
    res.json(procedure);
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.publish(req.params.id, req.user!.sub, req.user!.role);
    await auditService.log(req.user!.sub, AuditAction.PUBLISH, "Procedure", req.params.id);
    const version = await procedureVersionService.createSnapshot(req.params.id, req.user!.sub, req.body.changeType as ChangeType, req.body.changeDescription);
    await auditService.log(req.user!.sub, AuditAction.VERSION_CREATED, "ProcedureVersion", version._id.toString());
    res.json(procedure);
  }),

  createRevision: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.createRevision(req.params.id, req.user!.sub, req.user!.role);
    await auditService.log(req.user!.sub, AuditAction.UPDATE, "Procedure", procedure._id.toString());
    res.status(201).json(procedure);
  }),

  archive: asyncHandler(async (req: Request, res: Response) => {
    const procedure = await procedureService.archive(req.params.id, req.user!.sub, req.user!.role);
    await auditService.log(req.user!.sub, AuditAction.ARCHIVE, "Procedure", req.params.id);
    res.json(procedure);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await procedureService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "Procedure", req.params.id);
    res.status(204).send();
  }),
};
