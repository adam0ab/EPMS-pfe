import { Request, Response } from "express";
import { AuditAction } from "@epms/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { documentService } from "../services/document.service";
import { auditService } from "../services/audit.service";
import { ApiError } from "../utils/ApiError";

export const documentController = {
  listByProcedure: asyncHandler(async (req: Request, res: Response) => {
    const documents = await documentService.listByProcedure(req.params.procedureId);
    res.json(documents);
  }),

  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded");

    const document = await documentService.upload({
      procedureId: req.params.procedureId,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
      uploadedBy: req.user!.sub,
    });

    await auditService.log(req.user!.sub, AuditAction.CREATE, "DocumentMeta", document._id.toString());
    res.status(201).json(document);
  }),

  download: asyncHandler(async (req: Request, res: Response) => {
    const { stream, document } = await documentService.getDownloadStream(req.params.id);

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(document.fileName)}"`);

    await auditService.log(req.user!.sub, AuditAction.DOWNLOAD, "DocumentMeta", document._id.toString());

    stream.on("error", () => res.status(404).end());
    stream.pipe(res);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await documentService.remove(req.params.id);
    await auditService.log(req.user!.sub, AuditAction.DELETE, "DocumentMeta", req.params.id);
    res.status(204).send();
  }),
};
